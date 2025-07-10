const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()
const { getAccessToken } = require('../googleAuth')
const { google } = require('googleapis')

// GET all appointments 
router.get('/appointments', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to see appointments!' })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        })
        if(!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        let appointments
        if(user.role === 'CLIENT') {
            appointments = await prisma.appointment.findMany({
                where: { clientId: user.id },
                include: {
                    provider: {
                        select: {
                            name: true,
                            username: true,
                        }
                    }
                }
            })
        } else {
            // if role: PROVIDER
            appointments = await prisma.appointment.findMany({
                where: { providerId: user.id },
                include: {
                    client: {
                        select: {
                            name: true,
                            username: true
                        }
                    }
                }
            })
        }

        res.json(appointments)
    } catch(error) {
        console.log(error)
        res.status(500).json({ error: 'Server error' })
    }
})

// Client books an appointment
router.put('/appointments/:id/book', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to book an appointment!' })
    }

    const appointmentId = parseInt(req.params.id)
    const { serviceType, notes } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        })
        if(!user || user.role !== 'CLIENT') {
            return res.status(403).json({ error: 'Only clients can book appointments' })
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                clientId: user.id,
                status: 'BOOKED', 
                serviceType,
                notes,
                isUnread: true
            }
        })

        // Create Google Calendar event process below
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                provider: true,
                client: true
            }
        })
        
        // Event is created by provider's Google Calendar's acount and invite the client to the event using their email
        if(appointment.provider.googleConnected) {
            const { auth } = await getAccessToken(appointment.providerId)
            const calendar = google.calendar({ version: 'v3', auth })

            const event = {
                summary: appointment.serviceType,
                description: appointment.notes || '',
                start: { dateTime: appointment.dateTime.toISOString() },
                // Convert 30 mins to seconds then to milliseconds, since new Date is milliseconds
                // getTime returns num of milliseconds since 1/1/1970 -> add this num to 30 minutes in milliseconds -> convert back to Date
                end: { dateTime: new Date(new Date(appointment.dateTime).getTime() + (30 * 60 * 1000)).toISOString() }, 
                // Sends Google Calendar invite request to client's email  
                attendees: [{ email: appointment.client.email }]
            }
            
            // Add the event to Google Calendar
            const newEvent = await calendar.events.insert({
                calendarId: 'primary',
                resource: event
            })

            // Save the Google Calendar event ID in database
            await prisma.appointment.update({
                where: { id: appointmentId },
                data: { googleEventId: newEvent.data.id }
            })
        }
        res.status(201).json(updatedAppointment)
    } catch(error) {
        console.log(error)
        res.status(500).json({ error: 'Server error' })
    } 
})

// EDIT single appointment
router.put('/appointments/:id/edit', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to edit an appointment!' })
    }

    const appointmentId = parseInt(req.params.id)
    const { notes, serviceType, status } = req.body

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        })
        if(!appointment) {
            return res.status(404).json({ error: 'Appointment not found' })
        }

        const user = await prisma.user.findUnique({ 
            where: { id: req.session.userId } 
        })
        // Client can edit appointment 
        if(user.role === 'CLIENT') {
            if(appointment.clientId !== user.id) {
                return res.status(403).json({ error: 'Unauthorized' })
            }

            const newData = {}
            if(serviceType !== undefined) {
                newData.serviceType = serviceType
            }
            if(notes !== undefined) {
                newData.notes = notes
            }
            const updated = await prisma.appointment.update({
                where: { id: appointmentId },
                data: { ...newData }
            })

            return res.json(updated)
        }
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }
})

// Provider marks appointment as read
router.put('/appointments/:id/read', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in!' })
    }

    const appointmentId = parseInt(req.params.id)

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        })
        if(!appointment) {
            return res.status(404).json({ error: 'Appointment not found' })
        }

        if(appointment.providerId !== req.session.userId) {
            return res.status(403).json({ error: 'Unauthorized' })
        }

        const updated = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { isUnread: !appointment.isUnread }
        })
        
        res.status(200).json(updated)
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }
})

// CANCEL single appointment (set back to available)
router.put('/appointments/:id/cancel', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to delete an appointment!' })
    }

    const appointmentId = parseInt(req.params.id)

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { provider: true }
        })
        if(!appointment) {
            return res.status(404).json({ error: 'Appointment not found' })
        }

        const user = await prisma.user.findUnique({ 
            where: { id: req.session.userId } 
        })

        if(appointment.providerId !== user.id && appointment.clientId !== user.id) {
            return res.status(403).json({ error: 'Unauthorized' })
        }

        // First, cancel in Google Calendar
        if (appointment.googleEventId && appointment.provider.googleConnected) {
            const { auth } = await getAccessToken(appointment.providerId)
            const calendar = google.calendar({ version: 'v3', auth })

            await calendar.events.delete({
                calendarId: 'primary',
                eventId: appointment.googleEventId
            })
        }

        // Then, adjust database only if cancelling in Google Calendar was successful
        const updated = await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                status: 'AVAILABLE',
                clientId: null,
                serviceType: '',
                notes: null,
                isUnread: true,
                googleEventId: null
            }
        })

        res.status(200).json(updated)
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }
}) 

// DELETE single appointment
router.delete('/appointments/:id', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to delete an appointment!' })
    }

    const appointmentId = parseInt(req.params.id)

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        })
        if(!appointment) {
            return res.status(404).json({ error: 'Appointment not found' })
        }

        if(appointment.providerId !== req.session.userId) {
            return res.status(403).json({ error: 'Unauthorized' })
        }

        await prisma.appointment.delete({
            where: { id: appointmentId }
        })
        
        res.status(200).json({ message: 'Appointment deleted successfully'})
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }
})


module.exports = router
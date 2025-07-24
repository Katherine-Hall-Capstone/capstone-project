const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()
const { getAccessToken } = require('../googleAuth')
const { google } = require('googleapis')

const S_PER_MINUTE = 60
const MS_PER_S = 1000

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
                    },
                    service: true
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
                    },
                    service: true
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
    const { serviceId, notes } = req.body
    const parsedServiceId = parseInt(serviceId)

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        })
        if(!user || user.role !== 'CLIENT') {
            return res.status(403).json({ error: 'Only clients can book appointments' })
        }

        const service = await prisma.service.findUnique({
            where: { id: parsedServiceId }
        })
        if(!service) {
            return res.status(400).json({ error: 'Invalid service selected' })
        }

        const originalAppointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                provider: true,
                client: true,
            }
        })

        // getTime returns num of milliseconds since 1/1/1970 -> add this num to service duration in milliseconds -> convert back to Date
        const endDateTime = new Date(originalAppointment.startDateTime.getTime() + (service.duration * S_PER_MINUTE * MS_PER_S))

        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                clientId: user.id,
                status: 'BOOKED', 
                serviceId: parsedServiceId,
                notes,
                isUnread: true,
                endDateTime
            },
            include: {
                provider: true,
                client: true,
                service: true
            }
        })

        let updatedBookingsWithProviders = []

        if(user.bookingsWithProviders) {
            updatedBookingsWithProviders = [...user.bookingsWithProviders]
        }

        const existingProvider = updatedBookingsWithProviders.find(provider => provider.providerId === updatedAppointment.providerId)

        if(existingProvider) {
            existingProvider.count += 1
        } else {
            updatedBookingsWithProviders.push({ providerId: updatedAppointment.providerId, count: 1 })
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                bookingsWithProviders: updatedBookingsWithProviders
            }
        })

        // Create Google Calendar event process below
        // Event is created in both client and provider's calendar, if connected
        const event = {
            summary: updatedAppointment.service.name,
            description: updatedAppointment.notes || '',
            start: { dateTime: updatedAppointment.startDateTime.toISOString() },
            end: { dateTime: updatedAppointment.endDateTime.toISOString() }
        }

        let providerEventId = null
        let clientEventId = null

        // Event is created in provider's calendar if they connected it
        if(updatedAppointment.provider.googleConnected) {
            try {
                const { auth } = await getAccessToken(updatedAppointment.provider.id)
                const calendar = google.calendar({ version: 'v3', auth }) 

                const providerEvent = await calendar.events.insert({
                    calendarId: 'primary',
                    resource: event
                })

                providerEventId = providerEvent.data.id
            } catch(error) {
                console.error('Error adding event in provider calendar', error)
            }
        }

        // Event is created in client's calendar if they connected it
        if(updatedAppointment.client.googleConnected) {
            try {
                const { auth } = await getAccessToken(updatedAppointment.client.id)
                const calendar = google.calendar({ version: 'v3', auth }) 

                const clientEvent = await calendar.events.insert({
                    calendarId: 'primary',
                    resource: event
                })

                clientEventId = clientEvent.data.id
            } catch(error) {
                console.error('Error adding event in client calendar', error)
            }
        }

        // Save the Google Calendar event ID in database
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                providerGoogleEventId: providerEventId,
                clientGoogleEventId: clientEventId
            }
        })
    
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
    const { notes, serviceId } = req.body

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
            if(serviceId !== undefined) {
                newData.serviceId = serviceId
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
            include: {
                provider: true,
                client: true
            }
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

        let updatedBookingsWithProviders = [...appointment.client.bookingsWithProviders]

        const existingProvider = updatedBookingsWithProviders.find(provider => 
            provider.providerId === appointment.providerId
        )

        if(existingProvider) {
            existingProvider.count -= 1

            if(existingProvider.count === 0) {
                updatedBookingsWithProviders = updatedBookingsWithProviders.filter(provider => 
                    provider.providerId !== appointment.providerId
                )
            }

            await prisma.user.update({
                where: { id: appointment.clientId },
                data: {
                    bookingsWithProviders: updatedBookingsWithProviders
                }
            })
        }

        // Cancel in Google Calendar for provider
        if (appointment.providerGoogleEventId && appointment.provider.googleConnected) {
            try {   
                const { auth } = await getAccessToken(appointment.providerId)
                const calendar = google.calendar({ version: 'v3', auth })
                
                await calendar.events.delete({
                    calendarId: 'primary',
                    eventId: appointment.providerGoogleEventId
                })
            } catch(error) {
                console.error('Error deleting provider event in Google Calendar', error)
            }
        }

        // Cancel in Google Calendar for client 
        if (appointment.clientGoogleEventId && appointment.client.googleConnected) {
            try {   
                const { auth } = await getAccessToken(appointment.clientId)
                const calendar = google.calendar({ version: 'v3', auth })
                
                await calendar.events.delete({
                    calendarId: 'primary',
                    eventId: appointment.clientGoogleEventId
                })
            } catch(error) {
                console.error('Error deleting client event in Google Calendar', error)
            }
        }

        // Then, adjust database only if cancelling in Google Calendar was successful
        const updated = await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                status: 'AVAILABLE',
                clientId: null,
                serviceId: null,
                notes: null,
                isUnread: true,
                endDateTime: null,
                providerGoogleEventId: null,
                clientGoogleEventId: null
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
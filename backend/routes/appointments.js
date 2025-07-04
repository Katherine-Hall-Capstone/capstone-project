const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()

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

        res.status(201).json(updatedAppointment)
    } catch(error) {
        console.log(error)
        res.status(500).json({ error: 'Server error' })
    } 
})

// EDIT single appointment
router.put('/appointments/:id', async (req, res) => {
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
        // Provider can edit appointment status (cancelling)
        if(user.role === 'PROVIDER') {
            if(appointment.providerId !== user.id) {
                return res.status(403).json({ error: 'Unauthorized' })
            }
            const updated = await prisma.appointment.update({
                where: { id: appointmentId },
                data: { status }
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
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
router.post('/appointments', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to book an appointment!' })
    }

    const { providerId, dateTime, serviceType, notes } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        })
        if(!user || user.role !== 'CLIENT') {
            return res.status(403).json({ error: 'Only clients can book appointments' })
        }

        const appointment = await prisma.appointment.create({
            data: {
                clientId: user.id,
                providerId,
                dateTime: new Date(dateTime),
                status: 'PENDING',  // Initial state of appointment
                serviceType,
                notes
            }
        })

        res.status(201).json(appointment)
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
    const { notes, status } = req.body

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
        // Client can edit appointment notes 
        if(user.role === 'CLIENT') {
            if(appointment.clientId !== user.id) {
                return res.status(403).json({ error: 'Unauthorized' })
            }
            const updated = await prisma.appointment.update({
                where: { id: appointmentId },
                data: { notes }
            })

            return res.json(updated)
        }
        // Provider can edit appointment status
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

        if(appointment.clientId !== req.session.userId && appointment.providerId !== req.session.userId) {
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
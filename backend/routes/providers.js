const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()

// GET all providers
router.get('/providers', async (req, res) => {
    const { search } = req.query

    try {
        const providers = await prisma.user.findMany({
            where: {
                role: 'PROVIDER',
                name: { contains: search, mode: 'insensitive' }
            },
            select: {
                id: true,
                name: true,
                servicesOffered: true
            }
        })
        res.json(providers)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })  
    }
}) 

// GET single provider
router.get('/providers/:id', async (req, res) => {
    const providerId = parseInt(req.params.id)

    try {
        const provider = await prisma.user.findFirst({
            where: {
                id: providerId,
                role: 'PROVIDER'
            },
            select: {
                id: true,
                name: true,
                servicesOffered: true
            }
        })
        if(!provider) {
            return res.status(404).json({ error: 'Provider not found' })
        }

        res.json(provider)
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }
})

// GET single provider's available appointments 
router.get('/providers/:id/availability', async (req, res) => {
    const providerId = parseInt(req.params.id)

    try {
        const availableAppointments = await prisma.appointment.findMany({
            where: { 
                providerId,
                status: 'AVAILABLE' 
            }
        })

        res.status(200).json(availableAppointments)
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }
})

// ADD an available appointment 
router.post('/providers/:id/availability', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to add an availability!' })
    }

    const { dateTime } = req.body
    const parsedDate = new Date(dateTime)

    if(parsedDate < new Date()) {
        return res.status(401).json({ error: 'Cannot add available appointments in the past' })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        })
        if(!user || user.role !== 'PROVIDER') {
            return res.status(403).json({ error: 'Only service providers can add availabilities' })
        }

        // Checks if any appointment already exists, either booked or available
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                providerId: user.id,
                dateTime: parsedDate
            }
        })
        if (existingAppointment) {
            return res.status(400).json({ error: 'This time is already available or you have a booked appointment at this time' });
        }

        const availableAppointment = await prisma.appointment.create({
            data: {
                providerId: user.id,
                dateTime: parsedDate, 
                endDateTime: null,
                status: 'AVAILABLE',
                serviceId: null,
                isUnread: true
            }
        })

        res.status(201).json(availableAppointment)
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }
})

// GET all services for a single provider
router.get('/providers/:id/services', async (req, res) => {
    const providerId = parseInt(req.params.id)

    try {
        const services = await prisma.service.findMany({
            where: { providerId },
            select: {
                id: true,
                name: true,
                duration: true
            }
        })

        res.status(200).json(services)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Server error' })
    }
})

// ADD provider's offered services
router.post('/providers/:id/services', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to add services!' })
    }

    const providerId = parseInt(req.params.id)
    if(req.session.userId !== providerId) {
        return res.status(403).json({ error: 'Unauthorized' })
    }

    const { name, duration } = req.body

    if(!name || !duration) {
        return res.status(400).json({ error: 'Service name and duration required'})
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        })

        if(!user || user.role !== 'PROVIDER') {
            return res.status(403).json({ error: 'Only service providers can add services' })
        }

        const existingService = await prisma.service.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' }, // makes search case-insensitive
                providerId
            }
        })

        if(existingService) {
            return res.status(400).json({ error: 'Service already exists'})
        }

        const newService = await prisma.service.create({
            data: {
                name,
                duration,
                providerId
            }
        })

        res.status(200).json({ message: 'Service added'})
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }
})

// GET provider's reviews 
router.get('/providers/:id/reviews', async (req, res) => {
    const providerId = parseInt(req.params.id)

    try {
        const reviews = await prisma.review.findMany({
            where: { providerId },
            include: {
                client: {
                    select: {
                        name: true,
                        username: true
                    }
                }
            }
        })
        res.json(reviews)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })  
    }
})

module.exports = router;


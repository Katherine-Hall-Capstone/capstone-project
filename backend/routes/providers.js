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

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        })
        if(!user || user.role !== 'PROVIDER') {
            return res.status(403).json({ error: 'Only service providers can add availabilities' })
        }

        const availableAppointment = await prisma.appointment.create({
            data: {
                providerId: user.id,
                dateTime: parsedDate, 
                status: 'AVAILABLE',
                serviceType: '',
                isUnread: true
            }
        })

        res.status(201).json(availableAppointment)
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
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

    const { servicesOffered } = req.body

    if(!Array.isArray(servicesOffered)) {
        return res.status(400).json({ error: 'Services must be in an array '})
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        })

        if(!user || user.role !== 'PROVIDER') {
            return res.status(403).json({ error: 'Only service providers can add services' })
        }

        const updatedProvider = await prisma.user.update({
            where: { id: providerId },
            data: { servicesOffered }
        })

        res.status(200).json({ message: 'Services updated'})
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


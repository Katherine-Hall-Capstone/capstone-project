const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()

// GET all providers
router.get('/providers', async (req, res) => {
    try {
        const providers = await prisma.user.findMany({
            where: {
                role: 'PROVIDER'
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

// GET single provider's availability 
router.get('/providers/:id/availability', async (req, res) => {
    const providerId = parseInt(req.params.id)

    try {
        const availabilities = await prisma.availability.findMany({
            where: { providerId }
        })

        res.status(200).json(availabilities)
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }
})

// ADD an availability 
router.post('/providers/:id/availability', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to add an availability!' })
    }

    const { startDateTime, endDateTime } = req.body

    const start = new Date(startDateTime)
    const end = new Date(endDateTime)

    if (end <= start) {
        return res.status(400).json({ error: 'End time must be after start time' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        })
        if(!user || user.role !== 'PROVIDER') {
            return res.status(403).json({ error: 'Only service providers can add availabilities' })
        }

        const availability = await prisma.availability.create({
            data: {
                providerId: user.id,
                startDateTime: start,
                endDateTime: end
            }
        })

        res.status(201).json(availability)
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }
})

// DELETE an availability
router.delete('/providers/:id/availability/:id', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to delete an availability!' })
    }

    const availabilityId = parseInt(req.params.id)

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        })
        if(!user || user.role !== 'PROVIDER') {
            return res.status(403).json({ error: 'Only service providers can modify availabilities' })
        }

        const availability = await prisma.availability.findUnique({
            where: { id: availabilityId }
        })
        if(!availability) {
            return res.status(404).json({ error: 'Availability not found' })
        }
        
        if(availability.providerId !== req.session.userId) {
            return res.status(403).json({ error: 'Unauthorized' })
        }

        await prisma.availability.delete({
            where: { id: availabilityId }
        })

        res.status(200).json({ message: 'Availability deleted successfully'})
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


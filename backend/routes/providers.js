const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()

// GET all providers
router.get('/providers', async (req, res) => {
    const { search } = req.query

    if(!search || search.trim() === '') {
        return res.status(400).json({ error: 'No search query inputted' })
    }

    try {
        const providers = await prisma.user.findMany({
            where: { role: 'PROVIDER' },
            select: {
                id: true,
                name: true,
                servicesOffered: true
            }
        })

        const providersScored = providers.map(provider => {
            const similarityScore = findSimilarityScore(search, provider.name)
            return {...provider, similarityScore}
        })

        const bestMatchedProviders = providersScored
            .filter(provider => provider.similarityScore >= 0.55) // ignore names with scores below 0.55
            .sort((a, b) => b.similarityScore - a.similarityScore)

        res.json(bestMatchedProviders)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })  
    }
}) 

// Fuzzy Search function
function findSimilarityScore(input, target) {
    let i = 0
    let j = 0
    let prefixLength = 0

    while(i < input.length && i < target.length && input[i] === target[i] && prefixLength < 4) {
        prefixLength++
        i++
    }

    let bonus = prefixLength * 0.05

    let cost = 0
    i = j = prefixLength

    while(i < input.length && j < target.length) {
        if(input[i] === target[j]) {
            i++
            j++
        } else if(i + 1 < input.length && j + 1 < target.length && input[i] === target[j + 1] && input[i + 1] === target[j]) {
            // Transposition
            cost += 0.5
            i += 2
            j += 2
        } else if(i + 1 < input.length && input[i + 1] === target[j]) {
            // Simulates deleting character in input
            cost += 1
            i++
        } else if(j + 1 < target.length && input[i] === target[j + 1]) {
            // Simulates inserting character in input
            cost += 1
            j++
        } else {
            // Substitution
            cost += 1
            i++
            j++
        }
    }

    // If there were still remaining characters not compared
    cost += (input.length - i) + (target.length - j)

    const maxLength = Math.max(input.length, target.length)
    const similarityScore = 1 - cost / maxLength + bonus

    return similarityScore
}

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

// GET single provider's booked appointments 
router.get('/providers/:id/booked', async (req, res) => {
    const providerId = parseInt(req.params.id)

    try {
        const bookedAppointments = await prisma.appointment.findMany({
            where: { 
                providerId,
                status: 'BOOKED' 
            },
            select: {
                startDateTime: true,
                endDateTime: true
            }
        })

        res.status(200).json(bookedAppointments)
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

    const { startDateTime } = req.body
    const parsedDate = new Date(startDateTime)

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

        // Prevent exact duplicate time slots from being added 
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                providerId: user.id,
                status: 'AVAILABLE',
                startDateTime: parsedDate
            }
        })

        if (existingAppointment) {
            return res.status(400).json({ error: 'This time is already available' });
        }

        // Prevent availabilities from being added during booked appointments
        const overlappingAppointmnet = await prisma.appointment.findFirst({
            where: {
                providerId: user.id,
                status: 'BOOKED',
                startDateTime: { lte: parsedDate },  // "less than or equal to"
                endDateTime: { gt: parsedDate } // "greater than"
            }
        })

        if (overlappingAppointmnet) {
            return res.status(400).json({ error: 'You have a booked appointment at this time' })
        }

        const availableAppointment = await prisma.appointment.create({
            data: {
                providerId: user.id,
                startDateTime: parsedDate, 
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
                duration: true,
                details: true
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

    const { name, duration, details } = req.body

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
                details,
                providerId
            }
        })

        res.status(200).json({ message: 'Service added'})
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })
    }
})

// DELETE provider's offered service
router.delete('/providers/:providerId/services/:serviceId', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Log in to delete services!' })
    }

    const providerId = parseInt(req.params.providerId)
    const serviceId = parseInt(req.params.serviceId)

    if (req.session.userId !== providerId) {
        return res.status(403).json({ error: 'Unauthorized' })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        })

        if (!user || user.role !== 'PROVIDER') {
            return res.status(403).json({ error: 'Only providers can delete services' })
        }
        
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        })

        if (!service || service.providerId !== providerId) {
            return res.status(404).json({ error: 'Service not found or not yours' })
        }

        const appointmentsWithService = await prisma.appointment.findFirst({
            where: { serviceId: serviceId }
        })

        if(appointmentsWithService) {
            return res.status(400).json({ error: 'Appointments exist with this service. Cancel the appointment before deleting service!' })
        }

        await prisma.service.delete({
            where: { id: serviceId }
        })

        res.status(200).json({ message: 'Service deleted' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Server error' })
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


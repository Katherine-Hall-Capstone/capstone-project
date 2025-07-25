const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()
const BONUS_MULTIPLIER = 0.05
const SIMILARITY_SCORE_WEIGHT = 0.6
const BOOKINGS_SCORE_WEIGHT = 0.4
const SIMILARITY_THRESHOLD = 0.55

// GET all providers
router.get('/providers', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to see providers!' })
    }

    const { search } = req.query

    if(!search || search.trim() === '') {
        return res.status(400).json({ error: 'No search query inputted' })
    }

    try {
        const client = await prisma.user.findUnique({
            where: { id: req.session.userId },
            select: {
                bookingsWithProviders: true
            }
        })

        const providers = await prisma.user.findMany({
            where: { role: 'PROVIDER' },
            select: {
                id: true,
                name: true,
                servicesOffered: true
            }
        })
        // JSON being empty prevents it from being iterable, so change to empty array if needed 
        const bookings = Array.isArray(client.bookingsWithProviders) ? client.bookingsWithProviders : []
        // Get providers ranked by similarity score and booking score
        const bestMatchedProviders = getBestMatchedProviders(providers, bookings, search)

        res.json(bestMatchedProviders)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })  
    }
}) 

function getBestMatchedProviders(providers, bookings, search) {
    const lowercaseSearch = search.toLowerCase()

    // Get the similarity score of the input and each provider name
    const providersSimilarityScore = providers.map(provider => {
        const similarityScore = findSimilarityScore(lowercaseSearch, provider.name.toLowerCase())
        return { ...provider, similarityScore }
    })

    // Filter out the names with similarity scores below a defined threshold
    const similarProviders = providersSimilarityScore.filter(provider => provider.similarityScore >= SIMILARITY_THRESHOLD) 

    // Find the provider that the client most frequeuntly books with and the number of booked appointments client has with them
    let mostBookedProviderCount = 0

    for (const provider of bookings) {
        if (provider.count > mostBookedProviderCount) {
            mostBookedProviderCount = provider.count
        }
    }

    // Of these filtered names, get the booking score by how frequently they are booked by the client
    const scoredProviders = similarProviders.map(provider => {
        const bookingsScore = findBookingsScore(
            provider.id, 
            bookings, 
            mostBookedProviderCount
        )
        
        // Compute a total score taking into account similarity score and booking score with varying weights
        const totalScore = SIMILARITY_SCORE_WEIGHT * provider.similarityScore + BOOKINGS_SCORE_WEIGHT * bookingsScore

        return {...provider, totalScore}
    }) 
    
    return scoredProviders.sort((a, b) => b.totalScore - a.totalScore)
}

// Fuzzy Search: Similarity Score Function
function findSimilarityScore(input, target) {
    let i = 0
    let j = 0
    let prefixLength = 0

    while(i < input.length && i < target.length && input[i] === target[i] && prefixLength < 4) {
        prefixLength++
        i++
    }

    let bonus = prefixLength * BONUS_MULTIPLIER

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
            cost += 0.8
            i++
        } else if(j + 1 < target.length && input[i] === target[j + 1]) {
            // Simulates inserting character in input
            cost += 0.8
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

// Fuzzy Search: Scoring providers by how often client book with them
function findBookingsScore(providerId, bookingsWithProviders, mostBookedProviderCount) {
    if (mostBookedProviderCount === 0) {
        return 0 
    }

    const existingProvider = bookingsWithProviders.find(provider => provider.providerId === providerId)
    if(!existingProvider) {
        return 0
    }

    // Score the provider relative to the most frequently booked provider of the client (value will be from 0 to 1)
    return existingProvider.count / mostBookedProviderCount 
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
        const overlappingAppointment = await prisma.appointment.findFirst({
            where: {
                providerId: user.id,
                status: 'BOOKED',
                startDateTime: { lte: parsedDate },  // "less than or equal to"
                endDateTime: { gt: parsedDate } // "greater than"
            }
        })

        if (overlappingAppointment) {
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

        res.status(201).json(newService)
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


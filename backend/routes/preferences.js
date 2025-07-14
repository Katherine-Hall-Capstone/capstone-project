const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()

// Get preference of a provider or client
router.get('/preferences/:id', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to see preferences!' })
    }

    const userId = parseInt(req.params.id)
    if (req.session.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' })
    }

    try {
        const user = await prisma.user.findUnique({ 
            where: { id: userId } 
        })
        if (!user) {
            return res.status(403).json({ error: 'User does not exist' })
        }

        let userPreferences

        if(user.role === 'PROVIDER') {
            userPreferences = await prisma.providerPreferences.findUnique({
                where: { providerId: user.id }
            })
        } else if(user.role === 'CLIENT') {
            userPreferences = await prisma.clientPreferences.findMany({
                where: { clientId: user.id }
            })
        } else {
            return res.status(400).json({ error: 'Invalid role' })
        }
        res.json(userPreferences)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Server error' })
    }
})

// Create preferences for provider 
router.post('/preferences/providers/:id', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to set preferences!' })
    }

    const providerId = parseInt(req.params.id)
    if (req.session.userId !== providerId) {
        return res.status(403).json({ error: 'Unauthorized' })
    }

    const { maxConsecutiveHours, prefersEarly } = req.body
    if (maxConsecutiveHours == null || maxConsecutiveHours <= 0 || prefersEarly == null) {
        return res.status(400).json({ error: 'All fields required and hours cannot be negative' })
    }

    try {
        const user = await prisma.user.findUnique({ 
            where: { id: providerId } 
        })
        if (!user || user.role !== 'PROVIDER') {
            return res.status(403).json({ error: 'Only providers can add their preferences' })
        }

        const existingPreference = await prisma.providerPreferences.findUnique({
            where: { providerId }
        })
        if (existingPreference) {
            return res.status(400).json({ error: 'You already created a preference!' })
        }

        const newPreference = await prisma.providerPreferences.create({
            data: { 
                providerId, 
                maxConsecutiveHours, 
                prefersEarly }
        })

        res.status(201).json(newPreference)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Server error' })
    }
})

// Delete a provider's preferences 
router.delete('/preferences/provider/:id', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to delete preferences!' })
    }

    const providerId = parseInt(req.params.id)
    if (req.session.userId !== providerId) {
        return res.status(403).json({ error: 'Unauthorized' })
    }

    try {
        const user = await prisma.user.findUnique({ 
            where: { id: providerId } 
        })
        if (!user || user.role !== 'PROVIDER') {
            return res.status(403).json({ error: 'Only providers can delete their preferences' })
        }

        await prisma.providerPreferences.delete({
            where: { providerId }
        })

        res.status(200).json({ message: 'Preferences deleted successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Server error' })
    }
})

// Create a time window preference for client (multiple allowed)
router.post('/preferences/clients/:id', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to set preferences!' })
    }

    const clientId = parseInt(req.params.id)
    if (req.session.userId !== clientId) {
        return res.status(403).json({ error: 'Unauthorized' })
    }

    const { dayOfWeek, startTime, endTime } = req.body

    if (!dayOfWeek || !startTime || !endTime) {
        return res.status(400).json({ error: 'All fields required' })
    }

    if(startTime >= endTime) {
        return res.status(400).json({ error: 'Invalid time window' })
    }

    try {
        const user = await prisma.user.findUnique({ 
            where: { id: clientId } 
        })
        if (!user || user.role !== 'CLIENT') {
            return res.status(403).json({ error: 'Only clients can add their preferences' })
        }

        // Enforce one time window per day rule
        const existingDay = await prisma.clientPreferences.findFirst({
            where: {
                clientId,
                dayOfWeek
            }
        })

        if(existingDay) {
            return res.status(400).json({ error: 'You already set a time window for this day' })
        }

        const newPreference = await prisma.clientPreferences.create({
            data: { 
                clientId, 
                dayOfWeek, 
                startTime, 
                endTime 
            }
        })

        res.status(201).json(newPreference)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Server error' })
    }
})

// Delete a specific time window for client  
router.delete('/preferences/clients/:id/time-window/:windowId', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to set preferences!' })
    }

    const clientId = parseInt(req.params.id)
    const windowId = parseInt(req.params.windowId)

    if (req.session.userId !== clientId) {
        return res.status(403).json({ error: 'Unauthorized' })
    }

    try {
        const user = await prisma.user.findUnique({ 
            where: { id: clientId } 
        })
        if (!user || user.role !== 'CLIENT') {
            return res.status(403).json({ error: 'Only client can delete their preferences' })
        }

        const timeWindow = await prisma.clientPreferences.findUnique({
            where: { id: windowId }
        })

        if(!timeWindow || timeWindow.clientId !== clientId) {
            return res.status(404).json({ error: 'Time window not found or is not yours' })
        }

        await prisma.clientPreferences.delete({
            where: { id: windowId }
        })

        res.status(200).json({ message: 'Preferences deleted successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Server error' })
    }
})


module.exports = router
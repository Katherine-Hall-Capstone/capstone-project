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
            include: {
                availabilities: true,
                providerAppointments: true,
                reviewsRecieved: true
            } 
        })
        res.json(providers)
    } catch (error) {
        res.status(500).send('An error occurred while fetching the providers.');        
    }
}) 

module.exports = router;
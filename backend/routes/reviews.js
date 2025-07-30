const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()

module.exports = router;

// Client create review
router.post('/reviews', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to write a review!' })
    }

    const { providerId, serviceId, rating, comment } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        })
        if(!user || user.role !== 'CLIENT') {
            return res.status(403).json({ error: 'Only clients can write reviews' })
        }

        const review = await prisma.review.create({
            data: {
                clientId: user.id,
                providerId,
                serviceId, 
                rating,
                comment
            }
        })

        res.status(201).json(review)
    } catch(error) {
        console.log(error)
        res.status(500).json({ error: 'Server error' })
    } 
})

// GET reviews (authenticated, not to public)
router.get('/reviews', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to see your reviews!' })
    }

    let reviews
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        })
        if(!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        if(user.role === 'CLIENT') {
            reviews = await prisma.review.findMany({
                where: { clientId: user.id },
                include: {
                    provider: true,
                    service: true
                }
            })
        } else {
            reviews = await prisma.review.findMany({
                where: { providerId: user.id },
                include: {
                    client: true,
                    service: true
                }
            })
        }
        
        res.json(reviews)
    } catch(error) {
        console.log(error)
        res.status(500).json({ error: 'Server error' })
    }
})

// DELETE a review
router.delete('/reviews/:id', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in!' })
    }

    const reviewId = parseInt(req.params.id)

    try {
        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        })
        if(!review) {
            return res.status(404).json({ error: 'Review not found' })
        }

        const user = await prisma.user.findUnique({ 
            where: { id: req.session.userId } 
        })

        if(review.clientId !== user.id && user.role !== 'CLIENT') {
            return res.status(403).json({ error: 'Unauthorized' })
        }

        await prisma.review.delete({
            where: { id: reviewId }
        })

        res.status(200).json({ message: 'Review deleted successfully'})
    } catch(error) {
        console.log(error)
        res.status(500).json({ error: 'Server error' })
    }
})

// GET reviews (to public)
router.get('/reviews/:providerId', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to see your reviews!' })
    }

    const providerId = parseInt(req.params.providerId)

    try {
        const reviews = await prisma.review.findMany({
            where: { providerId },
            include: {
                client: true,
                service: true
            }
        })
        
        res.json(reviews)
    } catch(error) {
        console.log(error)
        res.status(500).json({ error: 'Server error' })
    }
})
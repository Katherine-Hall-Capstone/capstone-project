const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()

module.exports = router;

// Client create review
router.post('/reviews', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to write a review!' })
    }

    const { providerId, rating, comment } = req.body

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
                where: { clientId: user.id }
            })
        } else {
            reviews = await prisma.review.findMany({
                where: { providerId: user.id }
            })
        }
        
        res.json(reviews)
    } catch(error) {
        console.log(error)
        res.status(500).json({ error: 'Server error' })
    }
})

// GET single review
router.get('/reviews/:id', async (req, res) => {
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

        if(review.clientId !== req.session.userId && review.providerId !== req.session.userId) {
            return res.status(403).json({ error: 'Unauthorized' })
        }

        res.json(review)
    } catch(error) {
        console.log(error)
        res.status(500).json({ error: 'Server error' })
    }
})

// EDIT single review
router.put('/reviews/:id', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to edit a review!' })
    }

    const reviewId = parseInt(req.params.id)
    const { rating, comment } = req.body

    if(rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5.' })
    }
    
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
        if(!user || user.role !== 'CLIENT') {
            return res.status(403).json({ error: 'Only clients can edit reviews' })
        }
        if(review.clientId != user.id) {
            return res.status(403).json({ error: 'Unauthorized' })
        }
        
        const updated = await prisma.review.update({
            where: { id: reviewId },
            data: { rating, comment }
        })

        return res.json(updated)
    } catch(error) {
        console.log(error)
        res.status(500).json({ error: 'Server error' })
    }
})


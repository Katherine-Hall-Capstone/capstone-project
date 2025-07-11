const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()

router.post('/preferences/providers/:id', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to set preferences!' })
    }

    const providerId = parseInt(req.params.id)
    if (req.session.userId !== providerId) {
        return res.status(403).json({ error: 'Unauthorized' })
    }

    const { maxConsecutiveHours, prefersEarly } = req.body
    if (maxConsecutiveHours == null || prefersEarlier == null) {
        return res.status(400).json({ error: 'Missing fields' })
    }

})

module.exports = router

	// •	GET /preferences/provider-preference – get current provider’s preference
	// •	POST /preferences/provider-preference – create preference
	// •	PUT /preferences/provider-preference – update preference
	// •	GET /preferences/client-preferences – get current client’s time windows
	// •	POST /preferences/client-preferences – add a new time window
	// •	DELETE /preferences/client-preferences/:id – delete a specific time window
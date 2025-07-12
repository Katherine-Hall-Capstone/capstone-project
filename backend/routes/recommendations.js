const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()

router.get('/providers/:id/recommended', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ error: 'Log in to see appointments!' })
    }

    const providerId = parseInt(req.params.id)
    const clientId = req.session.userId

    try {
        const providerPreferences = await prisma.providerPreferences.findUnique({
            where: { providerId }
        })

        const clientPreferences = await prisma.clientPreferences.findMany({
            where: { clientId }
        })

        const availableAppointments = await prisma.appointment.findMany({
            where: { 
                providerId,
                status: 'AVAILABLE'
            },
            include: { service: true }
        })

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

        // First, filter by keeping available appointments within the client's windows
        const filteredByClientWindows = availableAppointments.filter(appointment => {
            const appointmentDayIndex = new Date(appointment.dateTime).getDay()
            const appointmentDayString = daysOfWeek[appointmentDayIndex]            
            
            const appointmentStartTime = new Date(appointment.dateTime).toTimeString().slice(0, 5) // .slice() to index 5 to limit time format to just hours and minutes
            
            return(clientPreferences.some(preference => {
                return preference.dayOfWeek === appointmentDayString 
                        && preference.startTime <= appointmentStartTime 
                        && preference.endTime > appointmentStartTime
            }))
        })

        // Then, 
        
        res.json(filteredByClientWindows)
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' })  
    }
})

module.exports = router;
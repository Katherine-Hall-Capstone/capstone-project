const { PrismaClient } = require('./generated/prisma')
const prisma = new PrismaClient()
const path = require('path')
const express = require('express')
const session = require('express-session')
const PORT = 3000

const authRouter = require('./routes/auth')

const app = express()
app.use(express.json())

app.use(session({
    secret: 'some-strong-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}))

app.use(authRouter)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

// GET all providers
app.get('/providers', async (req, res) => {
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

// GET all clients
app.get('/clients', async (req, res) => {
    try {
        const clients = await prisma.user.findMany({
            where: {
                role: 'CLIENT'
            },
            include: {
                servicesOffered: false,
                clientAppointments: true,
                reviewsWritten: true
            } 
        })
        res.json(clients)
    } catch (error) {
        res.status(500).send('An error occurred while fetching the clients.');        
    }
}) 
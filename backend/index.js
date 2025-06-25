const { PrismaClient } = require('./generated/prisma')
const prisma = new PrismaClient()
const path = require('path')
const express = require('express')
const session = require('express-session')
const PORT = 3000

const authRouter = require('./routes/auth')
const appointmentRouter = require('./routes/appointments')
const providersRouter = require('./routes/providers')
const reviewsRouter = require('./routes/reviews')

const app = express()
app.use(express.json())

app.use(session({
    secret: 'some-strong-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}))

app.use(authRouter)
app.use(appointmentRouter)
app.use(providersRouter)
app.use(reviewsRouter)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
const { PrismaClient } = require('./generated/prisma')
const prisma = new PrismaClient()
const path = require('path')
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const PORT = 3000

const app = express()

app.use(cors({
    origin: 'http://localhost:5174', 
    credentials: true
}));

app.use(express.json())

app.use(session({
    secret: 'some-strong-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}))

const authRouter = require('./routes/auth')
const appointmentRouter = require('./routes/appointments')
const providersRouter = require('./routes/providers')
const reviewsRouter = require('./routes/reviews')
const preferencesRouter = require('./routes/preferences')

app.use(authRouter)
app.use(appointmentRouter)
app.use(providersRouter)
app.use(reviewsRouter)
app.use(preferencesRouter)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
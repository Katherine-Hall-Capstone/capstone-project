const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()
const bcrypt = require("bcrypt");
const { google } = require('googleapis')
const { encrypt, decrypt } = require('../crypto')

router.post('/auth/signup', async (req, res) => {
    const { username, password, name, role, email } = req.body

    if(!username || !password || !name || !role || !email ) {
        return res.status(400).json({ error: 'All fields are required.' })
    }
    
    try {
        const existingUsername = await prisma.user.findUnique({
            where: { username }
        })
        if(existingUsername) {
            return res.status(400).json({ error: 'Username already taken.' });
        }

        const existingEmail = await prisma.user.findUnique({
            where: { email }
        })
        if(existingEmail) {
            return res.status(400).json({ error: 'Email already taken.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await prisma.user.create({
            data: { username, password: hashedPassword, name, role, email }
        })
        res.status(201).json({ message: 'User created successfully!' });
    } catch(error) {
        console.log(error);  
        res.status(500).json({ error: 'Server error' });
    }
})

router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body
    if(!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username }
        })
        if(!user) {
            return res.status(400).json({ error: 'Invalid username or password.' })
        }

        const isValidPassword = await bcrypt.compare(password, user.password)
        if(!isValidPassword) {
            return res.status(400).json({ error: 'Invalid username or password.' })
        }

        req.session.userId = user.id;
        res.json({ id: user.id, username: user.username, role: user.role })
    } catch(error) {
        console.log(error);  
        res.status(500).json({ error: 'Server error' });
    }
})

router.post("/auth/logout", async (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.clearCookie("connect.sid"); 
        res.json({ message: 'Logged out successfully' });
    });
});

// Checks who is currently logged in 
router.get('/auth/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    try{
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId },
            select: { id: true, username: true, role: true, googleConnected: true } 
        });

        res.json(user);
    } catch(error) {
        console.log(error);  
        res.status(500).json({ error: 'Server error' });
    }
})

// Initialize the OAuth client with credentials and redirect URI, in order to manage calendar access and handle tokens
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

// This redirects user to Google's consent form for access to their Google Calendar
router.get('/auth/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/calendar']
    })
    
    res.redirect(url)
})

// This handles the redirect after the user fills out Google's consent form
router.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code
    
    try {
        const { tokens } = await oauth2Client.getToken(code) // Gets the tokens for the given authorization code
        oauth2Client.setCredentials(tokens)

        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        const { encryptedToken, iv } = tokens.refresh_token ? encrypt(tokens.refresh_token) : { encryptedToken: null, iv: null }

        // Updates the logged-in User model with their Google token information
        await prisma.user.update({
            where: { id: req.session.userId },
            data: {
                googleRefreshToken: encryptedToken,
                googleRefreshIV: iv,
                googleConnected: true
            }
        })
        
        // After Google authorization is successful, it redirects user to the dashboard
        res.redirect('http://localhost:5173/dashboard')
    } catch(error) {
        console.log('OAuth error: ', error)
        res.status(500).json({ error: 'Server error' });
    }
})

// This handles disconnecting a user's Google account and calendar
router.post('/auth/google/disconnect', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.session.userId },
            select: { googleRefreshToken: true }
        })

        await prisma.user.update({
            where: { id: req.session.userId },
            data: {
                googleRefreshToken: null,
                googleRefreshIV: null,
                googleConnected: false
            }
        })

        res.json({ message: 'Your Google Calendar has been disconnected' })
    } catch(error) {
        console.log('OAuth error: ', error)
        res.status(500).json({ error: 'Server error' });
    }
})

module.exports = router
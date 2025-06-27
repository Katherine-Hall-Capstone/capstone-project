const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const router = require('express').Router()
const bcrypt = require("bcrypt");

router.post('/auth/signup', async (req, res) => {
    const { username, password, name, role } = req.body

    if(!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' })
    }
    
    try {
        const existingUser = await prisma.user.findUnique({
            where: { username }
        })
        if(existingUser) {
            return res.status(400).json({ error: 'Username already taken.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await prisma.user.create({
            data: { username, password: hashedPassword, name, role }
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
        res.json({ message: "Login successful!" })
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
            select: { username: true } 
        });

        res.json({ id: req.session.userId, username: user.username });
    } catch(error) {
        console.log(error);  
        res.status(500).json({ error: 'Server error' });
    }
})

module.exports = router;
const { PrismaClient } = require('./generated/prisma')
const { google } = require('googleapis')
const { decrypt } = require('./crypto')

const prisma = new PrismaClient()

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

async function getAccessToken(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if(!user || !user.googleRefreshToken || !user.googleRefreshIV) {
        throw new Error('Not connected to Google Calendar')
    }

    const refreshToken = decrypt(user.googleRefreshToken, user.googleRefreshIV)
    oauth2Client.setCredentials({ refresh_token: refreshToken })

    const { token } = await oauth2Client.getAccessToken()
    return { accessToken: token, auth: oauth2Client }
}

module.exports = { getAccessToken }

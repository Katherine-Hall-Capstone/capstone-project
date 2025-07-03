const crypto = require('crypto')

const algorithm = 'aes-256-cbc'
const secretKey = process.env.REFRESH_TOKEN_SECRET
const iv = crypto.randomBytes(16)

function encrypt(token) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv)
    let encrypted = cipher.update(token, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return { encryptedToken: encrypted, iv: iv.toString('hex') }
}
function decrypt(encryptedToken, ivHex) {
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv)
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}

module.exports = { encrypt, decrypt }
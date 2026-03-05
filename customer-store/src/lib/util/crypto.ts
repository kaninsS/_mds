import crypto from "crypto"

const ENCRYPTION_KEY = process.env.COOKIE_ENCRYPTION_KEY || "default_secret_key_32_chars_long!"
const IV_LENGTH = 16

// Ensure the key is exactly 32 bytes for aes-256-cbc
function getValidKey(): any {
    const key = Buffer.alloc(32)
    Buffer.from(ENCRYPTION_KEY).copy(key as any)
    return key as any
}

export function encrypt(text: string): string {
    if (!text) return text

    try {
        const iv = crypto.randomBytes(IV_LENGTH)
        const cipher = crypto.createCipheriv("aes-256-cbc", getValidKey(), iv as any)

        let encrypted = cipher.update(text, "utf8")
        encrypted = Buffer.concat([encrypted as any, cipher.final() as any] as any)

        return iv.toString("hex") + ":" + encrypted.toString("hex")
    } catch (error) {
        console.error("Encryption error:", error)
        return text
    }
}

export function decrypt(text: string): string {
    if (!text) return text

    try {
        const textParts = text.split(":")
        if (textParts.length !== 2) {
            return text
        }

        const iv = Buffer.from(textParts.shift() as string, "hex")
        const encryptedText = Buffer.from(textParts.join(":"), "hex")

        const decipher = crypto.createDecipheriv("aes-256-cbc", getValidKey(), iv as any)

        let decrypted = decipher.update(encryptedText as any)
        decrypted = Buffer.concat([decrypted as any, decipher.final() as any])

        return decrypted.toString("utf8")
    } catch (error) {
        console.error("Decryption error:", error)
        return ""
    }
}

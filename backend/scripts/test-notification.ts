//TO RUN THIS SCRIPT (cd /backend)
//npx ts-node scripts/test-notification.ts

require('dotenv').config()
const { ResendNotificationProviderService } = require("../src/modules/resend-notification/services/resend-provider")

const logger = {
    info: (msg) => console.log(`[INFO] ${msg}`),
    error: (msg, error) => console.error(`[ERROR] ${msg}`, error || ""),
    warn: (msg) => console.warn(`[WARN] ${msg}`),
    debug: (msg) => console.log(`[DEBUG] ${msg}`),
}

const apiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
const toEmail = process.env.RESEND_TO_EMAIL || "kaninsorn27@gmail.com"

if (!apiKey) {
    console.error("❌ RESEND_API_KEY is missing in environment variables.")
    process.exit(1)
}

; (async () => {
    console.log("---------------------------------------------------")
    console.log("🚀 Testing Resend Notification Provider (Direct Service)")
    console.log(`Target: ${toEmail}`)
    console.log(`From: ${fromEmail}`)
    console.log("---------------------------------------------------")

    try {
        const service = new ResendNotificationProviderService({ logger }, {
            apiKey,
            fromEmail
        })

        const result = await service.send({
            to: toEmail,
            template: "Resend Test",
            data: {
                subject: "hello world",
                text: "it works!",
                html: "<p>it works!</p>",
                from: fromEmail
            }
        })

        console.log("✅ Send Result:", result)
    } catch (error) {
        console.error("❌ Failed to send:", error)
    }
})()
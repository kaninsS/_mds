
import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { ProviderSendNotificationDTO, ProviderSendNotificationResultsDTO } from "@medusajs/framework/types"

type MailsacOptions = {
    apiKey: string
    fromEmail: string
}

export class MailsacNotificationProviderService extends AbstractNotificationProviderService {
    static identifier = "mailsac-notification"
    protected options: MailsacOptions

    constructor(container: any, options: MailsacOptions) {
        super()
        this.options = options
    }

    async send(
        notification: ProviderSendNotificationDTO
    ): Promise<ProviderSendNotificationResultsDTO> {
        if (!notification.to) {
            throw new Error("No recipient email provided")
        }

        if (!this.options.apiKey) {
            throw new Error("Mailsac API key not configured")
        }

        // Endpoint: https://mailsac.com/api/outgoing-messages
        const payload = {
            to: notification.to,
            from: this.options.fromEmail,
            subject: notification.template,
            text: JSON.stringify(notification.data),
            html: `
                <h1>${notification.template}</h1>
                <p><strong>Product Name:</strong> ${notification.data?.name}</p>
                <p><strong>Description:</strong> ${notification.data?.description}</p>
                ${notification.data?.image_url ? `<img src="${notification.data.image_url}" width="300" />` : ""}
            `,
        }

        try {
            const url = `https://mailsac.com/api/addresses/${this.options.fromEmail}/messages`
            console.log("Sending Mailsac email to URL:", url)
            console.log("Payload:", JSON.stringify(payload))

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Mailsac-Key": this.options.apiKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error("Mailsac API Error Status:", response.status)
                console.error("Mailsac API Error Body:", errorText)
                console.error("Payload sent:", JSON.stringify(payload))
                throw new Error(`Mailsac API failed: ${response.status} ${errorText}`)
            }

            const result = await response.json()
            console.log("Mailsac Email Sent:", result)

            return {
                id: result._id || result.id || "unknown-id",
            }
        } catch (error) {
            console.error("Failed to send email via Mailsac:", error)
            throw error // Medusa will handle retry if configured
        }
    }
}

export default MailsacNotificationProviderService

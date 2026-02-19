import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { ProviderSendNotificationDTO, ProviderSendNotificationResultsDTO } from "@medusajs/framework/types"
import { Resend } from "resend"

type ResendOptions = {
    apiKey: string
    fromEmail: string
}

type InjectedDependencies = {
    logger: any
}

export class ResendNotificationProviderService extends AbstractNotificationProviderService {
    static identifier = "resend-notification"
    protected options: ResendOptions
    protected resend: Resend
    protected logger: any

    constructor({ logger }: InjectedDependencies, options: ResendOptions) {
        super()
        this.options = options
        this.logger = logger
        this.resend = new Resend(options.apiKey)
    }

    async send(
        notification: ProviderSendNotificationDTO
    ): Promise<ProviderSendNotificationResultsDTO> {
        if (!notification) {
            throw new Error("No notification data provided")
        }

        try {
            const { to, data, template } = notification
            const subject = data?.subject as string || "Notification from Medusa"
            const html = data?.html as string || `<p>${JSON.stringify(data)}</p>`
            const text = data?.text as string || JSON.stringify(data)

            // Allow overriding 'from' or use default
            const from = data?.from as string || this.options.fromEmail

            this.logger.info(`Sending email via Resend to ${to} with subject "${subject}"`)

            const { data: result, error } = await this.resend.emails.send({
                from,
                to: [to],
                subject,
                html,
                text,
            })

            if (error) {
                this.logger.error(`Resend API Error: ${error.message} (${error.name})`)
                throw new Error(`Resend API failed: ${error.message}`)
            }

            this.logger.info(`Email sent successfully via Resend. ID: ${result?.id}`)

            return { id: result?.id || "unknown" }
        } catch (error) {
            this.logger.error("Failed to send email via Resend:", error)
            throw error
        }
    }
}

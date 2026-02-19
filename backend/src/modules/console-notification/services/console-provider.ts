
import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { ProviderSendNotificationDTO, ProviderSendNotificationResultsDTO } from "@medusajs/framework/types"

export class ConsoleNotificationProviderService extends AbstractNotificationProviderService {
    static identifier = "console-notification"

    async send(
        notification: ProviderSendNotificationDTO
    ): Promise<ProviderSendNotificationResultsDTO> {
        console.log("---------------------------------------------------")
        console.log("📧 Sending Email via Console Provider")
        console.log("To:", notification.to)
        console.log("Subject:", notification.template)
        console.log("Data:", JSON.stringify(notification.data, null, 2))
        console.log("---------------------------------------------------")

        return {
            id: "console-" + Date.now(),
        }
    }
}

export default ConsoleNotificationProviderService

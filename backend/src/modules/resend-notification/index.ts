import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { ResendNotificationProviderService } from "./services/resend-provider"

export default ModuleProvider(Modules.NOTIFICATION, {
    services: [ResendNotificationProviderService],
})

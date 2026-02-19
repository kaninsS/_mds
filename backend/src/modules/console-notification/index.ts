
import ConsoleNotificationProviderService from "./services/console-provider"
import { ModuleProvider, Modules } from "@medusajs/framework/utils"

export default ModuleProvider(Modules.NOTIFICATION, {
    services: [ConsoleNotificationProviderService],
})

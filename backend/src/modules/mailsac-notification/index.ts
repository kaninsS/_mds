
import MailsacNotificationProviderService from "./services/mailsac-provider"
import { ModuleProvider, Modules } from "@medusajs/framework/utils"

export default ModuleProvider(Modules.NOTIFICATION, {
    services: [MailsacNotificationProviderService],
})

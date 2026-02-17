import {
    createStep,
    createWorkflow,
    StepResponse,
    WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { IUserModuleService } from "@medusajs/framework/types"

type SendNotificationStepInput = {
    title: string
    description?: string
    price: number
    vendor_email: string
    image_url?: string
}

const getAdminEmailsStep = createStep(
    "get-admin-emails",
    async (_, { container }) => {
        const userModuleService: IUserModuleService = container.resolve(Modules.USER)

        // In a standard Medusa setup, users in the User Module are typically admins.
        // We fetch all users.
        const users = await userModuleService.listUsers()

        const emails = users.map(u => u.email)
        return new StepResponse(emails)
    }
)

const sendNotificationStep = createStep(
    "send-notification",
    async (input: { emails: string[], request: SendNotificationStepInput }, { container }) => {
        const { emails, request } = input

        // Simulate sending emails
        console.log("------------------------------------------------------------------")
        console.log(`[Workflow] Sending Vendor Request Notification to ${emails.length} admins`)
        console.log(`To: ${emails.join(", ")}`)
        console.log(`Subject: New Product Request from ${request.vendor_email}`)
        console.log(`Body:`)
        console.log(`Title: ${request.title}`)
        console.log(`Price: ${request.price}`)
        console.log(`Description: ${request.description}`)
        if (request.image_url) {
            console.log(`Image: ${request.image_url}`)
        }
        console.log("------------------------------------------------------------------")

        // Future: container.resolve("notificationService").send(...)

        return new StepResponse("sent")
    }
)

export const sendVendorRequestNotificationWorkflow = createWorkflow(
    "send-vendor-request-notification",
    (input: SendNotificationStepInput) => {
        const emails = getAdminEmailsStep()

        sendNotificationStep({
            emails,
            request: input
        })

        return new WorkflowResponse({ success: true })
    }
)

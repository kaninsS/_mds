
import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
// @ts-ignore
import { INotificationModuleService, IUserModuleService } from "@medusajs/framework/types"

const fetchAdminUsersStep = createStep(
    "fetch-admin-users",
    async (_, { container }) => {
        const userModuleService: IUserModuleService = container.resolve(Modules.USER)

        // Fetch all users. In a real scenario, you might want to filter by specific permissions or roles.
        // For now, we assume all users in the User module are admins or relevant staff.
        // Verify if we can filter by metadata or similar if needed.
        const users = await userModuleService.listUsers({}, { take: 100 })

        // Filter out users without email (theoretical, but safe)
        const adminEmails = users.map(u => u.email).filter(Boolean) as string[]

        return new StepResponse(adminEmails)
    }
)

const sendNotificationStep = createStep(
    "send-notification",
    async (input: { emails: string[], productRequest: any }, { container }) => {
        const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)

        const emailsSent: string[] = []

        // TODO: This could be optimized to send in batch if the provider supports it, or parallelize.
        // Mailsac is strict/rate-limited usually, so sequential might be safer or just loop.
        for (const email of input.emails as string[]) {
            try {
                await notificationModuleService.createNotifications({
                    to: email,
                    channel: "email",
                    template: "New Product Request", // Subject
                    data: {
                        name: input.productRequest.name,
                        description: input.productRequest.description,
                        image_url: input.productRequest.image_url,
                        // Add more data as needed for the template
                    },
                    // We can specify provider here if we have multiple, or let Medusa pick default for 'email' channel
                })
                // TODO: enable this when we have a real email provider
                // emailsSent.push(email)
            } catch (error) {
                console.error(`Failed to send notification to ${email}:`, error)
                // Continue sending to others
            }
        }

        return new StepResponse(emailsSent)
    }
)

export const sendProductRequestNotificationWorkflow = createWorkflow(
    "send-product-request-notification",
    (input: { productRequest: any }) => {
        const emails = fetchAdminUsersStep()
        sendNotificationStep({ emails, productRequest: input.productRequest })
        return new WorkflowResponse({})
    }
)

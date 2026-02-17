import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { logNewCustomerWorkflow } from "../workflows/log-new-customer"

export default async function logCustomerSubscriber({
    event: { data },
    container,
}: SubscriberArgs<{
    id: string
}>) {
    // Execute workflow in background (fire-and-forget)
    logNewCustomerWorkflow(container)
        .run({
            input: {
                customer_id: data.id,
            },
        })
        .catch(error => {
            console.error("Error in logCustomerSubscriber:", error)
        })
}

export const config: SubscriberConfig = {
    event: "customer.created",
}

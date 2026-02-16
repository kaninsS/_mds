import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { logNewCustomerWorkflow } from "../workflows/log-new-customer"

export default async function logCustomerSubscriber({
    event: { data },
    container,
}: SubscriberArgs<{
    id: string
}>) {
    await logNewCustomerWorkflow(container)
        .run({
            input: {
                customer_id: data.id,
            },
        })
}

export const config: SubscriberConfig = {
    event: "customer.created",
}

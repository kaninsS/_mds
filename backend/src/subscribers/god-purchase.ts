import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { applyGodPromotionWorkflow } from "../workflows/promotion/god-promotion"

export default async function godPurchaseSubscriber({
    event: { data },
    container,
}: SubscriberArgs<{
    id: string
}>) {
    await applyGodPromotionWorkflow(container)
        .run({
            input: {
                cart_id: data.id,
            },
        })
}

export const config: SubscriberConfig = {
    event: ["cart.created", "cart.customer_transferred"],
}
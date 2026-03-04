import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { MARKETPLACE_MODULE } from "../modules/marketplace"
import MarketplaceModuleService from "../modules/marketplace/service"
import * as fs from "fs"
import * as path from "path"

export default async function orderPlacedSubscriber({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    try {
        const query = container.resolve("query")

        // 1. Fetch the order details
        const { data: orders } = await query.graph({
            entity: "order",
            fields: [
                "id",
                "display_id",
                "email",
                "total",
                "currency_code",
                "customer_id",
                "sales_channel_id",
                "created_at",
            ],
            filters: { id: data.id },
        })

        const order = orders?.[0]
        if (!order) return

        // 2. Try to find the vendor linked to this order
        const marketplaceModuleService: MarketplaceModuleService =
            container.resolve(MARKETPLACE_MODULE)

        let vendorName = "N/A"
        try {
            // Check vendor_order link to find the vendor
            const { data: vendorOrderLinks } = await query.graph({
                entity: "vendor_order",
                fields: ["vendor.id", "vendor.name"],
                filters: { order_id: order.id },
            })

            if (vendorOrderLinks?.[0]?.vendor) {
                vendorName = vendorOrderLinks[0].vendor.name
            }
        } catch {
            // Link may not exist yet at this point; that's OK
        }

        // 3. Log the event
        const logEntry = [
            `[${new Date().toISOString()}] order.placed`,
            `order_id=${order.id}`,
            `display_id=#${order.display_id}`,
            `email=${order.email}`,
            `total=${order.total} ${order.currency_code?.toUpperCase()}`,
            `vendor=${vendorName}`,
        ].join(" | ") + "\n"

        const logFilePath = path.join(process.cwd(), "..", "_tmp", "vendor-order-logs.txt")

        try {
            fs.mkdirSync(path.dirname(logFilePath), { recursive: true })
            fs.appendFileSync(logFilePath, logEntry)
        } catch (writeError) {
            console.error("[order-placed] Log write failed:", writeError)
        }

        console.log(`[order-placed] Order #${order.display_id} placed by ${order.email}`)
    } catch (error) {
        console.error("[order-placed] Error:", error)
    }
}

export const config: SubscriberConfig = {
    event: "order.placed",
}

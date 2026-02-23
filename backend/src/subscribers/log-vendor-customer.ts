import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { MARKETPLACE_MODULE } from "../modules/marketplace"
import MarketplaceModuleService from "../modules/marketplace/service"
import * as fs from "fs"
import * as path from "path"

export default async function logVendorCustomerSubscriber({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    try {
        // 1. Fetch customer details
        const query = container.resolve("query")
        const { data: customers } = await query.graph({
            entity: "customer",
            fields: ["id", "email", "first_name", "last_name", "created_at", "metadata"],
            filters: { id: data.id },
        })

        const customer = customers?.[0]
        if (!customer) return

        const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "N/A"

        // 2. Log to file
        const logEntry = `[${new Date().toISOString()}] customer.created | id=${customer.id} | email=${customer.email} | name=${name}\n`
        const logFilePath = path.join(process.cwd(), "..", "_tmp", "vendor-customer-logs.txt")
        try {
            fs.appendFileSync(logFilePath, logEntry)
        } catch (writeError) {
            console.error("[log-vendor-customer] Log write failed:", writeError)
        }

        // 3. If customer was registered via vendor invite, create VendorCustomer mapping
        const vendor_id = customer.metadata?.vendor_id as string | undefined
        if (!vendor_id) {
            console.log(`[log-vendor-customer] No vendor_id in metadata for customer ${customer.id} — skipping DB mapping`)
            return
        }

        const marketplaceModuleService: MarketplaceModuleService =
            container.resolve(MARKETPLACE_MODULE)

        // Check if mapping already exists (e.g. created by /store/vendor-register)
        const existing = await marketplaceModuleService.listVendorCustomers({
            customer_id: customer.id,
        })

        if (existing.length > 0) {
            console.log(`[log-vendor-customer] VendorCustomer mapping already exists for customer ${customer.id}`)
            return
        }

        await marketplaceModuleService.createVendorCustomers({
            customer_id: customer.id,
            vendor_id: vendor_id,
            status: "active",
            joined_at: new Date(),
        })

        console.log(`[log-vendor-customer] Created VendorCustomer: vendor=${vendor_id} customer=${customer.id}`)
    } catch (error) {
        console.error("[log-vendor-customer] Error:", error)
    }
}

export const config: SubscriberConfig = {
    event: "customer.created",
}

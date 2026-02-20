import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import * as fs from "fs"
import * as path from "path"

export default async function logVendorCustomerSubscriber({
    event: { data },
    container,
}: SubscriberArgs<{
    id: string
}>) {
    try {
        // Resolve the query service directly to fetch customer details
        const query = container.resolve("query")
        const { data: customers } = await query.graph({
            entity: "customer",
            fields: ["id", "email", "first_name", "last_name", "created_at"],
            filters: { id: data.id },
        })

        const customer = customers?.[0]
        if (!customer) return

        const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "N/A"
        const logEntry = `[${new Date().toISOString()}] New Customer Registered: ${customer.email} (ID: ${customer.id}) - Name: ${name}\n`

        const logFilePath = path.join(process.cwd(), "..", "_tmp", "vendor-customer-logs.txt")

        try {
            fs.appendFileSync(logFilePath, logEntry)
            console.log(`[log-vendor-customer] Logged customer to ${logFilePath}`)
        } catch (writeError) {
            console.error("[log-vendor-customer] Failed to write log:", writeError)
        }
    } catch (error) {
        console.error("[log-vendor-customer] Error:", error)
    }
}

export const config: SubscriberConfig = {
    event: "customer.created",
}

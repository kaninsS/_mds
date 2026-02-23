import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import * as fs from "fs"
import * as path from "path"

export type LogEntry = {
    timestamp: string
    message: string
    raw: string
}

import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import MarketplaceModuleService from "../../modules/marketplace/service"

const readVendorLogsStep = createStep(
    "read-vendor-logs-step",
    async (input: { vendor_id: string }, { container }) => {
        const logFilePath = path.join(process.cwd(), "..", "_tmp", "vendor-customer-logs.txt")

        let entries: LogEntry[] = []

        try {
            // 1. Get the customers belonging to this vendor
            const marketplaceModuleService: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE)
            const vendorCustomers = await marketplaceModuleService.listVendorCustomers({
                vendor_id: input.vendor_id
            })
            const validCustomerIds = new Set(vendorCustomers.map(vc => vc.customer_id))

            // 2. Read and filter logs
            if (fs.existsSync(logFilePath)) {
                const content = fs.readFileSync(logFilePath, "utf-8")
                const lines = content.split("\n").filter(line => line.trim() !== "")

                entries = lines.map(line => {
                    // Parse format: [ISO_DATE] Message
                    const match = line.match(/^\[(.+?)\]\s+(.+)$/)
                    if (match) {
                        return {
                            timestamp: match[1],
                            message: match[2],
                            raw: line,
                        }
                    }
                    return { timestamp: "", message: line, raw: line }
                }).filter(entry => {
                    // Extract customer ID from the log message (e.g. id=cus_01KHW...)
                    const idMatch = entry.raw.match(/id=(cus_[a-zA-Z0-9]+)/)
                    if (idMatch && idMatch[1]) {
                        return validCustomerIds.has(idMatch[1])
                    }
                    return false
                }).reverse() // newest first
            }
        } catch (error) {
            console.error("Failed to read vendor log file:", error)
        }

        return new StepResponse({ entries })
    }
)

export const getVendorLogsWorkflow = createWorkflow(
    "get-vendor-logs",
    (input: { vendor_id: string }) => {
        const { entries } = readVendorLogsStep(input)
        return new WorkflowResponse(entries)
    }
)

import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import * as fs from "fs"
import * as path from "path"

export type LogEntry = {
    timestamp: string
    message: string
    raw: string
}

const readVendorLogsStep = createStep(
    "read-vendor-logs-step",
    async () => {
        const logFilePath = path.join(process.cwd(), "..", "_tmp", "vendor-customer-logs.txt")

        let entries: LogEntry[] = []

        try {
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
    () => {
        const { entries } = readVendorLogsStep()
        return new WorkflowResponse(entries)
    }
)

import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import * as fs from "fs"
import * as path from "path"

type WorkflowInput = {
    customer_id: string
}

const logCustomerStep = createStep(
    "log-customer-step",
    async (input: { customer: any }) => {
        const { customer } = input

        const logEntry = `[${new Date().toISOString()}] New Customer: ${customer.email} (ID: ${customer.id}) - Name: ${customer.first_name || 'N/A'} ${customer.last_name || 'N/A'}\n`

        const logFilePath = path.join(process.cwd(), "customer-logs.txt")

        try {
            fs.appendFileSync(logFilePath, logEntry)
            console.log(`Successfully logged new customer to ${logFilePath}`)
        } catch (error) {
            console.error("Failed to write to customer log file:", error)
            throw new Error(`Failed to log customer: ${error.message}`)
        }

        return new StepResponse({ success: true })
    }
)

export const logNewCustomerWorkflow = createWorkflow(
    "log-new-customer",
    (input: WorkflowInput) => {
        const { data: customers } = useQueryGraphStep({
            entity: "customer",
            fields: ["email", "first_name", "last_name", "id"],
            filters: {
                id: input.customer_id,
            },
        })

        logCustomerStep({ customer: customers[0] })

        return new WorkflowResponse(customers[0])
    }
)

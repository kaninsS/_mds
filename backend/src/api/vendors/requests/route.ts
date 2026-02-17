import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

const requestSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    price: z.number().min(0),
    vendor_email: z.string().email(),
    image_url: z.string().optional(),
})

import { sendVendorRequestNotificationWorkflow } from "../../../workflows/vendor-request/send-vendor-request-notification"

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const result = requestSchema.safeParse(req.body)

    if (!result.success) {
        res.status(400).json({
            message: "Invalid request data",
            errors: result.error.flatten()
        })
        return
    }

    const { title, description, price, vendor_email, image_url } = result.data

    await sendVendorRequestNotificationWorkflow(req.scope).run({
        input: {
            title,
            description,
            price,
            vendor_email,
            image_url,
        }
    })

    // In a real implementation, we would use a notification service here.
    // const notificationService = req.scope.resolve("notificationService")
    // await notificationService.send(...)

    res.status(200).json({
        message: "Request submitted successfully",
        request: { title, description, price, image_url }
    })
}

import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../../../modules/marketplace/service"
import { refundPaymentWorkflow } from "@medusajs/core-flows"
import { getOrdersListWorkflow } from "@medusajs/core-flows"

export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id
    if (!actor_id) return res.status(401).json({ message: "Unauthorized" })

    const { id } = req.params as { id: string }
    const { amount, note } = req.body as { amount?: number; note?: string }

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"]
    })

    if (!vendorAdmin?.vendor) {
        return res.status(404).json({ message: "Vendor not found for this user" })
    }

    const salesChannelId = vendorAdmin.vendor.sales_channel_id

    try {
        // Verify the order belongs to this vendor
        const listWorkflow = getOrdersListWorkflow(req.scope)
        const { result } = await listWorkflow.run({
            input: {
                fields: [
                    "id",
                    "payment_collections.*",
                    "payment_collections.payments.*",
                    "payment_collections.payments.captures.*",
                    "sales_channel_id",
                ],
                variables: {
                    filters: {
                        id,
                        sales_channel_id: salesChannelId,
                        is_draft_order: false,
                    },
                },
            },
        })

        let orders: any[] = []
        if (Array.isArray(result)) {
            orders = result
        } else {
            orders = result.rows || []
        }

        if (orders.length === 0) {
            return res.status(404).json({ message: "Order not found or does not belong to vendor" })
        }

        const order = orders[0]

        // Find captured payments that can be refunded
        const capturedPayments: any[] = []
        for (const pc of order.payment_collections || []) {
            for (const payment of pc.payments || []) {
                if (payment.captured_at && !payment.canceled_at) {
                    capturedPayments.push(payment)
                }
            }
        }

        if (capturedPayments.length === 0) {
            return res.status(400).json({ message: "No captured payments available to refund" })
        }

        // Refund the first captured payment
        const payment = capturedPayments[0]
        const workflow = refundPaymentWorkflow(req.scope)
        const { result: refundResult } = await workflow.run({
            input: {
                payment_id: payment.id,
                created_by: actor_id,
                ...(amount != null ? { amount } : {}),
                ...(note ? { note } : {}),
            },
        })

        res.json({
            message: "Payment refunded successfully",
            refund: refundResult,
        })
    } catch (error: any) {
        console.error("Error refunding payment:", error)
        res.status(500).json({ message: "Failed to refund payment", error: error.message })
    }
}

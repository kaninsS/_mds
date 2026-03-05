import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../../modules/marketplace/service"
import { getOrdersListWorkflow } from "@medusajs/core-flows"

export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id
    if (!actor_id) return res.status(401).json({ message: "Unauthorized" })

    const { id } = req.params as { id: string }

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
        // Use the same workflow as the list endpoint for consistency
        const workflow = getOrdersListWorkflow(req.scope)

        const { result } = await workflow.run({
            input: {
                fields: [
                    "id",
                    "display_id",
                    "status",
                    "fulfillment_status",
                    "payment_status",
                    "total",
                    "subtotal",
                    "tax_total",
                    "discount_total",
                    "shipping_total",
                    "currency_code",
                    "created_at",
                    "email",
                    "items.*",
                    "customer.*",
                    "shipping_address.*",
                    "billing_address.*",
                    "fulfillments.*",
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

        res.json({ order: orders[0] })
    } catch (error: any) {
        console.error("Error fetching vendor order detail:", error)
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

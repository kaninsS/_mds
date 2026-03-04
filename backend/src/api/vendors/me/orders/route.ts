import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id

    if (!actor_id) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // 1. Get the vendor's sales_channel_id
    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"]
    })

    if (!vendorAdmin || !vendorAdmin.vendor) {
        res.status(404).json({ message: "Vendor not found for this user" })
        return
    }

    const salesChannelId = vendorAdmin.vendor.sales_channel_id
    console.log(`[vendor-orders] vendor_id=${vendorAdmin.vendor.id}, sales_channel_id=${salesChannelId}`)

    if (!salesChannelId) {
        return res.json({ orders: [], count: 0, offset: 0, limit: 0 })
    }

    // Read optional query params for filtering
    const statusFilter = req.query.status as string | undefined

    const filters: Record<string, any> = {
        sales_channel_id: salesChannelId,
    }

    if (statusFilter && statusFilter !== "all") {
        filters.status = statusFilter
    }

    try {
        // Use query.graph to fetch orders filtered by sales_channel_id
        const { data: orders } = await query.graph({
            entity: "order",
            fields: [
                "id",
                "display_id",
                "region_id",
                "sales_channel_id",
                "status",
                "fulfillment_status",
                "payment_status",
                "total",
                "subtotal",
                "tax_total",
                "currency_code",
                "email",
                "created_at",
                "customer.id",
                "customer.first_name",
                "customer.last_name",
                "customer.email",
                "items.id",
                "items.title",
                "items.variant_title",
                "items.quantity",
                "items.unit_price",
                "items.thumbnail",
                "shipping_address.*",
            ],
            filters,
        })

        console.log(`[vendor-orders] Found ${orders.length} orders for sales_channel_id=${salesChannelId}`)

        // Sort by created_at descending (newest first)
        orders.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        res.json({
            orders,
            count: orders.length,
            offset: 0,
            limit: orders.length,
        })
    } catch (error) {
        console.error("Error fetching orders:", error)
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

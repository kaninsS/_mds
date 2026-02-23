import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../../modules/marketplace/service"

export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id
    if (!actor_id) return res.status(401).json({ message: "Unauthorized" })

    const { id } = req.params as { id: string }

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"]
    })

    if (!vendorAdmin?.vendor) {
        return res.status(404).json({ message: "Vendor not found for this user" })
    }

    const vendorId = vendorAdmin.vendor.id

    // 1. Verify this order actually belongs to the vendor
    const query = {
        entryPoint: "vendor",
        fields: ["id"],
        filters: { id: vendorId },
        orders: {
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
                "currency_code",
                "created_at",
                "email",
                "items.*",
                "customer.*",
                "shipping_address.*",
                "billing_address.*",
                "fulfillments.*"
            ],
            filters: { id }
        }
    }

    try {
        const result = await remoteQuery(query)

        let vendor;
        if (Array.isArray(result)) {
            vendor = result[0];
        } else if (result && typeof result === 'object') {
            vendor = (result as any).data ? (result as any).data[0] : result;
        }

        const orders = vendor?.orders || []
        if (orders.length === 0) {
            return res.status(404).json({ message: "Order not found or does not belong to vendor" })
        }

        res.json({ order: orders[0] })
    } catch (error: any) {
        console.error("Error fetching vendor order detail:", error)
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

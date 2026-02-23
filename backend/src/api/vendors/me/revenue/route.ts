import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id
    if (!actor_id) return res.status(401).json({ message: "Unauthorized" })

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"]
    })
    if (!vendorAdmin?.vendor) return res.status(404).json({ message: "Vendor not found" })

    const vendor_id = vendorAdmin.vendor.id

    const orderItems = await marketplaceModuleService.listVendorOrderItems({
        vendor_id
    }, {
        order: { created_at: "DESC" }
    })

    const total_revenue = orderItems.reduce((acc, item) => acc + Number(item.subtotal), 0)

    const pending_payout = orderItems
        .filter(i => i.vendor_payout_status === "pending")
        .reduce((acc, item) => acc + Number(item.subtotal), 0)

    const paid_payout = orderItems
        .filter(i => i.vendor_payout_status === "paid")
        .reduce((acc, item) => acc + Number(item.subtotal), 0)

    res.json({
        total_revenue,
        pending_payout,
        paid_payout,
        items: orderItems
    })
}

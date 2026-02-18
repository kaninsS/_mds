import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

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

    // The actor_id is the VendorAdmin ID. We need to find the admin and then the vendor.
    // Actually, let's check how 'actor' is defined.
    // In `create-vendor` workflow: `value: vendorAdmin.id` is set as actor.
    // So actor_id IS vendorAdmin.id.

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"]
    })

    if (!vendorAdmin || !vendorAdmin.vendor) {
        res.status(404).json({ message: "Vendor not found for this user" })
        return
    }

    res.json({
        vendor: vendorAdmin.vendor,
        admin: vendorAdmin
    })
}

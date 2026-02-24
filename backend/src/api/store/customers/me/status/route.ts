import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../../modules/marketplace/service"

export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id
    if (!actor_id) return res.status(401).json({ status: "unauthorized" })

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    // Check if there are any "blocked" vendor mappings for this customer
    const vendorCustomers = await marketplaceModuleService.listVendorCustomers({
        customer_id: actor_id,
        status: "blocked"
    })

    if (vendorCustomers.length > 0) {
        return res.json({ status: "blocked" })
    }

    res.json({ status: "active" })
}

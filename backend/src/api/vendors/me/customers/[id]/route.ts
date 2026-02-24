import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../../modules/marketplace/service"

// ── DELETE /vendors/me/customers/:id ─────────────────────────────────────────
// Block a customer (sets status = "blocked")
export const DELETE = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id
    if (!actor_id) return res.status(401).json({ message: "Unauthorized" })

    const { id } = req.params as { id: string }

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    await marketplaceModuleService.updateVendorCustomers({
        id,
        status: "blocked",
    })

    res.json({ message: "Customer blocked successfully" })
}

// ── POST /vendors/me/customers/:id ─────────────────────────────────────────
// Unblock an active customer (sets status = "active")
export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id
    if (!actor_id) return res.status(401).json({ message: "Unauthorized" })

    const { id } = req.params as { id: string }

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    await marketplaceModuleService.updateVendorCustomers({
        id,
        status: "active",
    })

    res.json({ message: "Customer unblocked successfully" })
}

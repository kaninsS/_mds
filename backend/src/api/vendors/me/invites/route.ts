import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import jwt from "jsonwebtoken"

const INVITE_SECRET = process.env.JWT_SECRET ?? "marketplace-invite-secret"
const INVITE_EXPIRY = "7d"

// ── GET /vendors/me/invites ──────────────────────────────────────────────────
// Returns a fresh signed invite token for this vendor.
// The token encodes vendor_id and expires in 7 days.
export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id
    if (!actor_id) return res.status(401).json({ message: "Unauthorized" })

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"],
    })
    if (!vendorAdmin?.vendor) return res.status(404).json({ message: "Vendor not found" })

    const vendor_id = vendorAdmin.vendor.id

    const token = jwt.sign(
        { vendor_id, type: "vendor_invite" },
        INVITE_SECRET,
        { expiresIn: INVITE_EXPIRY }
    )

    const invite_url = `${process.env.CUSTOMER_STORE_URL ?? "http://localhost:8000"}/register?invite=${token}`

    res.json({
        token,
        invite_url,
        vendor_id,
        expires_in: INVITE_EXPIRY,
    })
}

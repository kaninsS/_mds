import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

// ── GET /store/vendor-lookup?code=VENDOR-ABC123 ───────────────────────────────
// Public endpoint: validates a storefront code and returns vendor info.
// Used by customer-store registration form to show vendor details before signup.
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const code = req.query.code as string

    if (!code) {
        return res.status(400).json({ message: "Query parameter 'code' is required" })
    }

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    const storefronts = await marketplaceModuleService.listVendorStorefronts(
        { storefront_code: code },
        { relations: ["vendor"] }
    )

    if (storefronts.length === 0) {
        return res.status(404).json({ message: "Invalid storefront code" })
    }

    const storefront = storefronts[0]

    if (!storefront.is_active) {
        return res.status(404).json({ message: "This storefront is currently inactive" })
    }

    res.json({
        vendor_id: storefront.vendor?.id,
        vendor_name: storefront.vendor?.name,
        vendor_handle: storefront.vendor?.handle,
        welcome_message: storefront.welcome_message,
    })
}

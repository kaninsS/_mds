import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import crypto from "crypto"

/**
 * Generates a random storefront code like "VENDOR-A1B2C3"
 */
function generateStorefrontCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(crypto.randomInt(chars.length))
    }
    return `VENDOR-${code}`
}

// ── GET /vendors/me/storefront ────────────────────────────────────────────────
// Returns the vendor's storefront config (code, welcome message, active status)
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

    const storefronts = await marketplaceModuleService.listVendorStorefronts(
        { vendor_id },
    )

    if (storefronts.length === 0) {
        return res.json({ storefront: null })
    }

    res.json({ storefront: storefronts[0] })
}

// ── POST /vendors/me/storefront ───────────────────────────────────────────────
// Creates or updates the vendor's storefront code.
// Body (all optional):
//   { storefront_code?: string, welcome_message?: string, is_active?: boolean }
// If storefront_code is omitted, one is auto-generated.
export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id
    if (!actor_id) return res.status(401).json({ message: "Unauthorized" })

    const {
        storefront_code,
        welcome_message,
        is_active,
    } = req.body as {
        storefront_code?: string
        welcome_message?: string
        is_active?: boolean
    }

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"],
    })
    if (!vendorAdmin?.vendor) return res.status(404).json({ message: "Vendor not found" })

    const vendor_id = vendorAdmin.vendor.id

    // Check if storefront already exists
    const existing = await marketplaceModuleService.listVendorStorefronts(
        { vendor_id },
    )

    let storefront
    if (existing.length > 0) {
        // Update existing storefront
        storefront = await marketplaceModuleService.updateVendorStorefronts({
            id: existing[0].id,
            ...(storefront_code !== undefined && { storefront_code }),
            ...(welcome_message !== undefined && { welcome_message }),
            ...(is_active !== undefined && { is_active }),
        })
    } else {
        // Create new storefront
        const code = storefront_code || generateStorefrontCode()
        storefront = await marketplaceModuleService.createVendorStorefronts({
            vendor_id,
            storefront_code: code,
            welcome_message: welcome_message || null,
            is_active: is_active !== undefined ? is_active : true,
        })
    }

    res.json({ storefront })
}

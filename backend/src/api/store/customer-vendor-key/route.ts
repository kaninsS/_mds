import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

// ── GET /store/customer-vendor-key ────────────────────────────────────────────
// Authenticated endpoint: returns the vendor's publishable API key token
// for the logged-in customer. Used by the storefront to swap the API key.
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const customer_id = (req as any).auth_context?.actor_id

    if (!customer_id) {
        return res.status(401).json({ message: "Not authenticated" })
    }

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    // 1. Find the customer's vendor
    const vendorCustomers = await marketplaceModuleService.listVendorCustomers({
        customer_id,
    })

    if (!vendorCustomers.length) {
        return res.json({ publishable_api_key: null })
    }

    const vendor_id = vendorCustomers[0].vendor_id

    // 2. Get the vendor's publishable_api_key_id
    const vendors = await marketplaceModuleService.listVendors({
        id: vendor_id,
    })

    if (!vendors.length || !vendors[0].publishable_api_key_id) {
        return res.json({ publishable_api_key: null })
    }

    const publishableApiKeyId = vendors[0].publishable_api_key_id

    // 3. Fetch the actual key token from the API Key module
    try {
        const apiKeyModuleService = req.scope.resolve(Modules.API_KEY)
        const apiKey = await apiKeyModuleService.retrieveApiKey(publishableApiKeyId)

        return res.json({
            publishable_api_key: apiKey.token,
        })
    } catch (e) {
        console.error("[customer-vendor-key] Error fetching API key:", e)
        return res.json({ publishable_api_key: null })
    }
}

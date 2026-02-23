import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

// ── GET /vendors/me/product-visibility ─────────────────────────────────────────
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

    const rules = await marketplaceModuleService.listVendorProductVisibilities(
        { vendor_id },
        { relations: ["visibility_rule_customers"] }
    )

    res.json({ rules, count: rules.length })
}

// ── POST /vendors/me/product-visibility ────────────────────────────────────────
// Create or update a product visibility rule
export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id
    if (!actor_id) return res.status(401).json({ message: "Unauthorized" })

    const { product_id, rule_type, visibility, customer_ids = [] } = req.body as {
        product_id: string
        rule_type: "all" | "customer" | "none"
        visibility: "visible" | "hidden"
        customer_ids?: string[]
    }

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"]
    })
    if (!vendorAdmin?.vendor) return res.status(404).json({ message: "Vendor not found" })

    const vendor_id = vendorAdmin.vendor.id

    // Check if rule already exists
    const existingRules = await marketplaceModuleService.listVendorProductVisibilities({
        vendor_id,
        product_id,
    }, { relations: ["visibility_rule_customers"] })

    let rule = existingRules[0]

    if (rule) {
        // Update existing
        rule = await marketplaceModuleService.updateVendorProductVisibilities({
            id: rule.id,
            rule_type,
            visibility,
        })

        // Delete existing customers
        if (existingRules[0].visibility_rule_customers?.length) {
            for (const rc of existingRules[0].visibility_rule_customers) {
                await marketplaceModuleService.deleteVendorProductVisibilityCustomers(rc.id)
            }
        }
    } else {
        // Create new
        rule = await marketplaceModuleService.createVendorProductVisibilities({
            vendor_id,
            product_id,
            rule_type,
            visibility,
        })
    }

    // Insert new customers if applicable
    if (rule_type === "customer" && customer_ids.length > 0) {
        const customerLinks = customer_ids.map(cid => ({
            visibility_rule_id: rule.id,
            customer_id: cid,
        }))
        await marketplaceModuleService.createVendorProductVisibilityCustomers(customerLinks)
    }

    const updatedRule = await marketplaceModuleService.retrieveVendorProductVisibility(rule.id, {
        relations: ["visibility_rule_customers"]
    })

    res.json({ rule: updatedRule })
}

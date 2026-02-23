import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import jwt from "jsonwebtoken"

const INVITE_SECRET = process.env.JWT_SECRET ?? "marketplace-invite-secret"

/**
 * POST /store/vendor-register
 *
 * Links an existing customer to a vendor using EITHER:
 *   - invite_token (signed JWT — existing flow)
 *   - storefront_code (vendor storefront code — new flow)
 *
 * Body:
 *   {
 *     customer_id: string
 *     invite_token?: string      ← signed JWT (Path A)
 *     storefront_code?: string   ← vendor storefront code (Path B)
 *   }
 *
 * At least one of invite_token or storefront_code must be provided.
 */
export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    console.log("[vendor-register] Hit endpoint")

    const { customer_id, invite_token, storefront_code } = req.body as {
        customer_id: string
        invite_token?: string
        storefront_code?: string
    }

    if (!customer_id) {
        return res.status(400).json({ message: "customer_id is required" })
    }

    if (!invite_token && !storefront_code) {
        return res.status(400).json({
            message: "Either invite_token or storefront_code is required",
        })
    }

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    // ── 1. Resolve vendor_id from either path ─────────────────────────────────
    let vendor_id: string

    if (invite_token) {
        // Path A: JWT invite token (existing flow)
        try {
            const payload = jwt.verify(invite_token, INVITE_SECRET) as {
                vendor_id: string
                type: string
            }
            if (payload.type !== "vendor_invite") throw new Error("Invalid token type")
            vendor_id = payload.vendor_id
            console.log("[vendor-register] Token valid. Vendor ID:", vendor_id)
        } catch (e: any) {
            console.log("[vendor-register] Token invalid:", e.message)
            return res.status(400).json({
                message: "Invalid or expired invite token",
                details: e.message,
            })
        }
    } else {
        // Path B: Storefront code (new flow)
        try {
            const storefronts = await marketplaceModuleService.listVendorStorefronts(
                { storefront_code },
                { relations: ["vendor"] }
            )

            if (storefronts.length === 0) {
                return res.status(400).json({ message: "Invalid storefront code" })
            }

            const storefront = storefronts[0]
            if (!storefront.is_active) {
                return res.status(400).json({ message: "This storefront is currently inactive" })
            }

            vendor_id = storefront.vendor?.id
            if (!vendor_id) {
                return res.status(400).json({ message: "Storefront code is not linked to a vendor" })
            }

            console.log("[vendor-register] Storefront code valid. Vendor ID:", vendor_id)
        } catch (e: any) {
            console.error("[vendor-register] Storefront code lookup failed:", e.message)
            return res.status(400).json({ message: "Invalid storefront code" })
        }
    }

    // ── 2. Verify vendor exists ────────────────────────────────────────────────
    try {
        await marketplaceModuleService.retrieveVendor(vendor_id)
        console.log("[vendor-register] Vendor exists")
    } catch (e) {
        console.log("[vendor-register] Vendor not found:", vendor_id)
        return res.status(404).json({ message: "Vendor not found" })
    }

    // ── 3. Verify customer exists ──────────────────────────────────────────────
    const query = req.scope.resolve("query")
    let customers
    try {
        const result = await query.graph({
            entity: "customer",
            fields: ["id"],
            filters: { id: customer_id },
        })
        customers = result.data
        console.log("[vendor-register] Evaluated customer existence. Found:", customers.length)
    } catch (e: any) {
        console.log("[vendor-register] Query graph failed:", e.message)
    }

    if (!customers || customers.length === 0) {
        console.log("[vendor-register] Customer not found:", customer_id)
        return res.status(404).json({ message: "Customer not found" })
    }

    // ── 4. Check existing map or create VendorCustomer mapping ───────────────
    try {
        console.log("[vendor-register] Checking existing mappings...")
        const existing = await marketplaceModuleService.listVendorCustomers({
            customer_id,
        })

        if (existing.length === 0) {
            console.log("[vendor-register] Creating new vendor customer mapping...")
            const created = await marketplaceModuleService.createVendorCustomers([{
                customer_id,
                vendor_id,
                status: "active",
                joined_at: new Date(),
            }])
            console.log("[vendor-register] Successfully created mapping:", created)
        } else {
            console.log("[vendor-register] Mapping already exists")
        }
    } catch (e: any) {
        console.error("[vendor-register] Failed to create VendorCustomer mapping!! Error:", e)
        return res.status(500).json({ message: "Failed to link mapping", error: e.message })
    }

    console.log("[vendor-register] Returning success response.")
    res.status(200).json({
        success: true,
        vendor_id,
        message: "Customer linked to vendor successfully.",
    })
}

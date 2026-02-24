import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

// ── GET /vendors/me/customers ─────────────────────────────────────────────────
// Returns all customers mapped to this vendor.
export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id
    if (!actor_id) return res.status(401).json({ message: "Unauthorized" })

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    // Resolve vendor from the logged-in admin
    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"],
    })
    if (!vendorAdmin?.vendor) return res.status(404).json({ message: "Vendor not found" })

    // Fetch all VendorCustomer rows for this vendor
    const vendorCustomers = await marketplaceModuleService.listVendorCustomers(
        { vendor_id: vendorAdmin.vendor.id },
        { select: ["id", "customer_id", "status", "joined_at", "invited_by"] }
    )

    // Enrich with actual customer details via the query layer
    const query = req.scope.resolve("query")
    const customerIds = vendorCustomers.map((vc) => vc.customer_id)

    let customerDetails: Record<string, any> = {}
    if (customerIds.length > 0) {
        const { data: customers } = await query.graph({
            entity: "customer",
            fields: ["id", "email", "first_name", "last_name", "created_at"],
            filters: { id: customerIds },
        })
        customers.forEach((c: any) => { customerDetails[c.id] = c })
    }

    const result = vendorCustomers.map((vc) => ({
        id: vc.id,
        status: vc.status,
        joined_at: vc.joined_at,
        customer: customerDetails[vc.customer_id] ?? { id: vc.customer_id },
    }))

    res.json({ customers: result, count: result.length })
}


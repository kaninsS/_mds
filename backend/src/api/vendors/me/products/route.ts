import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

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

    const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)

    // 1. Get Vendor Admin to find Vendor ID
    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"]
    })

    if (!vendorAdmin || !vendorAdmin.vendor) {
        res.status(404).json({ message: "Vendor not found for this user" })
        return
    }

    const vendorId = vendorAdmin.vendor.id

    // 2. Fetch products for this vendor using Remote Query
    const query = {
        entryPoint: "vendor",
        fields: ["id"],
        filters: { id: vendorId },
        products: {
            fields: [
                "id",
                "title",
                "handle",
                "thumbnail",
                "status",
                "created_at",
                "updated_at",
                "variants.id",
                "variants.title",
                "variants.prices.amount",
                "variants.prices.currency_code"
            ],
        }
    }

    console.log("Querying products for vendor:", vendorId)

    try {
        const result = await remoteQuery(query)
        console.log("Raw remoteQuery result:", JSON.stringify(result, null, 2))

        // Handle different return types safely
        let vendor;
        if (Array.isArray(result)) {
            vendor = result[0];
        } else if (result && typeof result === 'object') {
            // @ts-ignore
            vendor = result.data ? result.data[0] : result;
        }

        const products = vendor?.products || []
        const count = products.length

        res.json({
            products,
            count,
            offset: 0,
            limit: products.length
        })
    } catch (error) {
        console.error("Error fetching products:", error)
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

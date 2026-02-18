import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
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

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"]
    })

    if (!vendorAdmin || !vendorAdmin.vendor) {
        res.status(404).json({ message: "Vendor not found for this user" })
        return
    }

    const vendorId = vendorAdmin.vendor.id

    const query = {
        entryPoint: "vendor",
        fields: ["id"],
        filters: { id: vendorId },
        orders: {
            fields: [
                "id",
                "display_id",
                "region_id",
                "status",
                "fulfillment_status",
                "payment_status",
                "total",
                "currency_code",
                "created_at"
            ],
        }
    }

    try {
        const result = await remoteQuery(query)

        let vendor;
        if (Array.isArray(result)) {
            vendor = result[0];
        } else if (result && typeof result === 'object') {
            // @ts-ignore
            vendor = result.data ? result.data[0] : result;
        }

        const orders = vendor?.orders || []
        const count = orders.length

        res.json({
            orders,
            count,
            offset: 0,
            limit: orders.length
        })
    } catch (error) {
        console.error("Error fetching orders:", error)
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

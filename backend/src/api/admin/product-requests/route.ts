import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
    const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)

    const query = {
        entryPoint: "product_request",
        fields: [
            "id",
            "name",
            "description",
            "image_url",
            "status",
            "vendor_id",
            "created_at",
            "updated_at"
        ]
    }

    try {
        const result = await remoteQuery(query)
        // @ts-ignore
        const product_requests = Array.isArray(result) ? result : (result.data || [])

        const vendorIds = [...new Set(product_requests.map((pr: any) => pr.vendor_id).filter(Boolean))]

        let vendorsMap = new Map()
        if (vendorIds.length > 0) {
            const vendors = await marketplaceModuleService.listVendors({
                id: vendorIds
            })
            vendors.forEach(v => vendorsMap.set(v.id, v))
        }

        const enrichedProductRequests = product_requests.map((pr: any) => ({
            ...pr,
            vendor: pr.vendor_id ? vendorsMap.get(pr.vendor_id) : null
        }))

        res.json({
            product_requests: enrichedProductRequests,
            count: enrichedProductRequests.length,
            offset: 0,
            limit: enrichedProductRequests.length
        })
    } catch (error) {
        console.error("Error fetching product requests:", error)
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

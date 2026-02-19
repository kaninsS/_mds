import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import { PRODUCT_REQUEST_MODULE } from "../../../../modules/product-request"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import ProductRequestModuleService from "../../../../modules/product-request/service"
import { sendProductRequestNotificationWorkflow } from "../../../../workflows/product-request/send-notification"

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
        ],
        filters: {
            vendor_id: vendorId
        }
    }

    try {
        const result = await remoteQuery(query)
        // @ts-ignore
        const all_product_requests = Array.isArray(result) ? result : (result.data || [])

        // Manual filter to ensure isolation (remoteQuery filter might be ignored if field is missing in schema cache)
        const product_requests = all_product_requests.filter((pr: any) => pr.vendor_id === vendorId)

        res.json({
            product_requests,
            count: product_requests.length,
            offset: 0,
            limit: product_requests.length
        })
    } catch (error) {
        console.error("Error fetching product requests:", error)
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

export const POST = async (
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

    const productRequestModuleService: ProductRequestModuleService =
        req.scope.resolve(PRODUCT_REQUEST_MODULE)

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"]
    })

    if (!vendorAdmin || !vendorAdmin.vendor) {
        res.status(404).json({ message: "Vendor not found for this user" })
        return
    }

    const vendorId = vendorAdmin.vendor.id

    const { name, description, image_url } = req.body as any

    if (!name || !description) {
        res.status(400).json({ message: "Name and description are required" })
        return
    }

    try {
        const productRequest = await productRequestModuleService.createProductRequests({
            name,
            description,
            image_url,
            // @ts-ignore - DML model updated but types might lag
            vendor_id: vendorId,
            status: "pending"
        })

        // Trigger notification workflow
        await sendProductRequestNotificationWorkflow(req.scope)
            .run({
                input: {
                    productRequest,
                },
            })

        res.json({ product_request: productRequest })
    } catch (error) {
        console.error("Error creating product request:", error)
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

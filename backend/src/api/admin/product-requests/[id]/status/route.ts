import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { PRODUCT_REQUEST_MODULE } from "../../../../../modules/product-request"
import ProductRequestModuleService from "../../../../../modules/product-request/service"

export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const { id } = req.params
    const { status } = req.body as { status: string }

    if (!["pending", "progress", "success"].includes(status)) {
        res.status(400).json({ message: "Invalid status" })
        return
    }

    const productRequestModuleService: ProductRequestModuleService =
        req.scope.resolve(PRODUCT_REQUEST_MODULE)

    try {
        await productRequestModuleService.updateProductRequests({
            id,
            status: status as "pending" | "progress" | "success"
        })

        // Retrieve the updated record to return fresh data
        const productRequest = await productRequestModuleService.retrieveProductRequest(id)

        res.json({ product_request: productRequest })
    } catch (error: any) {
        console.error("Error updating product request:", error)
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

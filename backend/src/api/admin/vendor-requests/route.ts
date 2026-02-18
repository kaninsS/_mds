import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const { data: vendor_requests } = await query.graph({
        entity: "vendor_request",
        fields: ["*"],
    })

    res.json({ vendor_requests })
}

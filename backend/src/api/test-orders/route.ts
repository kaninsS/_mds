import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    try {
        const { data: orders } = await query.graph({
            entity: "order",
            fields: [
                "id",
                "display_id",
                "total",
                "subtotal",
                "tax_total",
                "currency_code",
                "sales_channel_id"
            ]
        })
        res.json({ orders })
    } catch (error: any) {
        res.status(500).json({ message: error.message })
    }
}

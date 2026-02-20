import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { getVendorLogsWorkflow } from "../../../../workflows/log-for-vendor"

export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id

    if (!actor_id) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }

    const { result: entries } = await getVendorLogsWorkflow(req.scope).run({})

    res.json({ logs: entries })
}

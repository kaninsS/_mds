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

    const query = req.scope.resolve("query") as any
    const { data: vendorAdmins } = await query.graph({
        entity: "vendor_admin",
        fields: ["vendor.id"],
        filters: { id: actor_id },
    })

    const vendor_id = vendorAdmins[0]?.vendor?.id

    if (!vendor_id) {
        res.status(400).json({ message: "Vendor not found for admin" })
        return
    }

    const { result: entries } = await getVendorLogsWorkflow(req.scope).run({
        input: { vendor_id }
    })

    res.json({ logs: entries })
}

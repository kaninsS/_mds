import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { getOrdersListWorkflow } from "@medusajs/core-flows"
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

    // Ensure vendor context exists
    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"]
    })

    if (!vendorAdmin || !vendorAdmin.vendor) {
        res.status(404).json({ message: "Vendor not found for this user" })
        return
    }

    // Force strict filtering by the vendor's assigned sales channel
    const salesChannelId = vendorAdmin.vendor.sales_channel_id

    // Mirror Medusa's standard internal logic for index listing
    const variables = {
        filters: {
            ...req.filterableFields,
            sales_channel_id: salesChannelId,
            is_draft_order: false,
        },
        ...req.queryConfig?.pagination,
    }

    const workflow = getOrdersListWorkflow(req.scope)

    try {
        const { result } = await workflow.run({
            input: {
                fields: req.queryConfig?.fields || [], // The Admin config normally populates this automatically
                variables,
            },
        })

        let rows: any[] = []
        let metadata = { count: 0, skip: 0, take: 0 }

        if (Array.isArray(result)) {
            rows = result
            metadata = {
                count: rows.length,
                skip: variables.skip || 0,
                take: variables.take || rows.length,
            }
        } else {
            rows = result.rows
            metadata = result.metadata
        }

        res.json({
            orders: rows,
            count: metadata.count,
            offset: metadata.skip,
            limit: metadata.take,
        })
    } catch (error: any) {
        console.error("Error fetching vendor orders:", error)
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"
import {
    createSalesChannelsWorkflow,
} from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

type CreateVendorSalesChannelStepInput = {
    vendor_id: string
    vendor_name: string
}

/**
 * Creates a dedicated Sales Channel for the vendor and links it.
 * Compensation: deletes the Sales Channel if the workflow fails.
 */
const createVendorSalesChannelStep = createStep(
    "create-vendor-sales-channel",
    async (input: CreateVendorSalesChannelStepInput, { container }) => {
        const link = container.resolve(ContainerRegistrationKeys.LINK)

        // 1. Create a dedicated Sales Channel for this vendor
        const { result: salesChannels } = await createSalesChannelsWorkflow(container).run({
            input: {
                salesChannelsData: [
                    {
                        name: `${input.vendor_name} Store`,
                        description: `Sales channel for vendor: ${input.vendor_name}`,
                    },
                ],
            },
        })

        const salesChannel = salesChannels[0]

        // 2. Link vendor → sales channel
        await link.create({
            [MARKETPLACE_MODULE]: {
                vendor_id: input.vendor_id,
            },
            [Modules.SALES_CHANNEL]: {
                sales_channel_id: salesChannel.id,
            },
        })

        // 3. Save the sales_channel_id directly onto the custom Vendor model
        const marketplaceModuleService: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE)
        await marketplaceModuleService.updateVendors({
            id: input.vendor_id,
            sales_channel_id: salesChannel.id,
        })

        return new StepResponse(
            { sales_channel: salesChannel },
            { sales_channel_id: salesChannel.id, vendor_id: input.vendor_id }
        )
    },
    async (compensationData, { container }) => {
        if (!compensationData) return

        const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
        const link = container.resolve(ContainerRegistrationKeys.LINK)

        // Remove the link
        await link.dismiss({
            [MARKETPLACE_MODULE]: {
                vendor_id: compensationData.vendor_id,
            },
            [Modules.SALES_CHANNEL]: {
                sales_channel_id: compensationData.sales_channel_id,
            },
        })

        // Delete the Sales Channel
        await salesChannelModuleService.deleteSalesChannels(compensationData.sales_channel_id)
    }
)

export default createVendorSalesChannelStep

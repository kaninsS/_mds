import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"
import {
    createApiKeysWorkflow,
    linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

type CreateVendorPublishableKeyStepInput = {
    vendor_id: string
    vendor_name: string
    sales_channel_id: string
}

/**
 * Creates a dedicated publishable API key for the vendor,
 * scoped to their sales channel. Saves the key ID on the vendor model.
 * Compensation: deletes the API key if the workflow fails.
 */
const createVendorPublishableKeyStep = createStep(
    "create-vendor-publishable-key",
    async (input: CreateVendorPublishableKeyStepInput, { container }) => {
        // 1. Create a publishable API key for this vendor
        const { result: apiKeys } = await createApiKeysWorkflow(container).run({
            input: {
                api_keys: [
                    {
                        title: `${input.vendor_name} Storefront Key`,
                        type: "publishable",
                        created_by: "",
                    },
                ],
            },
        })

        const apiKey = apiKeys[0]

        // 2. Link the vendor's sales channel to this publishable key
        await linkSalesChannelsToApiKeyWorkflow(container).run({
            input: {
                id: apiKey.id,
                add: [input.sales_channel_id],
            },
        })

        // 3. Save the publishable_api_key_id onto the vendor model
        const marketplaceModuleService: MarketplaceModuleService =
            container.resolve(MARKETPLACE_MODULE)
        await marketplaceModuleService.updateVendors({
            id: input.vendor_id,
            publishable_api_key_id: apiKey.id,
        })

        return new StepResponse(
            { api_key: apiKey },
            { api_key_id: apiKey.id, vendor_id: input.vendor_id }
        )
    },
    async (compensationData, { container }) => {
        if (!compensationData) return

        const { Modules } = await import("@medusajs/framework/utils")
        const apiKeyModuleService = container.resolve(Modules.API_KEY)

        // Delete the API key on rollback
        await apiKeyModuleService.deleteApiKeys(compensationData.api_key_id)

        // Clear the vendor field
        const marketplaceModuleService: MarketplaceModuleService =
            container.resolve(MARKETPLACE_MODULE)
        await marketplaceModuleService.updateVendors({
            id: compensationData.vendor_id,
            publishable_api_key_id: null,
        })
    }
)

export default createVendorPublishableKeyStep

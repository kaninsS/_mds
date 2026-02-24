import { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import {
  createWorkflow,
  transform,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import {
  createProductsWorkflow,
  CreateProductsWorkflowInput,
  createRemoteLinkStep,
  useQueryGraphStep
} from "@medusajs/medusa/core-flows"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import { Modules } from "@medusajs/framework/utils"

type WorkflowInput = {
  vendor_admin_id: string
  product: CreateProductWorkflowInputDTO
}

const createVendorProductWorkflow = createWorkflow(
  "create-vendor-product",
  (input: WorkflowInput) => {
    // Retrieve vendor admin to get vendor ID
    const { data: vendorAdmins } = useQueryGraphStep({
      entity: "vendor_admin",
      fields: ["vendor.id", "vendor.name"],
      filters: {
        id: input.vendor_admin_id
      }
    })

    // Try to resolve the vendor's dedicated Sales Channel
    // Falls back to the store default if no vendor Sales Channel exists
    const { data: vendorWithSC } = useQueryGraphStep({
      entity: "vendor",
      fields: ["id", "sales_channel_id"],
      filters: {
        id: vendorAdmins[0].vendor.id,
      },
    }).config({ name: "retrieve-vendor-sales-channel" })

    const { data: stores } = useQueryGraphStep({
      entity: "store",
      fields: ["default_sales_channel_id"],
    }).config({ name: "retrieve-store-defaults" })

    const productData = transform({
      input,
      vendorWithSC,
      stores
    }, (data) => {
      // Use vendor's Sales Channel, otherwise fall back to default
      const salesChannelId = data.vendorWithSC?.[0]?.sales_channel_id
        || data.stores[0].default_sales_channel_id

      return {
        products: [{
          ...data.input.product,
          sales_channels: [
            {
              id: salesChannelId
            }
          ]
        }]
      }
    })

    const createdProducts = createProductsWorkflow.runAsStep({
      input: productData as CreateProductsWorkflowInput
    })

    const linksToCreate = transform({
      input,
      createdProducts,
      vendorAdmins
    }, (data) => {
      return data.createdProducts.map((product) => {
        return {
          [MARKETPLACE_MODULE]: {
            vendor_id: data.vendorAdmins[0].vendor.id
          },
          [Modules.PRODUCT]: {
            product_id: product.id
          }
        }
      })
    })

    createRemoteLinkStep(linksToCreate)

    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: ["*", "variants.*"],
      filters: {
        id: createdProducts[0].id
      }
    }).config({ name: "retrieve-products" })

    return new WorkflowResponse({
      product: products[0]
    })
  }
)

export default createVendorProductWorkflow
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
    // Retrieve vendor admin to get vendor ID and their Sales Channel ID
    const { data: vendorAdmins } = useQueryGraphStep({
      entity: "vendor_admin",
      fields: ["vendor.id", "vendor.name", "vendor.sales_channel_id"],
      filters: {
        id: input.vendor_admin_id
      }
    })

    const { data: stores } = useQueryGraphStep({
      entity: "store",
      fields: ["default_sales_channel_id"],
    }).config({ name: "retrieve-store-defaults" })

    const productData = transform({
      input
    }, (data) => {
      return {
        products: [{
          ...data.input.product
        }]
      }
    })

    const createdProducts = createProductsWorkflow.runAsStep({
      input: productData as CreateProductsWorkflowInput
    })

    const linksToCreate = transform({
      input,
      createdProducts,
      vendorAdmins,
      stores
    }, (data) => {
      return data.createdProducts.flatMap((product) => {
        const links: any[] = [
          {
            [MARKETPLACE_MODULE]: {
              vendor_id: data.vendorAdmins[0].vendor.id
            },
            [Modules.PRODUCT]: {
              product_id: product.id
            }
          }
        ]

        // 1. Link to Vendor's isolated Sales Channel (for Dashboard isolation)
        const vendorScId = data.input.product.sales_channels?.[0]?.id
        if (vendorScId) {
          links.push({
            [Modules.PRODUCT]: { product_id: product.id },
            [Modules.SALES_CHANNEL]: { sales_channel_id: vendorScId }
          })
        }

        // 2. Link to Global Store Sales Channel (for Next.js Storefront unified shopping)
        const defaultScId = data.stores?.[0]?.default_sales_channel_id
        if (defaultScId && defaultScId !== vendorScId) {
          links.push({
            [Modules.PRODUCT]: { product_id: product.id },
            [Modules.SALES_CHANNEL]: { sales_channel_id: defaultScId }
          })
        }

        return links
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
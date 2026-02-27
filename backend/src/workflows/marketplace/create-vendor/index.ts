import {
  createWorkflow,
  transform,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import {
  setAuthAppMetadataStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import createVendorAdminStep from "./steps/create-vendor-admin"
import createVendorStep from "./steps/create-vendor"
import createVendorSalesChannelStep from "./steps/create-vendor-sales-channel"
import createVendorPublishableKeyStep from "./steps/create-vendor-publishable-key"

export type CreateVendorWorkflowInput = {
  name: string
  handle?: string
  logo?: string
  admin: {
    email: string
    first_name?: string
    last_name?: string
  }
  authIdentityId: string
}

const createVendorWorkflow = createWorkflow(
  "create-vendor",
  function (input: CreateVendorWorkflowInput) {
    const vendor = createVendorStep({
      name: input.name,
      handle: input.handle,
      logo: input.logo,
    })

    const vendorAdminData = transform({
      input,
      vendor
    }, (data) => {
      return {
        ...data.input.admin,
        vendor_id: data.vendor.id,
      }
    })

    const vendorAdmin = createVendorAdminStep(vendorAdminData)

    // Create a dedicated Sales Channel for the vendor
    const salesChannelData = transform({
      input,
      vendor,
    }, (data) => ({
      vendor_id: data.vendor.id,
      vendor_name: data.input.name,
    }))

    const salesChannelResult = createVendorSalesChannelStep(salesChannelData)

    // Create a dedicated publishable API key for the vendor,
    // scoped to their sales channel
    const pubKeyData = transform({
      input,
      vendor,
      salesChannelResult,
    }, (data) => ({
      vendor_id: data.vendor.id,
      vendor_name: data.input.name,
      sales_channel_id: data.salesChannelResult.sales_channel.id,
    }))

    createVendorPublishableKeyStep(pubKeyData)

    setAuthAppMetadataStep({
      authIdentityId: input.authIdentityId,
      actorType: "vendor",
      value: vendorAdmin.id,
    })

    const { data: vendorWithAdmin } = useQueryGraphStep({
      entity: "vendor",
      fields: ["id", "name", "handle", "logo", "admins.*"],
      filters: {
        id: vendor.id,
      },
    })

    return new WorkflowResponse({
      vendor: vendorWithAdmin[0] as any,
    })
  }
)

export default createVendorWorkflow



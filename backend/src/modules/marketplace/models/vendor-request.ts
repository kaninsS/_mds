import { model } from "@medusajs/framework/utils"

export const VendorRequest = model.define("vendor_request", {
    id: model.id().primaryKey(),
    title: model.text(),
    description: model.text().nullable(),
    price: model.bigNumber(),
    vendor_email: model.text(),
    image_url: model.text().nullable(),
    status: model.enum(["pending", "approved", "rejected"]).default("pending"),
})

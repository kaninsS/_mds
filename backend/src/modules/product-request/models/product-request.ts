import { model } from "@medusajs/framework/utils"

const ProductRequest = model.define("product_request", {
    id: model.id().primaryKey(),
    name: model.text(),
    description: model.text(),
    image_url: model.text().nullable(),
    vendor_id: model.text().nullable(),
    status: model.enum(["pending", "progress", "success"]).default("pending"),
})

export default ProductRequest

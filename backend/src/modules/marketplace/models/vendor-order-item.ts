import { model } from "@medusajs/framework/utils"

const VendorOrderItem = model.define("vendor_order_item", {
    id: model.id().primaryKey(),
    vendor_id: model.text(),
    order_id: model.text(),
    line_item_id: model.text(),
    subtotal: model.bigNumber(),
    vendor_payout_status: model.enum(["pending", "processing", "paid"]).default("pending"),
})

export default VendorOrderItem

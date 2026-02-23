import { model } from "@medusajs/framework/utils"
import VendorProductVisibility from "./vendor-product-visibility"

const VendorProductVisibilityCustomer = model.define("vendor_product_visibility_customer", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    visibility_rule: model.belongsTo(() => VendorProductVisibility, {
        mappedBy: "visibility_rule_customers",
    }),
})

export default VendorProductVisibilityCustomer

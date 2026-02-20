import { model } from "@medusajs/framework/utils"
import VendorProductVisibilityCustomer from "./vendor-product-visibility-customer"

const VendorProductVisibility = model.define("vendor_product_visibility", {
    id: model.id().primaryKey(),
    vendor_id: model.text(),
    product_id: model.text(),
    rule_type: model.enum(["all", "customer", "none"]).default("all"),
    visibility: model.enum(["visible", "hidden"]).default("visible"),
    visibility_rule_customers: model.hasMany(() => VendorProductVisibilityCustomer, {
        mappedBy: "visibility_rule",
    }),
})

export default VendorProductVisibility

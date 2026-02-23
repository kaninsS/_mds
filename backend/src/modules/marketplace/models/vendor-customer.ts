import { model } from "@medusajs/framework/utils"
import Vendor from "./vendor"

const VendorCustomer = model.define("vendor_customer", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    status: model.enum(["active", "invited", "blocked"]).default("active"),
    invited_by: model.text().nullable(),
    joined_at: model.dateTime().nullable(),
    vendor: model.belongsTo(() => Vendor, {
        mappedBy: "vendor_customers",
    }),
})

export default VendorCustomer

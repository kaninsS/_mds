import { model } from "@medusajs/framework/utils"
import Vendor from "./vendor"

const VendorStorefront = model.define("vendor_storefront", {
    id: model.id().primaryKey(),
    storefront_code: model.text().unique(),
    welcome_message: model.text().nullable(),
    is_active: model.boolean().default(true),
    vendor: model.belongsTo(() => Vendor, {
        mappedBy: "storefront",
    }),
})

export default VendorStorefront

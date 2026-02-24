import { model } from "@medusajs/framework/utils"
import VendorAdmin from "./vendor-admin"
import VendorCustomer from "./vendor-customer"
import VendorStorefront from "./vendor-storefront"

const Vendor = model.define("vendor", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  logo: model.text().nullable(),
  sales_channel_id: model.text().nullable(),
  admins: model.hasMany(() => VendorAdmin, {
    mappedBy: "vendor",
  }),
  vendor_customers: model.hasMany(() => VendorCustomer, {
    mappedBy: "vendor",
  }),
  storefront: model.hasOne(() => VendorStorefront, {
    mappedBy: "vendor",
  }),
})

export default Vendor
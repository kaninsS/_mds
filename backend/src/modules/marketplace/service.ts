import { MedusaService } from "@medusajs/framework/utils"
import Vendor from "./models/vendor"
import VendorAdmin from "./models/vendor-admin"
import VendorCustomer from "./models/vendor-customer"
import VendorProductVisibility from "./models/vendor-product-visibility"
import VendorProductVisibilityCustomer from "./models/vendor-product-visibility-customer"
import VendorOrderItem from "./models/vendor-order-item"

class MarketplaceModuleService extends MedusaService({
  Vendor,
  VendorAdmin,
  VendorCustomer,
  VendorProductVisibility,
  VendorProductVisibilityCustomer,
  VendorOrderItem,
}) {
}

export default MarketplaceModuleService
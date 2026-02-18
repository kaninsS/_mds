import { MedusaService } from "@medusajs/framework/utils"
import Vendor from "./models/vendor"
import VendorAdmin from "./models/vendor-admin"

import { VendorRequest } from "./models/vendor-request"

class MarketplaceModuleService extends MedusaService({
  Vendor,
  VendorAdmin,
  VendorRequest
}) {
}

export default MarketplaceModuleService
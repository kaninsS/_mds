import { defineLink } from "@medusajs/framework/utils"
import MarketplaceModule from "../modules/marketplace"
import CustomerModule from "@medusajs/medusa/customer"

export default defineLink(
    MarketplaceModule.linkable.vendorCustomer,
    {
        linkable: CustomerModule.linkable.customer,
        isList: false,
    }
)

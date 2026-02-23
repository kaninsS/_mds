import { defineLink } from "@medusajs/framework/utils"
import MarketplaceModule from "../modules/marketplace"
import SalesChannelModule from "@medusajs/medusa/sales-channel"

export default defineLink(
    MarketplaceModule.linkable.vendor,
    SalesChannelModule.linkable.salesChannel
)

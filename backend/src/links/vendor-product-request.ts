import { defineLink } from "@medusajs/framework/utils"
import MarketplaceModule from "../modules/marketplace"
import ProductRequestModule from "../modules/product-request"

export default defineLink(
    MarketplaceModule.linkable.vendor,
    {
        linkable: ProductRequestModule.linkable.productRequest.id,
        isList: true
    }
)

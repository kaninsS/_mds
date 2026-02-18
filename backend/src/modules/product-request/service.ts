import { MedusaService } from "@medusajs/framework/utils"
import ProductRequest from "./models/product-request"

class ProductRequestModuleService extends MedusaService({
    ProductRequest,
}) { }

export default ProductRequestModuleService

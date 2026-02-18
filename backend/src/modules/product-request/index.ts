import { Module } from "@medusajs/framework/utils"
import ProductRequestModuleService from "./service"

export const PRODUCT_REQUEST_MODULE = "productRequest"

export default Module(PRODUCT_REQUEST_MODULE, {
    service: ProductRequestModuleService,
})

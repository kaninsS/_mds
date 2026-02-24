import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { HttpTypes } from "@medusajs/framework/types"
import createVendorProductWorkflow from "../../../../workflows/marketplace/create-vendor-product"

export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id

    if (!actor_id) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }

    const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE)

    const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)

    // 1. Get Vendor Admin to find Vendor ID
    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(actor_id, {
        relations: ["vendor"]
    })

    if (!vendorAdmin || !vendorAdmin.vendor) {
        res.status(404).json({ message: "Vendor not found for this user" })
        return
    }

    const vendorId = vendorAdmin.vendor.id

    // 2. Fetch products for this vendor using the native query graph mapped by sales channel
    const salesChannelId = vendorAdmin.vendor.sales_channel_id

    if (!salesChannelId) {
        // Vendor doesn't have a specific sales channel mapped yet
        return res.json({
            products: [],
            count: 0,
            offset: 0,
            limit: 0
        })
    }

    const query = {
        entryPoint: "product",
        fields: [
            "id",
            "title",
            "handle",
            "thumbnail",
            "status",
            "created_at",
            "updated_at",
            "sales_channels.id",
            "variants.id",
            "variants.title",
            "variants.prices.amount",
            "variants.prices.currency_code"
        ]
    }

    try {
        const result = await remoteQuery(query)

        // Handle different return types safely
        let products: any[] = [];
        if (Array.isArray(result)) {
            products = result;
        } else if (result && typeof result === 'object') {
            // @ts-ignore
            products = result.data || [];
        }

        const rawProductsCount = products.length
        const rawProduct0 = products[0] || null

        // 3. Strictly filter in-memory to ensure only products actively assigned to this specific Sales Channel are returned
        products = products.filter((p: any) =>
            p.sales_channels?.some((sc: any) => sc.id === salesChannelId)
        )
        const count = products.length

        res.json({
            products,
            count,
            offset: 0,
            limit: products.length
        })
    } catch (error) {
        console.error("Error fetching products:", error)
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

export const POST = async (
    req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateProduct>,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id
    if (!actor_id) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const body = req.body as any

    // Prepare options and combinations. Fallback to a single Default Option.
    let options = [{ title: "Default Option", values: ["Default"] }]
    let variantCombinations: Record<string, string>[] = [{ "Default Option": "Default" }]

    if (body.options && Array.isArray(body.options) && body.options.length > 0) {
        options = body.options
        variantCombinations = options.reduce((acc: any[], currentOption: any) => {
            return acc.flatMap(combo =>
                currentOption.values.map((v: string) => ({ ...combo, [currentOption.title]: v }))
            )
        }, [{}])
    }

    const price = body.price ? Number(body.price) : 0
    const currency_code = body.currency_code?.toLowerCase() || "thb"

    const variants = variantCombinations.map(combo => {
        const variantTitle = Object.values(combo).join(" / ")
        return {
            title: variantTitle,
            manage_inventory: false,
            options: combo,
            prices: [
                {
                    amount: price,
                    currency_code
                }
            ]
        }
    })

    const productPayload = {
        title: body.title,
        description: body.description,
        thumbnail: body.thumbnail,
        options,
        variants
    }

    const { result } = await createVendorProductWorkflow(req.scope)
        .run({
            input: {
                vendor_admin_id: actor_id,
                product: productPayload
            }
        })

    res.json({
        product: result.product
    })
}

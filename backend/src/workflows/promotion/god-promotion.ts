import { createWorkflow, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateCartPromotionsStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { GOD_PROMOTION_CODE } from "../../constants"
import { PromotionActions } from "@medusajs/framework/utils"

type WorkflowInput = {
    cart_id: string
}

export const applyGodPromotionWorkflow = createWorkflow(
    "god-promotion",
    (input: WorkflowInput) => {
        const { data: carts } = useQueryGraphStep({
            entity: "cart",
            fields: ["promotions.*", "customer.*", "customer.orders.*"],
            filters: {
                id: input.cart_id,
            },
        })

        const { data: promotions } = useQueryGraphStep({
            entity: "promotion",
            fields: ["code"],
            filters: {
                code: GOD_PROMOTION_CODE,
            },
        }).config({ name: "retrieve-promotions" })

        when({
            carts,
            promotions,
        }, (data) => {
            return data.promotions.length > 0 &&
                !data.carts[0].promotions?.some((promo) => promo?.id === data.promotions[0].id) &&
                data.carts[0].customer !== null
        })
            .then(() => {
                updateCartPromotionsStep({
                    id: carts[0].id,
                    promo_codes: [promotions[0].code!],
                    action: PromotionActions.ADD,
                })
            })

        // retrieve updated cart
        const { data: updatedCarts } = useQueryGraphStep({
            entity: "cart",
            fields: ["*", "promotions.*"],
            filters: {
                id: input.cart_id,
            },
        }).config({ name: "retrieve-updated-cart" })

        return new WorkflowResponse(updatedCarts[0])
    }
)
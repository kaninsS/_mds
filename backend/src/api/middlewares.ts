import {
  defineMiddlewares,
  authenticate,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { AdminCreateProduct } from "@medusajs/medusa/api/admin/products/validators"
import { PostVendorCreateSchema } from "./vendors/route"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/products",
      method: ["GET"],
      middlewares: [
        async (req, res, next) => {
          const customer_id = (req as any).auth_context?.actor_id;
          if (!customer_id) return next();

          try {
            const marketplaceModuleService: any = req.scope.resolve("marketplaceModuleService");

            // 1. Get customer's vendor
            const vendorCustomers = await marketplaceModuleService.listVendorCustomers({
              customer_id
            });

            if (!vendorCustomers.length) return next();
            const vendor_id = vendorCustomers[0].vendor_id;

            // 2. Get visibility rules for this vendor
            const rules = await marketplaceModuleService.listVendorProductVisibilities(
              { vendor_id },
              { relations: ["visibility_rule_customers"] }
            );

            if (!rules.length) return next();

            // 3. Find hidden product IDs
            const hiddenProductIds = rules
              .filter((r: any) => {
                if (r.visibility === "hidden" || r.rule_type === "none") return true;
                if (r.rule_type === "customer") {
                  const allowedCustomers = r.visibility_rule_customers?.map((c: any) => c.customer_id) || [];
                  return !allowedCustomers.includes(customer_id);
                }
                return false;
              })
              .map((r: any) => r.product_id);

            if (hiddenProductIds.length > 0) {
              // Inject a negative filter to exclude these products
              req.filterableFields = req.filterableFields || {};
              req.filterableFields.id = { $nin: hiddenProductIds };
            }
          } catch (e) {
            console.error("Error in visibility middleware:", e);
          }
          return next();
        }
      ]
    },
    {
      matcher: "/vendors",
      method: ["POST"],
      middlewares: [
        authenticate("vendor", ["session", "bearer"], {
          allowUnregistered: true,
        }),
        validateAndTransformBody(PostVendorCreateSchema),
      ],
    },
    {
      matcher: "/vendors",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(
          z.object({
            limit: z.number().optional(),
            offset: z.number().optional(),
            order: z.string().optional(),
            fields: z.string().optional(),
          }),
          {
            defaults: [
              "id",
              "name",
              "handle",
              "logo",
            ],
            isList: true,
          }
        ),
      ],
    },
    {
      matcher: "/vendors/me",
      middlewares: [
        authenticate("vendor", ["session", "bearer"]),
      ]
    },
    {
      matcher: "/vendors/me/*",
      middlewares: [
        authenticate("vendor", ["session", "bearer"]),
      ]
    },
    {
      matcher: "/vendors/*",
      middlewares: [
        authenticate("vendor", ["session", "bearer"]),
      ]
    },
    {
      matcher: "/vendors/products",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(AdminCreateProduct),
      ]
    },
    {
      matcher: "/vendors*",
      middlewares: [
        (req, res, next) => {
          const cors = require("cors");
          const corsOptions = {
            origin: process.env.AUTH_CORS?.split(","),
            credentials: true,
          };
          cors(corsOptions)(req, res, next);
        }
      ]
    }
  ],
}
)
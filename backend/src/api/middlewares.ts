import {
  defineMiddlewares,
  authenticate,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { AdminCreateProduct } from "@medusajs/medusa/api/admin/products/validators"
import { PostVendorCreateSchema } from "./vendors/route"
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })

export default defineMiddlewares({
  routes: [
    // /store/products scoping is now handled natively by per-vendor
    // publishable API keys — no middleware filter needed.
    {
      matcher: "/store/customer-vendor-key",
      method: ["GET"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
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
      matcher: "/vendors/me/upload",
      method: ["POST"],
      middlewares: [
        upload.array("files"),
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
    },
    {
      matcher: "/vendors/me/orders",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(
          z.object({
            limit: z.coerce.number().optional().default(50),
            offset: z.coerce.number().optional().default(0),
            order: z.string().optional(),
            fields: z.string().optional(),
          }),
          {
            defaults: [
              "id",
              "status",
              "created_at",
              "email",
              "display_id",
              "custom_display_id",
              "payment_status",
              "fulfillment_status",
              "total",
              "currency_code",
              "*customer",
              "*sales_channel",
              "*payment_collections"
            ],
            isList: true,
          }
        ),
      ],
    }
  ],
}
)
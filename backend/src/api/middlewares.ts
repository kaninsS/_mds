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
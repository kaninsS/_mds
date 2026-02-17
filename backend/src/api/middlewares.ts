import multer from "multer"
import cors from "cors"
import {
  defineMiddlewares,
  authenticate,
  validateAndTransformBody
} from "@medusajs/framework/http"
import { AdminCreateProduct } from "@medusajs/medusa/api/admin/products/validators"
import { PostVendorCreateSchema } from "./vendors/route"

const upload = multer({ storage: multer.memoryStorage() })

const storeCors = cors({
  origin: process.env.STORE_CORS!.split(","),
  credentials: true,
})

export default defineMiddlewares({
  routes: [
    {
      matcher: "/vendors",
      method: ["POST"],
      middlewares: [
        storeCors,
        authenticate("vendor", ["session", "bearer"], {
          allowUnregistered: true,
        }),
        validateAndTransformBody(PostVendorCreateSchema),
      ],
    },
    {
      matcher: "/vendors",
      method: ["OPTIONS"],
      middlewares: [storeCors],
    },
    {
      matcher: "/vendors/*",
      method: ["POST", "GET", "PUT", "DELETE"],
      middlewares: [
        storeCors,
        authenticate("vendor", ["session", "bearer"], {
          allowUnregistered: true
        }),
      ]
    },
    {
      matcher: "/vendors/*",
      method: ["OPTIONS"],
      middlewares: [storeCors]
    },
    {
      matcher: "/vendors/products",
      method: ["POST"],
      middlewares: [
        storeCors,
        validateAndTransformBody(AdminCreateProduct),
      ]
    },
    {
      matcher: "/vendors/products",
      method: ["OPTIONS"],
      middlewares: [storeCors]
    },
    {
      matcher: "/vendors/uploads",
      method: ["POST"],
      middlewares: [
        storeCors,
        upload.array("files"),
      ],
    },
    {
      matcher: "/vendors/uploads",
      method: ["OPTIONS"],
      middlewares: [storeCors],
    },
  ],
})
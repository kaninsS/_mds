import multer from "multer"
import cors from "cors"
import fs from "fs"
import path from "path"
import mime from "mime-types"
import {
  defineMiddlewares,
  authenticate,
  validateAndTransformBody,
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction
} from "@medusajs/framework/http"
import { AdminCreateProduct } from "@medusajs/medusa/api/admin/products/validators"
import { PostVendorCreateSchema } from "./vendors/route"

const upload = multer({ storage: multer.memoryStorage() })

const storeCors = cors({
  origin: process.env.STORE_CORS!.split(","),
  credentials: true,
})

const staticFileMiddleware = (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
  const baseUrl = "/static"
  console.log(`[Static] Request: ${req.path}`)

  if (!req.path.startsWith(baseUrl)) {
    return next()
  }
  const filePath = req.path.replace(baseUrl, "")
  const fullPath = path.resolve(process.cwd(), "static", filePath.startsWith("/") ? filePath.slice(1) : filePath)

  console.log(`[Static] Attempting to serve: ${fullPath} (Computed from ${req.path})`)

  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    console.log(`[Static] File NOT found: ${fullPath}`)
    return next()
  }

  const stat = fs.statSync(fullPath)
  const mimeType = mime.lookup(fullPath) || "application/octet-stream"

  console.log(`[Static] Serving file: ${fullPath} (${mimeType})`)

  res.writeHead(200, {
    "Content-Type": mimeType,
    "Content-Length": stat.size,
  })

  const readStream = fs.createReadStream(fullPath)
  readStream.pipe(res)
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/static/*",
      method: "GET",
      middlewares: [staticFileMiddleware],
    },
    ...[
      "/vendors",
      "/vendors/*",
      "/vendors/products",
      "/vendors/uploads",
    ].map((route) => ({
      matcher: route,
      method: ["OPTIONS"] as "OPTIONS"[],
      middlewares: [storeCors],
    })),
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
      matcher: "/vendors/products",
      method: ["POST"],
      middlewares: [
        storeCors,
        validateAndTransformBody(AdminCreateProduct),
      ]
    },
    {
      matcher: "/vendors/uploads",
      method: ["POST"],
      middlewares: [
        storeCors,
        upload.array("files"),
      ],
    },
  ],
})
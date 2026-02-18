import {
  AuthenticatedMedusaRequest,
  MedusaResponse
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import createVendorWorkflow, {
  CreateVendorWorkflowInput
} from "../../workflows/marketplace/create-vendor";
import { MARKETPLACE_MODULE } from "../../modules/marketplace";
import MarketplaceModuleService from "../../modules/marketplace/service";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const marketplaceModuleService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)

  const [vendors, count] = await marketplaceModuleService.listAndCountVendors(
    req.filterableFields,
    req.queryConfig
  )

  res.json({
    vendors,
    count,
    limit: req.queryConfig.pagination.take,
    offset: req.queryConfig.pagination.skip,
  })
}

export const PostVendorCreateSchema = z.object({
  name: z.string(),
  handle: z.string().optional(),
  logo: z.string().optional(),
  admin: z.object({
    email: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional()
  }).strict()
}).strict()

type RequestBody = z.infer<typeof PostVendorCreateSchema>

export const POST = async (
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) => {
  // If `actor_id` is present, the request carries 
  // authentication for an existing vendor admin
  if (req.auth_context?.actor_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Request already authenticated as a vendor."
    )
  }

  const vendorData = req.validatedBody

  // create vendor admin
  const { result } = await createVendorWorkflow(req.scope)
    .run({
      input: {
        ...vendorData,
        authIdentityId: req.auth_context.auth_identity_id,
      } as CreateVendorWorkflowInput
    })

  res.json({
    vendor: result.vendor,
  })
}
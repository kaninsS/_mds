import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/core-flows"
import { MedusaError } from "@medusajs/framework/utils"

export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const actor_id = req.auth_context?.actor_id

    if (!actor_id) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const input = req.files as Express.Multer.File[]

    if (!input?.length) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "No files were uploaded")
    }

    try {
        const { result } = await uploadFilesWorkflow(req.scope).run({
            input: {
                files: input.map((f) => ({
                    filename: f.originalname,
                    mimeType: f.mimetype,
                    content: f.buffer.toString("base64"),
                    access: "public",
                })),
            },
        })

        res.status(200).json({ files: result })
    } catch (error: any) {
        console.error("Upload error:", error)
        res.status(500).json({ message: "Failed to upload files", error: error.message })
    }
}

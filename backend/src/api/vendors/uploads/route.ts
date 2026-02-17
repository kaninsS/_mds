import {
    AuthenticatedMedusaRequest,
    MedusaResponse
} from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"

export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    const input = (req as any).files as Express.Multer.File[]

    if (!input || !input.length) {
        res.status(400).json({ message: "No files uploaded" })
        return
    }

    const { result } = await uploadFilesWorkflow(req.scope).run({
        input: {
            files: input?.map((f) => ({
                filename: f.originalname,
                mimeType: f.mimetype,
                content: f.buffer.toString("binary"),
                access: "public",
            })),
        },
    })

    res.json({
        files: result,
    })
}

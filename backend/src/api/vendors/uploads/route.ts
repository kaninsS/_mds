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

    // Ensure we return a full URL if the file service didn't
    const files = result.map(file => {
        if (file.url.startsWith("http")) return file
        const baseUrl = process.env.BACKEND_URL || "http://localhost:9000"
        // If url is just filename or relative path
        const cleanUrl = file.url.startsWith("/") ? file.url.slice(1) : file.url
        // If it already includes static, don't duplicate
        if (cleanUrl.includes("static")) {
            return { ...file, url: `${baseUrl}/${cleanUrl}` }
        }
        return { ...file, url: `${baseUrl}/static/${cleanUrl}` }
    })

    res.json({
        files,
    })
}

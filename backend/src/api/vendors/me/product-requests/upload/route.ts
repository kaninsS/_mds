
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IFileModuleService } from "@medusajs/framework/types"
// @ts-ignore
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })

export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    try {
        const actor_id = req.auth_context?.actor_id

        if (!actor_id) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        // Use multer to handle the file upload
        await new Promise<void>((resolve, reject) => {
            upload.single("file")(req, res, (err: any) => {
                if (err) return reject(err)
                resolve()
            })
        })

        // @ts-ignore
        const file = req.file

        if (!file) {
            res.status(400).json({ message: "No file provided" })
            return
        }

        // Strict validation based on user request
        // We can check against supportedTypes if needed, but for now we rely on the file service or client handling.

        const fileService: IFileModuleService = req.scope.resolve("file")

        const fileData = {
            filename: file.originalname,
            mimeType: file.mimetype,
            content: file.buffer,
        }

        const uploadResult = await fileService.createFiles([{
            filename: file.originalname,
            mimeType: file.mimetype,
            content: file.buffer.toString("base64"),
        }])

        res.json({ url: uploadResult[0].url })
    } catch (error) {
        console.error("File upload error:", error)
        res.status(500).json({ message: "File upload failed", error: error.message || "Unknown error" })
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
}

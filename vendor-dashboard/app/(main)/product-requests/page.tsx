"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/client"
import {
    Container,
    Heading,
    Table,
    StatusBadge,
    Text,
    Button,
    Input,
    Textarea,
    Label,
    toast,
} from "@medusajs/ui"
import { PlusMini, XMark } from "@medusajs/icons"

type ProductRequest = {
    id: string
    name: string
    description: string
    image_url: string | null
    status: "pending" | "progress" | "success"
    created_at: string
    updated_at: string
}

const STATUS_COLOR: Record<string, "orange" | "blue" | "green"> = {
    pending: "orange",
    progress: "blue",
    success: "green",
}

export default function ProductRequestsPage() {
    const [requests, setRequests] = useState<ProductRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({ name: "", description: "", image_url: "" })

    // New state for file upload
    const [isUploadMode, setIsUploadMode] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)

    const fetchRequests = async () => {
        const token = localStorage.getItem("medusa_auth_token")
        if (!token) return
        try {
            // @ts-ignore
            const { product_requests } = await sdk.client.fetch("/vendors/me/product-requests", {
                headers: { Authorization: `Bearer ${token}` },
            })
            setRequests(product_requests || [])
        } catch (e) {
            console.error("Failed to fetch product requests", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const token = localStorage.getItem("medusa_auth_token")
        if (!token) return

        setUploadingFile(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch("http://localhost:9000/vendors/me/product-requests/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error("Upload failed details:", errorData)
                throw new Error(`Upload failed with status ${response.status}: ${JSON.stringify(errorData)}`)
            }

            const data = await response.json()

            if (data.url) {
                setForm(prev => ({ ...prev, image_url: data.url }))
                toast.success("File uploaded successfully")
            } else {
                console.error("No URL returned", data)
                toast.error("Upload succeeded but no URL returned")
            }
        } catch (error) {
            console.error("Upload failed", error)
            toast.error(`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`)
        } finally {
            setUploadingFile(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem("medusa_auth_token")
        if (!token) return
        setSubmitting(true)
        try {
            // @ts-ignore
            await sdk.client.fetch("/vendors/me/product-requests", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: {
                    name: form.name,
                    description: form.description,
                    image_url: form.image_url || null,
                },
            })
            toast.success("Product request submitted!")
            setForm({ name: "", description: "", image_url: "" })
            setShowForm(false)
            await fetchRequests()
        } catch (e) {
            console.error("Failed to create product request", e)
            toast.error("Failed to submit request")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center p-8">
                    <Text>Loading product requests...</Text>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <Heading level="h1">Product Requests</Heading>
                <Button
                    variant="primary"
                    size="small"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? (
                        <><XMark className="mr-1" /> Cancel</>
                    ) : (
                        <><PlusMini className="mr-1" /> New Request</>
                    )}
                </Button>
            </div>

            {showForm && (
                <div className="mb-6 p-6 border border-ui-border-base rounded-lg bg-ui-bg-subtle">
                    <Heading level="h2" className="mb-4">Request a New Product</Heading>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="name" className="mb-1 block">Product Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Custom T-Shirt"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="description" className="mb-1 block">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the product you'd like to request..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label className="mb-2 block">Image Source</Label>
                            <div className="flex gap-4 mb-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        id="source-url"
                                        name="image-source"
                                        checked={!isUploadMode}
                                        onChange={() => setIsUploadMode(false)}
                                        className="accent-ui-fg-interactive"
                                    />
                                    <label htmlFor="source-url" className="text-ui-fg-base text-small cursor-pointer">Image URL</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        id="source-upload"
                                        name="image-source"
                                        checked={isUploadMode}
                                        onChange={() => setIsUploadMode(true)}
                                        className="accent-ui-fg-interactive"
                                    />
                                    <label htmlFor="source-upload" className="text-ui-fg-base text-small cursor-pointer">Upload File</label>
                                </div>
                            </div>

                            {isUploadMode ? (
                                <div key="upload-mode">
                                    <Label htmlFor="file-upload" className="mb-1 block">Select File</Label>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml,image/tiff,image/heic,image/x-adobe-dng"
                                        onChange={handleFileUpload}
                                        disabled={uploadingFile}
                                    />
                                    <Text className="text-ui-fg-subtle text-small mt-1">
                                        Supported types: JPEG, PNG, GIF, WebP, AVIF, SVG, TIFF, HEIC, RAW
                                    </Text>
                                    {uploadingFile && <Text className="text-ui-fg-interactive mt-1">Uploading...</Text>}
                                </div>
                            ) : (
                                <div key="url-mode">
                                    <Label htmlFor="image_url" className="mb-1 block">Image URL</Label>
                                    <Input
                                        id="image_url"
                                        placeholder="https://example.com/image.jpg"
                                        value={form.image_url || ""}
                                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                    />
                                </div>
                            )}

                            {form.image_url && (
                                <div className="mt-4">
                                    <Label className="mb-2 block">Image Preview</Label>
                                    <div className="relative h-40 w-40 rounded-lg overflow-hidden border border-ui-border-base bg-ui-bg-base">
                                        <img
                                            src={form.image_url}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    </div>
                                    <Button
                                        variant="transparent"
                                        size="small"
                                        className="text-ui-fg-error mt-1"
                                        onClick={() => setForm({ ...form, image_url: "" })}
                                        type="button"
                                    >
                                        Remove Image
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" isLoading={submitting || uploadingFile} variant="primary">
                                Submit Request
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Image</Table.HeaderCell>
                        <Table.HeaderCell>Product Name</Table.HeaderCell>
                        <Table.HeaderCell>Description</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Date</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {requests.length === 0 ? (
                        <Table.Row>
                            <Table.Cell className="text-center text-ui-fg-subtle py-8">
                                No product requests yet. Click "New Request" to get started.
                            </Table.Cell>
                        </Table.Row>
                    ) : (
                        requests.map((req) => (
                            <Table.Row key={req.id}>
                                <Table.Cell>
                                    {req.image_url ? (
                                        <img
                                            src={req.image_url}
                                            alt={req.name}
                                            className="h-10 w-10 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-md bg-ui-bg-subtle flex items-center justify-center">
                                            <span className="text-ui-fg-muted">-</span>
                                        </div>
                                    )}
                                </Table.Cell>
                                <Table.Cell className="font-medium">{req.name}</Table.Cell>
                                <Table.Cell className="max-w-xs truncate text-ui-fg-subtle">
                                    {req.description}
                                </Table.Cell>
                                <Table.Cell>
                                    <StatusBadge color={STATUS_COLOR[req.status] ?? "grey"}>
                                        {req.status}
                                    </StatusBadge>
                                </Table.Cell>
                                <Table.Cell className="text-ui-fg-subtle">
                                    {new Date(req.created_at).toISOString().split('T')[0]}
                                </Table.Cell>
                            </Table.Row>
                        ))
                    )}
                </Table.Body>
            </Table>
        </Container>
    )
}

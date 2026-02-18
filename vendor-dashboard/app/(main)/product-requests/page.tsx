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
                            <Label htmlFor="image_url" className="mb-1 block">Image URL (optional)</Label>
                            <Input
                                id="image_url"
                                placeholder="https://example.com/image.jpg"
                                value={form.image_url}
                                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" isLoading={submitting} variant="primary">
                                Submit Request
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <Table>
                <Table.Header>
                    <Table.Row>
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
                                    {new Date(req.created_at).toLocaleDateString()}
                                </Table.Cell>
                            </Table.Row>
                        ))
                    )}
                </Table.Body>
            </Table>
        </Container>
    )
}

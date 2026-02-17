"use client"

import { Button, Container, Heading, Table, StatusBadge, IconButton, Input, FocusModal, Label, Textarea, useToggleState, toast, Toaster } from "@medusajs/ui"
import { Plus, EllipsisHorizontal, MagnifyingGlass, Pencil, Trash } from "@medusajs/icons"
import { useState } from "react"

const MOCK_VENDOR_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3Rvcl9pZCI6IiIsImFjdG9yX3R5cGUiOiJ2ZW5kb3IiLCJhdXRoX2lkZW50aXR5X2lkIjoiYXV0aGlkXzAxS0hORENRNzJHODNHS0hONzBRVFFOOUg4IiwiYXBwX21ldGFkYXRhIjp7InJvbGVzIjpbXX0sInVzZXJfbWV0YWRhdGEiOnt9LCJpYXQiOjE3NzEzMjAyNzIsImV4cCI6MTc3MTQwNjY3Mn0.c2NBAqR3Ng6dI55GeZaM9X5tKY1iwr_4qXl6euyuDYA"

const products = [
    {
        id: "prod_01",
        title: "Medusa T-Shirt",
        status: "published",
        inventory: 120,
        price: "$25.00",
        collection: "Merch",
    },
    {
        id: "prod_02",
        title: "Medusa Hoodie",
        status: "published",
        inventory: 50,
        price: "$45.00",
        collection: "Merch",
    },
    {
        id: "prod_03",
        title: "Medusa Coffee Mug",
        status: "draft",
        inventory: 0,
        price: "$15.00",
        collection: "Accessories",
    },
    {
        id: "prod_04",
        title: "Medusa Sticker Pack",
        status: "published",
        inventory: 500,
        price: "$5.00",
        collection: "Accessories",
    },
]

export default function DashboardPage() {
    const { state: isRequestOpen, open: openRequest, close: closeRequest } = useToggleState()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

        // @ts-ignore
        const formData = new FormData(e.target)
        let imageUrl = ""

        const imageFile = formData.get("image") as File
        if (imageFile && imageFile.size > 0) {
            try {
                const uploadFormData = new FormData()
                uploadFormData.append("files", imageFile)

                const uploadResponse = await fetch(`${backendUrl}/vendors/uploads`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${MOCK_VENDOR_TOKEN}`,
                    },
                    body: uploadFormData,
                    credentials: "include",
                })

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json()
                    imageUrl = uploadResult.files[0]?.url
                } else {
                    console.error("Failed to upload image")
                    toast.error("Image Upload Failed", {
                        description: "Could not upload the selected image.",
                    })
                    setIsSubmitting(false)
                    return
                }
            } catch (error) {
                console.error("Error uploading image:", error)
                setIsSubmitting(false)
                return
            }
        }

        const data = {
            title: formData.get("title"),
            description: formData.get("description"),
            price: Number(formData.get("price")),
            vendor_email: "vendor@example.com", // Hardcoded for demo
            image_url: imageUrl,
        }

        try {
            const response = await fetch(`${backendUrl}/vendors/requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${MOCK_VENDOR_TOKEN}`,
                },
                body: JSON.stringify(data),
                credentials: "include",
            })

            if (response.ok) {
                toast.success("Request submitted", {
                    description: "Admin has been notified of your product request.",
                })
                closeRequest()
                // @ts-ignore
                e.target.reset()
            } else {
                throw new Error("Failed to submit")
            }
        } catch (error) {
            toast.error("Error", {
                description: "Failed to submit request. Please try again.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-ui-bg-subtle p-8">
            <Toaster />
            <Container className="flex flex-col gap-y-8 min-h-[calc(100vh-64px)]">
                <div className="flex items-center justify-between">
                    <div>
                        <Heading level="h1" className="text-2xl font-medium text-ui-fg-base">
                            Products
                        </Heading>
                        <p className="text-ui-fg-subtle text-sm mt-1">
                            Manage your product catalog
                        </p>
                    </div>
                    <div className="flex gap-x-2">
                        <FocusModal open={isRequestOpen} onOpenChange={(open) => open ? openRequest() : closeRequest()}>
                            <FocusModal.Trigger asChild>
                                <Button variant="secondary">
                                    <Plus />
                                    Request Product
                                </Button>
                            </FocusModal.Trigger>
                            <FocusModal.Content>
                                <FocusModal.Header>
                                    <FocusModal.Title asChild>
                                        <Heading className="ml-4">Request New Product</Heading>
                                    </FocusModal.Title>
                                </FocusModal.Header>
                                <FocusModal.Body className="flex flex-col items-center py-16">
                                    <div className="flex w-full max-w-lg flex-col gap-y-8">
                                        <div className="flex flex-col gap-y-1">
                                            <FocusModal.Description className="text-ui-fg-subtle">
                                                Submit a request for a new product to be added to your catalog.
                                            </FocusModal.Description>
                                        </div>
                                        <form onSubmit={handleRequestSubmit} className="flex flex-col gap-y-4">
                                            <div className="flex flex-col gap-y-2">
                                                <Label htmlFor="title" className="text-ui-fg-subtle">Product Title</Label>
                                                <Input id="title" name="title" required placeholder="e.g. Winter Jacket" />
                                            </div>
                                            <div className="flex flex-col gap-y-2">
                                                <Label htmlFor="price" className="text-ui-fg-subtle">Suggested Price</Label>
                                                <Input id="price" name="price" type="number" min="0" step="0.01" required placeholder="0.00" />
                                            </div>
                                            <div className="flex flex-col gap-y-2">
                                                <Label htmlFor="description" className="text-ui-fg-subtle">Description</Label>
                                                <Textarea id="description" name="description" placeholder="Describe the product details..." />
                                            </div>
                                            <div className="flex flex-col gap-y-2">
                                                <Label htmlFor="image" className="text-ui-fg-subtle">Product Image</Label>
                                                <Input id="image" name="image" type="file" accept="image/*" />
                                            </div>
                                            <div className="flex items-center justify-end gap-x-2 mt-4">
                                                <Button variant="secondary" type="button" onClick={closeRequest}>Cancel</Button>
                                                <Button type="submit" isLoading={isSubmitting}>Submit Request</Button>
                                            </div>
                                        </form>
                                    </div>
                                </FocusModal.Body>
                            </FocusModal.Content>
                        </FocusModal>

                        <Button variant="primary">
                            <Plus />
                            New Product
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-x-4">
                    <div className="relative max-w-[300px] w-full">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-ui-fg-muted">
                            <MagnifyingGlass />
                        </div>
                        <Input placeholder="Search products..." className="pl-8 bg-ui-bg-base" />
                    </div>
                    <div className="flex items-center gap-x-2">
                        <Button variant="secondary" size="small">Filter</Button>
                        <Button variant="secondary" size="small">Sort</Button>
                    </div>
                </div>

                <div className="border border-ui-border-base rounded-lg overflow-hidden bg-ui-bg-base">
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Name</Table.HeaderCell>
                                <Table.HeaderCell>Collection</Table.HeaderCell>
                                <Table.HeaderCell>Inventory</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                                <Table.HeaderCell>Price</Table.HeaderCell>
                                <Table.HeaderCell className="w-[50px]"></Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {products.map((product) => (
                                <Table.Row key={product.id} className="hover:bg-ui-bg-subtle transition-colors cursor-pointer">
                                    <Table.Cell className="font-medium text-ui-fg-base">
                                        {product.title}
                                    </Table.Cell>
                                    <Table.Cell className="text-ui-fg-subtle">
                                        {product.collection}
                                    </Table.Cell>
                                    <Table.Cell className="text-ui-fg-subtle">
                                        {product.inventory} in stock
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusBadge color={product.status === "published" ? "green" : "grey"}>
                                            {product.status === "published" ? "Published" : "Draft"}
                                        </StatusBadge>
                                    </Table.Cell>
                                    <Table.Cell className="text-ui-fg-base">
                                        {product.price}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex justify-end">
                                            <IconButton variant="transparent">
                                                <EllipsisHorizontal />
                                            </IconButton>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                    <div className="p-4 border-t border-ui-border-base flex items-center justify-between text-xs text-ui-fg-muted">
                        <p>Showing {products.length} results</p>
                        <div className="flex gap-x-2">
                            <Button variant="transparent" size="small" disabled>Previous</Button>
                            <Button variant="transparent" size="small" disabled>Next</Button>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}

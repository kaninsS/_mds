"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/client"
import { Container, Heading, Table, StatusBadge, Text, Button, Input, toast, Label } from "@medusajs/ui"
import { Plus } from "@medusajs/icons"

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newProductTitle, setNewProductTitle] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    const fetchProducts = async () => {
        const token = localStorage.getItem("medusa_auth_token")
        if (!token) return

        try {
            // @ts-ignore
            const { products } = await sdk.client.fetch("/vendors/me/products", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setProducts(products)
        } catch (e) {
            console.error("Failed to fetch products", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const handleCreateProduct = async () => {
        if (!newProductTitle.trim()) return

        setIsCreating(true)
        try {
            const token = localStorage.getItem("medusa_auth_token")
            // @ts-ignore
            await sdk.client.fetch("/vendors/me/products", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: { title: newProductTitle }
            })

            toast.success("Product created successfully!")
            setIsCreateModalOpen(false)
            setNewProductTitle("")
            fetchProducts()
        } catch (e: any) {
            toast.error("Failed to create product", { description: e.message })
        } finally {
            setIsCreating(false)
        }
    }

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center p-8">
                    <Text>Loading products...</Text>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-4">
                <Heading level="h1">Products</Heading>
                <Button size="small" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus />
                    Create Product
                </Button>
            </div>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Inventory</Table.HeaderCell>
                        <Table.HeaderCell>Created</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {products.length === 0 ? (
                        <Table.Row>
                            <td colSpan={4} className="p-4 text-center text-ui-fg-subtle">
                                No products found.
                            </td>
                        </Table.Row>
                    ) : (
                        products.map((product) => (
                            <Table.Row key={product.id}>
                                <Table.Cell>{product.title}</Table.Cell>
                                <Table.Cell>
                                    <StatusBadge color={product.status === "published" ? "green" : "grey"}>
                                        {product.status}
                                    </StatusBadge>
                                </Table.Cell>
                                <Table.Cell>
                                    {product.variants?.reduce((acc: number, v: any) => acc + (v.inventory_quantity || 0), 0) || 0} in stock
                                </Table.Cell>
                                <Table.Cell>
                                    {new Date(product.created_at).toLocaleDateString()}
                                </Table.Cell>
                            </Table.Row>
                        ))
                    )}
                </Table.Body>
            </Table>

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-ui-bg-overlay/50 backdrop-blur-sm">
                    <div className="bg-ui-bg-base w-full max-w-md rounded-xl shadow-elevation-flyout p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
                        <div>
                            <Heading level="h2">Create Product</Heading>
                            <Text className="text-ui-fg-subtle text-sm mt-1">Enter a name for your new product.</Text>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-title" className="text-ui-fg-base">Product Name</Label>
                            <Input
                                id="product-title"
                                placeholder="E.g. Handmade Leather Wallet"
                                value={newProductTitle}
                                onChange={(e) => setNewProductTitle(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-ui-border-base">
                            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateProduct}
                                isLoading={isCreating}
                                disabled={!newProductTitle.trim()}
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    )
}

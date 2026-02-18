"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/client"
import { Container, Heading, Table, StatusBadge, Text } from "@medusajs/ui"

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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

        fetchProducts()
    }, [])

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
                            <Table.Cell colSpan={4} className="text-center text-ui-fg-subtle">
                                No products found.
                            </Table.Cell>
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
        </Container>
    )
}

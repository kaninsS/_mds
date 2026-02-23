"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/client"
import { Container, Heading, Table, Text, Select, Button, toast, Badge } from "@medusajs/ui"

type RuleType = "all" | "customer" | "none"

export default function ProductVisibilityPage() {
    const [products, setProducts] = useState<any[]>([])
    const [rules, setRules] = useState<any[]>([])
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, ruleRes, custRes] = await Promise.all([
                    sdk.client.fetch<{ products: any[] }>("/vendors/me/products", { method: "GET" }),
                    sdk.client.fetch<{ rules: any[] }>("/vendors/me/product-visibility", { method: "GET" }),
                    sdk.client.fetch<{ customers: any[] }>("/vendors/me/customers", { method: "GET" })
                ])
                setProducts(prodRes.products || [])
                setRules(ruleRes.rules || [])
                setCustomers(custRes.customers || [])
            } catch (e) {
                console.error("Failed to load data", e)
                toast.error("Failed to load visibility data")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const getRuleForProduct = (productId: string) => {
        return rules.find(r => r.product_id === productId)
    }

    const handleRuleChange = async (productId: string, newType: RuleType) => {
        setSavingId(productId)
        try {
            const visibility = newType === "none" ? "hidden" : "visible"
            const body = {
                product_id: productId,
                rule_type: newType,
                visibility,
                customer_ids: [] // Can be extended to open a modal for customer selection
            }

            const res = await sdk.client.fetch<{ rule: any }>("/vendors/me/product-visibility", {
                method: "POST",
                body,
            })

            setRules(prev => {
                const existingIndex = prev.findIndex(r => r.product_id === productId)
                if (existingIndex >= 0) {
                    const newRules = [...prev]
                    newRules[existingIndex] = res.rule
                    return newRules
                }
                return [...prev, res.rule]
            })

            toast.success("Visibility updated")
        } catch (e) {
            console.error(e)
            toast.error("Failed to update visibility")
        } finally {
            setSavingId(null)
        }
    }

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center p-8">
                    <Text>Loading...</Text>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <Heading level="h1">Product Visibility</Heading>
                    <Text className="text-ui-fg-subtle mt-1">
                        Control which customers can see your products.
                    </Text>
                </div>
            </div>

            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Product</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Visibility Rule</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {products.length === 0 ? (
                        <Table.Row>
                            <td colSpan={3} className="text-center text-ui-fg-subtle p-8 border-b border-ui-border-base">
                                No products found.
                            </td>
                        </Table.Row>
                    ) : (
                        products.map(product => {
                            const rule = getRuleForProduct(product.id)
                            const currentType = rule?.rule_type || "all"

                            return (
                                <Table.Row key={product.id}>
                                    <Table.Cell className="flex flex-col">
                                        <Text className="font-medium text-ui-fg-base">{product.title}</Text>
                                        <Text className="text-xs text-ui-fg-subtle">Variants: {product.variants?.length || 0}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge color={product.status === "published" ? "green" : "grey"}>
                                            {product.status}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex items-center gap-4">
                                            <div className="w-48">
                                                <Select
                                                    value={currentType}
                                                    onValueChange={(val) => handleRuleChange(product.id, val as RuleType)}
                                                >
                                                    <Select.Trigger disabled={savingId === product.id}>
                                                        <Select.Value />
                                                    </Select.Trigger>
                                                    <Select.Content>
                                                        <Select.Item value="all">Visible to All My Customers</Select.Item>
                                                        <Select.Item value="customer">Specific Customers Only</Select.Item>
                                                        <Select.Item value="none">Hidden from Everyone</Select.Item>
                                                    </Select.Content>
                                                </Select>
                                            </div>
                                            {savingId === product.id && (
                                                <div className="w-4 h-4 border-2 border-ui-border-interactive border-t-transparent rounded-full animate-spin" />
                                            )}
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })
                    )}
                </Table.Body>
            </Table>
        </Container>
    )
}

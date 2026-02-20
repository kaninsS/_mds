"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/client"
import { Container, Heading, Table, Text, Badge } from "@medusajs/ui"

export default function RevenuePage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const res = await sdk.client.fetch<{
                    total_revenue: number,
                    pending_payout: number,
                    paid_payout: number,
                    items: any[]
                }>("/vendors/me/revenue", { method: "GET" })
                setData(res)
            } catch (e) {
                console.error("Failed to fetch revenue", e)
            } finally {
                setLoading(false)
            }
        }
        fetchRevenue()
    }, [])

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center p-8">
                    <Text>Loading revenue data...</Text>
                </div>
            </Container>
        )
    }

    if (!data) return null

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            <div>
                <Heading level="h1">Revenue & Payouts</Heading>
                <Text className="text-ui-fg-subtle mt-1">Track your earnings across all orders.</Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Container>
                    <Text className="text-ui-fg-subtle text-sm mb-1">Total Revenue</Text>
                    <Heading level="h2" className="text-2xl">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.total_revenue / 100)}
                    </Heading>
                </Container>
                <Container>
                    <Text className="text-ui-fg-subtle text-sm mb-1">Pending Payout</Text>
                    <Heading level="h2" className="text-2xl text-orange-600">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.pending_payout / 100)}
                    </Heading>
                </Container>
                <Container>
                    <Text className="text-ui-fg-subtle text-sm mb-1">Paid Earnings</Text>
                    <Heading level="h2" className="text-2xl text-green-600">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.paid_payout / 100)}
                    </Heading>
                </Container>
            </div>

            <Container>
                <Heading level="h2" className="text-lg mb-4">Earnings Breakdown</Heading>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Item / Order</Table.HeaderCell>
                            <Table.HeaderCell>Subtotal</Table.HeaderCell>
                            <Table.HeaderCell>Payout Status</Table.HeaderCell>
                            <Table.HeaderCell>Date</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {data.items.length === 0 ? (
                            <Table.Row>
                                <td colSpan={4} className="text-center text-ui-fg-subtle p-8 border-b border-ui-border-base">
                                    No completed sales found.
                                </td>
                            </Table.Row>
                        ) : (
                            data.items.map((item: any) => (
                                <Table.Row key={item.id}>
                                    <Table.Cell>
                                        <Text className="font-medium text-ui-fg-base">{item.line_item_id}</Text>
                                        <Text className="text-xs text-ui-fg-subtle">Order ID: {item.order_id}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(item.subtotal) / 100)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge color={item.vendor_payout_status === "paid" ? "green"
                                            : item.vendor_payout_status === "processing" ? "blue" : "orange"} className="capitalize">
                                            {item.vendor_payout_status}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell className="text-ui-fg-subtle">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        )}
                    </Table.Body>
                </Table>
            </Container>
        </div>
    )
}

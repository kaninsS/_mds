"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/client"
import { Container, Heading, Table, StatusBadge, Text, Button } from "@medusajs/ui"
import Link from "next/link"

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await sdk.client.fetch<{ orders: any[] }>("/vendors/me/orders", {
                    method: "GET"
                })
                setOrders(res.orders || [])
            } catch (e) {
                console.error("Failed to fetch orders", e)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center p-8">
                    <Text>Loading orders...</Text>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-4">
                <Heading level="h1">Orders</Heading>
            </div>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Order ID</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Payment</Table.HeaderCell>
                        <Table.HeaderCell>Fulfillment</Table.HeaderCell>
                        <Table.HeaderCell>Total</Table.HeaderCell>
                        <Table.HeaderCell>Date</Table.HeaderCell>
                        <Table.HeaderCell></Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {orders.length === 0 ? (
                        <Table.Row>
                            <td colSpan={7} className="text-center text-ui-fg-subtle p-8 border-b border-ui-border-base">
                                No orders found.
                            </td>
                        </Table.Row>
                    ) : (
                        orders.map((order) => (
                            <Table.Row key={order.id}>
                                <Table.Cell>#{order.display_id}</Table.Cell>
                                <Table.Cell>
                                    <StatusBadge color={order.status === "completed" ? "green" : "blue"}>
                                        {order.status}
                                    </StatusBadge>
                                </Table.Cell>
                                <Table.Cell>
                                    <StatusBadge color={order.payment_status === "captured" ? "green" : "orange"}>
                                        {order.payment_status}
                                    </StatusBadge>
                                </Table.Cell>
                                <Table.Cell>
                                    <StatusBadge color={order.fulfillment_status === "shipped" ? "green" : "grey"}>
                                        {order.fulfillment_status}
                                    </StatusBadge>
                                </Table.Cell>
                                <Table.Cell>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code }).format(order.total / 100)}
                                </Table.Cell>
                                <Table.Cell>
                                    {new Date(order.created_at).toLocaleDateString()}
                                </Table.Cell>
                                <Table.Cell className="text-right">
                                    <Link href={`/orders/${order.id}`}>
                                        <Button variant="secondary" size="small">Details</Button>
                                    </Link>
                                </Table.Cell>
                            </Table.Row>
                        ))
                    )}
                </Table.Body>
            </Table>
        </Container>
    )
}

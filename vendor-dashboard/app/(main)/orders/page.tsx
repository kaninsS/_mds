"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/client"
import { Container, Heading, Table, StatusBadge, Text } from "@medusajs/ui"

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("medusa_auth_token")
            if (!token) return

            try {
                // @ts-ignore
                const { orders } = await sdk.client.fetch("/vendors/me/orders", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setOrders(orders)
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
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {orders.length === 0 ? (
                        <Table.Row>
                            <Table.Cell colSpan={6} className="text-center text-ui-fg-subtle">
                                No orders found.
                            </Table.Cell>
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
                            </Table.Row>
                        ))
                    )}
                </Table.Body>
            </Table>
        </Container>
    )
}

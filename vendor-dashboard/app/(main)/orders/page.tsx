"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/client"
import { Container, Heading, Table, StatusBadge, Text, Button, clx } from "@medusajs/ui"
import Link from "next/link"

const PAYMENT_STATUS_MAP: Record<string, { label: string, color: "red" | "orange" | "green" | "blue" | "grey" }> = {
    not_paid: { label: "Not Paid", color: "red" },
    authorized: { label: "Authorized", color: "orange" },
    partially_authorized: { label: "Partially Authorized", color: "red" },
    awaiting: { label: "Awaiting", color: "orange" },
    captured: { label: "Captured", color: "green" },
    refunded: { label: "Refunded", color: "red" },
    partially_refunded: { label: "Partially Refunded", color: "orange" },
    partially_captured: { label: "Partially Captured", color: "orange" },
    canceled: { label: "Canceled", color: "red" },
    requires_action: { label: "Requires Action", color: "orange" },
}

const FULFILLMENT_STATUS_MAP: Record<string, { label: string, color: "red" | "orange" | "green" | "blue" | "grey" }> = {
    not_fulfilled: { label: "Not Fulfilled", color: "red" },
    partially_fulfilled: { label: "Partially Fulfilled", color: "orange" },
    fulfilled: { label: "Fulfilled", color: "green" },
    partially_shipped: { label: "Partially Shipped", color: "orange" },
    shipped: { label: "Shipped", color: "green" },
    delivered: { label: "Delivered", color: "green" },
    partially_delivered: { label: "Partially Delivered", color: "orange" },
    partially_returned: { label: "Partially Returned", color: "orange" },
    returned: { label: "Returned", color: "green" },
    canceled: { label: "Canceled", color: "red" },
    requires_action: { label: "Requires Action", color: "orange" },
}

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
                                    <StatusBadge color={PAYMENT_STATUS_MAP[order.payment_status]?.color || "grey"}>
                                        {PAYMENT_STATUS_MAP[order.payment_status]?.label || order.payment_status}
                                    </StatusBadge>
                                </Table.Cell>
                                <Table.Cell>
                                    <StatusBadge color={FULFILLMENT_STATUS_MAP[order.fulfillment_status]?.color || "grey"}>
                                        {FULFILLMENT_STATUS_MAP[order.fulfillment_status]?.label || order.fulfillment_status}
                                    </StatusBadge>
                                </Table.Cell>
                                <Table.Cell>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code }).format(order.total)}
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

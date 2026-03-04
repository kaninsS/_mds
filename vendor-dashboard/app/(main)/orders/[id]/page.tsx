"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { sdk } from "@/lib/client"
import { Container, Heading, Text, Badge, Table } from "@medusajs/ui"
import { ArrowLeft } from "@medusajs/icons"
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

export default function OrderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await sdk.client.fetch<{ order: any }>(`/vendors/me/orders/${params.id}`, {
                    method: "GET"
                })
                setOrder(res.order)
            } catch (e) {
                console.error("Failed to fetch order", e)
                router.push("/orders")
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchOrder()
        }
    }, [params.id, router])

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center py-16">
                    <div className="w-6 h-6 border-2 border-ui-border-interactive border-t-transparent rounded-full animate-spin" />
                </div>
            </Container>
        )
    }

    if (!order) return null

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            <div className="flex items-center gap-4">
                <Link href="/orders" className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors">
                    <ArrowLeft />
                </Link>
                <Heading level="h1">Order #{order.display_id}</Heading>
                <div className="flex items-center gap-2 ml-auto">
                    <Badge color={order.status === "completed" ? "green" : "blue"}>{order.status}</Badge>
                    <Badge color={PAYMENT_STATUS_MAP[order.payment_status]?.color || "grey"}>
                        {PAYMENT_STATUS_MAP[order.payment_status]?.label || order.payment_status}
                    </Badge>
                    <Badge color={FULFILLMENT_STATUS_MAP[order.fulfillment_status]?.color || "grey"}>
                        {FULFILLMENT_STATUS_MAP[order.fulfillment_status]?.label || order.fulfillment_status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Container>
                    <Heading level="h2" className="text-lg mb-4">Customer Details</Heading>
                    <div className="flex flex-col gap-2 text-sm">
                        <Text><span className="text-ui-fg-subtle">Name:</span> {order.customer?.first_name} {order.customer?.last_name}</Text>
                        <Text><span className="text-ui-fg-subtle">Email:</span> {order.email}</Text>
                        {order.shipping_address && (
                            <div className="mt-2">
                                <Text className="font-medium text-ui-fg-subtle mb-1">Shipping Address</Text>
                                <Text>{order.shipping_address.address_1}</Text>
                                {order.shipping_address.address_2 && <Text>{order.shipping_address.address_2}</Text>}
                                <Text>{order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}</Text>
                                <Text>{order.shipping_address.country_code?.toUpperCase()}</Text>
                            </div>
                        )}
                    </div>
                </Container>

                <Container>
                    <Heading level="h2" className="text-lg mb-4">Summary</Heading>
                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex justify-between">
                            <Text className="text-ui-fg-subtle">Subtotal</Text>
                            <Text>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code }).format(order.subtotal)}</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text className="text-ui-fg-subtle">Tax</Text>
                            <Text>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code }).format(order.tax_total)}</Text>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-ui-border-base font-medium">
                            <Text>Total</Text>
                            <Text>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code }).format(order.total)}</Text>
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                <Heading level="h2" className="text-lg mb-4">Items</Heading>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Item</Table.HeaderCell>
                            <Table.HeaderCell>Quantity</Table.HeaderCell>
                            <Table.HeaderCell>Price</Table.HeaderCell>
                            <Table.HeaderCell>Total</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {order.items?.map((item: any) => (
                            <Table.Row key={item.id}>
                                <Table.Cell className="flex flex-col">
                                    <Text className="font-medium">{item.title}</Text>
                                    <Text className="text-xs text-ui-fg-subtle">{item.variant_title}</Text>
                                </Table.Cell>
                                <Table.Cell>{item.quantity}</Table.Cell>
                                <Table.Cell>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code }).format(item.unit_price)}
                                </Table.Cell>
                                <Table.Cell>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code }).format(item.unit_price * item.quantity)}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Container>
        </div>
    )
}

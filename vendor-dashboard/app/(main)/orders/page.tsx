"use client"

import { useEffect, useState, useMemo } from "react"
import { sdk } from "@/lib/client"
import {
    Container,
    Heading,
    Table,
    StatusBadge,
    Text,
    Button,
    Input,
} from "@medusajs/ui"
import { MagnifyingGlass } from "@medusajs/icons"
import Link from "next/link"

type StatusColor = "green" | "blue" | "orange" | "grey" | "red" | "purple"

function getStatusColor(status: string): StatusColor {
    switch (status) {
        case "completed":
            return "green"
        case "pending":
            return "orange"
        case "canceled":
        case "requires_action":
            return "red"
        case "archived":
            return "grey"
        default:
            return "blue"
    }
}

function getPaymentColor(status: string): StatusColor {
    switch (status) {
        case "captured":
            return "green"
        case "awaiting":
        case "authorized":
            return "orange"
        case "refunded":
        case "partially_refunded":
            return "blue"
        case "canceled":
            return "red"
        default:
            return "grey"
    }
}

function getFulfillmentColor(status: string): StatusColor {
    switch (status) {
        case "fulfilled":
        case "shipped":
        case "delivered":
            return "green"
        case "partially_fulfilled":
        case "partially_shipped":
            return "blue"
        case "canceled":
            return "red"
        case "not_fulfilled":
        default:
            return "grey"
    }
}

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "usd",
    }).format(amount)
}

function formatDateTime(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

const STATUS_OPTIONS = [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "canceled", label: "Canceled" },
    { value: "archived", label: "Archived" },
    { value: "requires_action", label: "Requires Action" },
]

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const query: Record<string, string> = {}
                if (statusFilter !== "all") query.status = statusFilter

                const res = await sdk.client.fetch<{ orders: any[] }>("/vendors/me/orders", {
                    method: "GET",
                    query,
                })
                setOrders(res.orders || [])
            } catch (e) {
                console.error("Failed to fetch orders", e)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [statusFilter])

    const filteredOrders = useMemo(() => {
        if (!search.trim()) return orders
        const q = search.toLowerCase()
        return orders.filter((o) => {
            const displayId = `#${o.display_id}`.toLowerCase()
            const email = (o.email || o.customer?.email || "").toLowerCase()
            const name = [o.customer?.first_name, o.customer?.last_name]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
            return displayId.includes(q) || email.includes(q) || name.includes(q)
        })
    }, [orders, search])

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center p-8">
                    <div className="w-6 h-6 border-2 border-ui-border-interactive border-t-transparent rounded-full animate-spin" />
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Heading level="h1">Orders</Heading>
                    <Text className="text-ui-fg-subtle text-sm mt-1">
                        {orders.length} order{orders.length !== 1 ? "s" : ""} total
                    </Text>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted w-4 h-4" />
                    <Input
                        placeholder="Search by order ID, email, or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <select
                    className="flex h-8 items-center rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ui-bg-interactive"
                    value={statusFilter}
                    onChange={(e) => {
                        setLoading(true)
                        setStatusFilter(e.target.value)
                    }}
                >
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Order</Table.HeaderCell>
                        <Table.HeaderCell>Date</Table.HeaderCell>
                        <Table.HeaderCell>Customer</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Payment</Table.HeaderCell>
                        <Table.HeaderCell>Fulfillment</Table.HeaderCell>
                        <Table.HeaderCell className="text-right">Total</Table.HeaderCell>
                        <Table.HeaderCell></Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {filteredOrders.length === 0 ? (
                        <Table.Row>
                            <td
                                colSpan={8}
                                className="text-center text-ui-fg-subtle p-8 border-b border-ui-border-base"
                            >
                                {search ? "No orders matching your search." : "No orders found."}
                            </td>
                        </Table.Row>
                    ) : (
                        filteredOrders.map((order) => {
                            const customerName = [
                                order.customer?.first_name,
                                order.customer?.last_name,
                            ]
                                .filter(Boolean)
                                .join(" ")
                            const customerEmail =
                                order.email || order.customer?.email || ""
                            const itemCount =
                                order.items?.reduce(
                                    (acc: number, i: any) => acc + (i.quantity || 1),
                                    0
                                ) || 0

                            return (
                                <Table.Row
                                    key={order.id}
                                    className="cursor-pointer hover:bg-ui-bg-subtle-hover transition-colors"
                                    onClick={() =>
                                        (window.location.href = `/orders/${order.id}`)
                                    }
                                >
                                    <Table.Cell className="font-medium">
                                        #{order.display_id}
                                    </Table.Cell>
                                    <Table.Cell className="text-ui-fg-subtle text-sm whitespace-nowrap">
                                        {formatDateTime(order.created_at)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex flex-col">
                                            {customerName && (
                                                <Text className="text-sm font-medium">
                                                    {customerName}
                                                </Text>
                                            )}
                                            <Text className="text-xs text-ui-fg-subtle">
                                                {customerEmail}
                                            </Text>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusBadge
                                            color={getStatusColor(order.status)}
                                        >
                                            {order.status}
                                        </StatusBadge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusBadge
                                            color={getPaymentColor(
                                                order.payment_status
                                            )}
                                        >
                                            {order.payment_status || "N/A"}
                                        </StatusBadge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusBadge
                                            color={getFulfillmentColor(
                                                order.fulfillment_status
                                            )}
                                        >
                                            {order.fulfillment_status ||
                                                "not_fulfilled"}
                                        </StatusBadge>
                                    </Table.Cell>
                                    <Table.Cell className="text-right font-medium whitespace-nowrap">
                                        {formatCurrency(
                                            order.total || 0,
                                            order.currency_code
                                        )}
                                        <Text className="text-xs text-ui-fg-subtle block">
                                            {itemCount} item
                                            {itemCount !== 1 ? "s" : ""}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell className="text-right">
                                        <Link
                                            href={`/orders/${order.id}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Button
                                                variant="secondary"
                                                size="small"
                                            >
                                                Details
                                            </Button>
                                        </Link>
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

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { sdk } from "@/lib/client"
import { Container, Heading, Text, Badge, Table, StatusBadge } from "@medusajs/ui"
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

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    }).format(amount)
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    })
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
        <div className="flex flex-col gap-y-2">
            {/* Breadcrumb */}
            <div className="flex items-center gap-x-2 text-sm text-ui-fg-subtle">
                <Link href="/orders" className="hover:text-ui-fg-base transition-colors">
                    Orders
                </Link>
                <span>▸</span>
                <span className="text-ui-fg-base">#{order.display_id}</span>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-x-4 gap-y-4 items-start">
                {/* ====== MAIN COLUMN ====== */}
                <div className="flex flex-col gap-y-4">

                    {/* Header Card */}
                    <Container>
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-y-1">
                                <Heading level="h1" className="text-2xl font-semibold">
                                    #{order.display_id}
                                </Heading>
                                <Text className="text-ui-fg-subtle text-sm">
                                    {formatDate(order.created_at)}
                                </Text>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <StatusBadge color={PAYMENT_STATUS_MAP[order.payment_status]?.color || "grey"}>
                                    {PAYMENT_STATUS_MAP[order.payment_status]?.label || order.payment_status}
                                </StatusBadge>
                                <StatusBadge color={FULFILLMENT_STATUS_MAP[order.fulfillment_status]?.color || "grey"}>
                                    {FULFILLMENT_STATUS_MAP[order.fulfillment_status]?.label || order.fulfillment_status}
                                </StatusBadge>
                            </div>
                        </div>
                    </Container>

                    {/* Summary Card */}
                    <Container>
                        <Heading level="h2" className="text-base font-semibold mb-4">Summary</Heading>

                        {/* Items */}
                        <div className="flex flex-col gap-y-3 mb-4">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-x-3">
                                    {item.thumbnail && (
                                        <img
                                            src={item.thumbnail}
                                            alt={item.title}
                                            className="w-8 h-8 rounded object-cover border border-ui-border-base"
                                        />
                                    )}
                                    {!item.thumbnail && (
                                        <div className="w-8 h-8 rounded bg-ui-bg-subtle border border-ui-border-base" />
                                    )}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <Text className="font-medium text-sm truncate">{item.title}</Text>
                                        <Text className="text-xs text-ui-fg-subtle">{item.variant_title}</Text>
                                    </div>
                                    <Text className="text-sm text-ui-fg-subtle w-24 text-right">
                                        {formatCurrency(item.unit_price, order.currency_code)}
                                    </Text>
                                    <Text className="text-sm text-ui-fg-subtle w-12 text-right">
                                        {item.quantity}x
                                    </Text>
                                    <Text className="text-sm font-medium w-28 text-right">
                                        {formatCurrency(item.unit_price * item.quantity, order.currency_code)}
                                    </Text>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        {(() => {
                            const itemSubtotal = order.items?.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0) || 0
                            const orderTotal = itemSubtotal + (order.shipping_total || 0) + (order.tax_total || 0)
                            const totalAfterDiscount = order.total || 0
                            return (
                                <div className="flex flex-col gap-y-2 border-t border-ui-border-base pt-4 text-sm">
                                    <div className="flex justify-between">
                                        <Text className="text-ui-fg-subtle">Item Subtotal</Text>
                                        <Text>{formatCurrency(itemSubtotal, order.currency_code)}</Text>
                                    </div>
                                    {(order.shipping_total != null && order.shipping_total > 0) && (
                                        <div className="flex justify-between">
                                            <Text className="text-ui-fg-subtle">Shipping Subtotal</Text>
                                            <Text>{formatCurrency(order.shipping_total, order.currency_code)}</Text>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <Text className="text-ui-fg-subtle">Tax Total</Text>
                                        <Text>{formatCurrency(order.tax_total || 0, order.currency_code)}</Text>
                                    </div>
                                    <div className="flex justify-between font-medium border-t border-ui-border-base pt-2">
                                        <Text>Order Total</Text>
                                        <Text>{formatCurrency(orderTotal, order.currency_code)}</Text>
                                    </div>

                                    {(order.discount_total != null && order.discount_total > 0) && (
                                        <>
                                            <div className="flex justify-between mt-2 border-t border-ui-border-base pt-2">
                                                <Text className="text-ui-fg-subtle">Discount Total</Text>
                                                <Text>{formatCurrency(order.discount_total, order.currency_code)}</Text>
                                            </div>
                                            <div className="flex justify-between font-medium">
                                                <Text>Total After Discount</Text>
                                                <Text>{formatCurrency(totalAfterDiscount, order.currency_code)}</Text>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex justify-between mt-2 border-t border-ui-border-base pt-2">
                                        <Text className="text-ui-fg-subtle">Paid Total</Text>
                                        <Text>€ 0.00 {order.currency_code?.toUpperCase()}</Text>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                        <Text>Outstanding amount</Text>
                                        <Text>€ {totalAfterDiscount.toFixed(2)} {order.currency_code?.toUpperCase()}</Text>
                                    </div>
                                </div>
                            )
                        })()}
                    </Container>


                </div>

                {/* ====== SIDEBAR ====== */}
                <div className="flex flex-col gap-y-4">

                    {/* Customer Card */}
                    <Container>
                        <Heading level="h2" className="text-base font-semibold mb-4">Customer</Heading>
                        <div className="flex flex-col gap-y-3 text-sm">
                            {/* Customer ID + Name */}
                            <div className="flex justify-between items-center">
                                <Text className="text-ui-fg-subtle">ID</Text>
                                <div className="flex items-center gap-x-2">
                                    <div className="w-6 h-6 rounded-full bg-ui-bg-interactive flex items-center justify-center text-xs text-ui-fg-on-color font-medium">
                                        {(order.customer?.first_name || "?")[0]}
                                    </div>
                                    <Text>{order.customer?.first_name} {order.customer?.last_name}</Text>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="flex justify-between items-center">
                                <Text className="text-ui-fg-subtle">Contact</Text>
                                <Text className="truncate max-w-[180px]">{order.email}</Text>
                            </div>

                            {/* Company */}
                            {order.customer?.company_name && (
                                <div className="flex justify-between items-center">
                                    <Text className="text-ui-fg-subtle">Company</Text>
                                    <Text>{order.customer.company_name}</Text>
                                </div>
                            )}

                            {/* Shipping Address */}
                            {order.shipping_address && (
                                <div className="flex justify-between items-start border-t border-ui-border-base pt-3">
                                    <Text className="text-ui-fg-subtle">Shipping address</Text>
                                    <div className="flex flex-col items-end text-right">
                                        {order.shipping_address.first_name && (
                                            <Text>{order.shipping_address.first_name} {order.shipping_address.last_name}</Text>
                                        )}
                                        <Text>{order.shipping_address.address_1}</Text>
                                        {order.shipping_address.address_2 && <Text>{order.shipping_address.address_2}</Text>}
                                        <Text>{order.shipping_address.city}{order.shipping_address.province ? `, ${order.shipping_address.province}` : ""} {order.shipping_address.postal_code}</Text>
                                        <Text>{order.shipping_address.country_code?.toUpperCase()}</Text>
                                    </div>
                                </div>
                            )}

                            {/* Billing Address */}
                            <div className="flex justify-between items-start border-t border-ui-border-base pt-3">
                                <Text className="text-ui-fg-subtle">Billing address</Text>
                                <Text className="text-ui-fg-subtle italic">
                                    {order.billing_address
                                        ? `${order.billing_address.address_1}, ${order.billing_address.city}`
                                        : "Same as shipping address"}
                                </Text>
                            </div>
                        </div>
                    </Container>
                </div>
            </div>
        </div>
    )
}

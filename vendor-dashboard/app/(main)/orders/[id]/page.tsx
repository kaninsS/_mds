"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { sdk } from "@/lib/client"
import { Container, Heading, Text, Badge, Table, StatusBadge, Button } from "@medusajs/ui"
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
    const [capturing, setCapturing] = useState(false)
    const [refunding, setRefunding] = useState(false)
    const [showRefundForm, setShowRefundForm] = useState(false)
    const [refundAmount, setRefundAmount] = useState("")
    const [refundNote, setRefundNote] = useState("")

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

    useEffect(() => {
        if (params.id) {
            fetchOrder()
        }
    }, [params.id])

    const handleCapturePayment = async () => {
        if (capturing) return
        setCapturing(true)
        try {
            await sdk.client.fetch(`/vendors/me/orders/${params.id}/capture`, {
                method: "POST"
            })
            // Refresh order data
            await fetchOrder()
        } catch (e) {
            console.error("Failed to capture payment", e)
            alert("Failed to capture payment")
        } finally {
            setCapturing(false)
        }
    }

    const handleRefundPayment = async () => {
        if (refunding) return
        setRefunding(true)
        try {
            await sdk.client.fetch(`/vendors/me/orders/${params.id}/refund`, {
                method: "POST",
                body: {
                    ...(refundAmount ? { amount: parseFloat(refundAmount) } : {}),
                    ...(refundNote ? { note: refundNote } : {}),
                },
            })
            setShowRefundForm(false)
            setRefundAmount("")
            setRefundNote("")
            await fetchOrder()
        } catch (e) {
            console.error("Failed to refund payment", e)
            alert("Failed to refund payment")
        } finally {
            setRefunding(false)
        }
    }

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
                                        <details className="group">
                                            <summary className="flex justify-between cursor-pointer list-none">
                                                <Text className="text-ui-fg-subtle">
                                                    Shipping Subtotal <span className="text-xs">▼</span>
                                                </Text>
                                                <Text>{formatCurrency(order.shipping_total, order.currency_code)}</Text>
                                            </summary>
                                            <div className="ml-4 mt-1 flex flex-col gap-y-1">
                                                {order.shipping_methods?.map((sm: any) => (
                                                    <div key={sm.id} className="flex justify-between">
                                                        <Text className="text-ui-fg-muted text-xs">{sm.name}</Text>
                                                        <Text className="text-ui-fg-muted text-xs">{formatCurrency(sm.amount, order.currency_code)}</Text>
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
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
                                            <details className="mt-2 border-t border-ui-border-base pt-2 group">
                                                <summary className="flex justify-between cursor-pointer list-none">
                                                    <Text className="text-ui-fg-subtle">
                                                        Discount Total <span className="text-xs">▼</span>
                                                    </Text>
                                                    <Text>{formatCurrency(order.discount_total, order.currency_code)}</Text>
                                                </summary>
                                                <div className="ml-4 mt-1 flex flex-col gap-y-1">
                                                    {order.items?.flatMap((item: any) =>
                                                        (item.adjustments || []).map((adj: any) => (
                                                            <div key={adj.id} className="flex justify-between">
                                                                <Text className="text-ui-fg-muted text-xs">
                                                                    Item ({adj.code || "Adjustment"})
                                                                </Text>
                                                                <Text className="text-ui-fg-muted text-xs">
                                                                    {formatCurrency(adj.amount, order.currency_code)}
                                                                </Text>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </details>
                                            <div className="flex justify-between font-medium">
                                                <Text>Total After Discount</Text>
                                                <Text>{formatCurrency(totalAfterDiscount, order.currency_code)}</Text>
                                            </div>
                                        </>
                                    )}

                                    {(() => {
                                        const paidTotal = order.payment_collections?.reduce(
                                            (sum: number, pc: any) => sum + (pc.captured_amount || 0), 0
                                        ) || 0
                                        const outstanding = totalAfterDiscount - paidTotal
                                        return (
                                            <>
                                                <div className="flex justify-between mt-2 border-t border-ui-border-base pt-2">
                                                    <Text className="text-ui-fg-subtle">Paid Total</Text>
                                                    <Text>{formatCurrency(paidTotal, order.currency_code)} {order.currency_code?.toUpperCase()}</Text>
                                                </div>
                                                <div className="flex justify-between font-medium">
                                                    <Text>Outstanding amount</Text>
                                                    <Text>{formatCurrency(outstanding, order.currency_code)} {order.currency_code?.toUpperCase()}</Text>
                                                </div>
                                            </>
                                        )
                                    })()}
                                </div>
                            )
                        })()}
                    </Container>

                    {/* Payments Card */}
                    <Container>
                        <div className="flex items-center justify-between mb-4">
                            <Heading level="h2" className="text-base font-semibold">Payments</Heading>
                            <StatusBadge color={PAYMENT_STATUS_MAP[order.payment_status]?.color || "grey"}>
                                {PAYMENT_STATUS_MAP[order.payment_status]?.label || order.payment_status}
                            </StatusBadge>
                        </div>

                        {/* Payment transactions */}
                        {order.payment_collections?.map((pc: any) =>
                            pc.payments?.map((payment: any) => {
                                const paymentIdShort = "#" + payment.id.split("_").pop()?.toUpperCase()
                                const capturedAmount = payment.captures?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0
                                const isPending = !payment.captured_at
                                const isCaptured = !!payment.captured_at

                                return (
                                    <div key={payment.id} className="flex flex-col gap-y-3">
                                        <div className="flex items-center gap-x-4 text-sm py-2 border-t border-ui-border-base">
                                            <div className="flex flex-col min-w-[120px]">
                                                <Text className="font-medium">{paymentIdShort}</Text>
                                                <Text className="text-xs text-ui-fg-subtle">
                                                    {formatDate(payment.created_at)}
                                                </Text>
                                            </div>
                                            <Text className="flex-1 text-ui-fg-subtle capitalize">
                                                {payment.provider_id?.replace(/_/g, " ")}
                                            </Text>
                                            <StatusBadge color={isCaptured ? "green" : "orange"}>
                                                {isCaptured ? "Captured" : "Pending"}
                                            </StatusBadge>
                                            <Text className="font-medium w-28 text-right">
                                                {formatCurrency(payment.amount, order.currency_code)}
                                            </Text>
                                        </div>
                                    </div>
                                )
                            })
                        )}

                        {/* Payment totals */}
                        {(() => {
                            const totalCaptured = order.payment_collections?.reduce(
                                (sum: number, pc: any) => sum + (pc.captured_amount || 0), 0
                            ) || 0
                            const totalAfterDiscount = order.total || 0
                            const totalPending = totalAfterDiscount - totalCaptured

                            return (
                                <div className="flex flex-col gap-y-2 border-t border-ui-border-base pt-3 mt-2 text-sm">
                                    <div className="flex justify-between">
                                        <Text className="text-ui-fg-subtle">Total paid by customer</Text>
                                        <Text>€ {totalCaptured.toFixed(2)} {order.currency_code?.toUpperCase()}</Text>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                        <Text>Total pending</Text>
                                        <Text>€ {totalPending.toFixed(2)} {order.currency_code?.toUpperCase()}</Text>
                                    </div>
                                </div>
                            )
                        })()}

                        {/* Capture payment banner */}
                        {(() => {
                            const pendingPayments = order.payment_collections?.flatMap((pc: any) =>
                                (pc.payments || []).filter((p: any) => !p.captured_at && !p.canceled_at)
                            ) || []

                            if (pendingPayments.length === 0) return null

                            const paymentIdShort = "#" + pendingPayments[0].id.split("_").pop()?.toUpperCase()

                            return (
                                <div className="flex items-center justify-between border-t border-ui-border-base pt-3 mt-2">
                                    <div className="flex items-center gap-x-2 text-sm">
                                        <span className="text-ui-fg-subtle">↩</span>
                                        <Text className="text-ui-fg-subtle">
                                            Payment {paymentIdShort} is ready to be captured.
                                        </Text>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={handleCapturePayment}
                                        disabled={capturing}
                                    >
                                        {capturing ? "Capturing..." : "Capture payment"}
                                    </Button>
                                </div>
                            )
                        })()}

                        {/* Refund payment banner */}
                        {(() => {
                            const capturedPayments = order.payment_collections?.flatMap((pc: any) =>
                                (pc.payments || []).filter((p: any) => p.captured_at && !p.canceled_at)
                            ) || []

                            if (capturedPayments.length === 0) return null

                            // Calculate refundable amount
                            const totalCaptured = order.payment_collections?.reduce(
                                (sum: number, pc: any) => sum + (pc.captured_amount || 0), 0
                            ) || 0
                            const totalRefunded = order.payment_collections?.reduce(
                                (sum: number, pc: any) => sum + (pc.refunded_amount || 0), 0
                            ) || 0
                            const refundable = totalCaptured - totalRefunded

                            if (refundable <= 0) return null

                            return (
                                <div className="border-t border-ui-border-base pt-3 mt-2">
                                    {!showRefundForm ? (
                                        <div className="flex items-center justify-between">
                                            <Text className="text-sm text-ui-fg-subtle">
                                                Refundable amount: {formatCurrency(refundable, order.currency_code)}
                                            </Text>
                                            <Button
                                                variant="secondary"
                                                size="small"
                                                onClick={() => {
                                                    setRefundAmount(refundable.toString())
                                                    setShowRefundForm(true)
                                                }}
                                            >
                                                Refund
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-y-3">
                                            <div className="flex items-center gap-x-3">
                                                <div className="flex flex-col gap-y-1 flex-1">
                                                    <label className="text-xs text-ui-fg-subtle">Amount</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        max={refundable}
                                                        value={refundAmount}
                                                        onChange={(e) => setRefundAmount(e.target.value)}
                                                        className="w-full px-3 py-1.5 text-sm border border-ui-border-base rounded bg-ui-bg-field text-ui-fg-base"
                                                        placeholder={`Max: ${refundable}`}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-y-1 flex-1">
                                                    <label className="text-xs text-ui-fg-subtle">Note (optional)</label>
                                                    <input
                                                        type="text"
                                                        value={refundNote}
                                                        onChange={(e) => setRefundNote(e.target.value)}
                                                        className="w-full px-3 py-1.5 text-sm border border-ui-border-base rounded bg-ui-bg-field text-ui-fg-base"
                                                        placeholder="Reason for refund"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end gap-x-2">
                                                <Button
                                                    variant="secondary"
                                                    size="small"
                                                    onClick={() => {
                                                        setShowRefundForm(false)
                                                        setRefundAmount("")
                                                        setRefundNote("")
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    size="small"
                                                    onClick={handleRefundPayment}
                                                    disabled={refunding || !refundAmount || parseFloat(refundAmount) <= 0 || parseFloat(refundAmount) > refundable}
                                                >
                                                    {refunding ? "Refunding..." : "Confirm refund"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })()}
                    </Container>

                    {/* Unfulfilled Items Card */}
                    <Container>
                        <div className="flex items-center justify-between mb-4">
                            <Heading level="h2" className="text-base font-semibold">Unfulfilled Items</Heading>
                            <StatusBadge color={FULFILLMENT_STATUS_MAP[order.fulfillment_status]?.color || "grey"}>
                                {order.fulfillment_status === "not_fulfilled" ? "Awaiting fulfillment" :
                                    FULFILLMENT_STATUS_MAP[order.fulfillment_status]?.label || order.fulfillment_status}
                            </StatusBadge>
                        </div>

                        <div className="flex flex-col gap-y-3">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-x-3 py-2 border-t border-ui-border-base">
                                    {item.thumbnail ? (
                                        <img
                                            src={item.thumbnail}
                                            alt={item.title}
                                            className="w-10 h-10 rounded object-cover border border-ui-border-base"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded bg-ui-bg-subtle border border-ui-border-base" />
                                    )}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <Text className="font-medium text-sm">{item.title}</Text>
                                        <Text className="text-xs text-ui-fg-subtle">{item.variant_title}</Text>
                                    </div>
                                    <Text className="text-sm text-ui-fg-subtle">{item.quantity}x</Text>
                                </div>
                            ))}
                        </div>
                    </Container>

                    {/* Metadata Card */}
                    <Container>
                        <details>
                            <summary className="cursor-pointer">
                                <div className="inline-flex items-center gap-x-2">
                                    <Heading level="h2" className="text-base font-semibold inline">Metadata</Heading>
                                    <Text className="text-xs text-ui-fg-subtle">
                                        ({Object.keys(order.metadata || {}).length})
                                    </Text>
                                </div>
                            </summary>
                            <div className="mt-3">
                                {Object.keys(order.metadata || {}).length > 0 ? (
                                    <div className="flex flex-col gap-y-2 text-sm">
                                        {Object.entries(order.metadata || {}).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                                <Text className="text-ui-fg-subtle font-mono">{key}</Text>
                                                <Text className="font-mono">{String(value)}</Text>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Text className="text-sm text-ui-fg-subtle">No metadata</Text>
                                )}
                            </div>
                        </details>
                    </Container>

                    {/* JSON Card */}
                    <Container>
                        <details>
                            <summary className="cursor-pointer">
                                <div className="inline-flex items-center gap-x-2">
                                    <Heading level="h2" className="text-base font-semibold inline">JSON</Heading>
                                    <Text className="text-xs text-ui-fg-subtle">
                                        ({Object.keys(order).length})
                                    </Text>
                                </div>
                            </summary>
                            <div className="mt-3">
                                <pre className="text-xs bg-ui-bg-subtle p-3 rounded overflow-auto max-h-80 font-mono">
                                    {JSON.stringify(order, null, 2)}
                                </pre>
                            </div>
                        </details>
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

                    {/* Activity Card */}
                    <Container>
                        <Heading level="h2" className="text-base font-semibold mb-4">Activity</Heading>
                        <div className="flex flex-col gap-y-0 relative">
                            {/* Timeline line */}
                            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-ui-border-base" />

                            {/* Order placed */}
                            <div className="flex items-start gap-x-3 py-2 relative">
                                <div className="w-[15px] h-[15px] rounded-full bg-ui-bg-interactive border-2 border-ui-border-interactive flex-shrink-0 z-10" />
                                <div className="flex flex-col">
                                    <Text className="text-sm font-medium">Order placed</Text>
                                    <Text className="text-xs text-ui-fg-subtle">{formatDate(order.created_at)}</Text>
                                </div>
                            </div>

                            {/* Payment authorized */}
                            {order.payment_collections?.[0]?.created_at && (
                                <div className="flex items-start gap-x-3 py-2 relative">
                                    <div className="w-[15px] h-[15px] rounded-full bg-ui-bg-field border-2 border-ui-border-base flex-shrink-0 z-10" />
                                    <div className="flex flex-col">
                                        <Text className="text-sm font-medium">Payment authorized</Text>
                                        <Text className="text-xs text-ui-fg-subtle">{formatDate(order.payment_collections[0].created_at)}</Text>
                                    </div>
                                </div>
                            )}

                            {/* Payment captured */}
                            {order.payment_collections?.[0]?.payments?.[0]?.captured_at && (
                                <div className="flex items-start gap-x-3 py-2 relative">
                                    <div className="w-[15px] h-[15px] rounded-full bg-ui-tag-green-bg border-2 border-ui-tag-green-border flex-shrink-0 z-10" />
                                    <div className="flex flex-col">
                                        <Text className="text-sm font-medium">Payment captured</Text>
                                        <Text className="text-xs text-ui-fg-subtle">{formatDate(order.payment_collections[0].payments[0].captured_at)}</Text>
                                    </div>
                                </div>
                            )}

                            {/* Awaiting fulfillment */}
                            {order.fulfillment_status === "not_fulfilled" && (
                                <div className="flex items-start gap-x-3 py-2 relative">
                                    <div className="w-[15px] h-[15px] rounded-full bg-ui-tag-orange-bg border-2 border-ui-tag-orange-border flex-shrink-0 z-10" />
                                    <div className="flex flex-col">
                                        <Text className="text-sm font-medium">Awaiting fulfillment</Text>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Container>
                </div>
            </div>
        </div>
    )
}

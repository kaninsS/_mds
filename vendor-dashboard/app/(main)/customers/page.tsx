"use client"

import { useEffect, useState } from "react"
import {
    Heading,
    Text,
    Button,
    Badge,
    Input,
} from "@medusajs/ui"
import {
    Users,
    Link as LinkIcon,
    ArrowPath,
    Check,
    Trash,
    MagnifyingGlass,
} from "@medusajs/icons"
import { sdk } from "@/lib/client"
import { toast } from "@medusajs/ui"

// ─── Types ────────────────────────────────────────────────────────────────────
type VendorCustomerEntry = {
    id: string
    status: "active" | "invited" | "blocked"
    joined_at: string | null
    customer: {
        id: string
        email: string
        first_name?: string
        last_name?: string
        created_at?: string
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusVariant(status: string) {
    if (status === "active") return "green"
    if (status === "invited") return "blue"
    return "red"
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<VendorCustomerEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [inviteUrl, setInviteUrl] = useState<string | null>(null)
    const [inviteLoading, setInviteLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const fetchCustomers = async () => {
        setLoading(true)
        try {
            const res = await sdk.client.fetch<{ customers: VendorCustomerEntry[] }>(
                "/vendors/me/customers",
                { method: "GET" }
            )
            setCustomers(res.customers ?? [])
        } catch (e: any) {
            toast.error("Failed to load customers", { description: e.message })
        } finally {
            setLoading(false)
        }
    }

    const generateInvite = async () => {
        setInviteLoading(true)
        try {
            const res = await sdk.client.fetch<{ invite_url: string }>(
                "/vendors/me/invites",
                { method: "GET" }
            )
            setInviteUrl(res.invite_url)
        } catch (e: any) {
            toast.error("Failed to generate invite link", { description: e.message })
        } finally {
            setInviteLoading(false)
        }
    }

    const copyInvite = () => {
        if (!inviteUrl) return
        navigator.clipboard.writeText(inviteUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const blockCustomer = async (vcId: string) => {
        try {
            await sdk.client.fetch(`/vendors/me/customers/${vcId}`, { method: "DELETE" })
            toast.success("Customer blocked")
            fetchCustomers()
        } catch (e: any) {
            toast.error("Failed to block customer", { description: e.message })
        }
    }

    useEffect(() => { fetchCustomers() }, [])

    const filtered = customers.filter((vc) => {
        const term = search.toLowerCase()
        const name = [vc.customer.first_name, vc.customer.last_name].filter(Boolean).join(" ")
        return (
            vc.customer.email?.toLowerCase().includes(term) ||
            name.toLowerCase().includes(term)
        )
    })

    return (
        <div className="flex flex-col gap-y-6 p-8 max-w-5xl">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Heading level="h1">Customers</Heading>
                    <Text className="text-ui-fg-subtle mt-1">
                        Manage customers linked to your vendor account.
                    </Text>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={fetchCustomers}
                        isLoading={loading}
                    >
                        <ArrowPath />
                        Refresh
                    </Button>
                    <Button
                        size="small"
                        onClick={generateInvite}
                        isLoading={inviteLoading}
                    >
                        <LinkIcon />
                        Generate Invite Link
                    </Button>
                </div>
            </div>

            {/* Invite Link Banner */}
            {inviteUrl && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-ui-border-base bg-ui-bg-subtle">
                    <LinkIcon className="text-ui-fg-interactive shrink-0" />
                    <Text className="text-sm font-mono text-ui-fg-base truncate flex-1">
                        {inviteUrl}
                    </Text>
                    <Button variant="secondary" size="small" onClick={copyInvite}>
                        {copied ? <Check className="text-green-500" /> : null}
                        {copied ? "Copied!" : "Copy"}
                    </Button>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
                <Input
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-6 h-6 border-2 border-ui-border-interactive border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <Users className="w-10 h-10 text-ui-fg-muted" />
                    <Heading level="h3" className="text-ui-fg-subtle">No customers yet</Heading>
                    <Text className="text-ui-fg-muted text-sm max-w-xs">
                        Generate an invite link and share it with your customers to get started.
                    </Text>
                </div>
            ) : (
                <div className="rounded-xl border border-ui-border-base overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-ui-bg-subtle border-b border-ui-border-base">
                            <tr>
                                <th className="text-left px-4 py-3 text-ui-fg-muted font-medium">Customer</th>
                                <th className="text-left px-4 py-3 text-ui-fg-muted font-medium">Email</th>
                                <th className="text-left px-4 py-3 text-ui-fg-muted font-medium">Status</th>
                                <th className="text-left px-4 py-3 text-ui-fg-muted font-medium">Joined</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ui-border-base">
                            {filtered.map((vc) => {
                                const name = [vc.customer.first_name, vc.customer.last_name]
                                    .filter(Boolean).join(" ") || "—"
                                const joined = vc.joined_at
                                    ? new Date(vc.joined_at).toLocaleDateString()
                                    : "—"
                                return (
                                    <tr key={vc.id} className="hover:bg-ui-bg-subtle-hover transition-colors">
                                        <td className="px-4 py-3 font-medium text-ui-fg-base">{name}</td>
                                        <td className="px-4 py-3 text-ui-fg-subtle">{vc.customer.email}</td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                size="xsmall"
                                                color={statusVariant(vc.status)}
                                                className="capitalize"
                                            >
                                                {vc.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-ui-fg-muted">{joined}</td>
                                        <td className="px-4 py-3 text-right">
                                            {vc.status !== "blocked" && (
                                                <Button
                                                    variant="danger"
                                                    size="small"
                                                    onClick={() => blockCustomer(vc.id)}
                                                >
                                                    <Trash />
                                                    Block
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Summary */}
            {!loading && customers.length > 0 && (
                <Text className="text-ui-fg-muted text-xs">
                    {customers.filter(c => c.status === "active").length} active ·{" "}
                    {customers.filter(c => c.status === "blocked").length} blocked ·{" "}
                    {customers.length} total
                </Text>
            )}
        </div>
    )
}

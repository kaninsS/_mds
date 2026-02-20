"use client"

import { useEffect, useState, useCallback } from "react"
import { sdk } from "@/lib/client"
import { useTheme, type Theme } from "@/lib/theme"

import {
    Container,
    Heading,
    Text,
    Button,
    Input,
    Label,
    Tabs,
    Badge,
    toast,
} from "@medusajs/ui"
import {
    User,
    Swatch,
    Clock,
    Sun,
    Moon,
    CheckMini,
} from "@medusajs/icons"

// ─── Types ────────────────────────────────────────────────────────────────────

type Vendor = {
    id: string
    name: string
    handle: string
    logo?: string | null
}

type LogEntry = {
    timestamp: string
    message: string
    raw: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAuthToken() {
    if (typeof window === "undefined") return null
    return localStorage.getItem("medusa_auth_token")
}

function formatDate(iso: string) {
    if (!iso) return "—"
    try {
        return new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(iso))
    } catch {
        return iso
    }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileTab() {
    const [vendor, setVendor] = useState<Vendor | null>(null)
    const [name, setName] = useState("")
    const [handle, setHandle] = useState("")
    const [logo, setLogo] = useState("")
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        try {
            const token = getAuthToken()
            // @ts-ignore
            const { vendor: v } = await sdk.client.fetch("/vendors/me", {
                headers: { Authorization: `Bearer ${token}` },
            })
            setVendor(v)
            setName(v?.name ?? "")
            setHandle(v?.handle ?? "")
            setLogo(v?.logo ?? "")
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleSave = async () => {
        setSaving(true)
        try {
            const token = getAuthToken()
            // @ts-ignore
            await sdk.client.fetch("/vendors/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, handle, logo: logo || undefined }),
            })
            toast.success("Profile saved successfully!")
            load()
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to save profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-ui-border-interactive border-t-transparent rounded-full animate-spin" />
                    <Text className="text-ui-fg-subtle text-sm">Loading profile…</Text>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-lg space-y-6">
            {/* Avatar preview */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-ui-border-base bg-ui-bg-subtle">
                <div className="w-14 h-14 rounded-full bg-ui-bg-base border border-ui-border-base flex items-center justify-center overflow-hidden shadow-sm">
                    {(logo || vendor?.logo) ? (
                        <img
                            src={logo || vendor?.logo || ""}
                            alt="vendor logo"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                    ) : (
                        <User className="w-7 h-7 text-ui-fg-muted" />
                    )}
                </div>
                <div>
                    <Text className="font-semibold text-ui-fg-base">{name || vendor?.name || "Unnamed Vendor"}</Text>
                    <Text className="text-ui-fg-subtle text-sm">@{handle || vendor?.handle || "handle"}</Text>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="vendor-name">Store Name</Label>
                    <Input
                        id="vendor-name"
                        placeholder="My Awesome Store"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="vendor-handle">Handle</Label>
                    <div className="flex items-center">
                        <span className="inline-flex items-center px-3 h-9 border border-r-0 border-ui-border-base rounded-l-md bg-ui-bg-subtle text-ui-fg-muted text-sm">@</span>
                        <Input
                            id="vendor-handle"
                            placeholder="my-store"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            className="rounded-l-none"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="vendor-logo">Logo URL</Label>
                    <Input
                        id="vendor-logo"
                        placeholder="https://example.com/logo.png"
                        value={logo}
                        onChange={(e) => setLogo(e.target.value)}
                    />
                </div>
            </div>

            <div className="pt-2">
                <Button
                    onClick={handleSave}
                    isLoading={saving}
                    disabled={saving}
                    size="base"
                >
                    Save Profile
                </Button>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────


function AppearanceTab() {
    const { theme, setTheme, resolvedTheme, isLoading } = useTheme()

    const options: { value: Theme; label: string }[] = [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "system", label: "System" },
    ]

    return (
        <div className="max-w-lg space-y-6">
            <div>
                <Heading level="h3" className="mb-1">Theme</Heading>
                <Text className="text-ui-fg-subtle text-sm">
                    Choose how the dashboard looks. Changes apply instantly everywhere.
                </Text>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-2 py-4">
                    <div className="w-4 h-4 border-2 border-ui-border-interactive border-t-transparent rounded-full animate-spin" />
                    <Text className="text-ui-fg-subtle text-sm">Loading theme…</Text>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {options.map((opt) => {
                        const isActive = theme === opt.value
                        return (
                            <button
                                key={opt.value}
                                onClick={() => setTheme(opt.value)}
                                aria-pressed={isActive}
                                aria-label={`${opt.label} theme`}
                                className={`relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border-2 transition-all cursor-pointer ${isActive
                                        ? "border-ui-border-interactive bg-ui-bg-base shadow-elevation-card-rest"
                                        : "border-ui-border-base bg-ui-bg-subtle hover:border-ui-border-strong hover:bg-ui-bg-base"
                                    }`}
                            >
                                {opt.value === "light" && <Sun className="w-7 h-7 text-yellow-500" />}
                                {opt.value === "dark" && <Moon className="w-7 h-7 text-indigo-400" />}
                                {opt.value === "system" && (
                                    <div className="relative w-7 h-7 flex items-center justify-center">
                                        <Sun className="absolute w-full h-full text-yellow-400 opacity-60" />
                                        <Moon className="absolute w-3.5 h-3.5 text-indigo-400 translate-x-1 translate-y-1" />
                                    </div>
                                )}
                                <Text className="font-medium text-xs">{opt.label}</Text>
                                {isActive && (
                                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-ui-bg-interactive flex items-center justify-center">
                                        <CheckMini className="text-white" />
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            )}

            {!isLoading && (
                <div className="p-4 rounded-xl border border-ui-border-base bg-ui-bg-subtle space-y-1">
                    <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">Currently active</Text>
                    <Text className="text-sm text-ui-fg-base font-medium">
                        {theme === "system"
                            ? `System — ${resolvedTheme === "dark" ? "Dark" : "Light"} mode`
                            : `${theme === "dark" ? "Dark" : "Light"} mode`}
                    </Text>
                </div>
            )}
        </div>
    )
}


// ─────────────────────────────────────────────────────────────────────────────

function LogHistoryTab() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const token = getAuthToken()
            // @ts-ignore
            const { logs: entries } = await sdk.client.fetch("/vendors/me/logs", {
                headers: { Authorization: `Bearer ${token}` },
            })
            setLogs(entries ?? [])
        } catch (e: any) {
            setError(e?.message ?? "Failed to load logs")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-ui-border-interactive border-t-transparent rounded-full animate-spin" />
                    <Text className="text-ui-fg-subtle text-sm">Loading logs…</Text>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 rounded-xl border border-ui-border-error bg-ui-bg-error-subtle">
                <Text className="text-ui-fg-error text-sm">{error}</Text>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Heading level="h3" className="mb-0.5">Customer Registration Log</Heading>
                    <Text className="text-ui-fg-subtle text-sm">
                        {logs.length} event{logs.length !== 1 ? "s" : ""} recorded
                    </Text>
                </div>
                <Button variant="secondary" size="small" onClick={load}>
                    Refresh
                </Button>
            </div>

            {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-xl border border-dashed border-ui-border-base">
                    <Clock className="w-10 h-10 text-ui-fg-muted" />
                    <Text className="text-ui-fg-subtle text-sm">No logs yet. They appear when customers register.</Text>
                </div>
            ) : (
                <div className="space-y-2">
                    {logs.map((entry, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-3 p-3.5 rounded-lg border border-ui-border-base bg-ui-bg-subtle hover:bg-ui-bg-base transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-ui-bg-base border border-ui-border-base flex items-center justify-center flex-shrink-0 mt-0.5">
                                <User className="w-4 h-4 text-ui-fg-muted" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <Text className="text-sm text-ui-fg-base leading-relaxed">{entry.message}</Text>
                                <Text className="text-xs text-ui-fg-muted mt-0.5">{formatDate(entry.timestamp)}</Text>
                            </div>
                            <Badge size="xsmall" color="green">customer.created</Badge>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <Heading level="h1" className="mb-1">Settings</Heading>
                <Text className="text-ui-fg-subtle">Manage your vendor profile, appearance, and activity log.</Text>
            </div>

            <Tabs defaultValue="profile">
                <Tabs.List>
                    <Tabs.Trigger value="profile">
                        <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            Profile
                        </span>
                    </Tabs.Trigger>
                    <Tabs.Trigger value="appearance">
                        <span className="flex items-center gap-1.5">
                            <Swatch className="w-4 h-4" />
                            Appearance
                        </span>
                    </Tabs.Trigger>
                    <Tabs.Trigger value="logs">
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            Log History
                        </span>
                    </Tabs.Trigger>
                </Tabs.List>

                <div className="mt-6">
                    <Tabs.Content value="profile">
                        <Container>
                            <ProfileTab />
                        </Container>
                    </Tabs.Content>

                    <Tabs.Content value="appearance">
                        <Container>
                            <AppearanceTab />
                        </Container>
                    </Tabs.Content>

                    <Tabs.Content value="logs">
                        <Container>
                            <LogHistoryTab />
                        </Container>
                    </Tabs.Content>
                </div>
            </Tabs>
        </div>
    )
}

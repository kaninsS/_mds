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

    // File upload states
    const [isUploadMode, setIsUploadMode] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)
    const [copied, setCopied] = useState(false)

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
                    Authorization: `Bearer ${token}`,
                },
                body: {
                    name,
                    logo: logo || undefined
                },
            })
            // Update the local vendor state instantly so preview updates
            setVendor(prev => prev ? { ...prev, name, logo: logo || null } : null)
            toast.success("Profile saved successfully!")
            load()
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to save profile")
        } finally {
            setSaving(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const token = getAuthToken()
        if (!token) return

        setUploadingFile(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch("http://localhost:9000/vendors/me/product-requests/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(`Upload failed with status ${response.status}: ${JSON.stringify(errorData)}`)
            }

            const data = await response.json()

            if (data.url) {
                setLogo(data.url)
                toast.success("Image uploaded successfully")
            } else {
                toast.error("Upload succeeded but no URL returned")
            }
        } catch (error) {
            console.error("Upload failed", error)
            toast.error(`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`)
        } finally {
            setUploadingFile(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(handle)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.info("Handle copied to clipboard")
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
        <div className="max-w-2xl space-y-8">
            {/* Avatar block */}
            <div className="flex items-center gap-5 p-5 rounded-2xl border border-ui-border-base bg-ui-bg-subtle shadow-sm">
                <div className="w-16 h-16 rounded-full bg-ui-bg-base border-2 border-ui-border-base flex items-center justify-center overflow-hidden shadow-sm">
                    {(logo || vendor?.logo) ? (
                        <img
                            key={logo || vendor?.logo || "avatar"}
                            src={logo || vendor?.logo || ""}
                            alt="vendor logo"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                    ) : (
                        <User className="w-8 h-8 text-ui-fg-muted" />
                    )}
                </div>
                <div>
                    <Heading level="h2" className="text-ui-fg-base">{name || vendor?.name || "Unnamed Vendor"}</Heading>
                    <Text className="text-ui-fg-subtle text-sm mt-0.5">@{handle || vendor?.handle || "handle"}</Text>
                </div>
            </div>

            <div className="space-y-7">
                {/* Basic Info */}
                <div className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="vendor-name" className="text-ui-fg-base">Store Name</Label>
                            <Input
                                id="vendor-name"
                                placeholder="My Awesome Store"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vendor-handle" className="text-ui-fg-base">Handle</Label>
                            <div className="flex flex-col gap-1.5">
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="flex items-center text-left relative group w-full h-8 overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-subtle hover:bg-ui-bg-base transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ui-border-interactive shadow-buttons-neutral"
                                    title="Click to copy handle"
                                >
                                    <span className="flex items-center justify-center w-8 h-full border-r border-ui-border-base text-ui-fg-muted text-sm shrink-0">@</span>
                                    <span className="px-3 text-ui-fg-muted font-mono text-sm truncate flex-1">{handle}</span>

                                    {/* Floating Copied Indicator */}
                                    <div
                                        className={`absolute right-1 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-ui-bg-base border border-ui-border-base rounded shadow-sm text-[11px] font-medium text-ui-fg-base transition-all duration-200 pointer-events-none flex items-center gap-1
                                            ${copied ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-2 scale-95'}
                                        `}
                                    >
                                        <CheckMini className="w-3 h-3 text-ui-fg-interactive" />
                                        Copied
                                    </div>
                                </button>
                                <Text className="text-xs text-ui-fg-muted">
                                    Read-only. Click to copy your unique store handle.
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logo Section */}
                <div className="space-y-4 pt-6 border-t border-ui-border-base">
                    <div>
                        <Heading level="h3" className="mb-1">Store Logo</Heading>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className="flex-1 w-full space-y-4">
                            {/* Image Source Radio Buttons */}
                            <div className="space-y-2">
                                <Label className="block">Image Source</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id="logo-url"
                                            name="logo-source"
                                            checked={!isUploadMode}
                                            onChange={() => setIsUploadMode(false)}
                                            className="accent-ui-fg-interactive"
                                        />
                                        <label htmlFor="logo-url" className="text-ui-fg-base text-small cursor-pointer">Image URL</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id="logo-upload"
                                            name="logo-source"
                                            checked={isUploadMode}
                                            onChange={() => setIsUploadMode(true)}
                                            className="accent-ui-fg-interactive"
                                        />
                                        <label htmlFor="logo-upload" className="text-ui-fg-base text-small cursor-pointer">Upload File</label>
                                    </div>
                                </div>
                            </div>

                            {/* Input Area */}
                            {isUploadMode ? (
                                <div key="upload-mode" className="space-y-2">
                                    <Label htmlFor="file-upload">Select File</Label>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml"
                                        onChange={handleFileUpload}
                                        disabled={uploadingFile || saving}
                                    />
                                    {uploadingFile ? (
                                        <Text className="text-ui-fg-interactive text-xs">Uploading image...</Text>
                                    ) : (
                                        <Text className="text-ui-fg-subtle text-xs">Recommended size: 256x256px. Max size: 2MB.</Text>
                                    )}
                                </div>
                            ) : (
                                <div key="url-mode" className="space-y-2">
                                    <Label htmlFor="vendor-logo">Image URL</Label>
                                    <Input
                                        id="vendor-logo"
                                        placeholder="https://example.com/logo.png"
                                        value={logo}
                                        onChange={(e) => setLogo(e.target.value)}
                                    />
                                </div>
                            )}

                            {logo && (
                                <Button
                                    variant="transparent"
                                    size="small"
                                    className="text-ui-fg-error pl-0"
                                    onClick={() => setLogo("")}
                                    type="button"
                                >
                                    Remove Logo
                                </Button>
                            )}
                        </div>

                        {/* Live Preview Box */}
                        <div className="w-full sm:w-48 flex-shrink-0 flex items-center justify-center p-6 rounded-xl border border-ui-border-base bg-ui-bg-subtle aspect-square sm:aspect-auto sm:min-h-[160px]">
                            <div className="w-32 h-32 rounded-full bg-ui-bg-base border-2 border-ui-border-base flex items-center justify-center overflow-hidden shadow-sm">
                                {logo ? (
                                    <img
                                        key={logo}
                                        src={logo}
                                        alt="Logo preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-ui-fg-muted opacity-50" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="pt-6 mt-8 border-t border-ui-border-base flex items-center justify-between">
                <Text className="text-sm text-ui-fg-subtle">
                    Ensure you save any unsaved changes before leaving.
                </Text>
                <Button
                    onClick={handleSave}
                    isLoading={saving || uploadingFile}
                    disabled={saving || uploadingFile}
                    size="large"
                    variant="primary"
                >
                    Save Changes
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

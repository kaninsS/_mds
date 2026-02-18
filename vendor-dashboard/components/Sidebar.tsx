"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    BuildingStorefront,
    ShoppingBag,
    Tag,
    Users,
    CogSixTooth,
    ArrowRightOnRectangle,
    InboxSolid
} from "@medusajs/icons"
import { Text, clx, Avatar, DropdownMenu } from "@medusajs/ui"
import { sdk } from "@/lib/client"
import { useRouter } from "next/navigation"

const SidebarItem = ({ href, icon: Icon, label }: any) => {
    const pathname = usePathname()
    const active = pathname === href

    return (
        <Link
            href={href}
            className={clx(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                    ? "bg-ui-bg-base text-ui-fg-base shadow-elevation-card-rest"
                    : "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
            )}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </Link>
    )
}

export function Sidebar() {
    const router = useRouter()

    const handleLogout = async () => {
        await sdk.auth.logout()
        router.push("/login")
    }

    return (
        <div className="w-64 h-screen border-r border-ui-border-base bg-ui-bg-subtle flex flex-col">
            <div className="p-4 border-b border-ui-border-base flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-ui-bg-base flex items-center justify-center border border-ui-border-base shadow-sm">
                    <BuildingStorefront className="text-ui-fg-base" />
                </div>
                <Text className="font-semibold text-sm">Vendor Store</Text>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
                <SidebarItem href="/" icon={BuildingStorefront} label="Dashboard" />
                <SidebarItem href="/orders" icon={ShoppingBag} label="Orders" />
                <SidebarItem href="/products" icon={Tag} label="Products" />
                <SidebarItem href="/product-requests" icon={InboxSolid} label="Product Requests" />
                <SidebarItem href="/settings" icon={CogSixTooth} label="Settings" />
            </div>

            <div className="p-4 border-t border-ui-border-base">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-error transition-colors"
                >
                    <ArrowRightOnRectangle className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}

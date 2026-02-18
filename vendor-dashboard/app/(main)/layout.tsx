"use client"

import { Sidebar } from "@/components/Sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { sdk } from "@/lib/client"
import { Text } from "@medusajs/ui"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("medusa_auth_token")

                if (!token) {
                    router.push("/login")
                    setLoading(false)
                    return
                }

                await sdk.client.setToken(token)

                // @ts-ignore
                const { vendor } = await sdk.client.fetch("/vendors/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log("Dashboard Session Vendor:", vendor)

                if (!vendor) {
                    console.log("No vendor found, redirecting to login")
                    localStorage.removeItem("medusa_auth_token")
                    router.push("/login")
                }
            } catch (e) {
                console.error("Auth check failed:", e)
                localStorage.removeItem("medusa_auth_token")
                router.push("/login")
            } finally {
                setLoading(false)
            }
        }
        checkAuth()
    }, [router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Text>Loading...</Text>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-ui-bg-subtle">
            <Sidebar />
            <main className="flex-1 overflow-y-auto h-screen bg-ui-bg-base p-8">
                {children}
            </main>
        </div>
    )
}

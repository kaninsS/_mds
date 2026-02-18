"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Label, Heading, Text, Container } from "@medusajs/ui"
import { sdk } from "@/lib/client"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const response = await sdk.auth.login("vendor", "emailpass", { email, password })
            // @ts-ignore
            const token = response.token

            if (token) {
                localStorage.setItem("medusa_auth_token", token)
            }
            router.push("/")
        } catch (err: any) {
            setError(err.message || "Invalid credentials")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-ui-bg-subtle">
            <Container className="w-full max-w-md p-8">
                <Heading className="mb-2 text-center">Vendor Login</Heading>
                <Text className="mb-6 text-center text-ui-fg-subtle">
                    Sign in to manage your store
                </Text>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="vendor@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <Text className="text-ui-fg-error text-sm">{error}</Text>
                    )}

                    <Button type="submit" isLoading={loading} className="w-full">
                        Sign in
                    </Button>
                </form>
            </Container>
        </div>
    )
}

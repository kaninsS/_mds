"use client"

import { Button, Heading, Input, Label, Text } from "@medusajs/ui"
import { Eye, EyeSlash } from "@medusajs/icons"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)

    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Mock authentication - just redirect for now
        router.push("/dashboard")
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-ui-bg-subtle">
            <div className="w-full max-w-[400px] flex flex-col gap-y-8 p-12 rounded-xl bg-ui-bg-base shadow-elevation-card-hover border border-ui-border-base transition-all hover:shadow-elevation-modal">
                <div className="flex flex-col gap-y-2 text-center">
                    <Heading level="h1" className="text-2xl font-medium text-ui-fg-base">
                        Vendor Portal
                    </Heading>
                    <Text className="text-ui-fg-subtle">
                        Sign in to manage your store
                    </Text>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="email" className="text-ui-fg-subtle">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="vendor@example.com"
                            autoComplete="email"
                            className="bg-ui-bg-field hover:bg-ui-bg-field-hover"
                        />
                    </div>

                    <div className="flex flex-col gap-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-ui-fg-subtle">
                                Password
                            </Label>
                            <Button
                                variant="transparent"
                                className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover p-0 h-auto font-normal text-xs"
                                type="button"
                            >
                                Forgot password?
                            </Button>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="bg-ui-bg-field hover:bg-ui-bg-field-hover pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-ui-fg-muted hover:text-ui-fg-base transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeSlash /> : <Eye />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" size="large" className="w-full font-medium shadow-none">
                        Sign in
                    </Button>
                </form>

                <div className="flex items-center justify-center gap-x-2 text-xs text-ui-fg-muted">
                    <span>Don't have an account?</span>
                    <Button
                        variant="transparent"
                        className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover p-0 h-auto font-normal text-xs"
                        type="button"
                    >
                        Apply as vendor
                    </Button>
                </div>
            </div>

            <div className="mt-8 text-xs text-ui-fg-disabled">
                &copy; {new Date().getFullYear()} Medusa Marketplace. All rights reserved.
            </div>
        </div>
    )
}

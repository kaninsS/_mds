"use client"

import { Container, Heading, Text } from "@medusajs/ui"

export default function Dashboard() {
    return (
        <Container>
            <Heading level="h1" className="mb-4">Dashboard</Heading>
            <div className="grid gap-4">
                <div className="p-4 rounded-lg bg-ui-bg-subtle border border-ui-border-base">
                    <Heading level="h2" className="mb-2">Welcome back</Heading>
                    <Text className="text-ui-fg-subtle">
                        Select an option from the sidebar to manage your store.
                    </Text>
                </div>
            </div>
        </Container>
    )
}

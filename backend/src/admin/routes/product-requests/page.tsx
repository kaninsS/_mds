import { defineRouteConfig } from "@medusajs/admin-sdk"
import { InboxSolid } from "@medusajs/icons" // Removed PencilSquare
import { Container, Heading, Table, StatusBadge, Button, toast, Drawer, Select, Label, Text } from "@medusajs/ui" // Removed clx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useState } from "react"

type ProductRequest = {
    id: string
    name: string
    description: string
    image_url: string | null
    status: "pending" | "progress" | "success"
    created_at: string
    updated_at: string
    vendor?: {
        name: string
    }
    vendor_id: string | null
}

type ProductRequestsResponse = {
    product_requests: ProductRequest[]
    count: number
}

const STATUS_COLOR: Record<string, "orange" | "blue" | "green"> = {
    pending: "orange",
    progress: "blue",
    success: "green",
}

const STATUS_OPTS = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "progress" },
    { label: "Success", value: "success" },
]

const ProductRequestsPage = () => {
    const queryClient = useQueryClient()
    const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null)
    const [status, setStatus] = useState<string>("")

    const { data, isLoading } = useQuery<ProductRequestsResponse>({
        queryFn: () => sdk.client.fetch(`/admin/product-requests`),
        queryKey: ["admin-product-requests"],
    })

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            sdk.client.fetch(`/admin/product-requests/${id}/status`, {
                method: "POST",
                body: { status },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-product-requests"] })
            toast.success("Status updated")
            // Update local state if drawer is open
            if (selectedRequest) {
                setSelectedRequest((prev) => prev ? { ...prev, status: status as any } : null)
            }
        },
        onError: () => {
            toast.error("Failed to update status")
        },
    })

    const handleManage = (req: ProductRequest) => {
        setSelectedRequest(req)
        setStatus(req.status)
    }

    const handleSave = () => {
        if (!selectedRequest) return
        updateStatus.mutate({ id: selectedRequest.id, status })
    }

    return (
        <Container>
            <Heading className="mb-6">Product Requests</Heading>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Product Name</Table.HeaderCell>
                            <Table.HeaderCell>Description</Table.HeaderCell>
                            <Table.HeaderCell>Vendor</Table.HeaderCell>
                            <Table.HeaderCell>Vendor ID</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Date</Table.HeaderCell>
                            <Table.HeaderCell>Action</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {!data?.product_requests?.length ? (
                            <Table.Row>
                                <Table.Cell className="text-center text-ui-fg-subtle py-8">
                                    No product requests found.
                                </Table.Cell>
                            </Table.Row>
                        ) : (
                            data.product_requests.map((req) => (
                                <Table.Row key={req.id}>
                                    <Table.Cell className="font-medium">{req.name}</Table.Cell>
                                    <Table.Cell className="max-w-xs truncate text-ui-fg-subtle">
                                        {req.description}
                                    </Table.Cell>
                                    <Table.Cell className="text-ui-fg-subtle">
                                        {req.vendor?.name || "N/A"}
                                    </Table.Cell>
                                    <Table.Cell className="text-ui-fg-subtle font-mono text-xs">
                                        {req.vendor_id || "N/A"}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusBadge color={STATUS_COLOR[req.status] ?? "grey"}>
                                            {req.status}
                                        </StatusBadge>
                                    </Table.Cell>
                                    <Table.Cell className="text-ui-fg-subtle">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Drawer>
                                            <Drawer.Trigger asChild>
                                                <Button variant="secondary" size="small" onClick={() => handleManage(req)}>
                                                    Manage
                                                </Button>
                                            </Drawer.Trigger>
                                            <Drawer.Content>
                                                <Drawer.Header>
                                                    <Drawer.Title>Manage Product Request</Drawer.Title>
                                                </Drawer.Header>
                                                <Drawer.Body className="p-4 flex flex-col gap-y-4">
                                                    <div className="flex flex-col gap-1">
                                                        <Text size="small" className="text-ui-fg-subtle">Product Name</Text>
                                                        <Text weight="plus">{req.name}</Text>
                                                    </div>

                                                    <div className="flex flex-col gap-1">
                                                        <Text size="small" className="text-ui-fg-subtle">Description</Text>
                                                        <Text className="text-ui-fg-subtle">{req.description}</Text>
                                                    </div>

                                                    <div className="flex flex-col gap-1">
                                                        <Text size="small" className="text-ui-fg-subtle">Vendor</Text>
                                                        <div className="flex items-center gap-2">
                                                            <Text weight="plus">{req.vendor?.name || "N/A"}</Text>
                                                            <Text size="small" className="font-mono text-ui-fg-muted">{req.vendor_id}</Text>
                                                        </div>
                                                    </div>

                                                    {req.image_url && (
                                                        <div className="flex flex-col gap-1">
                                                            <Text size="small" className="text-ui-fg-subtle">Image</Text>
                                                            <img
                                                                src={req.image_url}
                                                                alt={req.name}
                                                                className="w-[400px] h-[400px] object-contain bg-ui-bg-subtle rounded-md border border-ui-border-base"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col gap-2 pt-2">
                                                        <Label size="small" weight="plus">Status</Label>
                                                        <Select value={status} onValueChange={setStatus}>
                                                            <Select.Trigger>
                                                                <Select.Value />
                                                            </Select.Trigger>
                                                            <Select.Content>
                                                                {STATUS_OPTS.map((opt) => (
                                                                    <Select.Item key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </Select.Item>
                                                                ))}
                                                            </Select.Content>
                                                        </Select>
                                                    </div>
                                                </Drawer.Body>
                                                <Drawer.Footer>
                                                    <Drawer.Close asChild>
                                                        <Button variant="secondary">Cancel</Button>
                                                    </Drawer.Close>
                                                    <Button
                                                        isLoading={updateStatus.isPending}
                                                        onClick={handleSave}
                                                    >
                                                        Save
                                                    </Button>
                                                </Drawer.Footer>
                                            </Drawer.Content>
                                        </Drawer>
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        )}
                    </Table.Body>
                </Table>
            )}
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Product Requests",
    icon: InboxSolid,
})

export default ProductRequestsPage

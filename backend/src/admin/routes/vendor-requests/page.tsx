import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { Container, Heading, Table, StatusBadge, Button } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"

const resolveImageUrl = (url: string) => {
    if (!url) return null
    if (url.startsWith("http")) return url
    // If it starts with /static, prepend backend URL
    if (url.startsWith("/static")) return `http://localhost:9000${url}`
    // If it's likely just a filename (starts with / or no slash), prepend full static path
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url
    return `http://localhost:9000/static/vendor-request-img/${cleanUrl}`
}

const VendorRequestsPage = () => {
    const { data, isLoading } = useQuery({
        queryFn: () => sdk.client.fetch("/admin/vendor-requests"),
        queryKey: ["vendor-requests"],
    })

    const requests = data?.vendor_requests || []

    return (
        <Container>
            <Heading className="mb-6">Vendor Product Requests (v2 - Debug)</Heading>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Image</Table.HeaderCell>
                            <Table.HeaderCell>Product</Table.HeaderCell>
                            <Table.HeaderCell>Price</Table.HeaderCell>
                            <Table.HeaderCell>Vendor</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Submitted</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {requests.map((req: any) => (
                            <Table.Row key={req.id}>
                                <Table.Cell>
                                    {req.image_url ? (
                                        <img
                                            src={resolveImageUrl(req.image_url)!}
                                            alt={req.title}
                                            className="h-10 w-10 object-cover rounded-md"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 bg-ui-bg-subtle rounded-md flex items-center justify-center text-xs text-ui-fg-subtle">
                                            No Img
                                        </div>
                                    )}
                                </Table.Cell>
                                <Table.Cell className="font-medium text-ui-fg-base">
                                    {req.title}
                                    {req.description && (
                                        <p className="text-xs text-ui-fg-subtle truncate max-w-[200px]">{req.description}</p>
                                    )}
                                </Table.Cell>
                                <Table.Cell>{req.price}</Table.Cell>
                                <Table.Cell>{req.vendor_email}</Table.Cell>
                                <Table.Cell>
                                    <StatusBadge color={req.status === "approved" ? "green" : req.status === "rejected" ? "red" : "orange"}>
                                        {req.status}
                                    </StatusBadge>
                                </Table.Cell>
                                <Table.Cell className="text-ui-fg-subtle text-xs">
                                    {new Date(req.created_at).toLocaleDateString()}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                        {requests.length === 0 && (
                            <Table.Row>
                                <Table.Cell colSpan={6} className="text-center py-8 text-ui-fg-subtle">
                                    No requests found.
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            )}
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Vendor Requests",
    icon: ChatBubbleLeftRight,
})

export default VendorRequestsPage

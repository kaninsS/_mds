import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { Container, Heading, Table } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"

type Vendor = {
    id: string
    name: string
    handle: string
    logo: string | null
}

type VendorsResponse = {
    vendors: Vendor[]
    count: number
    limit: number
    offset: number
}

const VendorsPage = () => {
    const { data, isLoading } = useQuery<VendorsResponse>({
        queryFn: () => sdk.client.fetch(`/vendors`),
        queryKey: ["vendors"],
    })

    return (
        <Container>
            <Heading className="mb-6">Vendors</Heading>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Handle</Table.HeaderCell>
                            <Table.HeaderCell>Logo</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {data && data.vendors && data.vendors.map((vendor) => (
                            <Table.Row key={vendor.id}>
                                <Table.Cell>{vendor.name}</Table.Cell>
                                <Table.Cell>{vendor.handle}</Table.Cell>
                                <Table.Cell>
                                    {vendor.logo && (
                                        <img
                                            src={vendor.logo}
                                            alt={vendor.name}
                                            className="w-8 h-8 object-cover rounded-full"
                                        />
                                    )}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            )}
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Vendors",
    icon: ChatBubbleLeftRight,
})

export default VendorsPage

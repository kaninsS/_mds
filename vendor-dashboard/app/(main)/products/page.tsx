"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/client"
import { Container, Heading, Table, StatusBadge, Text, Button, Input, toast, Label } from "@medusajs/ui"
import { Plus } from "@medusajs/icons"

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newProductTitle, setNewProductTitle] = useState("")
    const [newProductDescription, setNewProductDescription] = useState("")
    const [newProductPrice, setNewProductPrice] = useState("")
    const [newProductCurrency, setNewProductCurrency] = useState("thb")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [options, setOptions] = useState<{ title: string, values: string }[]>([])
    const [isCreating, setIsCreating] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const fetchProducts = async () => {
        const token = localStorage.getItem("medusa_auth_token")
        if (!token) return

        try {
            // @ts-ignore
            const { products } = await sdk.client.fetch("/vendors/me/products", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setProducts(products)
        } catch (e) {
            console.error("Failed to fetch products", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const handleCreateProduct = async () => {
        if (!newProductTitle.trim()) return

        setIsCreating(true)
        try {
            const token = localStorage.getItem("medusa_auth_token")
            if (!token) throw new Error("Not logged in")

            let thumbnailUrl = undefined

            // 1. Upload image securely first if one is explicitly attached
            if (selectedFile) {
                const formData = new FormData()
                formData.append("files", selectedFile)

                const uploadRes = await fetch("http://localhost:9000/vendors/me/upload", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                })

                if (!uploadRes.ok) throw new Error("Image upload failed")
                const uploadData = await uploadRes.json()

                if (uploadData.files && uploadData.files.length > 0) {
                    thumbnailUrl = uploadData.files[0].url
                }
            }

            // Pre-process options properly parsing comma separated values
            const formattedOptions = options
                .filter(o => o.title.trim() && o.values.trim())
                .map(o => ({
                    title: o.title.trim(),
                    values: o.values.split(",").map(v => v.trim()).filter(Boolean)
                }))

            // 2. Transmit fully-mapped main product payload
            // @ts-ignore
            await sdk.client.fetch("/vendors/me/products", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: {
                    title: newProductTitle,
                    description: newProductDescription || undefined,
                    price: newProductPrice ? Number(newProductPrice) : undefined,
                    currency_code: newProductCurrency,
                    thumbnail: thumbnailUrl,
                    options: formattedOptions.length > 0 ? formattedOptions : undefined
                }
            })

            toast.success("Product created successfully!")

            // Clean up UI state
            setIsCreateModalOpen(false)
            setNewProductTitle("")
            setNewProductDescription("")
            setNewProductPrice("")
            setSelectedFile(null)
            setPreviewUrl(null)
            setOptions([])

            fetchProducts()
        } catch (e: any) {
            toast.error("Failed to create product", { description: e.message })
        } finally {
            setIsCreating(false)
        }
    }

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center p-8">
                    <Text>Loading products...</Text>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-4">
                <Heading level="h1">Products</Heading>
                <Button size="small" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus />
                    Create Product
                </Button>
            </div>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell className="w-16">Image</Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Price</Table.HeaderCell>
                        <Table.HeaderCell>Inventory</Table.HeaderCell>
                        <Table.HeaderCell>Created</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {products.length === 0 ? (
                        <Table.Row>
                            <td colSpan={4} className="p-4 text-center text-ui-fg-subtle">
                                No products found.
                            </td>
                        </Table.Row>
                    ) : (
                        products.map((product) => (
                            <Table.Row key={product.id}>
                                <Table.Cell>
                                    {product.thumbnail ? (
                                        <div className="w-10 h-10 rounded overflow-hidden shadow-sm border border-ui-border-base">
                                            <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 bg-ui-bg-component rounded flex items-center justify-center border border-ui-border-base text-ui-fg-muted font-semibold text-xs text-center leading-none px-1">
                                            No Img
                                        </div>
                                    )}
                                </Table.Cell>
                                <Table.Cell className="font-medium">{product.title}</Table.Cell>
                                <Table.Cell>
                                    <StatusBadge color={product.status === "published" ? "green" : "grey"}>
                                        {product.status}
                                    </StatusBadge>
                                </Table.Cell>
                                <Table.Cell>
                                    {product.variants?.[0]?.prices?.[0] ?
                                        `${(product.variants[0].prices[0].amount).toLocaleString()} ${product.variants[0].prices[0].currency_code.toUpperCase()}`
                                        : "N/A"
                                    }
                                </Table.Cell>
                                <Table.Cell>
                                    {product.variants?.reduce((acc: number, v: any) => acc + (v.inventory_quantity || 0), 0) || 0} in stock
                                </Table.Cell>
                                <Table.Cell>
                                    {new Date(product.created_at).toLocaleDateString()}
                                </Table.Cell>
                            </Table.Row>
                        ))
                    )}
                </Table.Body>
            </Table>

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-ui-bg-overlay/50 backdrop-blur-sm p-4">
                    <div className="bg-ui-bg-base w-full max-w-2xl rounded-xl shadow-elevation-flyout p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div>
                            <Heading level="h2">Create Product</Heading>
                            <Text className="text-ui-fg-subtle text-sm mt-1">Fill out the details to officially list your item in the marketplace.</Text>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="product-title" className="text-ui-fg-base">Product Name <span className="text-ui-fg-error">*</span></Label>
                                <Input
                                    id="product-title"
                                    placeholder="E.g. Handmade Leather Wallet"
                                    value={newProductTitle}
                                    onChange={(e) => setNewProductTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="product-desc" className="text-ui-fg-base">Description</Label>
                                <textarea
                                    id="product-desc"
                                    className="flex w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm text-ui-fg-base placeholder:text-ui-fg-muted focus:outline-none focus:ring-2 focus:ring-ui-bg-interactive"
                                    rows={3}
                                    placeholder="Describe your product..."
                                    value={newProductDescription}
                                    onChange={(e) => setNewProductDescription(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="product-price" className="text-ui-fg-base">Price</Label>
                                    <Input
                                        id="product-price"
                                        type="number"
                                        placeholder="0.00"
                                        value={newProductPrice}
                                        onChange={(e) => setNewProductPrice(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="product-currency" className="text-ui-fg-base">Currency</Label>
                                    <select
                                        id="product-currency"
                                        className="flex h-8 w-full items-center justify-between rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ui-bg-interactive"
                                        value={newProductCurrency}
                                        onChange={(e) => setNewProductCurrency(e.target.value)}
                                    >
                                        <option value="thb">THB</option>
                                        <option value="usd">USD</option>
                                        <option value="eur">EUR</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-ui-fg-base">Product Image</Label>
                                <div className="flex items-center gap-4">
                                    {previewUrl && (
                                        <div className="w-16 h-16 rounded overflow-hidden border border-ui-border-base shadow-sm shrink-0">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-ui-border-base mt-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-ui-fg-base font-medium">Product Options (Optional)</Label>
                                    <Button variant="secondary" size="small" type="button" onClick={() => setOptions([...options, { title: "", values: "" }])}>
                                        <Plus /> Add Option
                                    </Button>
                                </div>
                                {options.map((opt, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 border border-ui-border-base rounded-md relative shadow-sm">
                                        <button type="button" className="absolute top-2 right-2 text-ui-fg-muted hover:text-ui-fg-base p-1" onClick={() => setOptions(options.filter((_, i) => i !== idx))}>&times;</button>
                                        <div className="space-y-2 flex-1">
                                            <Label className="text-xs">Option Name</Label>
                                            <Input placeholder="e.g. Size" value={opt.title} onChange={e => {
                                                const newOpts = [...options]; newOpts[idx].title = e.target.value; setOptions(newOpts);
                                            }} />
                                        </div>
                                        <div className="space-y-2 flex-[2]">
                                            <Label className="text-xs">Values (comma separated)</Label>
                                            <Input placeholder="e.g. Small, Medium, Large" value={opt.values} onChange={e => {
                                                const newOpts = [...options]; newOpts[idx].values = e.target.value; setOptions(newOpts);
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-ui-border-base mt-2">
                            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateProduct}
                                isLoading={isCreating}
                                disabled={!newProductTitle.trim()}
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    )
}

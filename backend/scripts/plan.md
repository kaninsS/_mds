I'm building a multi-vendor marketplace on MedusaJS v2 (Medusa Framework). I need you to give me 5 software pattern or architectural structure ideas for the following scenario:

## Current State

I already have these models in my marketplace module:

1. **Vendor** — `id`, `handle`, `name`, `logo`, has-many `VendorAdmin`, has-many [VendorCustomer](cci:1://file:///Users/kns/m/_mds/backend/src/subscribers/log-vendor-customer.ts:6:0-64:1)
2. **VendorCustomer** (join table) — `id`, `customer_id`, `status` (active/invited/blocked), `invited_by`, `joined_at`, belongs-to [Vendor](cci:1://file:///Users/kns/m/_mds/backend/src/subscribers/log-vendor-customer.ts:6:0-64:1)
3. **VendorProductVisibility** — `id`, `vendor_id`, `product_id`, `rule_type` (all/customer/none), `visibility` (visible/hidden), has-many `VendorProductVisibilityCustomer`
4. **VendorProductVisibilityCustomer** — `id`, `customer_id`, belongs-to `VendorProductVisibility`

I also have a subscriber on `customer.created` that reads `metadata.vendor_id` from the newly created customer and automatically creates a [VendorCustomer](cci:1://file:///Users/kns/m/_mds/backend/src/subscribers/log-vendor-customer.ts:6:0-64:1) mapping.

Links: `VendorCustomer ↔ Customer` (Medusa module link)

## What I Need

When a new customer registers on my **customer-store** (storefront), I want a robust way to **map this customer to a vendor**, establishing a full **one-to-many relationship**: `unique_vendor → each_registered_user`.

This mapping system must be designed to support these **future features**:

1. **Per-vendor product visibility restriction** — each vendor can have the same shared product catalog, but control which products their specific customers can see
2. **Vendor-managed product visibility** — vendors can manage (show/hide) product visibility for their "parent" customers (the customers mapped to them)
3. **Scalable customer-vendor relationship management** — handle scenarios like a customer belonging to multiple vendors, vendor hierarchies, or customer groups per vendor

## What I Want From You

Give me **5 distinct software pattern or architectural structure ideas** for implementing this system. For each pattern:

1. **Pattern Name** — a clear, descriptive name
2. **Core Concept** — 2-3 sentence explanation of the architectural idea
3. **Data Model Design** — what tables/entities are needed and their relationships (ERD-style description)
4. **Registration Flow** — how the customer-to-vendor mapping happens at registration time
5. **Product Visibility Mechanism** — how per-vendor product filtering works with this pattern
6. **Pros** — strengths of this approach
7. **Cons** — weaknesses or trade-offs
8. **Best For** — what kind of marketplace this pattern suits best

## Constraints

- Must work within MedusaJS v2 architecture (modules, links, subscribers, workflows)
- Must use Medusa's DML (Data Modeling Language) for model definitions
- Should leverage Medusa's event system (`customer.created`, etc.)
- Should consider API route middleware for visibility filtering
- Must be compatible with existing Medusa Customer and Product modules (don't replace them, link to them)

## Format

Present each pattern in a structured, numbered format. After all 5 patterns, add a **comparison matrix table** rating each pattern on: Complexity, Scalability, Flexibility, Query Performance, and Implementation Effort (Low/Medium/High).

End with your **recommendation** for which pattern best fits a marketplace where ~10-50 vendors each have ~100-5,000 customers, with shared product catalogs that need per-vendor visibility control.

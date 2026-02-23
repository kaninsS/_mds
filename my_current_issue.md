# Current Issue: Vendor–Customer Mapping via Invite Token

## Problem Summary

When **Vendor A** shares an invite link with customers **A, B, and C**, each customer who registers through that link should be automatically mapped to Vendor A in the database (`vendor_customer` relationship).

Currently this mapping is **not being created reliably**, which means:

- Customers who register via Vendor A's invite link don't appear on Vendor A's dashboard.
- Order routing and product visibility rules that depend on the vendor–customer relationship are broken.

---

## Expected Behavior

```
Vendor A generates invite link
    └─ Customer A registers via link → vendor_customer { vendor_id: A, customer_id: A } ✅
    └─ Customer B registers via link → vendor_customer { vendor_id: A, customer_id: B } ✅
    └─ Customer C registers via link → vendor_customer { vendor_id: A, customer_id: C } ✅
```

Every customer who completes registration through **Vendor A's unique invite token** must end up with a row in the `vendor_customer` join table pointing back to Vendor A.

---

## Current Behavior

- The invite token is generated and the link is shared.
- When a customer registers, the `vendor_customer` row is **not created** (or is created inconsistently).
- The customer is not visible in Vendor A's customer list.

---

## Root Cause (Suspected)

The invite token is not being resolved back to a `vendor_id` during the customer registration subscriber/workflow, so the `vendor_customer` join record is never inserted.

Likely failure points:

1. **Token not stored** – the invite token may not be persisted to the database, so it cannot be looked up at registration time.
2. **Subscriber not triggered** – the `customer.created` event subscriber may not be reading the token from the registration request context.
3. **Missing join table** – the `VendorCustomer` model / migration may not exist yet, so there is no table to write to.

---

## Affected Files

| File | Role |
| --- | --- |
| `backend/src/modules/marketplace/models/vendor.ts` | `Vendor` model — currently has no `customers` relation |
| `backend/src/modules/marketplace/models/vendor-admin.ts` | `VendorAdmin` model |
| `backend/src/api/vendors/route.ts` | Vendor API — invite link generation should live here |
| `backend/src/subscribers/` | Customer-created subscriber — should create the mapping |
| `backend/src/workflows/marketplace/` | Workflows that should handle vendor–customer linking |

---

## What Needs to Be Done

### 1. Create `VendorInviteToken` model

Store invite tokens so they can be validated at registration time.

```
VendorInviteToken {
  id         (PK)
  vendor_id  (FK → Vendor)
  token      (unique, random string)
  expires_at (nullable)
  created_at
}
```

### 2. Create `VendorCustomer` join model

```
VendorCustomer {
  id          (PK)
  vendor_id   (FK → Vendor)
  customer_id (FK → Medusa customer)
  created_at
}
```

### 3. Add "Generate Invite Link" API endpoint

`POST /vendors/me/invite` — generates a token, saves it, returns the invite URL:

```
http://localhost:8000/register?token=<invite_token>
```

### 4. Pass token through registration flow

Customer store: when a user lands on `/register?token=<invite_token>`, include the token as metadata in the registration request body.

### 5. Resolve token → vendor in the subscriber

In `customer.created` subscriber:

1. Read the invite token from the customer's metadata.
2. Look up `VendorInviteToken` → get `vendor_id`.
3. Insert a row into `VendorCustomer`.

### 6. Run migration

Generate and apply the new migration after adding the two models.

---

## How to Verify the Fix

1. Create Vendor A (`npm run create-test-vendor`).
2. Call `POST /vendors/me/invite` → get invite URL.
3. Register as Customer A, B, C using that URL.
4. Check that `vendor_customer` has three rows all pointing to Vendor A.
5. Confirm Customers A, B, C appear in Vendor A's dashboard.

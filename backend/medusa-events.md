# Medusa Workflow Events

This file lists the common event types available in Medusa v2 workflows. You can use these strings in your subscriber `config` objects.

## Cart Events

| Event String | Description |
| :--- | :--- |
| `cart.created` | Emitted when a new cart is initialized. |
| `cart.updated` | Emitted when cart details (e.g., email, shipping address) are updated. |
| `cart.customer_updated` | Emitted when the customer associated with the cart changes. |
| `cart.customer_transferred` | Emitted when a guest logs in and their cart is merged with their account. |
| `cart.region_updated` | Emitted when the cart's region (currency/market) changes. |

## Order Events

| Event String | Description |
| :--- | :--- |
| `order.placed` | Emitted when checkout is successfully completed. |
| `order.updated` | Emitted when order details are modified. |
| `order.canceled` | Emitted when an order is fully canceled. |
| `order.completed` | Emitted when an order is marked as complete (usually after fulfillment). |
| `order.archived` | Emitted when an order is archived. |
| `order.fulfillment_created` | Emitted when a fulfillment (shipment group) is created. |
| `order.fulfillment_canceled` | Emitted when a fulfillment is canceled. |
| `order.return_requested` | Emitted when a return is initiated. |
| `order.return_received` | Emitted when a return is processed and received. |
| `order.claim_created` | Emitted when a claim is opened. |
| `order.exchange_created` | Emitted when an exchange is created. |
| `order.transfer_requested` | Emitted when an order ownership transfer is initiated. |

## Customer Events

| Event String | Description |
| :--- | :--- |
| `customer.created` | Emitted when a new customer registers. |
| `customer.updated` | Emitted when customer details (name, phone, metadata) change. |
| `customer.deleted` | Emitted when a customer account is removed. |

## User & Auth Events

| Event String | Description |
| :--- | :--- |
| `user.created` | Emitted when a new admin user is created. |
| `user.updated` | Emitted when an admin user is updated. |
| `user.deleted` | Emitted when an admin user is deleted. |
| `auth.password_reset` | Emitted when a password reset token is generated. |
| `invite.created` | Emitted when a user invite is sent. |
| `invite.accepted` | Emitted when a user accepts an invite. |

## Product Events

| Event String | Description |
| :--- | :--- |
| `product.created` | Emitted when a new product is created. |
| `product.updated` | Emitted when a product is updated. |
| `product.deleted` | Emitted when a product is deleted. |
| `product-variant.created` | Emitted when a variant is added. |
| `product-variant.updated` | Emitted when a variant is modified. |
| `product-variant.deleted` | Emitted when a variant is removed. |

## Fulfillment Events

| Event String | Description |
| :--- | :--- |
| `shipment.created` | Emitted when a shipment is created. |
| `delivery.created` | Emitted when a delivery is recorded. |

## Other Events

| Event String | Description |
| :--- | :--- |
| `region.created` | Emitted when a tax/currency region is created. |
| `region.updated` | Emitted when a region is modified. |
| `sales-channel.created` | Emitted when a sales channel is added. |
| `sales-channel.updated` | Emitted when a sales channel is modified. |

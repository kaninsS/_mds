---
description: Log vendor customer events workflow - triggered on customer.created
---

# Log For Vendor Workflow

This workflow reads the `vendor-customer-logs.txt` file and returns parsed log entries for the vendor dashboard's Log History page.

## Files

- **Subscriber**: `backend/src/subscribers/log-vendor-customer.ts`
  - Triggers on `customer.created` event
  - Appends a timestamped entry to `_tmp/vendor-customer-logs.txt`

- **Workflow**: `backend/src/workflows/log-for-vendor/index.ts`
  - `getVendorLogsWorkflow` — reads & parses the log file; returns entries newest-first

- **API Route**: `backend/src/api/vendors/me/logs/route.ts`
  - `GET /vendors/me/logs` — authenticated; returns `{ logs: LogEntry[] }`

## Steps

1. Customer registers via the storefront.
2. Medusa emits `customer.created` event.
3. `log-vendor-customer` subscriber fires, appends a line to `_tmp/vendor-customer-logs.txt`.
4. Vendor visits **Settings → Log History** in the dashboard.
5. Frontend fetches `GET /vendors/me/logs`.
6. Logs are displayed newest-first.

## Log Format

```
[2026-02-20T10:00:00.000Z] New Customer Registered: user@example.com (ID: cus_xxx) - Name: John Doe
```

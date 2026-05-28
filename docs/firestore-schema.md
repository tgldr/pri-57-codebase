# Firestore Baseline Schema

This baseline keeps all user data under a user-owned namespace to simplify authorization.

## Root Collections

- `users/{uid}`
  - User profile and preferences.
  - Example fields:
    - `displayName: string`
    - `email: string`
    - `createdAt: timestamp`

## Subcollections under `users/{uid}`

- `inventory_items/{itemId}`
  - Pantry/fridge items for expiry-aware sorting.
  - Sprint 1 fields:
    - `name: string`
    - `quantity: number`
    - `unit: string`
    - `expiryDate: timestamp | null`
    - `locationTag: string | null` (optional)
    - `updatedAt: timestamp`

- `metadata/{docId}`
  - User-level metadata documents used by app features.
  - Suggested docs:
    - `inventory_summary`

- `households/{householdId}`
  - Placeholder for future shared inventory use cases.
  - For Sprint 1, still user-scoped and user-owned.

## Inventory Ordering Baseline

Default ordering in list views is deterministic and client-side:

1. Items with `expiryDate` are sorted earliest date first.
2. Items missing `expiryDate` (`null` or absent) are sorted after all dated items.
3. Ties are broken by case-insensitive item name, then by document id.

Near-expiry emphasis baseline categories:

- `expired`: `expiryDate < now`
- `near_expiry`: `expiryDate` within the next 3 days
- `ok`: `expiryDate` beyond 3 days
- `no_expiry`: missing `expiryDate`

## Access Model

- Only the authenticated owner (`request.auth.uid == uid`) can read/write any document in `users/{uid}` and its subcollections.
- Cross-user access is denied by rules and verified in emulator tests.

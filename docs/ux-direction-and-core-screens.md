# PRI-55: First App UX Direction and Core Screens

## Product Direction

Build a fast, mobile-first pantry inventory experience centered on one daily question: "What should I use soon?"  
Primary job-to-be-done: let users capture items quickly and reduce food waste by surfacing urgent expirations.

Design principles used:

- `Recognition over Recall` and `Jakob's Law`: familiar list + form patterns with visible labels.
- `Cognitive Load` and `Chunking`: one primary CTA per screen, grouped item metadata.
- `Hick's Law`: limit top-level navigation to 3 destinations.
- `Fitts's Law`: large thumb-friendly add/edit actions.
- `Progressive Disclosure`: optional fields hidden until needed.
- `WCAG POUR`: color-independent status labels and accessible contrast.

## Information Architecture (MVP)

1. `Inventory` (default)
2. `Add Item` (modal/sheet from Inventory)
3. `Item Details/Edit`
4. `Insights` (summary counts: expired, near expiry, ok, no expiry)
5. `Settings` (profile, notification preferences placeholder)

Navigation model:

- Mobile: bottom nav with `Inventory`, `Insights`, `Settings`.
- Desktop/tablet: left rail/nav column with same destinations.

## Core User Flows

### 1) Add item fast

1. User taps `Add item`.
2. Form opens with required fields first: `Name`, `Quantity`, `Unit`.
3. User optionally adds `Expiry date` and `Location`.
4. User taps `Save`.
5. User returns to Inventory list with inline success toast and item appears in sorted position.

Risk control:

- Inline validation before submit for required fields and numeric quantity.
- Keep keyboard focus on first invalid field (accessibility + error recovery).

### 2) Scan inventory priority

1. User lands on Inventory.
2. Screen starts with status chips: `Expired`, `Use soon`, `All`, `No expiry`.
3. Default filter is `All`, but list remains sorted by expiry ascending.
4. Each row shows name, quantity + unit, optional location, and status badge text.
5. User can filter to `Expired` or `Use soon` to triage quickly.

Risk control:

- `Color-independence`: status always has text badge, not color only.
- Empty state includes explicit next action CTA.

### 3) Edit or remove item

1. User opens item detail from list row.
2. User edits inline fields or taps delete.
3. Delete requires confirm step with item name for error prevention.
4. After save/delete, return to previous context and preserve active filter.

Risk control:

- `Forgiveness`: Cancel path always visible.
- `Nielsen Error Prevention`: destructive action separated from primary save.

## Screen Specs

## 1) Inventory Screen (Home)

Purpose: quick triage and direct path to add/edit.

Layout:

- Header: `Pantry` title + `Add item` primary button.
- Status filter chips row: `All`, `Expired`, `Use soon`, `No expiry`.
- Item list (single column):
  - Item name (primary text)
  - Quantity + unit (secondary text)
  - Expiry date or `No expiry`
  - Status badge text (`Expired`, `Use soon`, `Fresh`, `No expiry`)
  - Optional location label

States:

- Loading: skeleton rows.
- Empty inventory: illustration + "No items yet" + `Add your first item`.
- Empty filter result: "No items in this filter" + `Show all`.
- Error: inline error card with `Retry`.

Interaction notes:

- Tap row opens Item Details.
- Swipe left (mobile) reveals `Edit` and `Delete` shortcuts.
- Floating action button appears on mobile when user scrolls down.

## 2) Add/Edit Item Screen

Purpose: low-friction data entry with validation.

Fields:

1. `Name` (text, required)
2. `Quantity` (number, required)
3. `Unit` (text/select, required)
4. `Expiry date` (date, optional)
5. `Location` (text/select, optional)

Form design:

- Single-column form.
- Required fields grouped first.
- Optional section collapsed under "Add optional details".

Validation:

- Name/unit cannot be empty.
- Quantity must be numeric.
- Expiry date must be valid date.
- Inline error copy under field in plain language.

Actions:

- Primary: `Save item`
- Secondary: `Cancel`
- Tertiary destructive on edit only: `Delete item`

## 3) Item Detail Screen

Purpose: review item info and quickly adjust.

Layout:

- Top: item name + status badge.
- Metadata list: quantity/unit, expiry date, location, last updated.
- Actions: `Edit`, `Delete`.

Behavior:

- Edit opens same form pre-filled.
- Deletion uses confirmation modal: "Delete [item name]?"

## 4) Insights Screen

Purpose: reinforce value and prioritize action.

Content:

- Four summary cards: `Expired`, `Use soon`, `Fresh`, `No expiry`.
- Section: "Use soon this week" list (top 5 nearest expiry).
- Optional future chart placeholder (not required for MVP build).

Accessibility:

- Card values and labels announced correctly for screen readers.
- Avoid chart-only communication for critical info.

## 5) Settings Screen (MVP light)

Purpose: account and preference scaffolding.

Content:

- Profile: display name/email (read-only for now).
- Preference toggles placeholder:
  - "Notify me about items expiring soon"
  - "Default near-expiry window: 3 days"

Note:

- Notification controls can remain disabled if backend notifications are not implemented yet, but UX should show intended direction transparently.

## Interaction + Content Standards

- Button labels use clear verbs: `Add item`, `Save item`, `Delete item`.
- Dates shown in locale-readable format (e.g., `May 28, 2026`).
- Use plain-language errors:
  - "Enter an item name."
  - "Quantity must be a number."
  - "Choose a valid expiry date."

## Accessibility Acceptance Criteria

1. All actionable controls keyboard reachable with visible focus.
2. Form fields have persistent labels (not placeholder-only).
3. Status is conveyed by text and icon, not color alone.
4. Contrast meets WCAG AA for text and controls.
5. Touch targets are at least 44x44 px.
6. Error messages programmatically associated to fields.

## MVP Scope Boundaries

Included now:

- Inventory list with sorting and status filtering.
- Add/edit/delete item flows.
- Basic insights summary screen.
- Core empty/loading/error states.

Deferred:

- Household shared inventory.
- Barcode scanning.
- Push notifications.
- Advanced analytics visualizations.

## Engineering Handoff Notes

- Keep sorting consistent with existing domain logic (`expiryDate` asc, null last, name tie-break).
- Reuse existing expiry classification categories: `expired`, `near_expiry`, `ok`, `no_expiry`.
- Preserve user context (active filter) after create/edit/delete.
- Implement status chips as client-side filters over fetched items.

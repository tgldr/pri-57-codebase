# PRI-56: Onboarding Screen UX Spec

## Goal

Get first-time users to their first successful item entry in under 90 seconds, while setting expectations for expiry tracking and recipe suggestions.

Design lenses applied: `Progressive Disclosure`, `Cognitive Load`, `Recognition over Recall`, `Hick's Law`, `Jakob's Law`, `WCAG POUR`, `Fitts's Law`.

## Entry Conditions

Show onboarding when:

- `inventory_items` count is `0`, and
- user has not completed onboarding (`users/{uid}.onboardingCompletedAt` missing).

Skip onboarding and route directly to `Inventory` when either condition is false.

## IA Placement

Onboarding is a 3-step horizontal pager before the main app shell:

1. `Track what you have`
2. `Use food before it expires`
3. `Get recipe ideas from what you own`

This keeps scope aligned with MVP value props and avoids pre-permission clutter.

## Screen Structure

## Shared layout (all steps)

- Top: progress indicator text `Step X of 3` + skip action.
- Middle: illustration area (non-essential, decorative).
- Below illustration: title + 1-2 sentence body copy.
- Bottom sticky action row:
  - Primary: `Continue` (steps 1-2), `Start tracking food` (step 3)
  - Secondary text button: `Skip`

Mobile behavior:

- Single-column, 24 px side padding.
- 44 px minimum tap targets.
- Sticky bottom action row above safe area inset.

## Step content

### Step 1: Track what you have

Title: `Know what's in your kitchen`
Body: `Add pantry and fridge items in seconds so you always have an up-to-date list.`

### Step 2: Use food before it expires

Title: `See what to use soon`
Body: `We sort by nearest expiry date and highlight urgent items to cut food waste.`

### Step 3: Get recipe ideas

Title: `Cook from what you already own`
Body: `Get recipe suggestions based on your current items and what you're missing.`

## Primary User Flow

1. First-time user signs in.
2. User sees onboarding step 1.
3. User taps `Continue` through steps.
4. On final CTA, app writes `onboardingCompletedAt` and routes to empty `Inventory` screen.
5. Empty state CTA is `Add your first item`.

Alternate flow:

- User taps `Skip` on any step.
- App writes `onboardingCompletedAt` immediately and routes to `Inventory`.

## Interaction Details

- Pager supports swipe and button navigation; buttons remain the explicit accessible path.
- `Continue` advances one step and updates progress text.
- Hardware/software back from step >1 moves to prior step.
- Back from step 1 exits onboarding route (platform default).
- Final CTA shows inline loading state (`Starting…`) for async persistence.

## Accessibility Requirements

- Progress announced to assistive tech (`Step 2 of 3`).
- Titles mapped as heading level 1 on each step.
- Decorative illustrations hidden from screen readers.
- Skip and primary actions are keyboard-focusable with visible focus ring.
- Copy remains understandable without illustrations.
- Color is never the only channel for state.

## Content and Tone

- Plain language, no jargon.
- Benefit-first framing per step.
- No coercive copy or dark patterns; `Skip` is always visible.

## Analytics Events

Track:

- `onboarding_viewed` with `step_index`
- `onboarding_continue_tapped` with `step_index`
- `onboarding_skipped` with `step_index`
- `onboarding_completed`

Success KPI for v1:

- >= 70% of new users who view onboarding reach `onboarding_completed`.
- >= 50% create first inventory item in same session.

## Edge States

- Persistence write fails on skip/complete: show inline error + retry action, keep user on step.
- App restart mid-onboarding: resume at last viewed step from local state; if absent, restart at step 1.
- Offline at completion: queue local completion flag and proceed to Inventory; sync later.

## Engineering Handoff Notes

- Add field in user profile document: `onboardingCompletedAt: timestamp | null`.
- Optional field for resume quality: `onboardingLastStep: number`.
- Route guard should run before tab shell mount to avoid UI flicker.
- Reuse existing typography and spacing tokens from app primitives; do not introduce one-off styles.

## Acceptance Criteria

1. New users see onboarding exactly once unless app data is reset.
2. `Skip` is present on every step and routes to Inventory.
3. Final CTA persists completion and routes to Inventory.
4. VoiceOver/TalkBack reads step, title, and actionable controls correctly.
5. Empty Inventory state appears immediately after onboarding completion.

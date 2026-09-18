# Visual Design Spec — Payments tab + Payment Details (from Figma SOT_Valmo)

Source: Figma file `ShOKxbXbnD9mOzWPmVdxd8` ("SOT_Valmo")
- Frame A — node `275:10421` "Daily Payout": the **Payments** tab (Past Payments list). This is
  the tab that's stubbed-but-unbuilt in the prototype.
- Frame B — node `275:9263` "Default": the **Payment Details** drill-down (tap a past-payment row →
  this screen). Matches the KRD's "currently live Pilot Payment section" mock 1:1 (Base Pay /
  Incentives / Adjustments / Deductions cards).

Both frames use the same Valmo Partner App design language already partially captured in the
prototype's own `<style>` token blocks — see "Reconciliation" at the end for drift notes.

## 1. Color tokens (as used in these two frames)

| Token | Hex | Usage in these frames |
|---|---|---|
| Valmo Primary | `#092D5E` | active tab label, card section titles ("Base Pay", "Incentives"...), CTA border/fill, header title implicit |
| Valmo tint-1 (new) | `#DDE7FE` | **active segment background** in the My Earnings / Payments tab control |
| Grey Coral Light T1 | `#F2F5FA` | page background, summary-card header strip, "Payment for" chip bg |
| Grey Coral Light T2 | `#E6EBF2` | hairline dividers, card borders, month-divider bg |
| Grey Coral Medium T1 | `#C3C9D4` | (segmented control / chip borders elsewhere in app) |
| Grey Coral Dark T1 | `#5A5E66` | secondary text (line-item labels, sub-captions) |
| Grey Coral Dark T2 | `#272829` | primary text (amounts, row titles) |
| Grey Base | `#353543` | large ₹ amount on summary card |
| Green action | `#43A92C` | incentive-credit sub-line, e.g. "(₹137 Incentives)" |
| Blue (link) | `#2A67FF` | (design-system link color; not directly visible as text here but is the app's link/action blue) |
| White | `#FFFFFF` | card/row surfaces |

These map directly onto the prototype's existing CSS custom properties: `--valmo-navy` (#092D5E),
`--valmo-blue-tint-1`/`--valmo-blue-tint-2` (close family to `#DDE7FE` — see reconciliation),
`--valmo-grey-light-02` (#E6EBF2), `--valmo-grey-mid-02` (#5A5E66), `--valmo-dark-grey-01` (#272829),
`--valmo-dark-grey-02` (#353543), `--valmo-green-action` (#43A92C).

## 2. Typography (Mier B02: Book=400, Demi=600, Bold=700)

| Role | Size/LH/Weight | Where used |
|---|---|---|
| Heading 03 | 17/24/700 | App-bar title ("Earnings" / "Payment Details") |
| Heading 04 | 15/20/700 | Card section titles ("Base Pay", "Deductions"), row date ("Mon, 22nd May") is Body-01 not Heading — see row spec |
| Heading 05 | 13/20/600 | "Delivery" / "Pickup" sub-group labels, "Past Payments" divider label |
| Body 01 | 15/20/400 | Payment-tile date text, Help/Track Payment button label |
| Body 02 | 13/20/400 | Line-item label + value text (e.g. "240 Deliveries @ ₹13/Delivery — ₹3120") |
| Body 03 | 12/16/400 | "Credited on 23 May" caption, incentive sub-line, chip labels ("How payments work") |
| Display 01 | 28/36/600 | Big ₹ amount on Payment Details summary card (`₹234`) |
| Button 01 | 15/20/600 | CTA button labels ("Help", "Track Payment") |
| Button 02/03 | 13 or 12 /16 /600-700 | Row amount ("₹654"), chip text |

These match the prototype's existing `--heading-03/04/05`, `--body-01/02/03`, `--display-01`,
`--button-01` variables exactly (same px/lh/weight triples) — **reuse them, do not add new type vars.**

## 3. Spacing / radius / layout

- Screen frame: 360px wide (matches prototype's `--screen-width: 360px`).
- Card radius: `8px` (`--radius-md`) — Base Pay / Incentives / Adjustments / Deductions cards.
- Card border: `1px solid #E6EBF2` (`--border-subtle`).
- Card internal padding: `12px` top, `16px` bottom, `12px` sides.
- Card header row: dashed bottom border `1px dashed #E6EBF2`, height 31px, label left / amount right.
- Line-item row height: 20px, label left / value right, 8px vertical gap between rows within a group.
- Info icon: 16px, sits ~80px from the left edge inline with a label (only on rows that have a tooltip).
- Past-payment list tile: padding `16px` horizontal / `14px` vertical, bottom hairline divider,
  date (left, Body-01) + "Credited on/with ..." caption (left, Body-03, `#5A5E66`) stacked;
  amount (right, Button-02, `#272829`) + incentive sub-line (right, Body-03, `#43A92C`) stacked;
  chevron (20px) at the far right.
- Month/section divider row: bg `#E6EBF2`, padding `16px/4px`, label Heading-05 `#5A5E66`.
- Segmented tab control (My Earnings | Payments in Frame A):
  - Two (or more) equal-width segments in a single row, each `32px` tall, `1px solid #E6EBF2` border.
  - **Only the outer corners are rounded** (`4px`) — first segment rounds top-left/bottom-left,
    last segment rounds top-right/bottom-right; middle segments (if any) are square. Segments sit
    flush against each other (shared borders), not spaced pills.
  - Active segment: background `#DDE7FE` (valmo-tint-1), label color `#092D5E`, weight Demi (600).
  - Inactive segment: background `#FFFFFF`, label color `#5A5E66`, weight Book (400).
  - Label size/line-height: 12/16 (Button-03/Body-03 scale).
- Utility chip row (Frame A, above the tab control): "How payments work" / "Rate card" — white pill,
  `1px solid #E6EBF2`, `6px` radius, `8px` padding, icon(16px) + label(Body-02, Demi) + chevron(16px).
- Payment Details summary card (Frame B): white card, `1px solid #E6EBF2`, `10px` radius, `96px` tall;
  header strip `#F2F5FA` full-width, `36px` tall, containing "Payment for <date>" (Body-02, mixed
  weight: "Payment for" Book + date Demi); big ₹ amount below in Display-01 (`#353543`).
  Sits inside a `14px`/`16px` padded white shell directly under the app-bar.
  **Note:** this exact "Payment for <date>" summary card is the reconciliation anchor the KRD's
  `debit_date` contract (§6b) points at — do not restyle it independently of the Losses tab's own
  payment-pointer copy.
- Bottom action bar (Frame B): fixed footer, `#F2F5FA` bg, shadow `0px -2px 6px rgba(72,68,68,0.2)`,
  info row ("Payment initiated & will be credited in 2-3 days") above two buttons — "Help" (outline,
  navy border/text) + "Track Payment" (solid navy fill, white text) — both `44px` tall, `4px` radius.

## 4. Component inventory to build

1. **Payments tab (list)** — replaces the currently-inert "Payments" label in the Earnings segmented
   control. Content: utility-chip row ("How payments work", "Rate card") → "Past Payments" section
   divider → repeating payment tiles (date, credited-caption, amount, incentive sub-line, chevron) →
   "View More Payments" footer link (doc icon + navy Demi label).
2. **Payment Details (drill-down)** — opened by tapping a payment tile. Content: app-bar with back
   chevron + "Payment Details" title + Help/notification icons → summary card (`Payment for <date>` +
   big ₹) → four collapsible cards (Base Pay, Incentives, Adjustments, Deductions) → bottom info +
   action bar.
3. **Segmented tab control restyle** — the prototype's existing 3-way My Earnings / Payments / Losses
   control currently uses a different visual (pill container, `10px` radius, active bg `#F6F9FE`,
   dividers between segments). Per this spec it should switch to the Figma style: flush segments,
   `4px` outer-corner radius only, active bg `#DDE7FE`, active text `#092D5E` Demi, inactive `#5A5E66`
   Book. Apply consistently across all three segments, not just Payments.

## 5. Reconciliation notes (prototype vs Figma — resolve during implementation)

- Prototype's `--valmo-blue-tint-2: #E3EDFF` is close to but **not** the same as Figma's `#DDE7FE`
  used here. Add `--valmo-tint-1: #DDE7FE` as a new token rather than reusing an existing near-miss —
  do not silently substitute.
- Prototype's current tab-bar for My Earnings/Payments/Losses (see WIP file, tab-bar block) uses
  `border-radius: 10px` container + `background:#F6F9FE` for the active Losses segment. Figma's
  segmented control for My Earnings/Payments uses flush segments with only-outer-corner `4px` radius
  and `#DDE7FE` active bg. These are two different components in the same app; **this task restyles
  the tab-bar to match Figma**, since Figma is the source of truth per the user's instruction.
- Row/card font weights: Figma's MCP metadata reports Body-02 as weight 500 in one place and the
  prototype's own token doc says `--body-02-weight: 400`. Use the prototype's existing 400 — the
  visual weight difference at 13px is not perceptible and the prototype's token set is the one this
  work must stay consistent with.

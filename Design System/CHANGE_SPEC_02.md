# Change Spec 02 — Losses tab restructure + Payments drill-down + collapsible cards

Status: **All three changes spec'd and decided. Ready to implement.** (Change 3's brainstorm resolved
2026-09-08 — user picked Option C, "headline number + filter chips" — see §3.)

File to edit: `Input Prototype/FE Report Card V9 - Payments Tab (WIP).html` (same working copy from
the previous round — keep editing this one, do not re-duplicate from the original).

Read `Design System/SUBAGENT_PLAYBOOK.md` §"Edit procedure" before touching the file — it has the
exact decode → edit → splice → verify pipeline, including a real encoding bug hit and fixed last
round. Following it exactly avoids re-discovering that the hard way.

---

## Baseline architecture (context so the implementer doesn't need to re-derive it)

The WIP file is a Claude-Design canvas bundle. The real markup+logic lives inside
`<script type="__bundler/template">` as a JSON-encoded string. Inside that, a proprietary reactive
component (`class Component extends DCLogic`) drives everything via `this.state.screen` (a string
enum) and a `render()` method that returns a data object the `sc-if`/`sc-for`/`{{ }}` template
bindings consume.

Current `screen` values (post the Payments-tab round): `"home"`, `"detail"`, `"accept"`, `"dispute"`,
`"review"`, `"won"`, `"debited"`, `"cdetail"`, `"pending"`, `"cooloff"`, `"wrong"`, `"lost"`,
`"awareness"`, `"accepted"`, `"payments"`, `"pdetail"`.

Relevant data constants: `MARKED` (open + decision-pending losses — feeds "Needs action"), `DEBITED`
(the old Losses "Debits" ledger — being retired from Losses per Change 1), `CLOSED` (past-decided
cases — this is already the "Decisions history" concept Change 2 asks for, just needs surfacing
without a tab click and a possible rename), `PAYMENTS` (Payments-tab row list, added last round).

Relevant render() flags: `inShell`/`inSheet`/`inDetail`/`inPaymentDetail`/`isPayments`,
`showLossesSubtabs` (gates the Needs action/Wrong Pickups/Debits pill row — **being removed**),
`showLossesBody` (gates all Losses-only content inside the shared shell scroll region).

---

## 1. Debits leaves Losses entirely → moves into Payment Details, cards become collapsible

**Remove:** the "Debits" concept from the Losses tab completely — no tab, no ledger screen. Concretely:
- Delete the "Debits" entry from the `tabs` pill array (and the whole pill row per Change 2 — see §2).
- Retire the `"debited"` and `"ddetail"` screen states and their render branches (the `s === "debited"`
  rows-building block, `DEBITED`-based ledger rendering, `ddetail` detail screen markup). Nothing in
  Losses should be able to reach them once this ships — if easier, remove their `SCREENS` pill entries
  too rather than leaving dead nav.
- `goBack()`'s `(s === "ddetail" || s === "cdetail") ? "debited" : ...` branch loses the `"ddetail"`
  case; `"cdetail"` should now go back to `"home"` (Decisions history lives in the flat Losses view now,
  not under a "debited" tab — see §2).

**Add, inside the existing Payment Details screen (`inPaymentDetail`):**

a. **Collapsible cards.** Base Pay stays static/always-expanded (matches Figma — it never had a
   chevron). Incentives, Adjustments, and Deductions each get a chevron toggle:
   - New state: `pdExpanded: { incentives: false, adjustments: false, deductions: true }` (defaults
     match the reference screenshot — Deductions open, the other two collapsed).
   - Tapping a card header toggles that card's entry in `pdExpanded` and rotates its chevron
     (reuse the existing `arrows/chevron` SVG rotation trick already used elsewhere in this file for
     collapsed/expanded state, e.g. search for `-rotate-90` usage patterns in the Figma-derived code
     from last round, or simplest: swap between a "▾" and "▸" path).
   - When collapsed, only the header row (title + amount) renders; line items hide.

b. **Drill-down modal on a debit line.** The reference screenshot ("Lost shipments" bottom sheet) shows
   tapping the **"Lost Shipments"** line inside Deductions opens a modal: title "Lost shipments",
   subtitle "{n} shipments deducted from this payment", a two-column header ("AWB NUMBER" / "AMOUNT"),
   one row per AWB (AWB number bold + "Marked lost on {date}" caption / amount), a "Total deducted"
   summary row, and a "Got it" primary button (full-width, navy) that dismisses it. Small "×" close
   icon top-right of the sheet.
   - New state: `pdModal: null | "lostShipments"` (null = closed).
   - New data constant, e.g. `LOST_SHIPMENT_ITEMS = [{ awb: "VLM8241900731", date: "12 May", amt: 85 },
     { awb: "VLM8241887204", date: "14 May", amt: 70 }, { awb: "VLM8241902558", date: "16 May", amt: 55 },
     { awb: "VLM8241914073", date: "18 May", amt: 45 }]` — matches the reference image exactly
     (total ₹255, matching the existing "Lost Shipments — ₹255" line already on screen — don't change
     that total, the modal must reconcile to it).
   - Only the "Lost Shipments" line is tappable/underlined-affordance in this pass. `TDS 1%` and
     `Facilitation Fee` are single flat fees, not aggregates — leave them non-interactive.
   - **Scope note, not to be silently expanded:** the KRD's other debit type ("Shipment Loss for
     Junk/Mismatch", which would live under Adjustments) isn't currently a line item in this screen's
     mock data at all — don't invent it. If the user wants that wired up too, that's a follow-up, not
     part of this change.
   - Modal presentation: reuse whatever bottom-sheet/overlay pattern already exists in this file for
     the accept/dispute sheets (`inSheet` region) for visual consistency (same overlay dim + slide-up
     card + rounded top corners) rather than inventing a new modal chrome.

---

## 2. Losses tab: remove the three sub-tabs, merge into one flat, sectioned view

**Remove:** the entire segmented pill row (Needs action / Wrong Pickups / Debits) and its
`showLossesSubtabs` gate — delete the markup block, the `tabs` render() field, and the `tabIds`
derivation. The Losses tab (`s === "home"`, still `isPayments === false`) becomes a single continuous
scroll with clearly labeled sections, in this order:

1. **(Change 3's metrics section goes here once decided — leave a placeholder `sc-if` hook, see §3.)**
2. **Needs action** — today's open `MARKED` rows (the 4 debited loss reason types), sorted by days
   left ascending. Unchanged logic, just no longer gated behind a tab click — always visible when
   there are open items.
3. **Decision pending** — items from `MARKED` with a `status` (already-acted-on, awaiting Kapture/
   selection outcome). This already renders inline after "Open" in the current `rows` sort — just
   needs its own explicit section header ("Decision pending") instead of being an undifferentiated
   continuation of the same "Open" group. (Today `showGroup`/`group` is hardcoded to `"Open"` for
   every row — split it so status-bearing rows get `group: "Decision pending"` and their own
   `groupTotal`.)
4. **Decisions** (rename of "Closed") — the existing `CLOSED`/`showClosedSection`/`closedRows` block,
   unchanged in logic, just always visible (no longer implicitly tied to being on the "home" tab vs.
   some other tab — it already only ever showed on `"home"`, so structurally this is nearly a no-op).
   Rename the visible section label from "Closed" to "Decisions" per the user's wording — copy-only
   change, `closedTotal`/`CLOSED` data untouched.
5. **Wrong Pickups** — fold the content of the current `s === "wrong"` screen (info banner "These are
   for your information. No money is deducted for these." + the wrong-pickup rows, reverse-chronological,
   no red/no minus signs per KRD F24) into this same flat scroll as its own section, instead of a
   separate tab/screen reached via `s === "wrong"`. Needs a `WRONG_PICKUPS` data constant if one
   doesn't already exist under a different name — check what currently powers the `s === "wrong"` rows
   build and reuse the same source, just re-home it into the merged view's row-building logic.
   Keep `wdetail` as the tap-through detail screen (its back-target becomes `"home"` per §1).

**State-machine cleanup implied by the merge:** `"wrong"` and `"debited"` stop being reachable
top-level `screen` values reached via a tab click (a stray `SCREENS` pill can still exist for direct
prototype navigation if useful for QA, but the in-app tab-bar path to them is gone). `isWrongPickups`,
`showStrip`, `stripAmount`, etc. get recomputed as "is there a wrong-pickups section to show" rather
than "is the current screen the wrong tab."

**Do not** merge Wrong Pickups' info-only, no-money styling into the same visual treatment as
Needs action/Decisions — KRD F24 is explicit: no red, no minus signs, info-only framing. Keep it
visually distinct (e.g. a soft grey/blue section, no ₹ deltas) even though it's now on the same page.

---

## 3. Top metrics/summary section — brainstorm (needs a decision before implementation)

JTBD as given: the Pilot opens Losses and wants to know (a) total upcoming/at-risk loss exposure,
(b) how much of that is actionable right now vs. already in a decided/pending state, and (c) that
Wrong Pickups is a separate, non-monetary bucket. The user explicitly flagged whether the metrics
should also act as **filters** on the list below as an open question.

Three options, from safest to richest:

**Option A — Static stat row (no filtering).** Three tiles: "Needs action" (₹ + count, amber/at-risk
tone), "Decision pending" (₹ + count, blue/neutral tone), "Wrong pickups" (count only, grey, no ₹).
Purely informational — tapping does nothing. Lowest implementation risk; matches how conservative the
KRD itself is about this exact area (F6 marks "badge / at-risk counting rules" as still an open
decision in the source doc — this option doesn't force a resolution on that either).

**Option B — Tappable filter tiles.** Same three tiles, but tapping one filters the sections below to
just that bucket (toggle: tap again clears back to "show everything"). Needs new state
(`activeFilter: null | "needsAction" | "pending" | "wrong"`) and filter logic applied across the
merged sections from §2. Most direct match to "acts like filters" as the user floated, but adds a
second interaction users have to learn on top of tapping into a row.

**Option C — Headline number + filter chips (recommended).** One big number up top (total ₹ across
Needs action + Decision pending, reusing the pattern already in this file's `stripAmount`/`showStrip`
concept) answering "how much is at stake" at a glance, with a row of smaller tappable chips below it
(Needs action / Decision pending / Wrong pickups) for the drill-in behavior from Option B. Gives a
fast headline read *and* the filtering the user is considering, without making the filter tiles do
double duty as both the primary number display and the interactive control.

**Decided (2026-09-08): Option C.** User picked "headline number + filter chips." Implement as follows.

### Option C — implementation spec

- **Headline:** big ₹ number = sum of Needs-action amounts + Decision-pending amounts (both buckets
  from `MARKED` — open items without a `status`, and items with a `status`, respectively). Caption
  below it: "{n} losses need your action" where `n` = count of Needs-action items only (not pending,
  not wrong pickups) — matches the "how much is actionable" half of the JTBD.
- **Filter chips, three:** "Needs action" / "Decision pending" / "Wrong pickups" — no chip for
  "Decisions" (the closed-history section from §2.4). Those are a different concept (an audit log of
  already-fully-resolved cases, not one of the three live buckets the JTBD asks about) — **the
  Decisions history section is always visible regardless of filter state**, a deliberate choice, flag
  it if it looks wrong once built.
- **State:** `lossFilter: null | "needsAction" | "pending" | "wrong"`. Tapping a chip sets it (replacing
  any other active filter); tapping the already-active chip clears it back to `null`. `null` = show
  Needs action + Decision pending + Wrong Pickups sections all at once (today's default).
- **Filtering effect:** when `lossFilter` is set, show only the matching section among {Needs action,
  Decision pending, Wrong Pickups}; hide the other two. Decisions history section is unaffected (always
  shown, per above).
- **Visual:** headline number block above the chip row, chip row styled consistently with the
  Payments-tab segmented-control work from round 1 (reuse the active/inactive token pair —
  `#DDE7FE`/navy-Demi active, white/grey inactive — rather than inventing a fourth chip style in this
  file).
- Sits at the very top of the merged Losses scroll, above "Needs action" (i.e. where the
  `<!-- METRICS SECTION PLACEHOLDER -->` hook from §2 is).

This is now fully specified — no longer a placeholder. Implement it together with §1 and §2.

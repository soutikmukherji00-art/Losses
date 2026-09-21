# Task Log — Payments-style tab for FE Loss Report Card prototype

Resumable log. If a session gets cut (usage limit, crash), read this file top to bottom,
check the Status column, and continue from the first `[ ]` item. Do not redo `[x]` items.

## Working files (do not lose track of these)

- Original (NEVER edit): `Input Prototype/FE Report Card V9 - Standalone.html`
- Working copy (edit this one): `Input Prototype/FE Report Card V9 - Payments Tab (WIP).html`
- Design spec (source of truth for visual tokens): `Design System/VISUAL_DESIGN_SPEC.md`
- This file: `PROGRESS.md`
- Subagent rules: `Design System/SUBAGENT_PLAYBOOK.md`

## Source of truth (Figma)

- Frame 1: https://www.figma.com/design/ShOKxbXbnD9mOzWPmVdxd8/SOT_Valmo?node-id=275-9263
- Frame 2: https://www.figma.com/design/ShOKxbXbnD9mOzWPmVdxd8/SOT_Valmo?node-id=275-10421
- File key: `ShOKxbXbnD9mOzWPmVdxd8`, node-ids: `275:9263`, `275:10421`

## Goal

The standalone prototype (`Input Prototype/...html`) renders Earnings → My Earnings / Payments / Losses,
but the "Payments" tab content itself was never built out (it's a static label only). The two Figma
frames above are the real visual design for this module. Task: extract their design system (colors,
type, spacing, component specs) into a markdown spec, then build a new tab in the WIP prototype that
matches that visual style exactly, reusing the extracted tokens (not eyeballed values).

## Phase checklist

- [x] P0 — Duplicate prototype file, preserve original, create `Design System/` folder, start this log.
- [x] P1 — Fetch both Figma frames (get_design_context + screenshot) and decompose into
      `Design System/VISUAL_DESIGN_SPEC.md` (colors, type scale, spacing, radii, component specs,
      exact copy/labels seen in the frames).
- [x] P2 — Reconciled inline in the spec's "Reconciliation notes" section (§5): prototype's existing
      type/color tokens matched the Figma frames almost exactly; one new token needed
      (`#DDE7FE` active-segment bg, not a reuse of an existing near-miss); tab-bar visual intentionally
      diverges from the prototype's pre-existing style per user instruction (Figma is source of truth).
- [x] P3 — Implemented. Method used (see decisions log): decoded the `__bundler/template` JSON string
      with `json.loads` into a clean baseline file, applied 8 scripted edits (segmented control restyle
      + dynamic wiring, Losses-body gating behind `showLossesBody`/`showLossesSubtabs`, new Payments-tab
      markup block, new sibling `inPaymentDetail` screen block, `SCREENS` pill entries, `isPayments` /
      `inPaymentDetail` state flags, `PAYMENTS` data constant, `render()` return-object additions), then
      `json.dumps` + re-escaped `</` → `</` (matching the bundle's own convention) and spliced the
      result back into the WIP `.html` file's template script tag only.
- [x] P4 — Visual QA done structurally (not pixel-rendered — no browser available in this environment):
      (a) `node --check` on the extracted JS logic passed; (b) `<sc-if>`/`<sc-for>` tag counts balanced
      (33/33, 11/11) before and after; (c) round-trip check — re-extracting and `json.loads`-parsing the
      spliced WIP file reproduces the edited template **byte-for-byte**; (d) byte-diff confirms every
      other part of the bundle (manifest, fonts/asset resources, bootstrap unpacker script) is
      **identical** to the untouched original. Content fidelity to Figma was checked by eye against the
      `get_design_context` output + screenshots while writing the markup (see spec §4 component list).
      **Not done: an actual rendered-in-browser check** — flag this to the user as the one remaining
      verification step before treating this as launch-ready, not just structurally sound.
- [x] P5 — Decided against wrapping via the generic Artifact tool (see decisions log — nesting risk
      with this bundle's own `<html><head><body>`). Deliverable is the WIP file's local path; user
      informed of the tradeoff and can ask for an Artifact-published version if they want a browser URL
      (would require converting away from the proprietary `sc-if` bundle format first).

**Status: implementation complete.** Nothing left mid-flight. If resuming after a cutoff, the only
outstanding item is asking the user to actually open the file in a browser and confirm it looks right —
there is no further coding work queued.

---

## Round 2 (2026-09-08) — Losses restructure + Payments drill-down + collapsible cards

Spec: `Design System/CHANGE_SPEC_02.md`. Same WIP file as round 1 (`Input Prototype/FE Report Card V9
- Payments Tab (WIP).html`) — no new duplicate needed, this continues on it.

- [x] Spec written (`CHANGE_SPEC_02.md`), covering: (1) Debits leaves Losses → moves into Payment
      Details as a drill-down modal + the 3 movable cards (Incentives/Adjustments/Deductions) become
      collapsible; (2) Losses' three sub-tabs removed, merged into one flat sectioned view (Needs
      action / Decision pending / Decisions / Wrong Pickups); (3) top metrics section — **brainstormed,
      not decided** (three options in the spec, recommendation: Option C, headline number + filter
      chips) — needs the user to pick before it's built.
- [x] Edit procedure (decode/edit/splice/verify, including the `unicode_escape` corruption gotcha from
      round 1) written up as a reusable runbook in `Design System/SUBAGENT_PLAYBOOK.md` so whoever
      implements this doesn't need to rediscover it.
- [x] Change 3 decision made: user picked Option C ("headline number + filter chips"). Spec updated
      in `CHANGE_SPEC_02.md` §3 with the concrete implementation (headline ₹ + 3 filter chips: Needs
      action / Decision pending / Wrong pickups; Decisions history stays always-visible, unfiltered).
- [x] Changes 1 + 2 + 3 implementation — done in one decode/edit/splice/verify pass over the WIP file.

**Status: Round 2 implementation complete.** All three changes from `CHANGE_SPEC_02.md` are live in
the WIP file. Nothing left mid-flight for this round.

## Round 3 (2026-09-08) — Filter-chip additions + horizontal scroll

- [x] Added an "All" chip (id `null`, always first) to `lossFilterChips` — clicking it just sets
      `lossFilter: null` unconditionally (no toggle-off, since there's nothing else for it to mean).
- [x] Added a "Decision closed" chip (id `"closed"`) that filters the Decisions/Closed section.
      `showClosedSection` was previously always-true whenever `showClosed && !emptyMarked`
      (unaffected by `lossFilter`, per Round 2's spec); now gated by a new `showClosedFiltered =
      lossFilter === null || lossFilter === "closed"` alongside the existing conditions, so selecting
      "Decision closed" hides Needs action/Decision pending/Wrong pickups (their conditions already
      require `lossFilter === null || lossFilter === <own id>`, so they auto-hide) and shows only
      Decisions. Selecting "All" (or default) shows everything, same as Round 2's original behavior.
- [x] Chip row changed from `flex-wrap: wrap` to `overflow-x: auto` + `flex-wrap: nowrap`, each chip
      `flex: none` so it can't shrink; added `.fe-nowrap-scroll` CSS class (scrollbar hidden, matching
      the existing `.fe-scroll` convention) so chips scroll horizontally in one row instead of wrapping.
- [x] Verified: `<sc-if>`/`<sc-for>` balance 37/37, 16/16 (unchanged counts — no new conditionals
      added, only chip data + a style tweak). `node --check` passed. Round-trip decode of the written
      WIP file matched the edited template character-for-character; byte-diff confirmed everything
      outside the edited template span (manifest, fonts, bootstrap script) is unchanged.

## Round 4 (2026-09-08) — Global "Sectioned vs Unified" layout toggle (left nav)

User wants an alternate Losses layout to compare side-by-side with the existing (Round 2/3) one,
switched from a global control outside the phone-frame mockup, not a per-tab setting.

- [x] New `altLayout` boolean added to `state` (default `false` = existing "Sectioned" behavior
      untouched). A fixed left rail (`position: fixed; left:0; width:104px`, navy bg, outside the
      centered phone-frame div) with two stacked pill buttons ("Sectioned"/"Unified") toggles it via
      `toggleAltLayout`. Main content wrapper got `padding-left: 120px` added so the rail doesn't
      overlap it. This is a prototype-only meta-control (like the existing `SCREENS` QA pills), not
      part of the simulated app UI.
- [x] **Sectioned mode** (`altLayout === false`): completely unchanged — original headline+chips
      metrics block, separate Needs-action/Decision-pending sections with group headers, all wrapped
      in new `<sc-if value="{{ !altLayout }}">` guards so nothing about it changed behaviorally.
- [x] **Unified mode** (`altLayout === true`): new parallel branches, each gated `<sc-if value="{{
      altLayout }}">`:
      - New `unifiedRows`: Needs-action + Decision-pending items from `MARKED` merged into one list,
        sorted purely by `days` ascending (both buckets already carry a `days` field — decision-pending
        items have their own resolution timeline from Meesho's side, so they interleave with
        needs-action items on the same urgency axis instead of forming a separate group). Built by
        reusing `mapMarkedRow` then overriding the chip to always read "`{days}` days left" (previously
        decision-pending rows showed the text "Decision pending" instead of a day count — the `sub`
        line's "Accepted on/Dispute raised on ..." text still carries that distinction).
      - New `summaryCards` (4, horizontally scrollable, `.fe-nowrap-scroll`): Needs action / Decision
        pending / Wrong pickups / Decisions, each showing the amount-or-count + item count that used
        to live in the sectioned mode's group headers — added because the merged list has no headers,
        so those per-category totals would otherwise disappear entirely. Purely informational, not
        tappable filters (no `pick` handler).
      - Wrong Pickups and Decisions sections are **not** merged into `unifiedRows` and render
        unchanged in both modes — Wrong Pickups carries no monetary/day-based urgency (`amount:
        "info"`), and Decisions is already-resolved history, so neither fits the "unresolved items on
        a timeline" framing the merge is for.
      - `lossFilter`/filter chips are sectioned-mode-only; in unified mode `lossFilter` just stays
        `null` (no chips render to change it), so `showWrongSection`/`showClosedSection`'s existing
        `lossFilter === null || …` conditions still evaluate to visible without any changes needed.
- [x] Verified: `<sc-if>` balance 45/45 (was 37/37), `<sc-for>` balance 18/18 (was 16/16) — net +8
      `sc-if`/+2 `sc-for` all from the new mode-gating and the two new loops (summaryCards,
      unifiedRows), fully balanced. `node --check` passed. Round-trip decode of the written WIP file
      matched the edited template character-for-character; byte-diff confirmed everything outside the
      edited template span is unchanged.
- [x] **Not done: actual rendered-in-browser check** (no browser in this environment, per Round 1/2/3)
      — please open the WIP file and toggle the left-rail switch to confirm both layouts render as
      expected, especially the fixed rail's `z-index`/positioning against the phone-frame mockup.

## Round 5 (2026-09-08) — Bug fix + 4 feedback items from screenshot review

User screenshot showed the left-rail toggle with no visible active/inactive distinction between
"Sectioned"/"Unified", plus 4 requested changes.

- [x] **Toggle-not-visible bug, root cause found and fixed.** The rail buttons used an inline
      `{{ altLayout ? '#0F1B33' : '#DDE7FE' }}` ternary inside a `style="background: {{ ... }}"`
      string. Checked every other `{{ }}` usage in the whole file (~150 occurrences): every single
      one is either a bare top-level name or one level of `loopVar.prop` — there is no other example
      of an inline ternary/expression inside `{{ }}` anywhere in this codebase. Concluded the
      template engine's interpolation only does property lookups, not expression evaluation, so the
      ternary silently failed to apply and both buttons rendered identically. Fix: precompute 4 flat
      fields in the render return object (`sectionedBtnBg/Color`, `unifiedBtnBg/Color`) the same way
      `lossFilterChips`/`summaryCards` already precompute their per-item colors, and reference those
      bare names from the two `<div style="...">` tags instead of an inline ternary.
- [x] **Unified view: decision-pending items get a distinct colored chip + "Decision pending"
      keyword.** Round 4 had overridden every unified-list chip to a uniform amber "{days} days
      left", losing the status distinction. Fixed by *not* overriding the chip at all for the
      actionable (needs-action + pending) half of `unifiedRows` — plain `mapMarkedRow(x, i)` already
      produces the right per-item chip (blue "Decision pending" for `x.status` items, amber "{days}
      days left" otherwise), so removing the override restored it while the list is still sorted by
      `days` under the hood.
- [x] **Date removed from line-item subtitles, both modes.** `mapMarkedRow`'s plain branch (no
      `status`, no custom `sub`) dropped the trailing `" · " + x.date`, leaving just `"AWB xxx…"`
      (was `"AWB xxx… · 11 Aug"` — redundant with the "{days} days left" chip already shown).
      `wrongRows`' subtitle similarly dropped its middle `" · " + x.date` segment. Left untouched:
      the `"Accepted on {date}"`/`"Dispute raised on {date}"` phrasing for decision-pending rows —
      that's an action record, not a bare trailing date, so it stayed (per the literal "beside the
      AWB" framing of the ask).
- [x] **Sectioned mode: single ₹ headline replaced with 2 tap-to-filter cards.** Closes the loop on
      the pros/cons discussion from earlier in this session (recommended: replace, not add, and
      double the cards as filters). New `sectionedCards` (Needs action / Decision pending) uses the
      exact same active/inactive bg+border pattern and the exact same `lossFilter` state/toggle logic
      as `lossFilterChips`, so tapping a card and tapping its matching chip are two affordances for
      one shared state — always in sync, never contradictory. The full 5-chip filter row (All / Needs
      action / Decision pending / Wrong pickups / Decision closed) stays underneath unchanged, since
      the 2 cards don't cover Wrong pickups/Decision closed/All.
- [x] **Wrong Pickups: real amount (greyed) + separate "Not deducted" chip, both modes.** Added an
      `amt` field to each `WRONG` data item (65/48/52 — didn't exist before; this bucket previously
      showed the literal text `"info"` in the amount slot, flagged as an oddity back in Round 2's
      notes). `wrongRows` now sets `amount: fmt(x.amt)` in muted grey (`#8E96A3`) plus
      `showChip:true, chip:"Not deducted"` in a neutral grey chip (`#EEF1F5`/`#5A5E66`) — same shared
      row shape as the other three lists. Sectioned mode's standalone Wrong Pickups section markup
      was missing the chip block entirely (only rendered `r.amount`); added it to match the
      Needs-action/Pending row markup.
- [x] **Scope change (mid-turn user correction): Unified mode now merges all 4 categories, not 2.**
      User clarified unified mode should read as "a history of my losses related items" — Wrong
      Pickups and Decisions join Needs-action/Decision-pending in the SAME flat list, not as separate
      sections below it (Round 4's original design). Implemented as: `unifiedRows` = [urgency-sorted
      actionable items (days ascending)] concatenated with [wrongRows + closedRows sorted by recency,
      most-recent-date-first, via a small `parseShortDate("14 Aug")` helper] — actionable-first,
      history-tail-after, since "days left" has no meaning for already-resolved/non-monetary items.
      **Judgment call, flagging:** the two halves use different sort keys (urgency vs. recency)
      because there's no single field meaningful across all 4 types; if a strict single-timeline
      ordering was intended instead, this needs revisiting. Consequently `showWrongSection` and
      `showClosedSection` (the standalone sectioned-mode sections) are now both gated on
      `!altLayout` so they don't double-render the same rows when unified mode is active — `closedRows`
      was hoisted out of the render return object into a named `const` earlier in the function so
      `unifiedRows` construction (which happens before the return statement) can reuse it.
- [x] **Placeholder thumbnails replaced with real images (open web).** All 5 gray
      diagonal-stripe `repeating-linear-gradient` placeholder boxes (Needs action, Decision pending,
      Unified list, Decisions, Wrong Pickups rows — NOT the evidence-photo upload grid in the detail
      screens, which is a different, intentionally-labeled placeholder and was left alone) replaced
      with `<img src="https://picsum.photos/seed/{awb}/88/88">` — Lorem Picsum, a free stock-photo
      placeholder service, seeded per-AWB so each row gets a stable (but arbitrary, non-thematic)
      real photo instead of a flat gray box. Flagging: these are NOT actual parcel/pickup photos
      (no such open, freely-hotlinkable, on-brand image source was available) — just real photographs
      standing in for the previous flat placeholder, addressing "distracting" per the ask without
      claiming visual accuracy to the loss photos they represent.
- [x] Verified: `<sc-if>` balance 46/46 (was 45/45 after Round 4), `<sc-for>` balance 19/19 (was
      18/18) — net +1/+1 from the new Wrong-Pickups chip conditional and the new `sectionedCards`
      loop. `node --check` passed. Round-trip decode of the written WIP file matched the edited
      template character-for-character; byte-diff confirmed everything outside the edited template
      span is unchanged.
- [x] **Not done: actual rendered-in-browser check** (no browser in this environment) — please open
      the file, confirm the left-rail toggle now visibly highlights the active mode, and check the
      unified list's merged ordering/chips/images render as intended, especially the actionable/
      history split point.

## Round 6 (2026-09-08) — Imagery, sectioned-card removal, unified-card filtering, sub-line cleanup

- [x] **Clothing/Meesho-themed imagery.** Swapped the Round-5 `picsum.photos` (random generic
      photos) for `https://loremflickr.com/88/88/clothing,fashion?lock={last 4 digits of AWB}` —
      LoremFlickr serves keyword-matched Flickr photos with no API key, `lock=` pins a stable image
      per value (kept AWB-seeded so a row's photo doesn't change on re-render). Still flagging (same
      caveat as Round 5): these are generic clothing/fashion stock photos, not actual pickup/parcel
      photos — no such open, freely-hotlinkable source exists — just thematically closer to Meesho's
      apparel marketplace than random nature/city photos were.
- [x] **Sectioned mode: Round-5 tap-to-filter cards removed.** Per feedback, reverted to filter chips
      only (`lossFilterChips`) — no cards above them. Deleted the `sectionedCards` markup block and
      its return-object field entirely (not just hidden) since it had no other reader.
- [x] **Unified mode: the 4 summary cards are now tappable filters.** Each row gained a `_cat` tag
      (`"needsAction"`/`"pending"`/`"wrong"`/`"closed"`) matching its origin category. `summaryCards`
      now carries an `id` per card and reuses the exact `lossFilter`-toggle pattern from
      `lossFilterChips` (tap to filter, tap the active one again to clear back to all) — same active
      bg/border convention (`#DDE7FE`/navy border when active). `unifiedRows` construction gained a
      final `.filter(r => lossFilter === null || r._cat === lossFilter)`, so a tapped card narrows the
      merged list to just that category.
- [x] **Wrong pickups summary card now shows a real ₹ total (greyed), like the other 3.** Added
      `wrongTotal = WRONG.reduce(...)`; the card's `amount` is `fmt(wrongTotal)` with `amountColor:
      "#8E96A3"` (muted grey) instead of the previous item-count text — same "amount shown, just
      grey to signal nothing was actually deducted" convention already used on its row-level chip
      since Round 5, now applied consistently to its summary card too. The other 3 cards' `amount`
      stayed black (`amountColor: "#272829"`).
- [x] **Line-item subtitles simplified to "AWB {full awb}" everywhere** — needs-action, decision-
      pending, unified-list, wrong-pickup, and decision rows all now show only the loss reason
      (title) + the full, unmasked AWB. Dropped: `mask()`-truncated AWB display, "Accepted on/Dispute
      raised on {date}" action-taken text, any custom `x.sub` next-step instruction (e.g. "Find it and
      give it to your hub captain" on the Shipment Lost row), "Your answers on record" (Wrong
      Pickups), and each Decision's outcome phrase (e.g. "you were right"/"accepted by you") — all
      treated as "next action" content per the ask; still visible on each row's own detail screen,
      just not in the list line. The `compactList` prop's date-prefixed variant was folded into the
      same fixed format (that prop is now inert for this purpose; left declared in `data-props` in
      case it's wired to something else later). `mask()` itself is untouched and still used by the
      loss-detail screen's own AWB display (out of scope — only list line items were asked about).
- [x] Verified: `<sc-if>` balance 46/46 (unchanged), `<sc-for>` balance 18/18 (was 19/19 — net -1 from
      deleting the `sectionedCards` loop). `node --check` passed. Round-trip decode of the written WIP
      file matched the edited template character-for-character; byte-diff confirmed everything outside
      the edited template span is unchanged.
- [x] **Not done: actual rendered-in-browser check** (no browser in this environment) — please open
      the file and confirm: LoremFlickr images load (external network dependency — will show broken
      images if offline), unified summary cards visibly highlight + filter the list when tapped, and
      all line-item subtitles now read as plain "AWB {full number}".

## Round 7 (2026-09-08) — Real Meesho product images

User supplied 3 real Meesho CDN product image URLs directly (from meesho.com product listings) to
replace Round 6's LoremFlickr generic clothing stock photos.

- [x] Added `const PRODUCT_IMAGES` (3 URLs, `images.meesho.com/images/products/.../...avif?width=360`)
      right before `MARKED`. All 5 `thumb` fields (mapMarkedRow, wrongRows, closedRows) now read
      `PRODUCT_IMAGES[i % PRODUCT_IMAGES.length]` — cycles through the 3 images by row index within
      each list. No 1:1 mapping to a specific loss item (only 3 images, more rows than that) — just
      real Meesho product photos standing in for the placeholder, same as the LoremFlickr images did,
      but now genuinely Meesho product imagery rather than generic stock photos.
- [x] Removed the now-dead LoremFlickr `?lock=` seeding logic and its comment.
- [x] Verified: `<sc-if>` 46/46, `<sc-for>` 18/18 (unchanged — no markup/conditional changes, only the
      thumb-URL source). `node --check` passed. Round-trip decode matched the edited template
      character-for-character; byte-diff confirmed everything outside the edited span is unchanged.
- [x] **Not done: actual rendered-in-browser check** — please open the file and confirm the 3 Meesho
      product images load correctly (external network dependency on `images.meesho.com`).

## Decisions / notes log (append, don't rewrite)

- (2026-09-08) **Round 2 implementation done.** Single decode → edit → splice → verify pass (per the
  playbook's Edit procedure), all three changes together:
  - **§1 Debits retirement + Payment Details upgrades:** Deleted the `DEBITED` data constant, the
    `"debited"`/`"ddetail"` screen branches, their `SCREENS` pill entries, and the `tabIds`/`tabs`
    Losses sub-tab machinery entirely. `goBack()` collapsed to a constant `() => this.setState({
    screen: "home" })` (was a 3-way ternary keyed off `ddetail`/`cdetail`/`wdetail` → all three now
    resolve to `"home"`). Inside Payment Details: added `pdExpanded` state (`{ incentives: false,
    adjustments: false, deductions: true }` default) driving a new data-driven `pdCards` render
    field + a `togglePdCard(key)` method; Incentives/Adjustments/Deductions are now one `sc-for`
    over `pdCards` with a chevron (rotates 0→180deg) and collapse/expand; Base Pay markup is
    untouched (still static, no chevron). Added `pdModal` state, `LOST_SHIPMENT_ITEMS` data
    constant (4 AWBs, ₹85+₹70+₹55+₹45 = ₹255, reconciling to the existing "Lost Shipments — ₹255"
    line), and a bottom-sheet modal (same dim-overlay + slide-up rounded-top-card chrome as the
    existing `showAwareness` overlay) opened only by tapping the "Lost Shipments" line; TDS 1% and
    Facilitation Fee stay non-interactive per spec.
  - **§2 Losses tab merge:** Removed the sub-tab pill row markup and `showLossesSubtabs` entirely —
    no tab bar. `inShell` simplified to `s === "home" || isPayments` (dropped `"debited"`/`"wrong"`).
    Split the old single `rows` (hardcoded `group: "Open"` for everything) into `needsActionRows`
    and `pendingRows`, each with its own group header + total, sorted by days-left ascending per
    CHANGE_SPEC_02 §2.3. Wrong Pickups' old separate `s === "wrong"` screen/tab is gone; its rows
    (`wrongRows`) and info banner are now an always-computed section folded into the same flat
    scroll, kept visually distinct (soft blue header/banner, `amount: "info"` text, no chip, no red)
    per the KRD F24 instruction not called out. "Closed" section renamed to "Decisions" in the
    visible label only — `CLOSED`/`closedTotal`/`closedRows` data/logic untouched.
  - **§3 Metrics + filter chips (Option C, already decided):** Added `lossFilter` state
    (`null | "needsAction" | "pending" | "wrong"`), a headline block (`lossHeadline` = needs-action +
    pending amounts, `lossHeadlineCaption` = needs-action count only) and `lossFilterChips` (3 chips,
    reusing the `#DDE7FE`/navy active vs. white/grey inactive token pair from the round-1 segmented
    control). `showNeedsActionSection`/`showPendingSection`/`showWrongSection` all gate on
    `lossFilter === null || lossFilter === <that bucket>`; `showClosedSection` (Decisions) has no
    filter dependency at all, so it is always visible regardless of `lossFilter`, per spec.
  - **Judgment calls not fully pinned down in the spec (flagging per instructions):**
    1. Renumbered the `SCREENS` QA-nav pill labels (1 Home, 2 Loss detail, … dropping the old "7
       Debits"/"9 Wrong Pickups" slots) since those two are no longer reachable states — purely
       cosmetic tidy-up of dead numbering, not a behavior change; flagging in case the numbers were
       meant to stay stable as external references.
    2. The Wrong Pickups section's row `amount` field literally renders the text `"info"` in the
       amount column — this was pre-existing behavior carried over unchanged from the old `s ===
       "wrong"` screen (not something introduced this round), but it reads oddly now that it sits
       inline next to real ₹ amounts in Needs action/Decision pending. Left as-is to avoid scope
       creep; worth a follow-up glance in an actual browser render.
    3. `showLossMetrics` is gated only on `s === "home"` (shows even when `emptyMarked` is true / all
       three live buckets are empty), since the spec didn't say to hide it in the empty case and a
       ₹0 headline still answers "how much is at stake" honestly. If this looks wrong once rendered,
       gate it on `!emptyMarked` too.
    4. Deleted the old always-`false` "summary strip" (`showStrip`/`stripAmount`/etc.) feature
       entirely — it was dead code (guarded by a permanently-false flag) whose concept the new
       headline metrics block explicitly supersedes per spec ("reusing the pattern already in this
       file's `stripAmount`/`showStrip` concept"). Removing rather than leaving it dangling avoids
       having two competing "amount summary" mechanisms in the code.
  - **Verification results:**
    - `<sc-if>`/`<sc-for>` tag balance: **37/37** and **16/16** (was 33/33, 11/11 before this round —
      net +4 `sc-if`, +5 `sc-for` from the new markup, all balanced).
    - `node --check` on the extracted `<script type="text/x-dc">` JS body: **passed**, both on the
      edited template standalone and after re-extracting from the spliced WIP file.
    - Round-trip verify (re-extract + `json.loads` the written WIP file, compare to the in-memory
      edited template string): **True** (character-for-character match).
    - Byte-diff outside the template span (everything before/after the `__bundler/template` JSON
      string — manifest, fonts/asset resources, bootstrap unpacker): **before-span identical: True,
      after-span identical: True**.
    - `FE Report Card V9 - Standalone.html` (the untouched original): confirmed **unchanged** —
      same file size/mtime as before this session touched anything.

- (2026-09-08) Confirmed scope with user: duplicate-first, edit only the duplicate. Sequential execution
  requested — do NOT parallelize P1–P5 across subagents; each subagent call (if any) gets one narrow,
  bounded task and reports back, no open-ended "go build the tab" delegations.
- (2026-09-08) P1 done. Frame `275:10421` = the **Payments tab** (Past Payments list) — this is the
  "new tab" the user means, currently just an inert label in the prototype. Frame `275:9263` =
  **Payment Details** drill-down (opens when a payment row is tapped) — same screen as the KRD's
  "currently live Pilot Payment section" mock. Both are in scope. Spec written to
  `Design System/VISUAL_DESIGN_SPEC.md`.
- (2026-09-08) File-format finding, important for anyone resuming: the WIP `.html` is a Claude-Design
  "canvas" bundle export. The real editable markup + logic is NOT in the raw file text — it's inside
  a JS string in `<script type="__bundler/template">`, escaped (`\n`, `\"`). Editing raw bytes with
  naive find/replace will not work. Workflow used: (1) `python3` unescape → decode the template string
  to a real `.html` file in the scratchpad, (2) edit that decoded file with normal tools, (3) `python3`
  re-escape → splice the edited string back into the same `<script type="__bundler/template">` block
  in the WIP file, byte-for-byte everywhere else unchanged. Always verify the splice by re-decoding
  and diffing before calling it done.
- (2026-09-08) The template is driven by a proprietary reactive class `class Component extends DCLogic`
  with `this.state.screen` as a string enum (`"home" | "debited" | "wrong" | "detail" | "accept" |
  "dispute" | ... | "cdetail" | "pending" | "cooloff" | "lost" | "awareness" | "accepted"`) and a
  `SCREENS` array driving quick-nav pills at the top of the canvas. Top-level render regions are
  `inShell` (list screens), `inSheet` (accept/dispute bottom sheets), `inDetail` (everything else,
  loss-detail-style). This file is Losses-feature-only — "My Earnings" and "Payments" segments in the
  top tab bar were always static/inert placeholders; nothing about Payments existed before this task.
- (2026-09-08) Implementation plan for P3 (see code comments added alongside once done):
  add `"payments"` and `"pdetail"` as new `screen` values; `inShell` extended to include `"payments"`;
  new sibling region `inPaymentDetail` for `"pdetail"` (Payment Details is visually a completely
  different screen from the existing "loss detail" `inDetail` region — do not reuse it); existing
  Losses-only body content inside the shell gated behind a new `showLossesBody` flag so it hides when
  `isPayments`; the 3-way top segmented control (My Earnings/Payments/Losses) converted from static
  divs to a data-driven `earningsSegs` list restyled per the Figma spec (flush segments, 4px
  outer-corner-only radius, active bg `#DDE7FE`).
- (2026-09-08) Decided: since the Payment Details screen has only one real data source (the KRD/Figma
  mock), every Payments-tab row opens the same static Payment Details content — no per-row variation.
  This is a deliberate prototype simplification, not a bug.
- (2026-09-08) "Give me the new link" — this bundle is a fully self-contained portable export (that's
  what "Standalone" in the filename means); it does not need a server and is not meant to be re-wrapped
  by the generic Artifact tool (that tool injects its own `<head>/<body>` skeleton, which would nest
  inside this file's own `<html><head><body>` and risk breaking the bootstrap `<script>` that must run
  first). Plan: deliver the edited file's local path as the primary result. Flag the Artifact-publish
  tradeoff to the user rather than silently attempting it.

---

## Round 7 (2026-09-09) — React port, presenter template, loss-detail architecture audit

New working directory: `react-prototype/` (Vite + React, plain CSS + tokens). The `.html`
bundle in `Input Prototype/` is now the *legacy* artifact — it is no longer the edit target.
See `react-prototype/README.md` for the full structure and handover notes.

- [x] Converted the V9 bundle to a React codebase: all 14 screens, one controller hook
      (`src/state/useLossesApp.js`, a direct port of the bundle's `renderVals()`), design tokens
      lifted verbatim into `src/styles/tokens.css`, all mock data extracted to
      `src/data/mockData.json`. Verified rendering + interaction in headless Chrome.
- [x] Added the **My Earnings** tab from Figma `TxIUrBKg7mRQhksWl4IS9y` node `1939:25543`
      (current-cycle card + daily earnings history). Extracted `UtilityChipRow`,
      `SectionDivider`, `PaymentListItem` as shared components so the Payments tab and My
      Earnings tab share one row/divider/chip implementation instead of duplicating markup.
- [x] Built the **presenter sandbox** (`src/presenter/`, app-agnostic; `src/app/presenterSections.js`
      is the only app-specific seam). Replaced the old left rail + top pill row. Three control
      groups: Global variants / Sectional variants / Screens (dropdown). All controls render as
      input-field selects (the segmented-pill look was rejected as gaudy and doesn't scale to
      many versions). `components/dev/` deleted.
- [x] Added global variant **`two-tab-l1`**: only My Earnings + Payments as tabs; Losses promoted
      to its own L1 page (`components/losses/LossesL1Screen.jsx`, reuses `LossesBody` unchanged),
      entered via a `LossesEntryPoint` widget under the Current Cycle card. That widget is itself
      a sectional variant (`card` | `banner`).
- [x] **Loss detail (L1) + sub-flow (L2) audit — analysis complete, written to
      `Design System/LOSS_DETAIL_ARCHITECTURE_AUDIT.md`.** Grounded in the KRD (text extracted
      to `KRD/KRD_extracted_text.txt` so the PDF never has to be re-parsed — needs `pdf-parse`,
      poppler is not installed on this machine). Contains: the canonical 5-reason taxonomy +
      status lifecycle from the KRD, a per-screen audit of all 9 current L1 variants and 7 L2
      sub-flows, a **14-item gap register** (5 × S1 — LiF money model is inverted, `lost` renders
      the wrong record, no payment pointer anywhere, missing silence consequence, voice-out is a
      no-op), and the proposed `f(reasonCode, caseState)` template architecture (reason registry,
      state table, 8-slot L1 template, L2 intent template, reason × state coverage matrix,
      tone-by-money-position visual rules).

- [x] **Architecture approved and implemented** (same day). The 9 hand-written detail screens
      and the ~100-line `if/else` chain are gone, replaced by:
      `src/config/lossReasons.js` (reason registry, axis 1) ·
      `src/config/caseStates.js` (case-state table, axis 2) ·
      `src/state/resolveCaseView.js` (the template: record + state → 8 fixed slots) ·
      `src/components/detail/CaseDetailScreen.jsx` (the single L1 page) ·
      `src/config/screenPresets.js` (review presets: every lifecycle state without its own
      screen id). Closed 12 of the 14 audited gaps — see the audit doc §7 for the per-gap
      record. Verified all 14 presets in headless Chrome, no console errors.

- [x] **(10 Sep) Slot order changed on design feedback: Money & Remedy promoted from slot 6 to
      slot 3**, directly under the status banner — after the Pilot reads what happened to their
      money, where that money now sits is the second-most-critical thing on the page, ahead of
      the proof and the explanation. Applied in three places, all now consistent:
      `react-prototype/src/components/detail/CaseDetailScreen.jsx` (render order),
      `src/state/resolveCaseView.js` (the spec docblock + inline slot numbering),
      `Design System/LOSS_DETAIL_ARCHITECTURE_AUDIT.md` §4d (the slot table), and the IA
      walkthrough page `Prototype/L1 Flows IA/gemini-code-1788946846026.html`. Slots 3-5 shifted
      down by one; every "slot N" reference in code comments was renumbered with it.

**Status: round 7 complete.** Still open by decision, not by omission: voice-out has no TTS
engine (G5), no evidence viewer (G14), and payment pointers are stated but not linked (G3b —
F27's deep-link needs a payments-surface change; user's call was "they won't point anywhere
for now, which is ok").

### Decisions log (round 7)

- (2026-09-09) User confirmed the L-numbering for this work: **L1 = the loss detail page**,
  **L2 = the sub-flows off it** (accept/dispute sheets, add-your-side, evidence viewer, tracker).
  The Losses list is L0/entry. Note this is a *different* usage from "Losses becomes an L1 page"
  in the two-tab variant discussion — there, L1 meant "a top-level page rather than a tab".
- (2026-09-09) Taxonomy authority is the **KRD, not the prototype**. The prototype's reason
  strings are FE-facing display names; the KRD's final-page table (reason → source → image set)
  is the real registry. NFR-5 ("reasons controlled by a whitelisted config array; may grow to
  ~10 without redesign") is the explicit mandate for the template architecture.
- (2026-09-09) Deliverable format for the audit: markdown in `Design System/` only — the
  artifact version was considered and dropped as unnecessary.
- (2026-09-09) Design calls taken on the loss-detail template (full table in the audit doc
  §0b): Lost-in-Field is amber while recoverable and green once returned, with its money story
  corrected to "already cut → return to get it back"; the silence consequence lives inside the
  What-to-do card; wrong-RVP keeps its greyed ₹ + "Not deducted" chip; DEBITED /
  NOT_DEDUCTED / RETURNED_CREDITED all get built now; `Under review` and `Decision pending`
  collapse into one `IN_DISPUTE` state.
- (2026-09-09) The two axes are deliberately independent: a reason says what happened
  (evidence, copy, money behaviour, which actions exist), a state says where the case is
  (tone, statement, tracker, footer). Tone is chosen by MONEY POSITION, never by severity or
  by loss type — that rule is what stops each new loss type from inventing a new palette.
- (2026-09-09) Headless-browser verification recipe for this machine: no `chromium-cli`, no
  system chromium, poppler absent — but `/Applications/Google Chrome.app` + `puppeteer-core`
  (installed into the scratchpad, no browser download) drives and screenshots the Vite dev
  server fine. Chrome's `--headless --screenshot` also works for a single static shot.

---

## Round 8 — spacing system (15 Sep 2026)

- [x] **Spacing standardised across `react-prototype/src/components` (46 CSS files).** The scale is
      now named by its own value (`--space-12` is 12px) instead of by position, and components ask
      for a **role** rather than a number — the same move `tokens.css` already made for colour,
      where a screen asks `Chip` for a `kind` and never for a hex.

      The diagnosis was not "raw px vs token". It was that the positional scale hid its own values
      (`--space-4` was 10px, `--space-5` was 12px), so 10 and 12 were used interchangeably for the
      same jobs — both as a tinted-panel inset, both as a gap between related items, and together
      as `10px 12px`. 82 of 154 token uses were those two. 10px is now gone; the roles took its work.
      The scale also had holes at 6 and 14, which is why those were the two most common raw values.

      Roles: `--gap-tight` / `--gap-inline` / `--gap-lead` / `--gap-stack` / `--gap-group`,
      `--pad-badge` / `--pad-panel` / `--pad-row` / `--pad-tile` / `--pad-screen` / `--pad-sheet`,
      `--pad-head-top` / `--pad-head-bottom`, `--tap-bleed`. Two roles may share a value on purpose
      (as `--chip-info-bg` and `--chip-neutral-bg` do): separate jobs that agree today.

      Result: 190 spacing declarations — 115 on a role, 54 on a value token, **2 raw px left**
      (a 1px optical icon nudge in `AlertPill`, a -1px border overlap in `SegmentedTabs`; both
      commented as intentional). Distinct spacing values fell from 17 to 10.

- [x] **Figma fidelity restored, not overridden.** `VISUAL_DESIGN_SPEC.md` §3 pins 14px (past-payment
      tile vertical; Payment Details 14/16 shell) and 6/8px (utility chip) from the SOT, so `--space-14`
      is in the scale as a documented exception rather than being tidied away. `PaymentListItem` had
      drifted to 12px vertical and is now back on the spec's 14px via `--pad-tile`. A 4dp Material
      grid was considered and rejected for exactly this reason — it would have overwritten the SOT.
      `MyEarningsTabContent`'s symmetric 16px heading step is likewise Figma-pinned and was
      deliberately left off the `--pad-head-*` rhythm.

- [x] Two spacing defects found while verifying and fixed: a **collapsed `pd-card` reserved a dashed
      rule plus 28px of inset** for items it wasn't rendering (69px tall → 44px, and Deductions now
      clears the fold on Payment Details); and `StatusTracker`'s step gap was an **inline `paddingBottom: 14`
      in JSX**, now `--gap-group` in CSS behind a `data-last` attribute.

- Scope: `components/` only. `presenter/` was deliberately left alone (stakeholder sandbox chrome,
  not product) — it holds the worst offender, `controls.css` at 9 raw values / 0 tokens, and never
  referenced `--space-*` so the rename did not touch it.
- Verified: `vite build` clean; 14 presets screenshotted before/after at 360x780 via the
  Chrome + puppeteer-core recipe. Note the before/after rig needs a **verified-free port** — the
  first attempt silently reused an occupied 5199 and compared the new build against itself.

- [x] **(15 Sep, same round) Loss list rows put on the payment rows' rhythm**, on design feedback
      that the Losses list read cramped next to Past Payments. Measured rather than eyeballed: both
      rows were already 69px tall, so height was never the difference. The tell was the gap between
      the two stacked lines — **2px in `ListRow` vs 6px in `PaymentListItem`** — plus 12px vs 14px
      of vertical padding. That 6px had been sitting in `PaymentListItem` as an unnamed raw value,
      which is why nothing propagated it.
      Now named `--gap-subline` ("metadata under a title in a list row") and distinguished from
      `--gap-tight` ("a qualifier belonging to the value above it" — ₹356 over its incentive line).
      `ListRow` takes `--pad-tile` + `--gap-subline`; `.chip--status` moves 4px → `--gap-subline`
      so both columns of the row share one rhythm. Loss row 69px → 73px (the extra 4px is the
      status chip, which payment rows do not carry). `PaymentListItem` renders identically —
      that edit was a rename onto the role.

---

## Round 9 — the debit-reason master sheet, and a Live dataset (18 Sep 2026)

Source: `External Memory/Debit reason master table.xlsx`. Sheet 1 is the debit-reason master
(12 rows × Debit reason / Debitable entity / Short Description / Tip / image sets / total image
count); sheet "Sample data" is **six real audited losses belonging to one real Pilot** — real
AWBs, hubs, amounts, audit date (Excel serial 46281 = 16 Sep 2026) and, in `image_1`–`image_4`,
real photograph URLs.

- [x] **Mock / Live data-source dropdown**, in the panel's Session section directly above the
      reset CTA, which is now **Reset Data** rather than "Reset to mock data" (it resets whichever
      dataset is selected). `src/data/activeDataset.js` is the switch and the only thing the three
      modules that used to import `mockData.json` now import — `helpers.js`, `caseStore.js`,
      `productImages.js`. Switching persists to `localStorage` and **reloads**: all three read the
      dataset at import time by design, and this is a control flipped once a demo. `?data=mock` /
      `?data=live` on the URL overrides the stored choice, so a link can open on either.

- [x] **Reason copy replaced from sheet 1** (`config/lossReasons.js`): `explain` ← Short
      Description, `tip` ← Tip, each evidence group's `count` / `source` ← the image columns. Also
      added `masterReason` + `debitableEntity` — they render nowhere, they exist so the next person
      holding that spreadsheet can line it up against the registry row by row.

      **Five of twelve rows, not twelve.** The five are every row whose debitable entity is the
      last-mile FE — and they turned out to be exactly the five the registry already had. The other
      seven are debited to LM hub QC, FM or FM QC; putting them in a Pilot's app would show them
      money that never leaves their hands.

      Two sheet facts changed the design rather than just the strings: "Total images count" is
      TOTAL PHOTOGRAPHS at two to an image set, so `WRONG_RVP` went from 1 + 1 tiles to the
      sheet's 2 + 2; and "Pickup images junk" has an empty Short Description, so that one `explain`
      is still the prototype's own (the stated rule for a silent cell).

- [x] **`prevention.steps` is now the Tip, a sentence to a step.** Not a cosmetic call. The steps
      and the tip render under the *same heading* — "Next time", on the loss page and in the accept
      sheet — which was a deliberate "the app names this one thing one way". Replacing the tip and
      keeping the prototype's own three-step decks put two different sets of words under one
      heading, visible in one screenshot. Steps are therefore shorter than they were and are what
      the business signed off. `prevention.habits` (the banner's "light the parcel · hold phone
      still") stay prototype data — no column is in that register. `remedyGroups.js`'s
      `photo-not-clear` merge has no sheet row, so its advice is still written here, but rewritten
      from the *intersection* of its two members' Tips.

- [x] **Live dataset** (`src/data/liveData.json`): the six sample rows and nothing else — all
      `ATTRIBUTED`, dated 16 Sep against a `today` of 18 Sep, ₹2,368 at stake, a clean dispute
      record so every one of them can really be disputed in front of him. `today` moved out of
      `helpers.js` and onto the dataset: a "today" of 15 Aug would have filed all six outside the
      current cycle and read every countdown backwards. Everything outside the loss rows (earnings,
      payments, base pay, PD cards) has no column in the sheet and carries the prototype's own
      numbers, rebased onto September; the cycle gross was raised so the card does not floor at ₹0
      against ₹2,368 of losses.

- [x] **Images are local** (`react-prototype/public/`, provenance in `src/data/evidence-sources.md`).
      16 evidence photographs under `evidence/<awb>/{own,qc}-N.jpg`, plus the three stock catalogue
      shots that were remote `images.meesho.com` URLs in `mockData.json`, now `catalog/*.avif`. So
      the prototype renders identically on Vercel, on a laptop and with no network. `buildEvidence`
      already preferred a record's own `photos` block over the stock catalogue, so the Live rows
      needed no code change; the L0 row thumb now prefers `photos.own[0]` too, so the list and the
      page it opens show the same real photo. The four secondary-QC files were 3072x4096 and
      3468x4624 (848 KB + 632 KB on one page); downscaled to 1200px long edge — 2.1 MB → 1.0 MB,
      pixel-identical on screen at a ~150px tile.

- Three latent defects surfaced by having a *second* dataset, all fixed:
  - `showWrongSection` / `showClosedSection` had **no row-count guard** — every dataset had had
    some of each, so "Wrong Pickups · No deductions" over empty space had never been reachable.
  - `HistoricLossesBody` reused the working list's empty state, so on Live, tapping Losses said
    **"No losses marked. Good work!"** over ₹2,368 still at stake. `EmptyState` now takes its copy
    as props; the ledger says "No decided losses yet".
  - Screen presets address cases by fixture position, so on Live half of them pointed at nothing or
    at a case never in the state their label claimed. A preset now declares the `{ reasonCode,
    caseState }` it `expect`s and `presetResolves` (in `caseStore.js`) filters the dropdown —
    18 entries on Mock, 9 on Live. The panel's "₹624 at stake from 6 Losses" hint was likewise
    hardcoded and now reads the widget's own figures.

- Verified: `vite build` clean; all 19 `public/` files land in `dist/`; every preset in both
  datasets driven in headless Chrome over CDP (Node's built-in `WebSocket`, no puppeteer) — 27
  screens, **zero console errors, zero broken images**, and the dataset dropdown confirmed to
  reload, drop `?data=`, and land on the other fixture.

- [x] **(18 Sep, same round) Three follow-ups from review.**

  **Catalog images off by default on Live.** Its default is now a fact about the *dataset*
  (`layerDefaults.catalogImages` in each JSON, surfaced as `CATALOG_IMAGES_DEFAULT` in
  `config/layerIds.js`) rather than a constant: on for Mock, off for Live. Live rows carry the
  Pilot's real photographs, and the catalogue is three dummy product shots of things he never
  handled — six tiles of somebody else's products under his own pickup photos would be the one
  invented thing on a screen whose whole claim is that nothing on it is invented.

  The default moved next to the **id**, not to the `<Layer>` call site, because three files need
  the same answer: `CatalogImagesLayer`'s registration, the case page's `<Layer>`, and
  `useLossesApp`, which applies the effect. `CatalogImagesLayer`'s own comment claimed "the
  default lives here and nowhere else" while `useLossesApp` spelled `true` twice — the shape that
  was meant to rule out a disagreeing default was agreeing by coincidence, and the first
  per-dataset default would have surfaced as a toggle whose position contradicted the page.
  Verified both ways: Live opens off / 0 tiles, one click → on / 6 tiles, click back; Mock the
  reverse; toggle position matches the page in every state.

  **Historic losses defaults to `hidden`.** `DEFAULT_LOSSES_STRUCTURE.historicPlacement`
  `'own-tab'` → `'hidden'`. It is the one placement valid at every point of the other two axes, so
  the default arrangement is never rewritten underneath you the way `own-tab` silently falls back
  to `subtab` when a door is shut. Verified across the full matrix — 3 placements × both doors ×
  both datasets, 24 combinations: `hidden` gives no sub-tab row and the working list as the whole
  losses area in all four door states, `own-tab` still disables itself without both doors, zero
  console errors.

  **Every byline removed from the prototype controls.** The `hint` prop is gone from `Toggle`,
  `Select` and `ActionButtons`, and all five `hint:` strings are gone from `presenterSections.js` —
  each preserved as a comment beside its control, since two of them carried the only written
  explanation of what the control did. A control in the panel now carries its name and nothing
  else. `.control-field__hint` was renamed `.control-note`: its last remaining user is the Layers
  section's "No togglable layers on this screen", which is that section's content rather than an
  annotation on a control, and a class named after a feature that no longer exists is a trap for
  the next reader. Verified: 0 bylines in the panel, 1 `.control-note`, in both datasets.

- [x] **(18 Sep, same round) Evidence photos open full-screen.**
      `components/common/ImageViewer.jsx` — a near-black overlay inside the phone frame, the photo
      contained (never cropped), a cross top right, and the group + label under it. Three ways out:
      the cross, the ground around the photo, Escape. State is `photoViewer` in `initialState` with
      `vm.openPhoto` / `vm.photoViewer.close`, mounted in `App.jsx` beside the other overlays at
      `z-index: 50` — above the sheets, below the confirmation popup, which must never be covered.

      This was a promise the prototype had already made and not kept: `PhotoEvidenceGroup`'s tiles
      carried `cursor: pointer` and a comment reading "tapping enlarges", and tapping did nothing.
      The thumbnails-always decision is only honest if there is somewhere to reach — the claim on a
      junk-photo case is that the Pilot's own photograph was not clear enough, and a 100px square is
      not enough to agree or disagree with that. On the Live dataset the first photo you open is a
      near-black pickup shot, which is the argument made in one tap.

      Details worth keeping: a tile with a photo is now a `<button>` and a tile standing in for a
      missing image (KRD F8) stays a `div`, because nothing-to-enlarge is not the same as
      tap-and-get-nothing. The group title travels with the photo — full screen, "my photo" vs "the
      QC photo" is the whole argument on a mismatch and the grid was the only thing saying which is
      which. `object-fit: contain`, not the grid's `cover`: a crop could hide the very blur or dark
      corner the case turns on. The ground is `--viewer-ground`, not `--scrim` — a navy wash at 55%
      sits over the image's own tones and puts a thumb on the scale when the thing being judged is
      whether the photo is too dark.

      One defect found in review and fixed: focusing the close button on open made Chrome paint its
      `:focus-visible` ring every time, including on touch. Focus goes to the dialog
      (`tabIndex={-1}`) instead — inside the overlay for a11y, no keyboard ring for a thumb.

      Verified: 36 tiles across 5 cases in both datasets — every one opens, fits inside the frame
      with a non-zero natural size, names its own group, and closes on Escape; clicking the photo
      itself does NOT close; zero console errors. **No carousel** — the viewer shows the photo you
      tapped, and next/prev across a group is the obvious next move if comparing four photos proves
      fiddly in front of a Pilot.

---

## Round 10 — the loss entry banner, three states (18 Sep 2026)

- [x] **Explicit `Review Losses` CTA**, and the banner is now two rows: mark + sentence, then the
      CTA right-aligned under it, left of the chevron. Beside the sentence was the first build and
      it was wrong — a fixed-width CTA left the sentence ~150px, so "₹624 at stake from 6 Losses"
      broke after the 6 and the countdown wrapped too: a four-line banner whose most important line
      was the one that got mangled. Its own row costs ~18px. The card stays one `<button>`; the CTA
      is a styled `<span>`, because a button inside a button is a coin toss about which one fires.

- [x] **Three states in `config/lossesEntryStates.js`** — Actionable / Review / Resolved, derived
      from the case pool so the banner cannot promise a state the list it opens does not have.
      Resolved hides the widget rather than showing "₹0 at stake from 0 Losses" on the screen a
      Pilot opens to see what they earned. Review is the banner as it was, plus the CTA. Actionable
      gets the amber countdown ground, a shaking alarm clock, and the time left.

      `MyEarningsTabContent` now has two gates that answer different questions:
      `lossesStructure.earningsEntry` (does this surface have an entry widget?) and
      `lossesEntryPoint.visible` (is there anything for it to say?).

- [x] **`AlarmClockIcon`**, new. The first build reused `ClockIcon` — a circle with two short
      vertical strokes — which at 14px beside a date reads as a clock but at 20px alone in a tinted
      banner reads as an **info circle**, and that is exactly what shipped in the first screenshot.
      The new mark has hands at genuinely different lengths and angles plus two bells, which is what
      lets the eye tell a clock face from a bulleted circle — and what makes the shake read as a
      shake. `ClockIcon` is untouched; three other callers still use it at 14px.

- [x] **The shake**: ±9° over a 2.4s cycle with only ~0.5s of movement, `transform-origin` on the
      clock's own face. A continuous pulse on a screen opened several times a day stops being a
      signal and becomes a tic. Off under `prefers-reduced-motion` — the amber, the clock and the
      countdown still carry the state without it.

- [x] **Countdown copy** — all of it in `entryUrgencyLine()`. `days` is the SOONEST deadline among
      the waiting losses, and the "n of m" clause appears only when that deadline covers some of
      them rather than all: `5 days to review` (one waiting, or all sharing the date),
      `3 days to review 1 of 4 losses` (mixed), `1 day to review`, `Closes today`.
      Written "1 of 4", not "1/4" — at 12px a slashed pair reads as a fraction, which is a
      different and wrong sentence.

      **Residual flagged to the user:** the mixed case puts three numbers on screen (6 in the
      sentence, 1 and 4 in the countdown) with nothing explaining why 4 ≠ 6. The sentence counts
      everything in play because that is what the Current Cycle card cross-references; the countdown
      counts only what is waiting. One line in `useLossesApp` scopes the sentence to the actionable
      subset if testing shows it trips people, at the cost of that cross-reference.

- [x] **Panel: `Loss banner state`** (Global variants) forces a treatment, because the data cannot
      reach all three on demand — Live is six waiting losses, so it only ever produces Actionable,
      and Resolved needs every case decided. `Auto` is the real reading.

- Verified in headless Chrome, both datasets, all four dropdown values: Live Auto →
  `urgent · "5 days to review"` (all six share the date, so no "n of m"); Mock Auto →
  `urgent · "3 days to review 1 of 4 losses"`; Review → calm, no countdown, animation `none`;
  Resolved → widget absent. CTA measured to sit left of the chevron in every visible state, banner
  inside the frame at every height (92px actionable / 70px review), zero console errors.

- [x] **(18 Sep, same round) Banner recomposed — the amber panel was the defect.** Design feedback
      was "visually I don't like it, same information, better form". Diagnosis, from the rendered
      screenshot rather than the source: the widget was a solid amber panel with a clock sitting 8px
      above the Current Cycle card, which is a white card with an amber strip and a clock of its
      own. **Two warm blocks, two clocks, and the squint test could not tell the alarm from the
      payout.** Secondary: three text colours and three type sizes in a 92px box, and the countdown
      was prose where every loss row in the app states the same fact as a chip. The layout detector
      was clean both before and after — this was never a mechanical finding.

      Fixes, all information preserved:
      - **Ground stays calm in both visible states**; the countdown chip is now the only warm
        element in the widget. Louder for being the only warm thing on the surface, and truer — the
        panel is not the alarm, one of the losses is.
      - **The countdown becomes `Chip kind="countdown"`**, saying `5 days left` / `3 days left ·
        1 of 4` — word for word the badge the loss rows already carry (`listChip` in
        `caseStates.js`). Text colours in the widget: three → one, plus the chip.
      - **Actionable borrows the Current Cycle card's footer rhythm**: hairline, then the chip and
        the action facing each other across the row. The two blocks now read as one system instead
        of two bespoke panels. Review keeps one row, having one fewer thing to say.
      - **Chevron dropped.** The underlined CTA is the affordance and the card is the tap target —
        what "View Details" does on the cycle card. It also buys the ~26px that keeps the sentence
        on one line in Live, and `from N Losses` is `nowrap` so the Review row's two-line case
        breaks before "from" rather than orphaning the noun.
      - Height: actionable 92 → 89px, review 70 → 48px (one tap target exactly).

- Verified in one batched round, both datasets × {1500px, 420px} × all three states: sentence on one
  line everywhere including Live's longer amount, one text ink, chip carries the only warm fill, no
  horizontal overflow, Resolved absent. Then the full 27-preset regression across both datasets —
  zero broken images, zero console errors — and a clean `impeccable detect --scope layout`.

- [x] **(18 Sep, same round) Banner rebuilt as one row — third and final shape.** The chip-and-rule
      version was still too much furniture. Design direction: one headline with an icon and a right
      CTA, nothing else; the timer bold and red *inside* the headline; a warmer surface behind it;
      Review cooler and rewritten to reflect that the Pilot is waiting on **us**; and different CTAs
      per state if they earn it.

      | | Surface | Headline | CTA |
      |---|---|---|---|
      | Actionable | `--tone-risk-*` warm | `₹624 at stake, `**`3 days left`** (red) | `Review (4)` |
      | Review | `--tone-progress-*` cool | `We are checking `**`2 losses`** | `Track` |

      **Colour is settled by the product rule, not by taste.** PRODUCT.md already says tone is
      chosen by money position — at risk / held / already cut. So Actionable takes the design
      system's at-risk surface and Review takes the held one, one flat tone at a time. That is also
      the diagnosis of "jarring": the previous build carried a cool ground with a warm badge sitting
      on it, two money positions stated at once inside one box.

      **Different CTAs earn their keep.** A control names its own action, and "Review" when the case
      is sitting with us would be a small lie; "Track" says progress is happening and there is
      nothing to do. The count moved into Actionable's CTA (`Review (4)`) at the user's prompt after
      the headline gave it up — it is the app's own idiom, the Losses tab reads `Losses (4)`, and it
      is literally the same number (`needsActionAll.length`), so the two can never disagree. Review
      does not repeat a count its headline already states.

      **Dropped on purpose:** the "· 1 of 4" scope qualifier on the timer. Three numbers in one row
      asked a Pilot to hold a set relationship in their head to read a countdown; the per-loss
      clocks are one tap away. This also retires the three-numbers residual flagged twice above.

      **Contrast measured on the built result**, not asserted: headline 12.96:1, timer 5.73:1, CTA
      11.89:1. The timer is `--text-error-ink`, not `--text-error` — pure red on the warm surface
      lands at ~3:1, under the floor for 14px text, and a countdown a Pilot cannot read in daylight
      is not a countdown.

      Height 92 → 89 → **48px**, exactly one tap target, in both visible states.

- One defect found in the batched round and fixed: forcing the Review treatment over a dataset with
  nothing pending rendered "We are checking **0** losses". The data path cannot reach it (that is
  Resolved, and Resolved hides) but the panel can, so the count now goes quiet — "We are checking
  your losses".
- Verified: both datasets × {1500px, 420px} × all three states — one row, one red element, one bold
  element, no overflow, Resolved absent; then the full 27-preset regression across both datasets
  with zero console errors, and a clean `impeccable detect --scope layout`.

- [x] **(18 Sep, same round) Banner: one weight, emphasis by colour.** Design note was still "too
      many colours / weight variations". The row was emphasising with weight AND family AND colour
      at once — book-weight base, brand-face bold highlight, coloured highlight, plus an icon in a
      fourth ink. Now: the whole headline is `--fw-demi` in one family, and the important words are
      marked **only** by colour.

      Each tone declares one `--entry-accent`, and the mark wears it too — the icon strokes
      `currentColor`, so "the icon matches the highlight" is a single declaration rather than two
      values kept in sync by hand. Actionable's accent is `--text-error-ink` (5.73:1 on the warm
      surface); Review's is `--tone-progress-ink` navy (12.2:1), quiet on purpose because the state
      where nothing is running out should not shout. `--valmo-action-blue` was the louder candidate
      for Review and was rejected on measurement: 4.22:1 on #EEF3FF, under the 4.5 floor.

      Verified on the built result: one font-weight (600) and one family across the headline in both
      states, icon colour identical to highlight colour in both, one row at 48px, no overflow. Then
      the 27-preset regression across both datasets with zero console errors and a clean
      `impeccable detect --scope layout`.

- [x] **(18 Sep, same round) Banner: stacked headline, bigger mark, chevron back, orange not red.**
      To a supplied mock. The headline became a two-line block — money and count on the first line,
      the clock on its own beneath it — which brings the count back off the CTA (it had ridden there
      one build, while the headline was a single line with no room for it). Mark 20 → 26px in both
      states. Chevron restored, paired with the CTA as one object that never wraps. Review copy is
      now "**2 losses** are under review", leading with the count so the accented words sit where
      the money sits on the other state.

      **Red → orange, and the shade was decided by measurement.** On the peach at-risk surface,
      Orange Main (#EC7600) measures 2.57:1 and Orange Deep (#B85A00) 4.09:1 — both under the 4.5
      floor for 14px text, and the same floor governs the mark since it carries the same meaning.
      Only `--text-warning-ink` (#8A5003) clears it, at 5.70:1, so that is the accent. A brighter
      orange would need a lighter ground; the peach surface is what rules it out. Flagged to the
      user rather than shipped silently.

      Heights: actionable 48 → 62px (the second line), review 48 → 52px (the larger mark).

- Verified: one font-weight (600) and one family across the headline in both states, mark colour
  identical to the accent in both, no overflow at 1500px or 420px, Resolved absent; 27-preset
  regression across both datasets with zero console errors; clean `impeccable detect --scope layout`.

- [x] **(18 Sep, same round) Yellow moved from the payment card to the loss banner.**
      The Current Cycle card is now neutral — `--border-default`, strip on `--surface-sunken` —
      which is exactly `HistoricSummaryCard`'s treatment on the Losses tab. That card had already
      reasoned this out and said so in its own header ("the strip is neutral rather than amber…
      nothing here is still coming"); the cycle card was the outlier. The two money cards are now
      true siblings, so a Pilot learns one card, not two.

      The point is hierarchy, not decoration: yellow was putting the loudest surface on My Earnings
      around the one block that needs no decision. A payment arriving on schedule is the good news.

      That freed the hue to become the app's **fourth semantic tone, `--tone-warn-*`**, which the
      Actionable banner now takes — so the loudest thing on the screen is the one thing that wants
      acting on. `--surface-cycle` / `--border-cycle` are retired; nothing references them. Contrast
      improved with the move: headline 12.96 → 13.73:1, timer 5.70 → 6.05:1, CTA 11.89 → 12.61:1.
      The accent is still the ramp's deepest orange — on yellow, Orange Main measures 2.73:1 and
      Orange Deep 4.34:1, both under the floor.

      Noted divergence: the banner's at-risk tone is now yellow while `StatusHero` keeps
      `--tone-risk-*` orange for the same money position. Adjacent warm hues doing different jobs —
      an entry point competing for attention on a crowded screen vs. a status statement on a page
      about one case.

- Verified: 27-preset regression across both datasets with zero console errors and zero broken
  images; clean `impeccable detect --scope layout` over `components/earnings` and `components/losses`;
  no remaining references to the retired tokens.

- [x] **(18 Sep, same round) One banner pattern, extracted.** The loss entry point and the
      contextual insight banner had drifted into two dialects of one idea — 8px vs 12px padding,
      13px vs 12px headline, navy vs near-black base ink, brand-face-bold vs colour emphasis, one
      with a chevron and one without — and nothing in either file could have revealed that, since
      neither could see the other. `components/common/Banner.css` now holds the shape and the rules;
      each component keeps only what is its own (the entry point's shake, the insight's
      self-measuring habit line and dot row).

      Measured on the built result, both banners: padding 12px, radius 8px, 1px border, min-height
      48px, `align-items: center`, gap 8px, mark 26px on `currentColor`, headline 12px/600 on
      `--text-primary`, accent 700 on the tone's accent, CTA 12px/600 navy underlined, chevron
      present, action gap 2px. The only differences are the tone and what each one says.

- [x] **(18 Sep, same round) Emphasis is colour PLUS one weight step.** Design note: the headline
      differentiation was not clear enough, with the call left to me — raise the highlight or lighten
      the neutral text. **Raised the highlight** (600 → 700), and the use scene decided it: most of
      the sentence is the neutral text, read at arm's length on a low-end screen in outdoor daylight
      (PRODUCT.md § Accessibility, where low literacy is the design centre). Lightening the many to
      separate the few would have bought contrast with legibility. The ladder is now 400 sub-line /
      600 headline / 700 accent, and the insight banner's habits take the same rule one rung lower
      (500 against the sub-line's 400).

- **Known cost, flagged not hidden:** the insight banner's habit line lost ~28px to the chevron the
  pattern requires, so on the widest insight it shows one habit where it showed two. It measures and
  degrades by design, and the sheet behind "More" carries the full deck.
- Verified: shared properties byte-identical across both banners; 27-preset regression across both
  datasets with zero console errors and zero broken images; clean `impeccable detect --scope layout`
  over `common/Banner.css`, `components/earnings` and `components/losses`.

- [x] **(18 Sep, same round) Banner: to the Figma spec — type, tone and emphasis.**
      Against the supplied mock (Figma `WCghUzecsonToq8dCxpm3W` · `7197:46123`, three frames:
      Actionable, Review, and the contextual insight). Everything below is the shared pattern in
      `components/common/Banner.css`, so both banners took it at once.

      **Type: one family, two weights, and the size paid for it.** The headline is now Body 02 —
      13/20 **Book (400)** — with emphasis at Demi (600). It was 12/18 at 600 with emphasis at 700,
      which is the ladder the previous round arrived at *because* a Book base at 12px gave up too
      much legibility for the use scene. One step up in size settles that objection and buys a real
      difference between the many and the few, at two weights instead of three. The sub-line is
      Body 03, 12/16 Book on the secondary ink; the CTA is unchanged at 12/16 Demi navy underlined.

      This makes the banner **the one place in the app running the DS scale un-shifted** —
      `styles/tokens.css` moves every other role one step down ("the prototype read bulky at the
      original sizes"). Flagged rather than hidden: a banner is one short sentence read at a glance,
      not a page of body text, and the mock is explicit about the step.

      **Colour lives on one line, and it is the line that carries the state.** Where there is a
      countdown, the countdown is that line (`.banner__sub` in the accent) and the headline marks
      its money and count with `.banner__strong` — Demi in the primary ink, no colour. Where nothing
      is running out there is no countdown to colour, so the headline takes the accent and the
      advice beneath it stays neutral. Within the coloured line, colour marks the CLAIM rather than
      one word of it: the insight accents both "QC mismatches" and "₹715" and leaves only the verb
      joining them in the base ink.

      `.banner__strong` replaced `.insight__habit`'s private 500 — a weight the pattern no longer
      uses — so that ladder is now stated in exactly one place.

      **Yellow → orange, and `--tone-warn-*` is left with no consumer.** The actionable banner is
      `data-tone="risk"` (Orange Tint 1 on a Tint 2 edge), which is what `StatusHero` already uses
      for the same money position — so the divergence the yellow move opened one build ago is
      closed. The yellow ramp stays defined and unused rather than deleted; the reasoning behind it
      is not re-derivable from a deletion. `CurrentCycleCard.css` and `HistoricSummaryCard.css`
      comments that claimed the hue "went to the banner" were corrected.

      **Progress fill moved to the ramp's T2 rung (#E3EDFF)** per the mock, declared on the banner
      rather than on `--tone-progress-surface`: that shared token cannot move there, because
      `StatusHero` stands a T2 *chip* on it and same-hue fills at the pale end of a ramp separate by
      ~1.04:1. A banner carries no chip, so it can stand on the rung the card has to leave free.

      **ACCENT DIVERGES FROM THE MOCK, ON MEASUREMENT.** The mock's at-risk accent is Orange Main
      `#EC7600`, which on the Tint 1 surface measures **2.57:1** — under 4.5 for the 12px countdown
      and under 3.0 for the 24px mark. Orange Deep `#B85A00` reaches 4.09:1 and still misses.
      `--tone-risk-ink` `#8A5003` is the only rung on the ramp that clears both, at **5.70:1**, so it
      is what shipped. A brighter orange would need a lighter ground; this surface is what rules it
      out. Everything else in all three frames is matched exactly.

- Verified on the built result, measured rather than asserted — Actionable 62px / Review 50px /
  Insight 62px at 328px wide, matching the mock's own frames; padding 12, radius 8, gap 8, mark 24,
  action gap 2, chevron 18; headline 13/20/400 `#272829` with emphasis at 600; timer 12/16/600 in
  the accent; insight sub 12/16/400 `#5A5E66` with the habit at 600 `#272829`; CTA 12/16/600
  `#092D5E`. Then the full preset sweep across both datasets × {1500px, 420px} — zero banner
  overflow, zero horizontal page scroll, zero console errors.

---

## Round 11 — the loss row (18 Sep 2026)

- [x] **`no-image` is the default line-item design** (was `three-row`). No photograph, AWB naming the
      parcel, clock in the rail — roughly half again as many losses per screenful, which is what the
      list is for: a Pilot opens it to see how many and how much, and reads one row properly only
      once they have chosen it.

- [x] **One gap for both columns of the row.** The body stack had none — the line boxes did the
      spacing — while the rail put `--gap-subline` between the amount and the clock. Two stacks of
      two lines side by side in one row, set to different rhythms: the AWB read as tucked under the
      reason while the clock sat loose under the amount. Both columns now declare
      `gap: var(--gap-subline)` the same way, so they cannot drift apart again, and it costs no
      height — the rail is the taller column and still sets the row. Measured: body gap 6px, rail
      gap 6px, equal in every design and both datasets. `PaymentListItem` already used the same
      token, so the whole list family is now on one value.

- [x] **New axis: `Row heading`** (`LINE_ITEM_HEADINGS`) — `reason` (default) or `awb`. Only the two
      body lines swap; weight, ink and the order of the ranks do not, so whichever fact leads is
      read the same way. A design that states no AWB has nothing to swap and falls back. Reason stays
      the default because a Pilot scanning this list is choosing which row to open, and they choose
      on what went wrong and what it costs — the AWB is what they check after choosing. The swap is
      there because the other errand (arriving holding a parcel, hunting its row) is worth being able
      to look at rather than argue about.

- [x] **The clock no longer wraps.** The rail was fixed at 72px — the width of "6 days left" — so
      every pending row broke "Decision in 3 days" across two lines. A countdown split in two stops
      reading as one fact, and it is the widest string in the rail that has to set the rail's width,
      not the narrowest. Measured the longest at 107px; the rail is now 108px with `white-space:
      nowrap` on the chip, so it is a rule rather than a measurement that happens to hold.

- **Cost, flagged not hidden:** the extra 36px comes out of the title column, and in the one design
  that carries a thumbnail AND the clock in the rail (`All details — 2 rows`) that leaves 124px for
  a title that wants 156 — so its reasons now wrap to two lines and its rows grow 73 → 87px. The
  default and the other two designs are unaffected. That design is the densest "everything at once"
  reading and is not the default; if the wrap is worse than the split clock there, the fix is to keep
  72px for thumb-carrying rows only.

- **Unrelated breakage found and fixed:** `useLossesApp.js` was calling `BUCKET_NAME` and
  `bucketName` from the new `config/lossBuckets.js` without importing either, so the app threw
  `ReferenceError` on first render in both datasets. Added the one missing import line. That file was
  being edited concurrently from another session while this work was in flight.

- Verified: gaps equal in all four designs × both datasets; clocks on one line in all four designs ×
  both datasets; both heading orders render; full preset regression (18 mock + 10 live) with zero
  console errors and zero broken images; clean `impeccable detect --scope layout` on `ListRow`.

- [x] **(18 Sep, same round) Live data re-sourced from Sheet4, and wrong pickups arrive with the
      Pilot's own answers.** The fixture had been transcribed from the sheet's `Sample data` tab;
      `Sheet4` is a newer pull and a different shape — a 17-row debit block, and a WRONG RVP block
      with its own columns, including the five `*_question` / `*_answer` pairs a Pilot fills in at
      pickup. Live now reads that sheet: six debitable rows and three wrong pickups, all real.

      **Six of seventeen, and the reason is in the file.** The sheet's 17 debit rows total ₹7,745,
      more than this Pilot's whole cycle earns — a list no payout on screen could absorb, and a
      scroll nobody walks a Pilot through. The six are spread across all three debitable reasons in
      the sheet's own proportions (1 ICUD junk · 3 pickup junk · 2 pickup-vs-QC) and across its
      amount range (₹95 to ₹1,079), so every money treatment the page has is exercised on real
      numbers. `_debitRowsNote` in `liveData.json` names all eleven rows left out and what it takes
      to put any of them back. Total at stake: ₹2,859 against a ₹3,480 cycle.

      **The Q&A: five label → answer rows, and nothing marked right or wrong.** The four options
      considered were a summary sentence plus marked rows, plain label/value rows, a chip row, and
      a collapsed "see your answers". Chose the plain rows — the same `SectionRow` the Payment
      Details screen uses, grey question left, his exact answer right ("Category → Same Category").
      A paragraph running five answers together is the one form in which a Pilot cannot find his own
      answer to the check he is arguing about; chips read as controls in this app; collapsing hides
      the thing the screen exists to show.

      **No tick, no cross, and that is the load-bearing call.** The feed attributes the wrong pickup
      to the shipment as a whole and says nothing about WHICH of the five checks was misanswered, so
      a mark beside any one line would be the app inventing a finding — and on `VLR082411058372`,
      where he answered "Different Colour", it would be inventing the opposite of one. The answers
      are reported; the photographs make the case. The three rows were picked to hold the design to
      that: one answered every check "same", one flagged a difference, and one was never asked the
      damage question at all (four answers, not five — the set is variable-length in the real data,
      so the block renders what the record carries and never a fixed five).

      `WRONG_RVP`'s evidence set moved from 2 + 2 to **3 + 1**, which is the extract's own split:
      sheet 1 only gave the total (4 photographs), Sheet4 gives the columns — `pickup_image_1..3`
      and one `catalog_image_link`. It is also the right asymmetry to draw: three photographs of
      what he did, one of what the parcel should have been.

- **Two defects found on the way, both fixed.** `parseShortDate` called `.split` on whatever it was
  handed, so one record missing one optional field took the whole app down with a TypeError — the
  first dateless wrong-RVP row rendered a white screen. It now floors to 0, which is the same
  "never a blocked row" rule the reason registry and the evidence builder already keep, and the two
  callers are both sorts so an unreadable date simply falls to the end. Separately, the first
  single-photo evidence group in the app's life put a caption reading "Photo" under a heading
  reading "Catalog photo" — the same word twice, once in grey. A caption tells tiles apart; one
  tile has nothing to tell apart, so it drops (a one-tile group naming what its photo IS keeps it).
- **Flagged, not fixed:** the sheet's `catalog_image_link` is a 1024×576 listing cover — for these
  three rows a four-up contact sheet, not a single product shot — so the square evidence tile shows
  a crop of it. The viewer behind the tile is `object-fit: contain`, so tapping shows the whole
  cover. Real data, not a transcription slip; worth knowing before the walkthrough.
- **Not transcribed:** the wrong-RVP block's `entinty` column (the customer's name and phone). It is
  the other party's personal data and nothing on this screen has a use for it.
- Verified: full preset regression across both datasets (18 mock + 10 live) with zero console
  errors, zero page errors, zero failed requests and zero broken images; all three wrong pickups
  walked (5 answers / "Different Colour" / 4 answers); the sectioned, unified and own-tab-historic
  arrangements all render the new rows, the ledger filing the three wrong pickups under September
  rather than under a blank month. Five retired `Sample data` evidence folders (~1.5 MB) deleted,
  the four new secondary-QC photographs downscaled to a 1200px long edge like their predecessors.

- [x] **(18 Sep, same round) Where a banner sits on the page, extracted — `.banner-slot`.**
      The two banners agreed on their shape and disagreed on their position. Measured, not guessed:
      the step off the tab rail was **20px on My Earnings and 8px on the Losses list**; the gutter
      was already the same 16px on both. Each wrapper had reasoned it out alone, which is exactly
      the drift `components/common/Banner.css` was written to end — so the slot moved in there too.

      **Above: `--gap-heading-above` (20px), because that is what this is** — the separation above
      the first group on the screen. 12px had already been tried on My Earnings and left the banner
      sitting on the tabs as though it were a fourth row of navigation chrome; the Losses list is
      the same situation under the same rail. It costs that list 12px of first screenful, which is
      real on a screen whose whole design constraint is height — flagged rather than absorbed.

      **Below is stated per screen, because it has to be COMPUTED to come out the same.** What
      follows a banner declares its own step above itself and the two differ — a section title asks
      20px on My Earnings, a chip row 12px on the Losses list — so a single `padding-bottom` on the
      slot would produce two different gaps. What has to match is the measured distance from the
      card's edge to the next thing's ink: 20px, the same step the slot puts above. My Earnings
      subtracts to zero; the Losses list writes
      `calc(var(--gap-heading-above) - var(--space-12))`, arithmetic visible rather than an 8 nobody
      could check.

      This side had already drifted once inside the same round: it was right, then the insight
      banner's dot row was removed and took the 8px it had been carrying with it, dropping that gap
      to 12 against My Earnings' 20. Caught by re-measuring, not by reading the CSS.

- Verified on the built result, all four layouts (My Earnings · Losses single / rolling / unified):
  tab rail → banner **20px** and banner → next ink **20px** on every one, gutter 16px, banner box
  identical. Full preset sweep, both datasets × {1500px, 420px}: zero overflow, zero horizontal
  page scroll, zero console errors.

- **Blocked on, and worked around:** the prototype would not render for most of this round —
  `useLossesApp.js` exported `setL2Presentation` without defining it, then referenced `l2AsSheet`
  the same way (an L2-presentation refactor in flight from elsewhere). Measurement ran against a
  throwaway copy of `src/` with a one-line stub rather than patching half-finished work in place.
  That refactor has since landed, and the numbers above were re-taken against the real repo build
  with no stub, on a clean sweep — so they stand on the shipped code, not on the workaround.

- [x] **(18 Sep) "Accept / Dispute presentation" removed — the sheet is the only presentation.**
      The config chose between a bottom sheet and a full page; the sheet had already won, and a
      config whose answer is settled is a question the panel keeps asking for no reason. Gone with
      it: the control, `l2Presentation` state and its setter, `l2AsSheet`, `showReasonPage`, and
      `ReasonSheetScreen.jsx` — the page chrome — which was the only caller of half of
      `ReasonSheetScreen.css`. The surviving form styles moved to `ReasonSheetBody.css` next to the
      component that actually uses them; the dead chrome rules (`.reason-sheet`, `__header`,
      `__close`, `__title-wrap`, `__title`, `__sub`, `__scroll`, `__bar`) went with the page.

      Two consequences simplified rather than carried: `showCaseDetail` no longer asks whether the
      L2 is a sheet (the case is always mounted behind it), and the draft-keeping rule in `openL2`
      no longer guards on presentation (there is only one, and it is dismissible).

- Verified: the panel no longer offers the control; both L2 presets open a `BottomSheet` over a
  still-mounted case detail, with the right title, chips and commit label, in both datasets; 28-preset
  regression, zero console errors, zero broken images.
- Note: `broken=8` readings during this round were a cold-cache artifact of the eager
  `complete && naturalWidth===0` check, not a defect — confirmed 0 broken on a direct re-check and on
  the warm re-run.

- [x] **(18 Sep) SMS dropped from every promise.** Four strings told the Pilot they would be told
      "here and by SMS"; there is no SMS. Where removing the clause left a trailing fragment
      ("…here.", "…days, here.") the adverb moved next to the verb rather than being deleted with
      it — "The team replies **here** in 7 days" — so the sentence still says *where*, which is the
      half of the promise that survives. `caseStates.js` (IN_DISPUTE), `ReasonSheetBody` (both
      branches), `ReturnedClaimSheet`, and the two quotes in LOSS_DETAIL_ARCHITECTURE_AUDIT.

- [x] **(18 Sep) A disabled Dispute button keeps its name; the pause moved to a note above the bar.**
      Under cool-off the label used to become "Paused till 28 Aug", which made the control name its
      own unavailability and left the Pilot without the word they came looking for — you cannot find
      a disabled Dispute button if it no longer says Dispute.

      `ActionBar` grew a `note` slot (one line, or several) above the buttons, quiet by construction
      — tertiary icon, secondary text — because it explains the state of a control rather than
      asking for anything. It renders with no buttons at all, which is what let the grace note below
      reach the states that offer no action.

      The note also spends the previously-dead `coolOffOutlastsCase`: when the pause outlives the
      case, "you can dispute again on 28 Aug" is true and useless — the money goes on the 20th — so
      it says *past 20 Aug, when this loss is settled* instead of leaving the Pilot to compare two
      dates himself.

- [x] **(18 Sep) Grace period — a new Pilot's first weeks cost them nothing, and they are not told.**
      New Global variant, off by default. `config/gracePeriod.js` holds the policy; `pilot.joinedOn`
      on each fixture holds the Pilot half of it (Mock 25 Jul, so the window ends 22 Aug and July's
      history is deliberately left uncovered — the toggle has to show both a deduction the window
      caught and one it did not).

      **The window is never announced.** Not on the losses list, not on My Earnings, not on an open
      loss, not in the payment. Telling a new Pilot their first four weeks are free hands them a
      reason to ignore every loss in those four weeks — which are exactly the four weeks the window
      exists to let them learn in. So an open loss under grace is indistinguishable from one without
      it: same amount at stake, same countdown, same warm tone, same section totals, same cycle
      card, same entry banner. They behave as they will have to behave from week five.

      **It shows up once, at the point of deduction.** `applyGrace` (`state/grace.js`) makes exactly
      one rewrite on the pool: a `DEBITED` case raised inside the window becomes the new terminal
      `GRACE_WAIVED` and loses its `debitDate` — that is a claim about a payment the Pilot can go
      and look at. `DEBITED` is the app's only state in which money has left and stayed gone, so it
      is the whole of "the deducted amounts"; everything upstream of it is still in play and reads
      as it always did.

      Nothing downstream needed changing. `GRACE_WAIVED` is not a debit state, so the payment
      breakdown drops it by the rule it already had; the historic ledger and the insight engine
      count it as money that came back, like every other loss the Pilot was not charged for. The
      pool itself is untouched, so the toggle is reversible and the two readings are comparable.

      **The hero is the entire explanation**, in reading order: `₹0` against the struck ₹210, then
      *"Not deducted — this loss fell in your first 4 weeks"*, then *"From 22 Aug, a loss you ignore
      or a dispute you lose comes out of your payout."* That last line is the sentence the free loss
      was bought for — a Pilot who reads only the ₹0 has learned that losses are free. It is also
      the one resolved-good state that keeps its prevention advice: a waived case was not their
      fault, so advice reads as an accusation; a covered one may well have been.

      `GRACE_WAIVED` is its own state rather than `WAIVED` because "you were right" and "we did not
      charge you because you are new" are two different things to have learned about your own
      record, and a Pilot who reads the first when the second is true will dispute the next one
      expecting to win.

      **Built wide first, then cut back to this.** The first pass announced the window on the losses
      list, in the My Earnings widget, in the section heads, on the cycle card and at the foot of
      every covered open loss, and showed ₹0 against every open stake. It worked and it was wrong:
      it spent the whole surface telling a new Pilot that nothing they did for a month would cost
      them anything. All of that is gone — no component in `src/components` mentions grace at all
      now, and the policy lives entirely in `config/` and `state/`.

- Verified on the built prototype, Mock, toggle off → on: the losses list, My Earnings, the cycle
  card and every open loss render identically; payment total ₹7464 → ₹7674 (the ₹210 covered QC
  debit, and only that — the pre-deducted ₹40 LiF is still open, so it is still deducted); Past
  Losses head "₹210 deducted" → "₹0 adjusted"; historic *deducted* ₹306 → ₹96 with the uncovered
  24 Jul debit still standing. Full preset sweep, both datasets × grace on/off: no blank screens,
  zero console errors.

- [x] **(18 Sep) Live data no longer borrows the stock catalogue — it says "Placeholder".**
      The catalog photo row on Live was six dummy product shots (a face wash, a hair oil, a soap
      bar) sitting under the Pilot's own pickup photographs. That is the one invented thing on a
      surface whose whole claim is that nothing on it is invented, and it is worse than an empty
      tile: a reviewer cannot tell it from data.

      New dataset field `stockPhotos` — `true` on Mock, `false` on Live. Where it is false
      `productImage()` returns nothing at all, so the catalogue cannot stand in anywhere: not in the
      catalog row, not in an evidence group the record has no photo for, not in an L0 row thumb
      (`ListRow` now guards the `<img>` rather than rendering a broken-image glyph). The tile that
      asked for one becomes an empty **white box reading "Placeholder"** — a third tile state, and
      deliberately not the striped image-missing frame: the stripes mean a photograph we expected
      did not arrive, the white box means the prototype has nothing true to put here. On Live that
      is the difference between a defect and a known gap.

      One image was rescued in the process: the catalog row REPLACES the reason's own `catalog`
      group, so on a wrong pickup it was swapping the extract's real `catalog_image_link` cover for
      six tiles of nothing. The row's first tile now carries that real cover on any dataset — which
      is what its own docblock had always promised, back when "the same offset" still resolved to
      the same image.

- Verified: full preset sweep, both datasets × catalog layer off/on. Placeholder tiles appear on
  **Live + layer on only** (29 across its 10 presets) and never on Mock or on Live with the layer
  off; zero broken images, zero blank screens, zero console errors on all four passes. Mock renders
  byte-identically to before.

- [x] **(21 Sep) The presenter panel collapses.** It is a tool, not part of the thing being shown:
      it earns its 272px while an arrangement is being set up and costs them for the rest of the
      session — shown to a Pilot, photographed for a deck, or simply looked at, a column of
      switches beside the phone is the loudest object on a screen whose subject is the phone.

      **One tab on the seam**, vertically centred and half over the border — the place a hand
      already goes on a docked panel, and the only spot belonging to neither side, so it cannot be
      mistaken for a control of either. Chevron only at rest (28px: enough to hit, little enough to
      forget), the words on hover, which is the one moment anybody is asking what it is. The arrow
      points where the panel will GO — right to push it away, left to pull it back — rather than at
      what it currently is. Shut, the tab stops being an edge treatment and becomes an object
      (white, darker ink, shadow on all sides): it is then the only way back, and discoverability
      is worth more than restraint on the one control that is load-bearing.

      `⌘\` / `Ctrl+\` toggles it, the editor convention for exactly this — a demo is driven
      one-handed with a phone in the other. The choice persists in `localStorage`, like the dataset
      switch, because the reason for wanting the panel rarely lasts less than a session.

      **It starts shut** (21 Sep): the prototype opens on the thing it is a prototype of. Anyone
      who needs the switches knows the panel is there and is one click from it; everyone else — a
      Pilot being shown a screen, a link opened from Slack, a screenshot taken for a deck — was
      being handed a column of controls they had no use for, beside the phone that was the point.
      The cost is asymmetric: a reviewer pays one click a session, a viewer paid every time. Only
      an explicit stored `'true'` opens it, so a reviewer who opened it once still finds it open.

      The panel stays **mounted** when collapsed, clipped to zero width rather than unmounted: the
      layer registry lives off it and its scroll position survives, so reopening shows the panel you
      left. `inert` keeps it out of the tab order meanwhile — clipped controls that could still be
      tabbed into would be a hidden panel changeable by accident. The contents are held at full
      width inside the clip, so collapsing slides the panel off the edge instead of reflowing every
      control through 272 intermediate layouts.

      All of it in `presenter/PresenterShell.jsx` + its CSS, chevron drawn inline: that folder is
      meant to be lifted wholesale into the next prototype, so it owes itself no dependency on this
      app's icon set. `prefers-reduced-motion` turns the animation off.

- Verified: 272 → 0 and back by tab and by keyboard; `aria-expanded` and `inert` track the state;
  shut, reload, still shut; reopened, the controls still drive the stage. No horizontal page scroll
  at 1024px or 1440px. Full preset sweep, both datasets × catalog layer off/on: zero blanks, zero
  broken images, zero console errors.

- [x] **(21 Sep) The L2 commit buttons name the move, not the plumbing.** "Send dispute" →
      **Raise Dispute**, "Confirm accept" → **Confirm**. The old pair described what the app does
      with the form; "raise a dispute" is what the Pilot is doing, and it is already the verb the
      loss page's own hero guidance uses ("Raise a dispute if you think this is an incorrect
      deduction") — so three surfaces now use one name for one act. Accept needs no object: the
      sheet is headed with the loss and carries the consequence pill above the button, so
      "Confirm" is the only thing left to say. One line, `useLossesApp.js`'s `submitLabel`.

- [x] **(21 Sep) The L1 hero's guidance line quotes the button.** "Raise a dispute if you think
      this is an incorrect deduction." → **"Tap ‘Raise Dispute’ if you think this amount is wrongly
      deducted"**. A Pilot who has understood *raise a dispute* still has to find it, and the
      control is at the far foot of the page; naming it in the hero's own words is what joins the
      sentence to the thing it asks for. That only holds while the two agree, so the quoted words
      and the control's label now have to change together — noted in `caseStates.js` beside the
      string.

      Its sibling — the branch an accept-only loss type would land on — went with it:
      "Accept and tell us why it happened." → **"Tap ‘Accept’ and tell us what happened"**. Nothing
      reaches it on either fixture (every reason that can be ATTRIBUTED offers dispute), which is
      exactly why it was worth changing now: dead copy is how the app's older voice ships on the
      day a new loss type makes it live. Verified by temporarily making `ICUD_IMG_JUNK`
      accept-only, screenshotting the branch, and restoring the file byte-for-byte.

- **Open:** the words quoted are the BOTTOM SHEET's commit label. The button on the L1 page itself
  still says "Dispute" (one word, deliberately — see `actionButtons` in `CaseDetailScreen.jsx`), so
  the hero currently names a control that appears one tap later. Either the bar button becomes
  "Raise Dispute" or the hero quotes "Dispute"; flagged for a call, not guessed at.

- [x] **(21 Sep) "At stake" → "may be deducted", on the two surfaces that actually said it.**
      Twenty-one hits for the phrase, two of them rendered: the Needs Decision section head
      (`NEEDS_ACTION_TOTAL`) and the My Earnings entry banner's headline. The other nineteen are
      comments using "at stake" as the NAME OF A MONEY POSITION — the `RISK` tone is defined as
      "money at stake", the money-grammar table's first column is "at stake", the historic ledger
      explains why an info-only loss never was. Those are the concept, not the copy, and renaming
      them would have been a search-and-replace pretending to be an edit. The comments that
      *quoted* the old headline were updated; the ones that reason about the position were not.

      **The banner could not take the direct swap.** "₹624 may be deducted from 6 losses" reads as
      the money coming out of the losses — "deducted from" names the thing money leaves, and that
      is his payout, not his loss list. The verb moved to the end: **"₹624 from 6 losses may be
      deducted"**, which keeps the app's existing "from N losses" phrasing and leaves both figures
      against the nouns they belong to. The head took the swap as it was: **"₹363 may be
      deducted"**.

- Verified on both surfaces; full preset sweep, both datasets × catalog layer, zero errors.
- **Note:** the banner headline is 5 characters longer and now wraps to two lines above the
  countdown, so the widget is a line taller than it was. It reads correctly; if the height matters
  more than the count does, the alternative is "₹624 may be deducted" alone on the headline.

- [x] **(21 Sep) Section names, status chips and two money totals renamed.** Six changes off one
      table, all of them moving from what the system calls a thing to what the Pilot would:

      | was | now | where |
      |---|---|---|
      | Needs Decision | **Needs Attention** | section head · filter chip · summary card · cycle sheet |
      | Disputes in Review | **Team is checking** | same four |
      | Past Losses | **History** | same four |
      | Decision in N days | **Reply in N days** | hero chip + list badge, on IN_DISPUTE / ACCEPTED / LIF_CLAIM_SENT |
      | Waived | **Not deducted** | the state's `label` |
      | ₹261 held | **₹261 on hold** | the pending section's total |

      The first three were one edit: `config/lossBuckets.js` is the single source all four surfaces
      read, which is the whole reason that file exists. "Team is checking" also fixes something the
      old name got wrong — the bucket holds accepted cases as well as disputes, and "Disputes in
      Review" quietly did not cover them.

      "Reply in" reverses an earlier unification that had picked "Decision in" as the one
      vocabulary; the fact is unchanged and so is the rule that both surfaces say it the same way.
      "on hold" over "held": the money is in a state, not in our possession — "₹261 held" reads as
      money we have taken and are keeping.

      Comments and `CONFIG_REFERENCE.md` were swept to match, which needed a second pass: the blunt
      replace also rewrote the two lines in `lossBuckets.js` that deliberately NAME the superseded
      names ("\"Needs Attention\" over the older \"Needs Attention\""), and a stale third name in
      `LossesBody.jsx`. Both repaired.

- Verified: old strings return 0 screens across every preset on both datasets; new strings render
  on the surfaces expected. Full sweep × catalog layer, zero errors. The built JS hash was
  unchanged by the comment pass, which is the proof it touched no rendered string.

- [x] **(21 Sep) Six more copy changes, one batch.**

      | was | now | where |
      |---|---|---|
      | Secondary QC mismatch | **Captain rejected the QC** | `feName` — L1 title, list rows, Loss-Wise head |
      | QC mismatches | **Captain QC Mismatch** | `insightNoun` — the insight banner's subject |
      | "… cost you ₹X" | **"… can cost you ₹X"** | insight banner, **info-only types only** |
      | Dispute sent | **Raised Dispute** | dispute confirmation popup |
      | (byline) | **"Your dispute is sent to the team."** prepended | same popup |
      | "Dispute/Disputing is paused till {date}" | **"You can't raise dispute again till {date}"** | hero guidance, action-bar note, cool-off notice title |

      Both reason strings now name a PERSON and an ACT: "Secondary QC mismatch" is what operations
      calls the check, "Captain rejected the QC" is what happened to the Pilot, and the hub captain
      is someone he knows.

      **The conditional verb is data-driven, not a string swap.** `remedyGroups` already knew which
      types move money (`showsTotal`, which is why the Wrong Pickups head omits its ₹ total); that
      same fact now also picks the tense, as `costsMoney`, so the head and the sentence cannot end
      up disagreeing about whether money moved. A wrong pickup deducts nothing, so "wrong pickups
      cost you ₹1129" was a bill the Pilot never got and would go hunting for in a payment; "can
      cost you" keeps the figure — the parcels' real value, and the reason the habit is worth
      fixing — and states it as the exposure it is.

      The cool-off notice lost a sentence in the rename: its body used to end "You can dispute
      again after {date}", which is the title's own date and fact in a second grammar one line
      apart. What is left is the half the title cannot say — why the door is shut, and that
      accepting still works.

- [x] **(21 Sep) Losses list section order: Wrong Pickups now comes before History.** The order is
      the list's argument. The two sections above are open, Wrong Pickups is a standing advisory
      the Pilot can still act on next time, and History is the only part of the page that is
      finished — so the settled section goes last. It used to sit between them, which closed the
      list on an advisory after having already told the Pilot it was done. The filter chips and the
      Unified layout's summary cards were already in this order; only the sectioned body disagreed.

- Verified on screen: all six strings render where expected, the section heads read Needs Attention
  → Team is checking → Wrong Pickups → History, and the wrong-pickup insight reads "can cost you
  ₹1129" on Live while the other three keep "cost you". Full preset sweep, both datasets × catalog
  layer: zero blanks, zero broken images, zero console errors. Specs updated (CONFIG_REFERENCE,
  INSIGHTS_SPEC, LOSS_DETAIL_ARCHITECTURE_AUDIT).

- [x] **(21 Sep) "Returned on 8 Aug" → "Credited back on 12 Aug".** Not just a rename: the hero
      was dating the PARCEL (`returnedOn`) while the credit-pair rows two blocks below dated the
      MONEY (`creditDate`, the 12th). One page, one event, two dates. The hero now reads the credit
      date and says it in the same words as the row it summarises.

- [x] **(21 Sep) In-dispute tracker speaks the dispute's own vocabulary.** "Decision expected" →
      **Reply expected**, "Decision before your payout" → **Reply before your payout** (matching
      the chips renamed earlier the same day), and the title "Your dispute" → **Raised Dispute** —
      the button the Pilot pressed and the headline of the popup that confirmed it, so one act is
      named one way in all three places.

- [x] **(21 Sep) Only Dispute is now true of the DATA, not just the controls.** The variant removed
      the Accept button, the accept sheet and the accept route — and stopped there, so the fixture
      went on carrying cases only an accept could have produced. "Team is checking" held a loss
      reading *"Accepted on 14 Aug"* in a build where the Pilot has never been offered an Accept
      button. The most-scrutinised state in the variant was evidence the variant was not real.

      `state/flowVariant.js` — same shape as the grace lens: read the pool through it once before
      any surface sees it, never edit the pool, so switching back restores every case exactly.
      Three states are accept-only and each has one honest dispute equivalent:

      | seeded | under Only Dispute | why |
      |---|---|---|
      | `ACCEPTED` | `IN_DISPUTE`, reason swapped to "Not my parcel" | same loss, same day, through the only door there is. The accept reason had to go with it — "I was in a hurry" is an admission, and carrying it into a dispute puts a confession inside a denial |
      | `NOT_DEDUCTED` | `WAIVED` (`waiveReason: agent_right`) | both mean the Pilot kept the money; `NOT_DEDUCTED` is reachable only from `ACCEPTED` |
      | `DEBITED` · pathLabel "you accepted it" | pathLabel "your dispute was not upheld" | that label is printed verbatim in the hero, so it was the accept flow speaking on a page the accept flow cannot have produced |

      Silence-path `DEBITED` is untouched — a window closing with no reply is the one outcome both
      flows share. No case moves bucket (ACCEPTED and IN_DISPUTE are both `pending`; NOT_DEDUCTED
      and WAIVED are both `closed`), so every count and total is identical under both flows.

      Two copy lines went with it, both of which named a door the variant removes: the cool-off
      hero's "You can still accept." and the cool-off notice's "Accepting still works." Under Only
      Dispute a cool-off case has no move left at all, and those were the app pointing at a button
      it had deleted on the one screen where the Pilot is actively hunting for something to press.

      And three presets: "Loss · accepted", "Loss · not deducted" and "Sheet · accept" carry
      `needsAccept` and are no longer offered under the variant — the panel stops offering a jump
      to a page that no longer matches its own label. 18 presets → 15 on Mock, 10 → 9 on Live.

- [x] **(21 Sep) Insight banners are pickable from the panel.** New `multiselect` control type
      (`presenter/controls/MultiSelect.jsx` + one `CONTROL_TYPES` line — the folder's stated cost
      of a new control kind, paid exactly once). Checkboxes rather than a column of `Toggle`s: a
      toggle says "this is on or off, independently", and these are members of one list being
      filtered.

      The menu is built from the pool, so it offers exactly the loss types the active dataset has,
      each with its figure — the thing that decides whether a reviewer wants to see it. **None
      picked = automatic**, which is the product rule (top 3 by money, always three); a pick shows
      exactly those, still in money order, because a row whose order moved with the picking would
      make two reviews of the same selection disagree. Lookups resolve against the full list, not
      the shown subset, so a sheet still opens for an insight the banner is not carrying.

- [x] **(21 Sep) One colour for the label band.** The full-width grey strip heading a group of rows
      — "Past Payments", "May 2025", "Needs Attention" and siblings — was two greys: `SectionDivider`
      reached for `--border-subtle` (a BORDER token used as a fill, right only by accident) and
      `SectionHeader` carried its own `#FAFAFC`, so the identical object read differently one tab
      apart. Both now name `--surface-group-head`, which is the DS's **Grey Coral/Light T2 #E6EBF2**
      (Figma ShOKxbXbnD9mOzWPmVdxd8 · 275:10288) via the existing `--valmo-grey-light-02`.
      `SectionHeader`'s bottom hairline went with it — band and rule became the same colour, so it
      was drawing nothing; the band's own edge against the white row below is the separation, which
      is how the reference draws it. Every band in the app goes through one of those two
      components, so there is nothing left to miss.

      **And one geometry** (21 Sep): the band is **28px** everywhere — `--pad-band-y` (4px) around
      a Heading-05 line, which is the reference node's own 360×28. It was two shapes as well as two
      colours. `SectionHeader` ran 14px above and 6px below a 20px line — 40px, asymmetric on the
      reasoning that a heading binds downward to the rows it labels. Good rule for a heading
      sitting on the page; this is not one. It is a filled strip, and a filled strip's own edges do
      the binding, so the asymmetry bought nothing and cost 12px on every group. `SectionDivider`
      already ran 4/4 but around an 18px line, one type step short — it takes Heading 05 now too.
      `--pad-head-top` / `--pad-head-bottom` are gone; they had exactly one caller.

- Verified: Accept + Dispute vs Only Dispute walked side by side — the pending case reads
  "Accepted on 14 Aug. Not deducted yet." vs "Sent 14 Aug. Nothing is deducted while we check.",
  the closed one "The team decided in your favour." vs "You were right.", cool-off drops its accept
  sentence, and the accept presets disappear. Multiselect: auto → one banner → two → cleared back
  to auto, all correct. Bands match across Losses, My Earnings and Payments. Full preset sweep,
  both datasets × catalog layer: zero blanks, zero broken images, zero console errors.

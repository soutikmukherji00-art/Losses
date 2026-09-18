# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

**Primary: Pilots (also called FEs)** — Valmo delivery partners using the Valmo Partner (Valmo1)
Android app. The situation is adversarial and time-pressed: a shipment loss has been attributed to
them, money is about to leave their payout, and today they discover it only as a single unexplained
line ("Lost Shipments −₹255") after the fact. Their job on this surface is to understand what
happened to a specific shipment, see the proof, and decide — accept it, dispute it, or do nothing —
inside a 7-day window. Many are low-literacy and read a language other than English; they are on
low-end Android devices, often on 2G or offline, standing in the field between deliveries.

Comprehension bar set by the KRD: a Pilot understands the three choices in **10–15 seconds**,
validated in ≥3 real Pilot walkthroughs / FGDs.

**Secondary (not designed for here):** Kapture agents (12–15, 3P payroll) who review 100% of
disputes in their own tool; support/ops who today explain deductions manually. Captains and other
debit entities are explicitly out of scope for V1 — they come later on the same rails.

## Product Purpose

The **FE Loss Report Card** is a Losses section in the Valmo Partner app that shows each attributed
shipment loss with its proof and lets the Pilot respond **before** the money is cut.

Direction, from leadership (Aug '26): *"innocent until proven guilty."* Show the likely debit
first, give the Pilot the right to respond, deduct only after — by their acceptance, by a failed
dispute, or by silence after fair notice.

The model: a loss is attributed and shown with the Pilot's own photos. The Pilot has 7 days from
attribution to **Accept** ("yes, my mistake" + a reason chip; business then selects Y% of accepted
shipments for full deduction), **Dispute** (one chance only — reason chip + optional text note, no
voice notes, no photo upload; a human agent reviews within a 7-day SLA; right → waived, wrong →
full deduction, SLA missed → auto-waived), or **stay silent** → full amount deducted at window
close.

Success (KR goal): reduce seller-claim losses *fairly* — fewer repeat mistakes through behaviour
change, and wrong attributions corrected before deduction. NSM: loss (claims) events per active
Pilot per week, exposed vs holdout, trending down; robustness cut is loss events per 50 reverse-
pickup shipments. Counts debited loss types only. Model-health metrics: action rate in-window,
accept / dispute / silence rates, overturn rate, SLA compliance, Lost-in-Field recovery rate.

The flywheel this design serves: visibility → Pilots fix behaviour and contest wrong attributions
→ SX claims fall → SX improves → CPS reduced.

## Positioning

What no neighbouring surface in this app can truthfully claim: **shipment-level loss visibility
with the Pilot's own evidence attached, and a right of reply that gates the deduction.** Every
other deduction in the app is a fait accompli — a cumulative number with no break-up, no reason,
no recourse. This surface inverts the order of operations between money and explanation.

The earlier design (read-only "Actual vs Potential debit" two-card model) is dead and must not be
revived: it is replaced by the three-way accept / dispute / silence choice.

## Operating Context

- **Where it lives:** inside the Valmo Partner Android app's Earnings area, alongside My Earnings
  and Payments. Losses is currently a third tab; a variant promoting Losses to its own L1 page
  (two-tab L1) is under review.
- **The money surface it must reconcile with:** the Payments tab and Payment Details screen, where
  the "Lost Shipments" deduction line appears today. Loss records point at payments; the deep-link
  (F27) is stated but **not wired** — pointers currently point nowhere by decision.
- **Conditions of use:** 2GB-RAM Android, 2G networks, intermittent offline. Text must render
  before images; thumbnails lazy-load; last-fetched view is cached and readable with an
  "as of <date>" state.
- **Screen hierarchy in use on this project:** L0 = the Losses list (entry) · **L1 = the loss
  detail page** · **L2 = the sub-flows off it** (accept sheet, dispute sheet, add-your-side,
  evidence viewer, tracker). Note: "L1" in the two-tab variant discussion means something
  different — "a top-level page rather than a tab."
- **Systems behind it:** SX Claims gold table (`gold.sx_report_debit`) for four reason types; the
  Loss Engine for Lost-in-Field (arrives day-0 via a payouts-engine side-channel); Kapture for
  dispute review; the payout engine executes deductions (manual file upload today; automation
  deferred).
- **Prototype reality:** the design artifacts in this repo are a React + Vite web prototype
  rendered inside a phone frame (`react-prototype/`), with a presenter sandbox for reviewing
  variants with stakeholders. The design language it must produce is Android's and the Valmo app's,
  not the web's. The older Claude-Design `.html` bundle in `Input Prototype/` is legacy and is no
  longer an edit target.

## Capabilities and Constraints

**Reason registry (the taxonomy authority is the KRD, not the prototype).** Five reason codes in
V1, each with its own evidence set and money behaviour:

| KRD reason | FE-facing name | Evidence | Money behaviour |
|---|---|---|---|
| ICUD image junk | "Delivery photo not clear" | 2 images | debitable |
| Pickup image junk | "Pickup photo not clear" | 2 images | debitable |
| Pickup-vs-QC mismatch | "Secondary QC mismatch" | 4 images (2 pickup + 2 Sec-QC) | debitable |
| Wrong-RVP pickup | "Wrong parcel picked up" | none (info only) | **never debited** |
| Lost in Field (LiF) | "Shipment Lost" | none (reason + tip) | **already cut day-0; recoverable on return** |

**NFR-5 is load-bearing:** rendered reasons are controlled by a whitelisted config array and the
list may grow to ~10 **without redesign**. Any loss-detail design must be a function of
(reason code × case state), never a hand-built screen per reason. Reason → tip and reason → image-
set mappings are config owned by Business. A reason code missing from the mapping degrades to a
generic tip / no-image state; the row is never blocked.

**Case-state lifecycle:** ATTRIBUTED → (viewed) → IN_DISPUTE / ACCEPTED → DEBITED / WAIVED /
NOT_DEDUCTED, plus LiF RETURNED_CREDITED. Plus `OPEN_DISPUTE_PAUSED` (cool-off) when a Pilot loses
X disputes in a row: disputes pause for [T] days with the reason and reopen date shown; **accept
and silence stay open**; one won dispute resets the counter.

**Durable rules the design must not contradict:**
- One clock: 7 days from attribution for every case. No seen-based window, no 14-day cap.
- One dispute per loss, final. Chips + optional text note only — no voice notes, no photo upload.
- Silence has a consequence and it must be stated where the choices are, not as a footnote.
- Tone is chosen by **money position** (at risk / held / already cut / not deducted / recovered),
  never by severity or by loss type. This is what stops each new reason from inventing a palette.
- The app never promises a waiver on acceptance — business selects Y% of accepted shipments for
  full deduction and the Pilot is told the outcome before payout.
- A fraud-awareness overlay stays in the design; its treatment is open with the designer.

**Undecided / [TBD] — do not invent values:** Y% (accepted-selection rate), X (consecutive wrong
disputes before cool-off), T (cool-off days), leakage budget, SLA-compliance target, queue-capacity
threshold, expected impact, target timeline. All are gating and owned by Business/Biz-Fin.

**Known open by decision, not omission:** voice-out has no TTS engine wired (G5); there is no
evidence viewer (G14); payment pointers are stated but not linked (G3b).

## Brand Commitments

- **The Valmo Partner app's existing design language is binding.** New screens must read as native
  to the app — its tokens, components and patterns — not as a new visual world.
- **Figma is the visual source of truth** and outranks the prototype wherever they disagree:
  `SOT_Valmo` file `ShOKxbXbnD9mOzWPmVdxd8` (nodes `275:9263` Payment Details, `275:10421` Payments
  tab); My Earnings from file `TxIUrBKg7mRQhksWl4IS9y` node `1939:25543`. Extracted tokens live in
  `Design System/VISUAL_DESIGN_SPEC.md` and `react-prototype/src/styles/tokens.css`.
- **Voice:** simple English as the base, written to be localised into every app language. Process
  language, hedging and legal register are failure modes here — the copy has to survive translation
  and be understood by a low-literacy reader at a glance.
- Product naming in the app is FE-facing, not internal: "Delivery photo not clear," not
  "ICUD image junk."

## Evidence on Hand

- `KRD/KRD_FE_Loss_Report_Card_Valmo1_App.pdf` (doc v7→v8, 3 Sep 2026) — the product authority.
  Text extracted to `KRD/KRD_extracted_text.txt`; parse the text file, not the PDF (poppler is not
  installed on this machine).
- `Design System/VISUAL_DESIGN_SPEC.md` — tokens, type scale, spacing, radii, component specs
  extracted from the Figma frames.
- `Design System/LOSS_DETAIL_ARCHITECTURE_AUDIT.md` — the reason × state template architecture,
  the 14-item gap register, and which gaps closed.
- `Design System/CHANGE_SPEC_02.md`, `Design System/SUBAGENT_PLAYBOOK.md`, `PROGRESS.md` — round-by-
  round decision history. `PROGRESS.md` is the resumable log.
- `react-prototype/` — the live prototype: 14 screens, presenter sandbox, mock data in
  `src/data/mockData.json`.
- **Real sizing data (analytics, Jun '26):** ≈₹800 debited per Pilot per month across ~4K Pareto
  Pilots (372 hubs) → ≈₹32L/month, ≈₹3.8Cr annualised. ~3 attributed loss events per Pilot per
  month. Full-base sizing is [TBD].
- **Absences future work must not fabricate:** there are no real Pilot photos, no live loss records,
  no Pilot quotes or testimonials, no baseline or impact numbers, no pricing or licensing story.
  All prototype data is mock. Pilot walkthroughs are a requirement, not a completed input.

## Product Principles

1. **Explanation before money.** No amount appears without the shipment, the reason and the proof
   that produced it. The old cumulative-line pattern is the anti-reference.
2. **The choice is the page.** A Pilot must be able to answer "what are my options and what happens
   if I do nothing" in 10–15 seconds, in their own language, without reading a paragraph.
3. **Truthful about money position.** Never imply a waiver, never soften an already-executed
   deduction, never show a red number for something that will not be debited. Money position drives
   the tone.
4. **Config, not screens.** Loss types are data. Anything that would need a new hand-built screen
   for reason #6 is the wrong design.
5. **Built for the worst device on the worst network.** Text before images, usable offline with an
   honest "as of" state, no design that only works when the photos load.

## Accessibility & Inclusion

- **Low literacy is the design centre, not an edge case.** Copy is simple-English base, localised
  to every app language; the three choices, tab names and the Lost-in-Field story all get a
  vernacular pass.
- **F10 (P0): a voice-out control on every explanation block**, reading aloud in the app language
  with fallback to the default. No TTS engine is wired yet — the affordance must still be designed
  as real, not decorative.
- Content must remain comprehensible with images absent or unloaded (placeholder + reason + tip).
- Touch targets and legibility must hold on low-end Android hardware in outdoor daylight.

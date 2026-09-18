# Loss Detail (L1) + Sub-flow (L2) — Audit & Template Architecture

**Status: audited → architecture approved → BUILT (9 Sep 2026).** §4's architecture is now
the live implementation in `react-prototype/`; §7 records exactly which gaps that closed and
which remain open. The artifact version of this document was dropped by decision (not needed).

Sources used:
- `KRD/KRD_FE_Loss_Report_Card_Valmo1_App.pdf` (doc v7→v8, 3 Sep 2026), text extracted to
  `KRD/KRD_extracted_text.txt` (line refs below point at that file).
- `react-prototype/src/state/useLossesApp.js` — the live implementation of every L1/L2 screen.
- `Design System/VISUAL_DESIGN_SPEC.md` — token/visual source of truth.

## 0. Scope decisions (confirmed with the user before starting)

| Question | Decision |
|---|---|
| L1 / L2 definition | **L1 = the loss detail page** (what opens on tapping a line item). **L2 = the sub-flows off it** (accept sheet, dispute sheet, add-your-side, evidence viewer, tracker). The Losses list is L0/entry. |
| Deliverable | Audit + template spec **first**; code refactor only after the spec is approved. |
| Taxonomy grounding | Prototype data **+ the KRD** (done — see §1). |
| Where it lives | This markdown. (An artifact version was considered and dropped, 9 Sep.) |

### 0b. Design decisions taken on this audit (9 Sep 2026)

| # | Question | Decision |
|---|---|---|
| 1 | Build the artifact version? | **No** — markdown is enough. |
| 2 | Accept the `f(reasonCode, caseState)` architecture? | **Yes** — implemented, see §7. |
| 3 | Lost-in-Field tone | **Amber (`risk`) while recoverable, green (`resolved_good`) once returned.** Money story corrected to "already cut → return to get it back". |
| 4 | Where the silence consequence goes | **Inside the "What to do" card**, with the choices it's the alternative to — not a footnote. *(Superseded, 16 Sep: the "What to do" card is gone — the hero's guidance and the sticky ActionBar carry the choice. The consequence has no block of its own either; the hero states it in the three fields it already fills — `figure` = what's at stake, `chip` = how long, `statement` = "Not deducted yet." Written out again as a sentence it was those same three facts twice on one page.)* |
| 5 | Wrong-RVP money display | **Keep the current model** (greyed ₹ + "Not deducted" chip). |
| 6 | Build DEBITED / NOT_DEDUCTED / RETURNED_CREDITED? | **Yes, build them now.** Payment pointers may point nowhere for the moment; a real target can be wired when PM asks. |
| 7 | Collapse `Under review` + `Decision pending`? | **Yes** — one `IN_DISPUTE` state. |

---

## 1. Canonical taxonomy (from the KRD — this is the authority, not the prototype)

### 1a. Reason codes — the real list

KRD final page (`KRD_extracted_text.txt` L1324–1337) carries the authoritative table:

| # | KRD reason | FE-facing name | Source system | Evidence on card | Money behaviour |
|---|---|---|---|---|---|
| 1 | ICUD image junk | "Delivery photo not clear" | SX claims (gold) | 2 images | Debitable |
| 2 | Pickup image junk | "Pickup photo not clear" | SX claims (gold) | 2 images | Debitable |
| 3 | Pickup-vs-QC mismatch | "Secondary QC mismatch" | SX claims (gold) | 4 images (2 pickup + 2 Sec-QC) | Debitable |
| 4 | Wrong-RVP pickup | "Wrong parcel picked up" / "…wrong seller" | SX claims (gold) | none (info only) | **Never debited** |
| 5 | Lost in Field (LiF) | "Shipment Lost" | Loss Engine (shipment-loss flow) | none (reason + tip) | **Already deducted day-0; recoverable** |

Decided naming call (L872–875): *"Delivery photo not clear" is ICUD junk — same reason,
FE-facing name.*

**The load-bearing scalability requirement — NFR-5 (L549–550):** *"reasons rendered are
controlled by a whitelisted-reasons array (config); the list may grow to ~10 without
redesign."* This single line is the mandate for the architecture in §4.

Supporting requirements:
- **F8 (L350–356):** detail shows the Pilot's own photos above the choices; **image set per
  reason-code mapping** (mismatch = 4, photo-junk = 2, LiF = none). Image missing →
  placeholder + reason + tip; row never blocked.
- **Reason-code → tip and → image-set mappings are config**, owned by Business
  (dependency table, L797–799).
- **Edge case (L641):** reason code missing from tip/image mapping → generic tip / no-image
  state; gap logged.

### 1b. Case-state lifecycle — the second axis

KRD §6b (L612–614), verbatim:

> **Status lifecycle (data).** ATTRIBUTED → (viewed) → IN-DISPUTE / ACCEPTED → DEBITED /
> WAIVED / NOT-DEDUCTED, plus LiF RETURNED-CREDITED. This lifecycle is the shape the central
> loss DB should hold for every entity.

Expanded with the rules that drive UI states:

| State | Enters when | Money position | Key rules |
|---|---|---|---|
| `ATTRIBUTED` (open) | loss attributed | at risk, not yet cut | 7-day window from **attribution** for every case — no seen-based clock, no 14-day cap (L861–864). Countdown chip driven by window state (F5). |
| `OPEN_DISPUTE_PAUSED` (cool-off) | > X consecutive wrong disputes | at risk | dispute paused [T] days, shown with reason + reopen date; **accept and silence stay open**; one win resets counter (F17, L446–449). |
| `IN_DISPUTE` | dispute submitted | held | single & final dispute; 100% human review, 7-day SLA in **our** clock; chips + optional note, **no voice notes, no photo upload** (F14–F16). |
| `ACCEPTED` | accept submitted | pending selection | Business selects **Y% of accepted shipments** (not Y% of amount) for full deduction; app promises process + date, **never the outcome, never odds/Y%** (F12, L599–602). |
| `DEBITED` | silence at window close · dispute found wrong · selected after accept | cut | posts on **resolution date**; must carry payment pointer (F21–F22). |
| `WAIVED` | dispute found right · **SLA breach → auto-waive** | ₹0 | auto-waive fires exactly once even if Kapture is down; a late agent decision cannot un-waive (F16, NFR-6). |
| `NOT_DEDUCTED` | accepted but not selected | ₹0 | a "no-money outcome" that stays visible in the Closed strip (F7). |
| `RETURNED_CREDITED` | LiF parcel returned to hub in window | cut, then credited back | card leaves Needs action; debit row stays as "Returned ✓" **and** a green credit row is added next cycle — bank-statement style, nothing deleted (F19). |
| `INFO_ONLY` | wrong-RVP, terminal | never money | info only; Pilot's recorded responses + optional "Add your side"; **no red, no minus signs** (F24). |

### 1c. Other L1/L2-shaping requirements

- **F9 (L360–366):** two option cards, each stating what can happen — Dispute shows **both
  endings** (₹0 if right / full ₹ if wrong); Accept states process + confirmation promise.
  **Silence consequence printed on-screen.** Copy never promises a waiver, never shows odds or Y%.
- **F7 (L338–348):** acted-on cases stay visible with a *Decision pending* chip + **3-step
  tracker** (raised → your reason → decision expected). Closed strip keeps no-money outcomes
  visible. **Tracker for accepted cases says "decision before your payout" — no dated reply
  promise.**
- **F10 (L379–382):** voice-out button on **every** explanation block (TTS in app language). P0.
- **F18 (L454–460):** LiF — recovery card in Needs action: *"₹X already cut — return to your
  hub by \<date\> to get it back"* + a live row in Debits, from day 0.
- **F22 (L483–491):** every debited item carries a **payment pointer** — exact payout date +
  section + line: claims → **Adjustments · "Shipment Loss for Junk/Mismatch"**; LiF →
  **Deductions · "Lost Shipments"**. Pointer text is real data, not hardcoded; mappings are config.
- **F27 (L529–531):** deep-link — tapping a loss deduction line in Payment Details opens the
  matching case at line-item level. Reverse of the F22 pointer. **In V1.**
- **F23:** history kept 3 months in-app.
- **NFR-2:** thumbnails lazy-load, **full image on tap**.

---

## 2. Current-state audit — what the prototype actually renders

All nine L1 variants are produced by one generic shell (`components/detail/DetailScreen.jsx`)
fed by a ~90-line `if / else if` chain in `computeViewModel()` (`useLossesApp.js`).

| Screen id | Reached from | Banner | Evidence | Blocks | Actions | Tracker | Footer |
|---|---|---|---|---|---|---|---|
| `detail` | Needs-action row | amber · "{₹} loss marked to you · right action in {n} days might prevent it" | yes (per item `photos`) | What happened | Accept + Dispute | — | "You can dispute only once." |
| `cooloff` | dev nav / `coolOff` prop | amber · "₹120 loss marked to you · act in 6 days" *(hardcoded)* | yes | — | Accept + **Dispute locked** | — | "If you do nothing for 6 days, full ₹120 will be deducted." |
| `pending` | Decision-pending row | blue · dated reply promise | yes | What happened | — | **3-step** | "You will be told here." |
| `review` | after Dispute submit | blue · "Dispute under review · reply by 19 Aug" *(hardcoded)* | **no** | ₹ + Your reason | — | **no** | "You will get the answer here." |
| `won` | dev nav | green · "✓ You were right — ₹0 deducted" | no | What happened + Keep it up | — | — | "This case is closed." |
| `accepted` | after Accept submit | blue · "Accepted · {₹} · we will confirm before your payout" | no | What happens now + Your reason | — | — | "This case is closed…" |
| `cdetail` | Decisions row | green · `c.banner` | no | What happened + What the team decided | — | — | `c.foot` |
| `wdetail` | Wrong-Pickups row | blue · "This is for your information. No money is deducted." | yes (own + catalog) | What happened + Your answers that day | **Add your side** | — | "Repeated wrong pickups may be reviewed by your hub." |
| `lost` | Shipment-Lost row | amber · "Parcel not delivered, not returned. Find it by 20 Aug or ₹40 will be deducted." *(hardcoded)* | no | What happened + What to do (highlighted) | — | — | — |

### L2 sub-flows today

| Sub-flow | Where | State |
|---|---|---|
| Accept sheet | `ReasonSheetScreen` (`isAccept`) | Built: process banner, 4 chips, note (required on "Other"), "Next time" tip, Confirm accept → `accepted` |
| Dispute sheet | `ReasonSheetScreen` (`isDispute`) | Built: 4 chips, note, amber **both-endings** warning, Send dispute → `review` |
| Add your side | inline in `wdetail` | Built: textarea + Submit → "Saved ✓" |
| 3-step tracker | `StatusTracker`, only on `pending` | Built, but copy violates F7 (see G6) |
| Evidence viewer | — | **Missing.** Hint says "Tap a photo to see it full size"; nothing opens. |
| Voice-out (सुनें) | `AudioChip`, on banners/blocks/tracker | **Stub** — `stopPropagation()` only, no TTS |
| Lost Shipments drill-down | Payment Details (payments surface) | Built: 4 AWBs + ₹255 total + "Got it" |

---

## 3. Gap register — prototype vs KRD

Severity: **S1** = breaks the KRD's money model or a P0 requirement · **S2** = structural/scalability
· **S3** = copy/polish.

| # | Sev | Gap | KRD ref |
|---|---|---|---|
| G1 | **S1** | **LiF money model is inverted.** Prototype: "Find it by 20 Aug or ₹40 **will be** deducted" (future). KRD: LiF is **already** auto-deducted day-0; the app's job is the remedy — "₹X already cut — return by \<date\> to get it back". No `RETURNED_CREDITED` state, no credit pairing, no recovery-card framing anywhere. | F18, F19, §6b L608–609 |
| G2 | **S1** | **`lost` screen renders the wrong record.** The branch reads `MARKED[2]` ("Pickup photo not clear") while the Shipment-Lost row is `MARKED[5]`; LiF-specific amounts (₹40 / 20 Aug) are hardcoded in the copy. So the LiF screen shows another loss's title, AWB and explanation. | — (implementation bug) |
| G3 | **S1** | **No payment pointer on any detail screen.** F22 requires every debited item to name its payout date + section + line. Additionally, since Debits was retired into Payment Details (CHANGE_SPEC_02 §1), **claims losses have no ledger surface at all** — Payment Details only carries LiF ("Lost Shipments"), not "Shipment Loss for Junk/Mismatch" in Adjustments. | F21, F22, §6b L621–625 |
| G4 | **S1** | **Silence consequence missing on the primary `detail` screen.** F9 requires it printed on-screen; today only `cooloff` states it. | F9 |
| G5 | **S1** | **Voice-out is a no-op** on a P0 requirement (every explanation block, TTS in app language). | F10 |
| G6 | **S2** | **Accepted-case tracker makes a dated promise** ("by 21 Aug · review can still stop the deduction"). KRD §6d lists this as a copy correction in flight: it must say **"decision before your payout"**, no date. | F7, §6d L689–691 |
| G7 | **S2** | **Type and state are conflated.** `lost` and `wdetail` are *reason-shaped* screens; `pending`/`review`/`won`/`accepted`/`cdetail`/`cooloff` are *state-shaped*. Adding reason #6 today means a new screen id, a new branch, a new dev-nav entry — the opposite of NFR-5's "grows to ~10 without redesign". | NFR-5 |
| G8 | **S2** | **Evidence set is per-item, not per reason code.** Data rows carry `photos: 'grid' \| 'pair' \| 'none'`; F8 mandates a reason-code → image-set mapping held as config. The mapping is currently duplicated into every mock row. | F8 |
| G9 | **S2** | **`review` and `pending` are two screens for one lifecycle state** (`IN_DISPUTE`) — and they disagree: `review` has no evidence and no tracker, `pending` has both. | §6b lifecycle |
| G10 | **S2** | **No `WAIVED`-by-auto-waive state.** `won` covers only "agent found you right". The SLA-breach ending ("our delay is never your cost") has no screen. | F16, NFR-6 |
| G11 | **S2** | **`NOT_DEDUCTED` (accepted-but-not-selected) has no state handling** — it exists only as a chip string on a mock CLOSED row. | F12, F7 |
| G12 | **S3** | **Hardcoded copy/amounts/dates inside branches:** `cooloff` ₹120 / 6 days (its own record says ₹75 / 3 days), `review` "19 Aug", `lost` ₹40 / "20 Aug". None derive from the record. | §6j "all config, no hardcoding" |
| G13 | **S3** | Wrong-RVP rows show a greyed ₹ amount + "Not deducted" chip. F24 says info-only, "no red, no minus signs" — greyed is defensible, but the money-adjacent treatment needs a design call. | F24 |
| G14 | **S3** | No evidence viewer (full image on tap). | NFR-2, F8 |

---

## 4. Proposed architecture

### 4a. The core move: two orthogonal axes

> **L1 detail = f(reasonCode, caseState).** Nothing else.

Everything the prototype currently branches on collapses into these two inputs:
- **Reason code** decides *what happened* → evidence set, explain copy, tip, money semantics,
  which remedies exist, which payment line it lands on.
- **Case state** decides *where it is* → banner tone + statement, which action block appears,
  whether a tracker shows, what the footer promises.

No screen is ever added for a new reason. A new reason is a **row in a registry**; a new state
is a **row in a state table**. This is what NFR-5 asks for, expressed as code.

### 4b. Reason registry (config — Business-owned per KRD 6f)

```js
{
  code: 'PICKUP_IMG_JUNK',            // KRD reason code (stable, never shown)
  feName: 'Pickup photo not clear',   // FE-facing name (vernacular pass applies)
  source: 'sx_claims_gold',           // sx_claims_gold | loss_engine
  money: 'debitable',                 // debitable | info_only | pre_deducted
  evidence: [                         // F8 mapping, per reason NOT per row
    { group: 'own',  count: 2, title: 'Your photos', note: 'Taken by you at pickup' }
  ],
  explain: 'Your pickup photo was not clear enough to check the item at QC.',
  tip: 'Take the photo in good light, with the label and the item both visible.',
  actions: ['accept', 'dispute'],     // info_only → ['add_side']; pre_deducted → ['return_remedy']
  remedy: null,                       // LiF: { kind: 'hub_return', windowDays: 7 }
  paymentLine: { section: 'Adjustments', label: 'Shipment Loss for Junk/Mismatch' }
}
```

Registry rows for the five canonical reasons (LiF differs on three fields — `money`,
`actions`, `remedy` — which is exactly why it stops needing its own screen):

| code | money | evidence | actions | remedy |
|---|---|---|---|---|
| `ICUD_IMG_JUNK` | debitable | own × 2 | accept, dispute | — |
| `PICKUP_IMG_JUNK` | debitable | own × 2 | accept, dispute | — |
| `PICKUP_QC_MISMATCH` | debitable | own × 2 + qc × 2 | accept, dispute | — |
| `WRONG_RVP` | info_only | own × 1 + catalog × 1 | add_side | — |
| `LOST_IN_FIELD` | pre_deducted | none (tip block) | — | hub_return, 7d |

**Fallback (KRD L641):** unknown code → `feName` = raw reason string, generic tip, no-evidence
state, actions from `money`. Renders, logs a gap, never blocks the row.

### 4c. Case-state table

Each state declares presentation, not layout:

```js
{
  id: 'IN_DISPUTE',
  tone: 'progress',                    // risk | progress | resolved_good | resolved_neutral
  statement: ({r}) => `Dispute raised on ${r.actedOn} · we reply within ${r.slaDays} days`,
  actionBlock: 'none',                 // offers | offers_dispute_paused | add_side | recovery | none
  tracker: 'dispute',                  // dispute | accepted | null
  footer: 'awaiting_reply',
  showsPaymentPointer: false,
}
```

States: `ATTRIBUTED`, `OPEN_DISPUTE_PAUSED`, `IN_DISPUTE`, `ACCEPTED`, `DEBITED`, `WAIVED`,
`NOT_DEDUCTED`, `RETURNED_CREDITED`, `INFO_ONLY`. Definitions and rules per §1b.

### 4d. L1 slot template — the IA invariant

A fixed slot order, always in this sequence; each (reason, state) pair only decides whether a
slot fills and with what. This is what makes a new loss type land in a shape Pilots already know.

| # | Slot | Filled by | Skipped when |
|---|---|---|---|
| 1 | **Identity** — FE reason name + AWB | reason | never |
| 2 | **Status banner** — tone + money statement + voice-out | state | never |
| 3 | **Money** — credit pair (LiF returned) | reason `money` + state | every state but `RETURNED_CREDITED`. The payment pointer that used to fill this slot on `DEBITED` is now a sentence in the hero's guidance line — see decision 8 |
| 4 | **Evidence** — grouped photo sets | reason `evidence` | `evidence: none` → slot 5 carries the tip instead |
| 5 | **Explanation** — "What happened" (+ tip when no evidence, + case narrative) | reason `explain` / `tip`; narrative from record | never |
| 6 | **Progress** — 3-step tracker | state `tracker` | non-awaiting states |
| 7 | **Action block** — offers / paused / add-side / none | reason `actions` ∩ state `actionBlock` | terminal states |
| 8 | **Consequence footer** — closure statement (the silence consequence is the hero's job, see decision 4) | state `footer` | never |

**Decision 8 — the payment pointer is a sentence in the hero, not a section (16 Sep).** F22 asks a debited item to name its payout date, section and line. It did, in a slot-3 section headed "Where this money went" whose body was `In your 12 Aug payment · Adjustments → Shipment Loss for Junk/Mismatch` — a breadcrumb, and more precision than a Pilot on a doorstep can use. `DEBITED`'s guidance line now says it as a sentence and names the tab instead: *"See this deduction in your 12 Aug payment, under Payments."* It replaced *"Nothing more will be deducted for this."*, which was true but spent the page's one actionable line on reassurance the chip (`Closed 12 Aug`) and the statement (`Deducted — …`) had already given. **Open question:** the section and line are no longer stated anywhere on the loss page. The Payments tab shows them, and F27's deep-link would close the gap properly if it ever gets a target surface.

**Money at slot 3 (design call, 10 Sep).** It was originally specced at 6, below evidence and
explanation. Feedback moved it directly under the status banner: once the Pilot has read *what*
happened to their money, *where that money now sits* is the second-most-critical thing on the
page — ahead of the proof and the narrative. This is also the slot the old prototype was missing
entirely (G1, G3), and the one the KRD's reconciliation contract leans on hardest.

Note slot 5's tip carries a state gate as well as a reason one: it only appears when there is no
evidence to look at, the case isn't terminal, and slot 3 isn't already saying it better (with a
deadline). So slot 5 is *reason + state*, even though its main block is reason-driven.

### 4e. L2 sub-flow template

One sheet shell, parameterised by **intent**:

```js
{ intent: 'dispute',
  title: ({r}) => `Dispute — AWB ${r.awb}`,
  preamble: null,
  chips: DISPUTE_CHIPS, chipPrompt: 'Why is this not your mistake?',
  note: { optional: true, requiredWhen: 'Other' },
  consequence: { tone: 'risk', text: ({r}) => `One dispute only. Right → ₹0. Wrong → full ${r.amount}.` },
  submit: { label: 'Send dispute', to: 'IN_DISPUTE' } }
```

Intents: `accept`, `dispute`, `add_side`, and (new, for LiF) `return_remedy`. Cross-cutting L2
utilities that belong to the shell, not to any intent: **evidence viewer** (G14) and
**voice-out** (G5).

### 4f. Coverage matrix (reason × state)

`●` valid & should exist · `○` valid, **not built today** · `—` invalid by design

| | ATTRIB | COOL-OFF | IN_DISPUTE | ACCEPTED | DEBITED | WAIVED | NOT_DED | RETURNED | INFO |
|---|---|---|---|---|---|---|---|---|---|
| ICUD junk | ● | ● | ● | ● | ○ | ● | ○ | — | — |
| Pickup junk | ● | ● | ● | ● | ○ | ● | ○ | — | — |
| QC mismatch | ● | ● | ● | ● | ○ | ● | ○ | — | — |
| Wrong-RVP | — | — | — | — | — | — | — | — | ● |
| Lost in Field | ●(recovery) | — | — | — | ○ | — | — | ○ | — |

Reading: 3 debitable reasons share one column set; the two special reasons are special only in
*which columns are legal*, not in needing bespoke screens. **`DEBITED`, `NOT_DEDUCTED` and
`RETURNED_CREDITED` are unbuilt across the board** — and they are precisely the states that
carry money, which is why G3 matters.

### 4g. Visual rules (so a new reason can't invent a new language)

Tone is chosen by **money position**, never by severity or by reason:

| Tone | Means | Border / bg / text | Used by |
|---|---|---|---|
| `risk` | money at stake, action open | `#EFD9B0` / `#FFF4E5` / `#A05E03` | ATTRIBUTED, COOL-OFF, LiF recovery |
| `progress` | in flight, nothing cut yet | `#C6D6EE` / `#F6F9FE` / `#092D5E` | IN_DISPUTE, ACCEPTED, INFO_ONLY |
| `resolved_good` | no money lost | `#C7E3D0` / `#F3FAF5` / `#1B7F3B` | WAIVED, NOT_DEDUCTED, RETURNED_CREDITED |
| `resolved_neutral` | money cut, case closed | grey ramp (`--valmo-grey-*`) | DEBITED |

Chip taxonomy, one meaning each: **countdown** (amber, days left) · **state** (blue, "Decision
pending") · **outcome** (green, "₹0 deducted ✓") · **info** (grey, "Not deducted"). Red is
reserved for system errors — never for a loss (F24).

### 4h. Adding a new loss type — the payoff

1. Add a row to the reason registry (§4b) — code, FE name, money, evidence, explain, tip,
   actions, payment line.
2. Mark its legal states in the coverage matrix (§4f).
3. If it needs a remedy the app doesn't have yet, add one `remedy` kind + one L2 intent (§4e).
4. Nothing else. No new screen, no new branch, no new visual treatment, no dev-nav entry.

---

## 5. Open questions to settle before/while building this

Carried from KRD §6h plus ones this audit raises:

1. **Silence-consequence display (F9, KRD-open)** — exact on-screen treatment on the
   `ATTRIBUTED` detail. Needs a design call; blocks G4.
2. **Pre-payout confirmation (F13, KRD-open)** — firm requirement or not, channel, timing.
   Shapes the `ACCEPTED` footer and whether `NOT_DEDUCTED` gets a proactive surface.
3. **Claims-loss ledger surface** — with Debits retired into Payment Details, where does
   "Shipment Loss for Junk/Mismatch" (Adjustments) live, and does slot 6's pointer point at it?
   Prototype and KRD have diverged here; needs reconciling before G3 can be fixed.
4. **Badge / at-risk counting (F6, KRD-open)** — LiF and decision-pending excluded; affects the
   entry-point widget count the new 2-tab variant shows.
5. **Wrong-RVP money treatment (G13)** — keep the greyed ₹ + "Not deducted" chip, or drop
   amounts entirely per F24's "no minus signs"?
6. **Awareness overlay (KRD-open)** — in/out, copy, triggers. Currently built in the prototype.

---

## 6. Where the architecture now lives in code

| Concern | File |
|---|---|
| Reason registry (axis 1) | `react-prototype/src/config/lossReasons.js` |
| Case-state table (axis 2) | `react-prototype/src/config/caseStates.js` |
| The template (slot resolver) | `react-prototype/src/state/resolveCaseView.js` |
| The one L1 screen | `react-prototype/src/components/detail/CaseDetailScreen.jsx` |
| Slot 3 (money) | `react-prototype/src/components/detail/MoneyRemedyBlock.jsx` |
| Slot 7 (the choices themselves) | `react-prototype/src/components/common/ActionBar.jsx` |
| Review presets, one per state | `react-prototype/src/config/screenPresets.js` |
| Tone → palette | `react-prototype/src/components/common/InfoBanner.css` |

**To add a loss type:** one row in `lossReasons.js`. To review it in a given state: one row in
`screenPresets.js`. Nothing else — no screen, no branch, no CSS.

---

## 7. Implementation status (9 Sep 2026)

Every one of the 9 old hand-written detail screens is gone; there is now a single
`CaseDetailScreen` fed by `resolveCaseView()`. The ~100-line `if/else` chain in
`computeViewModel()` is deleted. All 14 review presets render with no console errors, verified
in headless Chrome.

### Gaps closed

| # | Gap | How |
|---|---|---|
| G1 | LiF money model inverted | Banner now reads "₹40 **already cut** · return the parcel to your hub by 20 Aug **to get it back**"; `MONEY.PRE_DEDUCTED` + a `hub_return` remedy drive the recovery flow. New `RETURNED_CREDITED` state pairs the debit with its credit. *(16 Sep: the separate "Get your ₹40 back" section in slot 3 is gone — it repeated the hero's guidance line verbatim. F18's instruction is in the hero; the claim is slot 7's `RecoveryActionCard`.)* |
| G2 | `lost` rendered the wrong record | Records are addressed by `caseRef {list, index}`; no branch can pick a different row than the one tapped. Amounts/dates come off the record. |
| G3 | No payment pointer | `DEBITED`'s hero guidance sends the Pilot to it: *"See this deduction in your 12 Aug payment, under Payments."* The Payments tab is built from the same case pool via the registry's `paymentLine` (`paymentBreakdown.js`), so the line really is there. *Stated, not linked* (see below). **Narrower than F22 as written** — the sentence names the payment, not the section and line within it; see decision 8. |
| G4 | Silence consequence missing | Carried by the hero on every state where silence costs money: `figure` + `chip` + `statement` say what's at stake, how long, and that it hasn't happened yet (decision 4). |
| G6 | Accepted tracker made a dated promise | Accepted-case step 3 is now "Decision before your payout / Review can still stop the deduction" — no date (KRD F7). |
| G7 | Type/state conflation | Replaced by the two axes. `lost` and `wdetail` no longer exist as screens. |
| G8 | Evidence set per-item | Now per reason code (`reason.evidence`), incl. the mismatch 2+2 grouping. |
| G9 | `review` + `pending` duplicated | Collapsed into `IN_DISPUTE` (decision 7). |
| G10 | No auto-waive outcome | `WAIVED` reads the record's `waiveReason`; `sla_breach` → "we did not reply in time" + "our delay is never your cost". |
| G11 | `NOT_DEDUCTED` unhandled | A real state with its own record and green tone. |
| G12 | Hardcoded copy/amounts | All statements are functions of the record. Cool-off is now an overlay on a real open case, so its ₹/days match the row. |

Two more found and fixed during verification: a stale "What to do — find the parcel"
instruction surviving onto closed/returned LiF cases, and the Decisions section total still
claiming "₹0 adjusted" once a DEBITED case existed (now "₹210 deducted").

### Still open

| # | Gap | Note |
|---|---|---|
| G3b | Pointer has no target | Deliberate (decision 6): F27's deep-link needs a payments-surface change. The pointer is stated as text; `pointer.linked = false` marks the seam. Claims losses still have no ledger surface of their own. |
| G5 | Voice-out is a no-op | `AudioChip` is on every explanation block per F10, but no TTS engine is wired. P0 for real delivery. |
| G14 | No evidence viewer | "Tap a photo to see it full size" still opens nothing (NFR-2 wants full image on tap). |
| G13 | Wrong-RVP shows a greyed ₹ | Unchanged by decision 5. |

### Still parked for PM

§5's open questions stand, most importantly: where the claims-loss ledger lives now that Debits
was folded into Payment Details, F6's badge-counting rules, and F13's pre-payout confirmation.

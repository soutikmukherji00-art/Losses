# Insights — Spec

Status: **in build**. Changelog at the bottom; append to it as things land.

## 1. Intent

The app currently tells a Pilot *what happened* to each loss, one loss at a
time. It never tells them what keeps happening, or what to do differently.
Insights add both:

- **Contextual insights** (Losses list) — "this keeps costing you; here is the
  habit that fixes it", shown where they are already looking at their losses.
- **Prevention** (loss detail) — every loss page gains a "how to avoid this
  next time" section, so a single case teaches as well as informs.
- **Historic insights** (Losses tab, split arrangement only) — the same
  patterns read over settled history rather than open cases, as a **ranked
  panel** rather than the banner. See § 3b.

All three are the same data seen at different scopes. That is the point: the
historic block is not a second engine, and the L1 section is not a second copy
deck.

## 2. One model, three surfaces

```
config/lossReasons.js   →  prevention: { chips, steps }     (per loss type)
        │
state/insights.js       →  buildInsights(cases, { scope })  →  Insight[]
        │
        ├── InsightBanner   (Losses list, above the filter chips)
        ├── InsightSheet    (tap-through detail)
        └── historic block  (Losses tab, split arrangement)
```

**`Insight`**

| field | meaning |
|---|---|
| `id` | the loss-type group id (reuses `remedyGroups.js`, so merges hold) |
| `label` | the loss type's own name — "Photo not clear" |
| `count` / `amount` | how many, and what they cost |
| `rows` | the cases behind it, as standard `ListRow` rows |
| `noun` | the type as a sentence subject — "Captain QC Mismatch" (see `insightNoun`) |
| `costsMoney` | false on an info-only type (wrong pickups). The banner then reads "**can** cost you ₹X" — the Pilot was never charged, so the figure is exposure, not a bill |
| `habits` / `steps` | from the reason's `prevention` block |

**Why grouped by `remedyGroups`:** the merge already decided that a pickup
photo and a delivery photo are one problem with one fix. An insight about
"unclear photos" must not split into two weaker insights for the same habit.

**Scope** is the only thing that differs per surface: `active` (open cases),
`historic` (settled), `all`. Same builder, same shape — which is what makes
the later global-insights work a call with a different scope, not a rewrite.

**`amount` vs `deducted`** (added 16 Sep). An insight carries both: `amount`
is what its cases were *charged*, `deducted` is what actually left the Pilot
and stayed gone. They differ by every case waived, never deducted, or credited
back. The active banner states `amount` — nothing has moved there, and what is
at stake is the point. Anything retrospective states `deducted`, because
"cost you" about money that came back is a lie.

**The contextual banner uses `all`, not `active`** (decided in build). "This
keeps happening to you" is a claim about a track record, and the handful of
open cases can never carry it — against the current fixture, `active` yields
no insights at all because no type reaches three open cases. Historic uses
`historic`.

**`insightNoun`** (added in build): a loss type's `label` heads a list group
("Photo not clear") and will not go inside a sentence — "Photo not clear have
cost you ₹517". Each reason now carries a plural noun phrase for sentence use
("unclear photos"), and a merged group carries its own.

### Thresholds and ranking

A loss type becomes an insight at **3+ cases** in scope (config:
`INSIGHT_MIN_CASES`). Against today's fixture that yields three, and correctly
stays silent on wrong pickups (1 case):

| group | cases | ₹ |
|---|---|---|
| Photo not clear | 5 | 517 |
| Captain rejected the QC | 4 | 570 |
| Shipment Lost | 3 | 280 |
| Wrong parcel picked up | 1 | — below threshold |

Ranked by **money, not frequency**. "A lot of losses" is how a Pilot describes
the problem, but what they want back is the money, and the two disagree here —
QC mismatch costs most while unclear photos happen most.

## 3. Contextual insights — the banner

Sits **above the filter chip row** on the Losses list. Not on the Historic
tab any more — see § 3b.

```
┌──────────────────────────────────────────────────┐
│ 💡  Captain QC Mismatch cost you ₹715            │
│     Next time: open the list · match items  More │
└──────────────────────────────────────────────────┘
              · · ▬     ← dots, outside the tint
```

**Two lines, 65px** — about one list row, and that is the whole design
constraint. The block sits on top of the Needs-action list a Pilot opened the
screen for, so anything it takes is a loss they have to scroll to reach. Every
decision below is downstream of that.

**Claim:** `{loss type} cost you ₹{amount}`. The money carries the brand face
and bold weight, the same device My Earnings gives the one fact a Pilot scans
for.

**No loss count, anywhere in the banner.** It is the fact a Pilot acts on
least, the claim reads in one line without it, and the sheet states it
("₹715 across 5 losses") the moment they tap through.

**Remedy:** `Next time: {habit} · {habit}` + a `More` link. One line, always.

**The habits carry the weight, not the words framing them** — primary ink at
medium against a tertiary label and separator. This line is the only thing on
the banner a Pilot can act on, and in the first build it was the quietest thing
on it. Contrast: claim 12.85:1, habits 14:1, label 5.33:1, link 12.85:1.

**No trailing chevron.** It cost 28px of the text column and said what the
tinted ground and the link already say. Shortening "View more" to "More" freed
another ~31px, and together that is what takes the remedy budget from 207px to
**266px** — the difference between one habit and two.

### The fit budget

The remedy line has **262px**. Both habits fit on every reason, measured in the
banner's own typography (inside the scaled phone frame — measuring against the
page gives readings ~25% high):

| Reason | Habits on the banner | Needs | Spare |
|---|---|---|---|
| Photo not clear *(merged)* | `light the parcel · hold phone still` | 243px | 19 |
| QC mismatch | `open pickup list · match parcel` | 235px | 27 |
| Lost in field | `count at handover · bag by route` | 246px | 16 |
| Wrong pickup | `check seller name · match parcel` | ~242px | 20 |

The banner still **measures** rather than trusting that table, because NFR-5
lets the reason list grow to ~10 without redesign: a future habit pair too wide
drops to one rather than wrapping or truncating. `More` sits outside the
measured span and is `flex: none`, so it survives either way, and its gap is
`--gap-stack` rather than the tighter middot so it reads as a separate thing
and not the last item in the list.

The measurement is taken again on `document.fonts.ready` — the first paint
happens in the fallback face, which is wider, so without that re-measure which
habits a Pilot sees would depend on how fast the font loaded.

### Habit copy rules

Every habit was audited against one test: **does it name enough to act on?**
"open the list" fails it — which list? — and "match items" fails it twice.

- **Drop articles, keep qualifiers.** "open the list" → `open pickup list`.
  The article costs 4 characters and carries nothing; the qualifier costs 7 and
  carries the whole meaning.
- **The pair is the unit.** A habit may lean on the one before it: `match
  parcel` needs no "to the list" because `open pickup list` just named it.
- **Name the object, not the quality.** "good light" → `light the parcel`;
  "hold steady" → `hold phone still`.
- Lower case, no terminal punctuation, most-useful first — the second one only
  shows when it fits.

### Shared rules

`steps` — what the sheet and the loss page render under "Next time" — stay
full imperative sentences.

**A merged group carries its own `prevention`, never a member's.** The photo
merge used to take whichever member came first out of the pool, so an insight
covering both photo types handed out `show full label` — the pickup fix, which
means nothing at a doorstep. The merge decided these are one problem with one
fix; `remedyGroups.js` now writes that fix down. The loss detail page is
unaffected: it is about one case, so it keeps its own reason's advice.

**No dots.** They used to sit outside the tint, indexing the whole set. The
rolling banner is a scrolling ROW now, and the part-visible next card already
says the row continues — the dots were a second, weaker statement of the same
fact, costing 18px of height on a surface whose whole design constraint is
height. Back to 65px with the row.

Tinted, not white — it is advice, not another loss. `--surface-raised` / info
tone, no new colour.

**Tap → `InsightSheet`**, reusing `BottomSheet`: the headline, "₹715 across 5
losses", the prevention steps in full under "Next time", then the cases
themselves as `ListRow`s so a Pilot can go straight to any of them.

### Banner mode (config)

- `rolling` — **the default.** A horizontal scroll row: the top 3 issues by
  money, one card per issue, each ~88% of the screen so ~20px of the next one
  shows past the right edge. The Pilot swipes or drags it (a mouse drags too —
  the pointer is captured only once the gesture passes a 6px slop, so a plain
  tap still opens the sheet), and it advances itself every **7s**, pausing
  while a pointer is down. Cards snap to the page gutter.
- `single` — the top-ranked insight only, full width.

**Always three cards.** `buildInsights(..., { topN: INSIGHT_BANNER_COUNT })`
caps the row at 3 and tops it up from below the 3-case pattern threshold when
fewer than 3 patterns qualify, so the row never changes length. The threshold
decides which three get in; money alone decides the order they read in.

**Why ~88% and not 80%.** The card's chrome (mark, gaps, padding, the "More"
action) is a fixed 116px and the longest claim in the registry wants 189px, so
the claim holds its single line only while the card is wider than ~305px — at
the 360px frame that caps the peek at 30px. Below that the banner grows a
third line, 62px to 82px, which costs more than the peek is worth.

## 3b. Historic insights — the break-up sheet

*(Added 16 Sep. This surface rendered `InsightBanner` at `historic` scope,
then a ranked section, then that section merged into the summary card. It is
now a bottom sheet behind a one-line control on the card.)*

The banner was the right component in the wrong room. Its job is a nudge —
"this keeps happening, here is the habit that fixes it" — which works on the
active list because everything under it is still actionable. On a tab of
settled losses nothing is, so the same words read as advice about a decision
already made. And nothing in them said what period the money covered: ₹384
could be this week or this year.

Looking back, the question is not "what should I fix next" but "where has my
money actually gone" — which makes **ranking** the insight, not the single
costliest pattern.

The card keeps the money and one line naming what is behind it; the ranking
lives in `HistoricBreakupSheet`:

```
┌──────────────────────────────────────────────────┐     ╔════════════════════════════════════╗
│ 🕐  Since July · 9 losses                         │     ║ What the ₹306 went on          ✕   ║
│──────────────────────────────────────────────────│     ║ 9 losses since July                ║
│ Deducted from your earnings                      │     ║────────────────────────────────────║
│ ₹306  ₹̶9̶7̶0̶                                       │     ║ Captain rejected the QC ₹210 ₹̶3̶8̶4̶> ║
│ ₹664 was waived, never deducted, or returned.    │     ║ 3 losses · 69%                     ║
│ ·················································│  →  ║ Photo not clear         ₹96 ₹̶3̶4̶6̶ > ║
│ From 4 kinds of loss          View break-up      │     ║ 3 losses · 31%                     ║
└──────────────────────────────────────────────────┘     ║ Shipment Lost            ₹0 ₹̶2̶4̶0̶ > ║
                                                          ║ 2 losses                           ║
                                                          ║ Wrong parcel picked up       ₹0  > ║
                                                          ║ 1 loss                             ║
                                                          ║────────────────────────────────────║
                                                          ║ Deducted                      ₹306 ║
                                                          ╚════════════════════════════════════╝
```

**Why a sheet.** The card is the first thing on the tab, so every row it
carries is a loss the Pilot has to scroll past to reach their own history. The
ranking cost four rows there — and a top-two ranking is the one shape that
cannot add up to the figure above it. Out of the card, the list stops being a
highlight reel and becomes an audit that reconciles.

**No threshold in the sheet.** `INSIGHT_MIN_CASES` protects the banner's
two-line budget; a break-up that quietly dropped a kind of loss would not sum
to its own total, which is the one thing this surface owes. The sheet calls
`buildInsights` with `minCases: 1`.

**The zero rows are the point** as much as the costly ones. "₹0" against a
struck charge is the app's existing grammar for money that was at stake and
stayed with the Pilot — the same device the list rows and the loss hero use —
so a kind of loss that cost nothing says so at a glance with no new vocabulary.
A kind that was *never charged* (informational) shows a bare ₹0 with no strike,
which is why insights carry `charged` as well as `amount`: counting an
informational loss as charged would invent a debt.

**The trigger line** — "From 4 kinds of loss · View break-up" — is the
`CurrentCycleCard` foot pattern (a claim on the figure, plus the link to it),
so the two money cards behave the same way one tab apart. It hides itself at
one kind of loss, where the figure above is already the whole story.

**Tapping a row replaces the sheet** with that type's `InsightSheet` rather
than stacking on it; two sheets deep is a place a Pilot cannot leave with one
Back.

**The layer toggles the whole card** (`losses-tab.summaryCard`), and with the
card gone the sheet has no way in — correctly, since it is a break-up of the
card's figure.

- **Every kind**, ranked by `deducted`, not `amount` — a loss type whose cases
  were all waived cost the Pilot nothing and cannot lead a list headed "what
  the ₹306 went on", but it still appears, at ₹0.
- **Shares** are of everything deducted in the period, and only on the rows
  that deducted something. The basis is the card's own figure, named in the
  sheet's title.
- **No "Next time" line.** The remedy still exists, one tap away in the same
  sheet the banner opens. A Pilot who has decided they want to fix something
  goes there; a Pilot looking back is not being asked to act.
- **The sheet states `deducted` too** when opened from here. The panel row and
  the sheet it opens must show the same number — that disagreement is exactly
  what changelog #14 was.
- **"What the ₹306 went on"**, not "Where it went" — the total is named rather
  than pronouned, so the title works as the sheet's own subject.
- Ordinary sheet language, not the banner's tint. The banner is tinted because
  it interrupts a working list with something the Pilot did not come for; a
  Pilot who tapped through *asked* for this.

`INSIGHT_MIN_CASES` still governs the active banner, where the budget it
protects is real.

## 4. Prevention on the loss detail page

A sub-group of slot 5 ("What happened"), headed **"Next time"** — the same
word the accept sheet uses for the same advice (KRD F7), so one deck reads
under one heading everywhere it appears.

*(Revised 16 Sep. It shipped as its own section, "How to avoid this next
time", placed after the action block as slot 8. Given its own white block and
its own heading it announced itself as a second topic, when it is the same
topic's last sentence: this is what happened, and this is how it doesn't
happen again. The heading was also the only six-word one on a page whose
others are "What happened" / "What you did". Slot 8 is gone; the footer keeps
slot 9.)*

Rendered as a numbered list, because these are steps performed in an order —
not a set of unrelated tips. The chips are deliberately NOT repeated here:
L1 has room for the full steps, and the chips are the same advice compressed.

It **replaces the ad-hoc tip promotion** in `resolveCaseView` — the three-way
condition plus the `hidesCoachingTip` flag exist only because a one-line tip
had nowhere of its own to live. With a real section, the tip's home is obvious
and those branches go.

Suppressed on `WAIVED` / `NOT_DEDUCTED` via a state flag: telling a Pilot how
to do better on a case we just agreed was not their fault is an accusation.

The accept sheet's "Next time" line stays as-is (KRD F7).

## 5. Config surface

| Control | Where | Options |
|---|---|---|
| Contextual insights | **Layer** on the Losses list | on / off |
| Historic insights | **Layer** on the Losses tab, split arrangement only | on / off |
| Insight banner mode | Sectional variant | `rolling` (default) · `single` |

On/off uses the **Layers** mechanism rather than new variant flags — this is
exactly the case Layers was built for ("a banner on the list page I can switch
on and off"), and a Layer that only mounts on one surface gives the "only in
the split arrangement" gating for free. Banner mode is a real design variant,
so it is a Sectional variant.

## 6. Copy rules

Matches the surrounding app: plain, second person, no exclamation, no praise,
no blame. States a number and a habit.

- Banner claim: `"{Loss type} cost you ₹{amount}"`, the amount in the brand
  face. Note **"cost"**, not "costed" — "cost" is its own past tense, and this
  copy is the base every app language is translated from.
- Banner remedy: `"Next time: {habit} · {habit}"` + a "More" link. The habits
  are the emphasised part of the line, not the label.
- Habits: 2–3 words, lower case, written to complete that sentence — "better
  light", "holding steady", "one bag per route". The habit, never the failure.
- Steps (sheet and loss page): full imperative sentences, one action each,
  physical and checkable.
- Steps: one action per line, physical and checkable ("Stand where the light
  falls on the parcel"), never abstract ("be careful").

---

## Changelog

| # | Change | Status |
|---|---|---|
| 1 | Spec written | done |
| 2 | `prevention: { chips, steps }` added to every reason + fallback (`lossReasons.js`) | done |
| 3 | `insightNoun` added per reason and per merged group — labels don't fit in sentences | done |
| 4 | `state/insights.js` — one builder, three scopes, grouped by `remedyGroups`, ranked by money | done |
| 5 | Contextual banner + rolling mode + detail sheet; Layer toggle, banner-mode sectional variant | done |
| 6 | Historic insights block reuses the same banner at `historic` scope | done |
| 7 | Banner capped to 2 chips — a third wrapped and made it taller than a list row | done |
| 8 | L1 prevention block, replacing the ad-hoc tip promotion — now a "Next time" sub-group inside What happened (see § 4) | done |
| 9 | Removed the whole `tip` field from `resolveCaseView` plus the `showsCoachingTip` / `hidesCoachingTip` state flags — the new section covers every case they did. Accept sheet's "Next time" (KRD F7) untouched | done |
| 10 | Prevention suppressed on `WAIVED` / `NOT_DEDUCTED` via `hidesPrevention` | done |
| 11 | Banner redesigned: lightbulb mark, byline, habits as bullets instead of chips, amount in the brand face; spacing regrouped so headline / (byline + habits) is one step and the gaps inside the block are hairlines. Accepts the height cost over the 2-line rule — see § 3 | done |
| 12 | `prevention.chips` → `prevention.habits`, and the copy rewritten imperative ("Good lighting" → "Stand in the light"). Nothing renders a chip any more, so the field no longer claims to | done |
| 13 | `chip--insight` variant deleted — its only consumer was the banner | done |
| 14 | **Bug:** the historic banner's sheet showed all-scope numbers. `insightOpen` held an id only, and both scopes emit the same group ids, so `₹384 across 3 losses` opened a sheet reading `₹715 across 5`. It now carries `{ id, scope }` | done |
| 15 | Banner restructured to the requested format: claim in the heading (type · money · count), remedy inline in the byline with an "and N more" link, arrow top-aligned, rolling dots moved outside the tint | done |
| 16 | Lightbulb mark dropped — 28px of a 328px row, and the difference between a one-line claim and a wrapped one | done |
| 17 | Habits rewritten to complete "Next time try …" — gerund/noun phrases, lower case, shorter ("Stand in the light" → "better light") | done |
| 18 | Byline pinned to two lines: habit sentences vary by loss type, and a rolling banner that resized every 5s moved the Needs-action list under the Pilot's thumb | done |
| 19 | Lightbulb mark restored. It costs 28px of the text column, which is why the claim now has three layouts instead of one | done |
| 20 | `config/insightLayouts.js` + **Insight layout** control: Compact (default, 65px), Ledger (65px), Stacked (83px). All three carry icon · type · money · count · remedy | done |
| 21 | Remedy line rewritten to fit one line in every layout and every loss type — "Next time try X, Y and 1 more" → "From 5 losses · try X +2". Habit count per layout (`HABITS_SHOWN`) is what holds the line, so the block never resizes as the banner rolls | done |
| 22 | Settled on Compact; the **Insight layout** variant and `config/insightLayouts.js` removed. Ledger and Stacked are recorded in this changelog's history, not in the code | done |
| 23 | Loss count dropped from the banner entirely — claim is `{type} cost you ₹{amount}`, remedy is `Next time: {habit} · {habit}  View more`. Back to 65px, one list row | done |
| 24 | Second habit is measured against the real line budget rather than assumed, and re-measured on `document.fonts.ready` — the fallback face is wider, so a first-paint-only check made the copy depend on font load order | done |
| 25 | Trailing chevron removed and "View more" shortened to "More" — together ~59px, which takes the remedy budget from 207px to 266px and shows both habits on every reason instead of one | done |
| 26 | Habits emphasised: primary ink at medium, label and separator dropped to tertiary. The only actionable line on the banner had been its quietest | done |
| 27 | `one bag per route` → `bag by route`; at 275px against a 266px budget it was the single pair that still missed | done |
| 28 | Full copy audit of every habit — "does it name enough to act on?". `open the list` → `open pickup list`, `match items` → `match parcel`, `good light` → `light the parcel`, `hold steady` → `hold phone still`, `check the seller` → `check seller name`, `ask if unsure` → `ask hub captain`, `return same day` → `bring back same day`. Steps tightened where they were verbose | done |
| 29 | **Bug:** the merged photo group borrowed its `prevention` from whichever member reason came first out of the pool, so "unclear photos" told a delivery-photo Pilot to `show full label`. Merged groups now carry their own block and `buildInsights` prefers it | done |
| 30 | Historic tab: `InsightBanner` replaced by a ranked top-3 stating what each loss type actually **deducted** and its share of the period's total. The banner's nudge framing read as advice about decisions already made, and never named the period — see § 3b | done |
| 32 | The ranked block merged into the summary card as `HistoricBreakdown`, dropping the caption that restated the card's total | done |
| 33 | The layer moved out to wrap the whole card (`losses-tab.summaryCard`, "Summary card (Losses tab)"). Toggling half of one claim was not a variant worth reviewing; `HISTORIC_INSIGHTS_LAYER` retired from `layerIds.js` with its last cross-file reader | done |
| 34 | The ranking moved out of the card into `HistoricBreakupSheet`, behind a "From N kinds of loss · View break-up" line. The card drops from ~330px to 209px and the first loss row clears the fold; the sheet gains what the card could not hold — every kind of loss, and a total that reconciles | done |
| 35 | `buildInsights` takes `minCases` so the sheet can ask for all of them, and carries `charged` (informational cases excluded) so a ₹0 row can strike the stake that never left | done |
| 31 | `deducted` added to every insight beside `amount`, so a retrospective surface can state what money actually left rather than what was charged. The historic sheet states it too, so the panel row and the sheet it opens agree (cf. #14) | done |

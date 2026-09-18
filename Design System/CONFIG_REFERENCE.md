# Config Reference

The single, human-readable index of every presenter-controlled config in the
`react-prototype` app: what it's called, what it does, where it lives in
code, and how to add to it. If you add a new variant, prop, preset, or
layer — **add a row here in the same change.** This file is documentation,
not a spec to keep in sync by memory: if it disagrees with the code, the
code is right and this file is stale — fix whichever one is wrong.

All controls below render in the right-hand panel (`ControlPanel`), defined
in `src/app/presenterSections.js`. That file is the only place that connects
the generic `presenter/` folder to this app's specific screens and state —
see its own header comment.

**Controls carry a name and nothing else.** There are no bylines under them
(the `hint` prop is gone from `Toggle`, `Select` and `ActionButtons`) — what a
control does is documented next to it in `presenterSections.js` and in this
file. The one line of small grey type left in the panel is the Layers
section's "No togglable layers on this screen", which is that section's
content rather than an annotation on a control. Four control types exist today — `select`,
`segmented`, `toggle`, `actions` (a row of buttons), plus the self-feeding
`layers` — and adding a fifth is one file in `presenter/controls/` and one
line in `ControlPanel.jsx`'s `CONTROL_TYPES`.

---

## 0a. Shared patterns — reach for these before writing markup

A pattern audit found the same things re-implemented across screens, and the
cause was always the same: **the pattern existed but wasn't reachable as a
component**, so the next screen invented its own. The status badge was a
bespoke `<div>` inside `ListRow`, coloured by inline styles from a raw-hex map
in a *state* file — so a new screen literally could not reuse it, and wrote
green text instead. Before adding markup, check this table.

| Need | Use | Not |
|---|---|---|
| A loss row (photo · reason · AWB · clock · amount · chevron) | `ListRow` — what it shows is a config, not a prop; see § Line item design | hand-rolled flex rows |
| A status badge | `Chip variant="status" kind="…"` | coloured text, bespoke pills |
| Any other pill | `Chip variant="filter\|reason\|utility"` | — |
| A white block on the grey ground | `Section` | `__card` / `__wrap` divs |
| A label/value line inside one | `SectionRow` (`strong` for totals) | bespoke rows |
| A list group heading with a total | `SectionHeader` | — |
| A primary/secondary CTA | `Button` (via `ActionBar` for sticky footers) | per-screen button CSS |
| A pushed screen's back+title bar | `ScreenHeader` | per-screen header CSS |
| A tinted advisory block | `InfoBanner` / `AlertPill` | bespoke notice divs |
| A dimmed overlay | `BottomSheet` (pass `title`/`subtitle`/`onClose` for its head) | hardcoded rgba, per-sheet heads |
| A photo at full size | `ImageViewer` — hand any tappable image `vm.openPhoto({ src, label, group })` | a second lightbox, or a bigger thumbnail |
| A toggle-able section | `Layer` (§ Layer visibility) | — |

**Two rules that keep it that way:**

1. **Components take names, never colours.** `ListRow` asks `Chip` for a
   `kind` and its amount for a `tone`; the view model says what a row *means*
   and CSS decides what that looks like. A `style={{ color }}` crossing from
   the state layer into a component is the smell that started this.
2. **No hex in component CSS** — `styles/tokens.css` says so at the top. If a
   value isn't in there, add it there, don't inline it.

The badge vocabulary itself (the five `kind`s, and the four text shapes) is
defined in `config/caseStates.js`. Adding a sixth colour to that palette
should feel hard; that's deliberate.

### Bucket names (`config/lossBuckets.js`)

What each group of losses is called, in one place, keyed by bucket id.

| id | Name |
|---|---|
| `needsAction` | **Needs Decision** |
| `pending` | **Disputes in Review** |
| `closed` | **Past Losses** |
| `wrong` | **Wrong Pickups** |

A bucket name appears on five surfaces — the sectioned list's section heads,
the filter chips above them, the Unified layout's summary cards, the cycle
sheet's group heads, and the lifecycle label a case carries on its own page.
Before this file the same words were typed into `caseStates.js`,
`useLossesApp.js`, `LossesBody.jsx` and both data fixtures, and had already
drifted: the section head read "Wrong Pickups" while the summary card beside
it read "Wrong pickups". The fixtures still carry a `label` on each filter
chip, but only "All" is read from it now — a chip resolves its name by id.

The names say what the Pilot has to do, or what has already happened, never
what our system calls the state. **Disputes in Review** says whose turn it
is, which the older "Decision pending" left open — the one thing a Pilot
waiting on us needs to be sure of — and it names the thing in the group
rather than the state those things are in, as the other three do. **Past Losses** describes what the group
*is*; "Decisions" named the event that closed the case and read as a place to
go and decide something.

## 0. How the prototype holds a case

Worth reading first, because it is what makes the thing walkable.

The active dataset (`src/data/activeDataset.js` — Mock or Live, § 8 below)
still keeps its three fixture lists (`marked` / `wrong` /
`closed`), but **they are not the app's structure** — they are seed data for
one flat pool of cases (`src/state/caseStore.js`), and every bucket the Pilot
sees is a filter over that pool by the case's current `caseState`
(`SECTION_OF_STATE` in `useLossesApp.js`). The three lists are already
exactly predicted by state (marked = open / in-flight, wrong = `INFO_ONLY`,
closed = terminal), so flattening them changed no bucket.

That means acting on a loss **really moves it**: accept a case and it leaves
"Needs Decision" for "Disputes in Review", in the list, in the tab count,
in the summary totals — because all of those read the same pool. Previously the new
state was written onto the *pointer* to the case, so it looked right on the
detail page and vanished the moment you went back.

Two consequences worth knowing:

- **Nothing persists.** The pool is seeded into React state at mount, so a
  browser refresh — or **Reset Data** in the panel's Session section —
  restores the active dataset's fixtures exactly. A demo always starts from
  the same place.
- **Presets show real state.** `screenPresets.js` addresses cases as a
  pointer into the fixture (`{ list: 'marked', index: 2 }`), resolved to a
  case id on the jump. Once you have accepted "Loss · needs action", that
  preset's label no longer describes what you'll see. Reset puts it back.

Per-case facts live on the case, not in UI state — the Pilot's "add your
side" note and the Lost-in-Field return claim included, so they neither leak
onto the next case nor vanish when you leave the page.

---

## 1. Global variants

Reshape the whole app (tab structure, app-wide flow policy). State lives in
`src/state/useLossesApp.js` (`initialState`), each with a `setXVariant`
action wired into `presenterSections.js` under **Global variants**.

| Name | Values | State key | What it changes | Where it's read |
|---|---|---|---|---|
| Losses as a Tab | on (default) · off | `lossesTab` | Is there a Losses segment beside My Earnings and Payments? | `useLossesApp.js` (`onLossesTab`, `inShell`, `earningsSegs`) |
| Loss entry point in My Earnings | on (default) · off | `earningsEntry` | Is there an entry widget on the My Earnings tab? | `MyEarningsTabContent.jsx`, `lossesEntryPoint` |
| Historic losses | `hidden` (default) · `subtab` · `own-tab` | `historicPlacement` | **Where** the ledger lives — not whether. `own-tab` is the arrangement where the tab IS the ledger and the working list moves to its own page. **`hidden` is the baseline** — the working list is the whole losses area, and it is the one placement valid at every point of the other two axes, so the default arrangement never gets rewritten underneath you the way `own-tab` falls back to `subtab` when a door is shut. See § The Losses surface below. | `useLossesApp.js` (`onLossesList`, `onHistoric`, `showLossesSubTabs`) |
| Grace period (first weeks free) | off (default) · on | `gracePeriod` | A loss raised inside a new Pilot's first `weeks` weeks settles at ₹0 instead of being deducted. **Nothing else on any screen changes** — the window is never announced. See § The grace window below. | `useLossesApp.js` (`resolveGrace` → `applyGrace`, one rewrite on the pool) |
| Flow | `dispute-only` (default) · `accept-dispute` | `flowVariant` | **Only Dispute** hides every accept-related affordance app-wide: the Accept CTA in the case detail bottom bar and the accept sheet becomes unreachable. Dispute becomes the *primary* CTA in the bottom bar whenever Accept isn't offered (whether because of this variant, or because a reason simply never offered accept). | `resolveCaseView.js` (`buildAction`, via `ctx.onlyDispute` → `action.canAccept`) and `CaseDetailScreen.jsx` (`actionButtons`, which derives Dispute's variant from `action.canAccept`) |

### The grace window (`config/gracePeriod.js`, `state/grace.js`)

The app's second account-level policy — the first is the dispute cool-off —
and the only variant that changes **money** rather than shape or copy.

**The rule.** For `GRACE_PERIOD.weeks` weeks from the day a Pilot joined
(`pilot.joinedOn` on the fixture), a loss raised inside the window is not
deducted. After it closes the normal rule resumes.

`weeks` is a **placeholder**, the same standing as X and T in
`disputeCoolOff.js`. Four weeks is what the brief named.

**It is never announced, and that is the design.** The Pilot is not told about
the window in advance — not on the losses list, not on My Earnings, not on an
open loss, not in the payment. A new Pilot who reads "your first four weeks
are free" has been handed a reason to ignore every loss in those four weeks,
which are exactly the four weeks the window exists to let them learn in. So an
open loss under grace is **indistinguishable** from one without it: same
amount at stake, same countdown, same warm tone, same section totals, same
cycle card, same entry banner. They behave as they will have to behave from
week five.

The window shows up **once**, on a loss that has settled, as money returned
with a sentence saying why — the moment it teaches the rule instead of
undermining it.

**Where it is applied.** `computeViewModel` resolves the window and hands the
pool through `applyGrace` (`state/grace.js`), which makes exactly one rewrite:

| Case | Under the window |
|---|---|
| `DEBITED` raised inside the window | becomes **`GRACE_WAIVED`**, and loses its `debitDate` — a debit date is a claim about a payment the Pilot can go and look at |
| everything else | untouched. Attributed, accepted, in dispute and Lost in Field's recovery window are all still in play; a case only meets the lens when it settles |

`DEBITED` is the app's only state in which money has left and stayed gone, so
it is the whole of "the deducted amounts". Nothing downstream needed changing:
`GRACE_WAIVED` is not a debit state, so `paymentBreakdown.js` drops it by the
rule it already had, and the historic ledger and insight engine count it as
money that came back, like every other loss the Pilot was not charged for.

It is a **lens, not an edit**: the pool itself is untouched, so turning the
toggle off restores every deduction exactly as it was — one dataset, seen
under the policy and without it.

**What changes on screen.** One kind of page, plus the figures that follow
from it:

| Surface | Under the window |
|---|---|
| the settled loss | `₹0` with the amount struck, then *"Not deducted — this loss fell in your first 4 weeks"*, then *"From 22 Aug, a loss you ignore or a dispute you lose comes out of your payout"* — the whole explanation, in the hero, in reading order |
| its list row | `₹0` against the struck amount, like any other loss that cost nothing |
| Payment Details | the covered line is simply not there; the payout is higher by that much |
| historic ledger · Past Losses head | *deducted* falls, *came back* rises |

**The hero is the entire explanation**, and it is the only place in the app
that mentions the window. The guidance line is the sentence the free loss was
bought for: a Pilot who reads only the ₹0 has learned that losses are free.

**`GRACE_WAIVED` is its own state, not `WAIVED`.** "You were right" and "we
did not charge you because you are new" are two different things to have
learned about your own record, and a Pilot who reads the first when the second
is true will dispute the next one expecting to win. It is also the one
resolved-good state that keeps its prevention advice: a waived case was not
the Pilot's fault, so advice reads as an accusation — a covered one may well
have been, and the advice is the only thing the window leaves behind.

### What the sheet presentation has to keep answering

*(Settled 18 Sep: accept and dispute are ALWAYS a bottom sheet. The full-page
alternative and the config that chose between them are gone — the sheet keeps
the loss on screen behind the scrim, and no reading of this decision is helped
by replacing the case with a form. The four answers below are now
requirements, not a defence of one option against another.)*

A bottom sheet is a lighter container than accept or dispute deserves. Four
things make it risky here, and the sheet implementation answers each — if you
change it, keep the answers:

1. **The affordance undersells the stakes.** A sheet reads as dismissible and
   reversible. Accept and dispute are neither: dispute is explicitly one try
   only, and both move real money. That mismatch is the objection no amount of
   implementation detail fixes, and it is the one to re-open if Pilot testing
   shows people tapping through these sheets too lightly — the answer then is
   a confirmation step, not a different container.
2. **The commit button must never scroll away or hide behind the keyboard.**
   The sheet pins it in a footer *outside* the scrolling body — that is what
   `BottomSheet`'s `scrollBody` prop exists for.
3. **KRD F9's consequence copy must be read before the tap.** The sheet opens
   at 90% height so the dispute's "one try only / if right ₹0, if wrong the
   full ₹X" pill is on screen without scrolling. A shorter sheet would put the
   one sentence the Pilot is owed below the fold.
4. **A scrim tap must not bin a part-written answer.** It doesn't: the draft
   is kept, stamped with the case and mode it belongs to (`l2DraftFor`), so
   reopening the same sheet restores it and it never leaks onto another loss.

One thing the sheet cannot match: with the on-screen keyboard up, a real
device gives the sheet far less room than the prototype's fixed frame
suggests. Judge the note-writing experience on hardware, not here.

Dispute cool-off is **not** listed here even though it's an app-wide policy
flag exactly like the two above — it deliberately has no state key or
control of its own. See § Layer visibility below: it's driven entirely by
the "Cool-off notice (Losses list)" layer toggle, so there's one control for
one fact instead of two that could disagree.

**Adding a new global variant:** add the state key + default to
`initialState`, a setter next to `setGlobalVariant`, thread it into `ctx` in
`computeViewModel` if `resolveCaseView` needs to know about it (don't reach
into `state` from inside `resolveCaseView` — it must stay a pure function of
`(record, stateId, ctx)`), then add a `select`/`segmented` control under
**Global variants** in `presenterSections.js`. Add a row to this table.

### The Losses surface: two sub-tabs, one home

Losses divide three ways, and each type has a home. Two of them are
list-shaped, and those two are the **sub-tabs of one surface** — Current Cycle
and Historic, defaulting to Current Cycle:

| Type | What it means | Home | Where it's derived |
|---|---|---|---|
| **Current cycle** (working list) | Still in play — needs action, or waiting on a decision — plus this cycle's decisions | The **Current Cycle sub-tab**, in every arrangement | `needsActionAll` + `pendingAll` + `wrongRows` + `closedRows` |
| **Historic** | Settled — deducted, waived, never deducted, or credited back | The **Historic sub-tab**, in every arrangement, as a ledger | `src/state/historicLedger.js` |
| **This cycle** | Everything still in play — unactioned (silence deducts it) *and* already accepted/disputed, whose decision lands either way before payout | A line on the Current Cycle card, opening a drill-down sheet | `cycleLossLine` + `cycleLossesSheet` in `useLossesApp.js` |

`src/components/losses/LossesTabbedBody.jsx` is the surface: the sub-tab row
(`LossesSubTabs`) plus whichever half it selects. It exists as its own
component because the surface has **two homes** — the Losses tab inside the
shell, and the pushed Losses page in the arrangement that has no tab — and
composing it twice is how those two would drift apart.

The sub-tab lives in `state.lossesSubTab` and **persists across navigation**
on purpose: open a case from Historic, come back, and you are still in
Historic rather than dropped into a list you did not leave from.

### The three axes (`config/lossesStructure.js`)

The losses area used to be a list of **named arrangements** —
`entry-in-earnings`, `losses-tab`, `active-plus-historic`. Those names
described whole arrangements rather than the facts that varied between them,
so the panel could not tell you what a name stood for and a new arrangement
meant inventing a new name for a point already inside the existing options'
product. They are gone. Three independent axes replace them:

| Axis | Values | What it decides |
|---|---|---|
| `lossesTab` | on / off | A Losses segment in the bar |
| `earningsEntry` | on / off | The entry widget on My Earnings |
| `historicPlacement` | `hidden` / `subtab` / `own-tab` | Where the ledger lives |

**Why the third axis is not a boolean.** "Is historic shown?" cannot express
the arrangement where the TAB IS the ledger and the working list moves to its
own page — the two halves on two separate surfaces. That is a different
information architecture, not a visibility flag, so the axis asks *where*.

**Both doors can be off**, and that is not a broken state: the Current Cycle
card carries its "settling this cycle" line in every arrangement, and that
line opens a drill-down whose rows open real loss pages. Both off is the
arrangement where losses have no list surface of their own.

**One impossible point, normalised in `resolveLossesStructure`.** `own-tab`
needs BOTH doors: a tab for the ledger to be, and the widget to give the
working list somewhere to be reached from. With the tab taken and no widget,
the working list would have no surface while the ledger had one — so the
option falls back to `subtab` (never to `hidden`: closing a door should not
also take historic away) and the panel greys it out. 3 × 2 × 2 = 12 points
collapse to **9 distinct arrangements**.

The `losses-active` screen id is back, and means one specific thing: the
pushed page carrying the working list, used wherever the tab is absent or the
ledger has taken it.

**"This cycle" is a projection, not a state** — every case still in play, i.e.
the Needs-action and Decision-pending buckets together. Nothing was added to
the state table for it.

Unlike the other two types this one is not list-shaped, so it has no sub-tab:
the Current Cycle card states what will settle against this cycle in every
arrangement, because that is a fact about the Pilot's money rather than about
navigation. The line reads "−₹763 from 6 loss items will be settled this
cycle", with only the two figures in red, and opens `CycleLossesSheet` — a
drill-down built from the same `ListRow` the losses list uses, so an item
carries the same chip there and opens the same L1 page.

**The historic ledger** (`historicLedger.js`) answers a question the working
list can't — "what have losses actually cost me?" — so it's a ledger, not a
filtered list. It keeps three figures that are genuinely different and were
previously collapsed into one:

- `incurred` — what was charged in the first place
- `deducted` — what actually left and stayed gone
- `cameBack` — what didn't: waived, never deducted, or deducted then credited
  back after a hub scan

Rows are grouped by the cycle the money moved in (credit date, else debit date,
else the day the loss was raised). Wrong Pickups appear as history but
contribute to **no** figure — no money was ever at stake on them, so counting
their value as "came back" would invent a saving the Pilot never made.

The totals widget at the top is deliberately minimal: it is the slot insights
will grow into.

The Active and Historic homes are confined to this arrangement — the other two
keep the Needs Decision / Disputes in Review / Wrong Pickups / Past Losses buckets,
so the variants stay comparable. The cycle line is the exception, and is
shared by all three.

## 2. Sectional variants

Reshape one section/widget's design, independent of the global variants
above.

| Name | Values | State key | What it changes | Where it's read |
|---|---|---|---|---|
| Losses list layout | `sectioned` (default) · `unified` · `loss-wise` | `lossesLayout` | **Sectioned** groups by lifecycle bucket (Needs Decision / Disputes in Review / Wrong Pickups / Past Losses). **Unified** is one flat, date-ordered feed. **Loss Wise** groups the whole list by the *remedy* each loss needs — see § Remedy groups below. All three render the same `ListRow` and `SectionHeader`; a layout decides order and grouping, never how a loss looks. **Chip row:** Sectioned and Loss Wise both take the filter chips (Unified takes the summary cards instead), but Loss Wise drops the **Wrong Pickups** chip — that is a loss *type*, and Loss Wise already cuts the list by type, so its chips can only be decision states. A `wrong` filter carried in from Sectioned is dropped with it, so the list is never silently trimmed by a chip that isn't on screen. | `useLossesApp.js` (`layout` / `isUnified` / `isLossWise` / `isSectioned`, `lossFilter`, `lossFilterChips`), rendered in `LossesBody.jsx` |

| Line item design | `no-image` · `no-awb` · `three-row` (default) · `two-row` | `lineItemDesign` | How ONE loss reads, on every surface that lists one — see § Line item design below. |

There was an "Entry point style" variant here (card vs banner). It's gone —
the widget is always the banner now, one line reading "₹763 at stake from 6
Losses". A variant with only one surviving option is a branch pretending to be
a choice, so the state key, the setter and the control were deleted rather
than left defaulted.

### Line item design (`config/lineItemDesigns.js`)

How one loss reads in a list. Six surfaces render the same `ListRow` — the
sectioned list, the unified feed, the Loss Wise groups, the historic ledger,
the "settling this cycle" sheet and the insight drill-downs — so this moves
all six at once. That is the point: a loss that looked one way in a list and
another way in a sheet over it would be two components again.

`ListRowDesignProvider` (in `App.jsx`) hands the resolved design to every row
through context rather than a prop. A row is rendered from six places and
none of them is making a decision about its design; threading a prop through
each would let one of them forget.

**Two axes, four options.** `contents` is which facts about the parcel the
row states; `clock` is where the countdown sits.

| Option | Photo | AWB | Clock | Reading |
|---|---|---|---|---|
| **No image** | — | ✓ | rail | The densest row — no photograph and two lines. Two trades at once: the AWB becomes the only thing naming the parcel, and the reason and the deadline sit at opposite corners. It buys roughly half again as many losses per screenful. |
| **No AWB** | ✓ | — | body | Two lines, reason and deadline, so the statement is uninterrupted — at the cost of matching a row to a label without tapping it. |
| **All details — 3 rows** *(default)* | ✓ | ✓ | body | Reason, AWB, deadline, with the amount centred against the block. |
| **All details — 2 rows** | ✓ | ✓ | rail | The original. Two facts left, two right — the row is two columns rather than a statement, and the reason and the deadline end up at opposite corners. |

**What never varies:** the reason leads, the amount is the counterweight, the
chevron is the quietest mark and is on every row in every section. Those are
the row's hierarchy (documented on `ListRow.jsx`), not a variant of it.

**Why the clock-in-rail designs need a CSS override.** With the clock in the
rail, the rail's width is set by the longest clock text (`Decision in 2
days`), so it is fixed at 72px rather than content-sized. Without that the
title column is 172px in Needs Decision and 127px in Disputes in Review — the
same list wrapping its titles in one section and not the next. 72px fits the
longest single-line clock; anything longer wraps inside the rail instead of
pushing it wider.

The rule keys on `data-clock="rail"`, not on a design's id: the fixed width
is a consequence of the clock being in the rail, and two designs put it
there. Keying on the name would have meant copying the rule the next time a
design chose the rail.

### The banner pattern (`components/common/Banner.css`)

Two surfaces are banners in the same sense — an inset, tinted, bordered card
that sits on top of a list, says one thing, and carries a way in on the right:
the **loss entry point** on My Earnings and the **contextual insight** above
the losses list. They share one base so "the same pattern" is a fact rather
than something to re-check by eye; each adds only what is genuinely its own
(the entry point's shake, the insight's self-measuring habit line and dot row).

| | Value |
|---|---|
| shape | row, `align-items: center`, gap `--gap-lead`, padding `--pad-panel`, radius `--radius-md`, 1px border, `min-height: --tap-target-min` |
| mark | 20px, strokes `currentColor` → `--banner-accent` |
| headline | `--body-02`, `--fw-demi`, `--text-primary` |
| emphasis | `--banner-accent` **plus one weight step** (`--fw-bold`) |
| sub-line | `--body-03`, `--fw-book`, `--text-secondary`; its own emphasis steps to `--fw-medium` |
| action | `--body-03` `--fw-demi` navy underlined + 18px chevron, `--space-2` apart |

**One tone at a time**, chosen by what the banner is about, never by how loud
we want it — `warn` for money at risk or a clock running, `progress` for held,
in-progress or advisory. `--banner-accent` is that tone's single emphasis
colour and the mark wears it too.

**Emphasis is colour plus one weight step, never a third device.** Colour
alone was tried and read too flat at 12px on a tinted ground. The step goes
UP on the accent rather than DOWN on the surrounding text, and the use scene
decides that: most of the sentence is the neutral text, read at arm's length
on a low-end screen in outdoor daylight (PRODUCT.md § Accessibility).
Lightening the many to emphasise the few would buy separation with legibility.
The result is a three-rung ladder — 400 sub-line, 600 headline, 700 accent.

**The action is a word and a chevron**, travelling together, never wrapping.
The whole card is the tap target; the CTA is a `<span>`, never a nested button.

**Known cost:** the insight banner's habit line lost ~28px to the chevron, so
on the widest insight it now shows one habit where it showed two. The
component measures and degrades by design (`useHabitsThatFit`), and the sheet
behind "More" carries the full deck. Shortening the `Next time:` label would
buy most of it back if both habits matter more than the label.

### The loss entry banner's three states (`config/lossesEntryStates.js`)

The widget at the top of My Earnings. **Mark · headline block · action.**
Three treatments, chosen by what is actually in the pool — derived, never
stored, so the banner cannot promise a state the list it opens does not have.

| State | When | Mark (20px) | Surface | Headline | CTA |
|---|---|---|---|---|---|
| **Actionable** | ≥1 loss waiting on the Pilot | `AlarmClockIcon`, shaking | `--tone-risk-*` (warm) | `₹624 at stake from 6 losses`<br>**`3 days left`** | `Review ›` |
| **Review** | nothing waiting, ≥1 decision pending | `PackageXIcon` | `--tone-progress-*` (cool) | **`2 losses`**` are under review` | `Track ›` |
| **Resolved** | nothing waiting, nothing pending | — | — | — | **hidden entirely** |

The headline is a block, not a line: Actionable stacks the money-and-count on
the first line and the clock on its own beneath it, so the clock is a
statement rather than a clause competing with the money. Review needs one
line, because nothing is running out.

Resolved hides rather than showing "₹0 at stake" — a thing to read and dismiss
every day on the screen a Pilot opens to see what they earned. The list stays
reachable from the Losses tab and the Current Cycle card in every arrangement.
Two gates answer different questions: `lossesStructure.earningsEntry` (does
this surface have an entry widget?) and `lossesEntryPoint.visible` (is there
anything for it to say?).

**Each state says its own sentence**, because the Pilot's position differs and
a shared template would flatten that. Actionable states money and clock, with
the clock coloured *inside* the sentence so the eye lands on what is running
out. Review states who holds the ball, in active voice, with no money figure:
nothing is running out and nothing is theirs to do.

**One weight, one family, emphasis by colour.** The whole headline is
`--fw-demi`; the important words are not heavier than the rest, they are a
different colour. Each state declares one `--entry-accent`, and the mark
leading the row wears it too — the icon strokes `currentColor`, so "the icon
matches the highlight" is one declaration rather than two values kept in sync.
Earlier builds emphasised with weight *and* family *and* colour at once, which
is what made a 48px row look busy.

| Tone | Surface | `--entry-accent` | Contrast |
|---|---|---|---|
| risk | `--tone-warn-*` #FFF7D6 | `--tone-warn-ink` #8A5003 | 6.05:1 |
| progress | `--tone-progress-*` #EEF3FF | `--tone-progress-ink` #092D5E | 12.2:1 |

**The warm accent is the deepest orange on the ramp, and that is a contrast
decision rather than a taste one.** On the yellow surface, Orange Main
(`#EC7600`) measures **2.73:1** and Orange Deep (`#B85A00`) **4.34:1** — both
under the 4.5 floor for 14px text, and the same floor applies to the mark
because it carries the same meaning. Only `--text-warning-ink` clears it.

Review's accent is quiet on purpose: the state where nothing is running out
should not shout, so it shifts hue rather than jolting. `--valmo-action-blue`
was the louder candidate and fails the floor at 4.22:1 on that surface.

**Tone follows money position**, which is the product rule (PRODUCT.md: "at
risk / held / already cut / not deducted / recovered") rather than a loudness
dial — so the widget uses the same warm surface the loss pages use for the
same position, and one flat tone at a time. Two earlier builds carried a cool
ground with a warm badge on it, which read as two systems arguing inside one
box.

**The CTA differs by state** because a control names its own action: "Review"
when there is something to decide, "Track" when it is with us and the Pilot is
watching progress. The CTA and its chevron are one object — the word is the
action, the chevron is the direction — and the pair never wraps. Neither CTA
carries a count; both headlines state their own.

**The timer** is `entryTimerText()` — `3 days left` / `1 day left` /
`Closes today` — and it states the SOONEST deadline among the waiting losses.
Measured on the built result: headline 13.73:1, timer 6.05:1, CTA 12.61:1.

### `--tone-warn-*`, and the two money cards

Yellow used to be `--surface-cycle` / `--border-cycle`: one card's private
colour, named after the card rather than after what it meant, and it put the
loudest surface on My Earnings around the one block that needs no decision —
a payment arriving on schedule is the good news, not the warning.

The **Current Cycle card is now neutral** (`--border-default`, strip on
`--surface-sunken`), identical to `HistoricSummaryCard` on the Losses tab.
That card had already worked this out and said so in its own header; the cycle
card was the outlier, and now the two money cards are true siblings — same
card, same strip, same brand-face figure — so a Pilot learns one, not two.

That freed the hue to become the fourth semantic tone, **`--tone-warn-*`**,
which the Actionable banner takes. The loudest surface on the screen is now
the one thing on it that wants acting on. `--surface-cycle` and
`--border-cycle` are retired; nothing references them.

Note the banner's at-risk tone is therefore yellow while the loss detail
pages' `StatusHero` keeps `--tone-risk-*` orange for the same money position.
Adjacent warm hues, different jobs: the banner is an entry point competing for
attention on a crowded screen, the hero is a status statement on a page about
one case.

**The shake** is ±9° over a 2.4s cycle with ~0.5s of movement, off under
`prefers-reduced-motion`. A continuous pulse on a screen opened several times
a day stops being a signal and becomes a tic.

**Panel control:** *Loss banner state* (Global variants) forces a treatment
for review, because the data cannot reach all three on demand — Live is six
waiting losses, so it only ever produces Actionable. `Auto` is the real
reading, and acting on cases moves it: accept the last waiting loss on Auto
and the banner drops to Review by itself. Forcing Review over a dataset with
nothing pending renders "We are checking **your losses**" — the count goes
quiet rather than printing a zero.

### Remedy groups (the `loss-wise` layout)

`src/config/remedyGroups.js` — the grouping theme is **what the Pilot does
about the loss**, not which reason code it carries. Two reasons fixed the same
way belong together: someone scanning this list is deciding how to spend the
next ten minutes, and "three need a decision, one needs a parcel returned"
answers that where "three QC mismatches and two junk photos" does not.

| Group | Heading | Matched by | Total? |
|---|---|---|---|
| `decide` | Needs your decision | `actions` includes `accept` or `dispute` | yes |
| `recover` | Return to recover | `remedy.kind === 'hub_return'` | yes |
| `info` | For information only | `money === MONEY.INFO_ONLY` | no — no money was ever at stake, so a ₹ total would invent a cost |
| `other` | Other losses | fallback; nothing matched | yes |

**Every group is derived from fields the reason registry already carries —
never from a list of reason codes.** That is what keeps this compatible with
the registry's central promise: *adding a loss type is a row in
`lossReasons.js` and nothing else*. A new reason lands in the right group
automatically because of what it lets the Pilot DO. Hardcoding codes here
would break that silently — the symptom would be a new loss type appearing
under the wrong heading, long after the change that caused it.

Order matters, first match wins: `recover` is tested before `info` because a
Lost-in-Field case is pre-deducted but emphatically not information-only —
there is money to get back.

**Headings are deliberately flow-neutral.** The first group is not "Accept or
dispute": the **Only Dispute** flow variant removes accept entirely, and a
heading promising a choice the screen doesn't offer would be a lie in that
variant. The other two reuse wording already in `caseStates.js`, so the list
and the detail page name the same thing the same way.

**Adding a new sectional variant:** same recipe as above, filed under
**Sectional variants** instead. If the variant only makes sense under
another variant's value (like Losses entry point needing `two-tab-l1`),
conditionally include the control the way `presenterSections.js` already
does for that case.

## 3. Layer visibility (per-section show/hide)

A generic, code-light mechanism for toggling any individual section or
widget on/off from the panel — **without adding a control to
`presenterSections.js` or any state to `useLossesApp.js`.** This is what to
reach for when the ask is "let me flip a banner/section on and off from the
panel while I look at layout options", the way Figma's Layers panel lets you
hide one layer without touching anything else.

**How it works**

- `src/presenter/LayerVisibilityContext.jsx` holds a live registry of
  whatever `<Layer>`s are currently mounted, plus any manual on/off
  overrides a human has clicked in the panel.
- `src/components/common/Layer.jsx` is the wrapper: `<Layer id label>` around
  any JSX registers it on mount, unregisters on unmount, and renders nothing
  when toggled off.
- `src/presenter/controls/LayersControl.jsx` is the panel's **Layers**
  section — it reads the registry directly (it's the one control type that
  doesn't get its data from `presenterSections.js`) and renders one toggle
  per currently-registered layer. Navigate to a screen with no `<Layer>`s on
  it and the section reads "No togglable layers on this screen" — the list
  always matches what's actually on screen, nothing to keep in sync by hand.

**To make something togglable** (e.g. "I want a toggle for a new banner on
the list page"): wrap it in `<Layer id="<screen>.<thing>" label="Human name">`.
That's the entire integration — no other file changes, and no row is
strictly required in this doc, though a one-line mention below helps anyone
scanning for "what can I hide right now."

**Reference implementation (cosmetic):** `src/components/earnings/LossesBody.jsx`
wraps `CoolOffNotice` in `<Layer id={COOL_OFF_NOTICE_LAYER} label="Cool-off
notice (Losses list)" defaultVisible={false}>` — copy this pattern for the
next purely-cosmetic layer.

**The one functional exception — dispute cool-off.** This same layer's
toggle is also read as a business flag, not just a show/hide switch:
`useLossesApp.js` calls `layerRegistry.isVisible(COOL_OFF_NOTICE_LAYER,
false)` to decide `coolOff`, which forces any case that's currently
`ATTRIBUTED` (the needs-action, decision-still-open state) into
`OPEN_DISPUTE_PAUSED` — the bottom bar's Dispute button becomes a disabled
"Paused till {date}" pill (Accept still works, per KRD F17), the hero's
guidance line names the pause and its date, and the layer's own
`CoolOffNotice` banner names the same date on the Losses list. One toggle,
one fact, two places it's read (`useLossesApp.js` for the business effect,
`LossesBody.jsx` for the banner) — deliberately, rather than a separate
`coolOff` state key that the layer's visibility would only happen to agree
with. `COOL_OFF_NOTICE_LAYER` lives in `src/config/layerIds.js` — the one
place a layer id needs a shared constant, because both files reference it.
This is *why* `LayerVisibilityProvider` wraps `App` from `main.jsx` instead
of living inside `App.jsx`: `useLossesApp` reads the registry, so it has to
be a descendant of the provider, not the thing rendering it.

Because this flag now lives in the panel's Layers section instead of a
`useState` default, its default lives on the `<Layer>` call site
(`defaultVisible={false}`) rather than in `initialState` — keep those two
facts (the Layer's default, and `useLossesApp`'s fallback when the layer
hasn't mounted yet) in agreement if either one changes.

Currently registered layers (grows as more sections adopt `<Layer>`):

| Layer id | Label | Screen | Wrapped component | Functional effect beyond show/hide |
|---|---|---|---|---|
| `losses-list.coolOffNotice` (`COOL_OFF_NOTICE_LAYER`) | Cool-off notice (Losses list) | Losses list (`home`) | `CoolOffNotice` | Yes — pauses dispute app-wide, see above |
| `losses-list.contextualInsights` (`CONTEXTUAL_INSIGHTS_LAYER`) | Contextual insights (Losses list) | Losses list (`home`) | `InsightBanner` | No |
| `losses-tab.summaryCard` | Summary card (Losses tab) | Losses surface, Historic sub-tab | The whole summary card (`HistoricSummaryCard`), and with it the only way into the break-up sheet it fronts. Declared at its own call site rather than in `layerIds.js`, per that file's rule: only one file needs it | No |
| `losses-list.catalogImages` (`CATALOG_IMAGES_LAYER`) | Catalog images (all loss pages) | Losses list (`home`) **and** every loss page (`case`) | **per dataset** — on for Mock, off for Live (`CATALOG_IMAGES_DEFAULT`) | Yes — adds the catalog photo row to every L1, see below |

### Registration-only layers

A `<Layer>` with **no children** renders nothing; it exists to put a toggle in
the panel while that screen is up, and something else applies the effect. That
is how a layer reaches past the component it is declared in.

`losses-list.catalogImages` is the worked example. The toggle is declared on
the losses list (where the arrangement gets set up) *and* on the case page
(so it can be flipped while you look at what it changes) — one id, one
override, either surface, because the registry keys on the id and the
overrides outlive any single mount. The effect is applied in
`resolveCaseView`'s `buildEvidence`, which `useLossesApp` reaches by reading
the same id out of the registry and passing `catalogImages` through `ctx` —
the same route `coolOff` takes. `resolveCaseView` stays a pure function of
`(record, stateId, ctx)`; it never reads the registry itself.

**Its default is a dataset fact, not a design one**, and lives in
`config/layerIds.js` as `CATALOG_IMAGES_DEFAULT`, read from the active
dataset's `layerDefaults.catalogImages`. On **Mock** it is on: those rows carry
no real photographs, so the listing row is the only thing on the page that
shows what the product was. On **Live** it is off: every row carries the
Pilot's real photographs, and the catalogue is three dummy product shots of
things he never handled — six tiles of somebody else's products under his own
pickup photos would be the one invented thing on a screen whose whole claim is
that nothing on it is invented. The toggle is still there; flip it to show the
arrangement.

The default sits beside the **id** rather than at the `<Layer>` call site
because three files need the same answer — `CatalogImagesLayer`'s
registration, the case page's `<Layer>`, and `useLossesApp`, which applies the
effect. All three used to spell it `true` independently; they agreed only by
coincidence, and the first per-dataset default would have shown up as a toggle
whose position disagreed with the page.

When it is on, a scrolling row of `CATALOG_IMAGE_COUNT` product-listing photos
is appended **below** the reason's own evidence groups, and it *replaces* any
single `catalog` group that reason declared (wrong pickups) — the row opens on
that same photo, so the comparison survives and the page never shows one image
twice. On a reason carrying no evidence at all, the row becomes the section's
only group.

## 4. Screen presets ("Jump to screen")

`src/config/screenPresets.js` (`SCREEN_PRESETS`) — every entry is a surface
or a **case preset** (a pointer at one mock record, optionally forcing a
lifecycle state). Because every loss detail page is `f(reasonCode,
caseState)`, reviewing a new lifecycle state is a new row here, never a new
screen id. Add a row when you want a specific (reason, state) combination to
be one dropdown pick away instead of something you have to navigate to by
hand.

**`expect` — why the dropdown is shorter on Live.** A preset may declare the
`{ reasonCode, caseState }` its label names. `presetResolves` (in
`state/caseStore.js`) checks that against the SEED record and the panel offers
only the presets that hold, so the Live dataset — six real awaiting-answer
losses, no decided cases, no wrong pickups, no Lost-in-Field — offers nine
entries where Mock offers eighteen, rather than offering all eighteen with
half of them pointing at nothing or at a case that was never in the state the
label claims. Presets still show a case's CURRENT state, so acting on one
still makes its label stale; `expect` is only about whether the entry was ever
true of this dataset. Omit `expect` on a surface preset; omit it on a case
preset only if the pointer alone is enough.

## 5. Confirmation popups

`src/config/confirmations.js` — what each submitted flow says back to the
Pilot. The structure is fixed and lives in
`src/components/common/ConfirmationPopup.jsx`; only the words change per
flow, so adding one is a row in the registry, never a new component.

Modelled on the Partner App's standard confirmation popup
(Figma `WCghUzecsonToq8dCxpm3W` · node `6256:10328`): scrim + centred 328px
card, a 64px icon, headline, byline, and a ✕ top-right. It auto-closes after
3s (`CONFIRMATION_MS`); the ✕ and the scrim dismiss it sooner.

| Flow | Raised by | Headline | Byline |
|---|---|---|---|
| `accept` | `submitSheet` (accept sheet) | Accept recorded | We will tell you before your payout. |
| `dispute` | `submitSheet` (dispute sheet) | Dispute sent | Nothing is deducted while we check. |
| `returnedClaim` | `confirmReturnedClaim` (Lost in Field) | Check requested | We will check the hub scan. |
| `addSide` | `submitSide` (wrong pickup) | Your side is saved | No money is deducted for this. |

**Two deliberate departures from the Figma reference**, both design calls
worth keeping in mind before "fixing" them back:

- **The tick is navy, not green.** Emerald already means one specific thing
  on these screens — "no money was lost" (the Waived, Returned and
  Not-deducted badges all wear it). A green tick over a case a Pilot has
  just *accepted* would read as "sorted, you're fine", which is the one
  promise KRD F12 forbids this flow from making.
- **It closes itself.** The reference is dismissed by hand.

**Copy rules** (also stated at the top of `confirmations.js`, because they
are easy to break by accident):

- ~3 seconds of reading. Bylines stay at 6–8 words.
- Accept may never promise a waiver, odds, or a dated reply (KRD F12/F7) —
  "before your payout" is the only honest timing it has.
- Each flow states its own most useful *true* fact rather than a house line.
  Accept has no honest money reassurance to give, so it gives timing;
  dispute's strongest fact is that the money stays put meanwhile.
- The page underneath already states the outcome in full. These lines
  confirm the tap and carry one fact — they are not a summary.

**To add one:** add a row to `CONFIRMATIONS`, then set
`confirmation: '<id>'` in the `patch()` of whatever action submits that
flow. Nothing else — `App.jsx` already renders whatever is raised, over
whatever screen the flow landed on.

## 6. Case lifecycle (the moves that aren't the Pilot's)

`src/config/caseTransitions.js` — the verdicts handed down by the review
team, the deduction timer, or the hub scan. The Pilot's own moves are the
app's own CTAs (accept, dispute, claim a return, add your side) and live
next to the flows that raise them in `useLossesApp.js`; without this file a
walkthrough could never reach the Past Losses bucket, because nothing a Pilot
can tap closes a case.

The panel turns each row into a button under **Case lifecycle**, shown only
while you're on a case that has somewhere left to go.

| From | Offers |
|---|---|
| `ATTRIBUTED` / `OPEN_DISPUTE_PAUSED` | Window closed → deducted |
| `ACCEPTED` | Review → not deducted · Review → deducted |
| `IN_DISPUTE` | Dispute upheld → waived · Dispute rejected → deducted |
| `LIF_RECOVERY_OPEN` | Hub scanned it → credited · Never returned → stays deducted |
| `LIF_CLAIM_SENT` | Scan found it → credited · Not at the hub → stays deducted |

Note `LIF_CLAIM_SENT` — the state a Lost-in-Field case enters when the Pilot
says the parcel is already back. It exists because claiming a return is a
real move: the Pilot has done everything they can and the hub scan decides,
exactly like accept/dispute hand the case to the review team. Recording it as
a flag on an otherwise-unchanged case (as it was originally) left the loss in
"Needs Decision", still counting down, with the page still telling the Pilot to
give the parcel to their hub captain.

**Each row carries a `patch`, and it is not decoration.** Every terminal
state reads fields an open case doesn't have yet — `RETURNED_CREDITED` wants
`returnedOn` and `creditDate`, `DEBITED` wants a `pathLabel` for its "Deducted
— {reason}" line. A state that lands without them renders "Returned on
undefined". Whatever the destination's entry in `caseStates.js` reads, supply
it in the `patch`.

**To add a transition:** add a row under the state it starts from. To let a
new *state* be reached at all, add its entry to `caseStates.js` first, then a
row here.

`GRACE_WAIVED` is the one state with **no row here and no way to be
transitioned into**, deliberately: nobody decides it, the window does. It is
produced by the grace lens (`state/grace.js`) reading a `DEBITED` case inside
the window, and it disappears again the moment the toggle goes off — see
§ The grace window.

## 7. Prototype-level props

`src/state/useLossesApp.js` (`props` object near the top) — flags like
`replyDays`, `showClosed`, `emptyMarked`, `coolOffEnds`, `awarenessOverlay`,
`awarenessRule`. These predate the panel (they're the former Claude Design
"data-props" QA panel) and are **not currently panel-exposed** — flip them
by editing the object directly. If one of these earns a spot in the panel,
move it into `initialState` + a setter and document it under **Global** or
**Sectional variants** above — or, if it's fundamentally an on/off switch
for one section (like `coolOff` was), consider whether it belongs as a
Layers toggle instead (§ Layer visibility above) rather than a second kind
of control.

## 8. Data source (Mock vs Live)

`src/data/activeDataset.js` — the panel's **Session → Data source** dropdown,
sitting directly above **Reset Data**. Two fixtures of identical shape:

| Source | What it is | Use it for |
|---|---|---|
| **Mock data** (default) | `src/data/mockData.json` — every loss type crossed with every lifecycle state across `marked` / `wrong` / `closed`. Dated around a "today" of 15 Aug. | Reviewing the design. It is what makes § 4's presets reachable and what shows all the use cases at once. |
| **Live data** | `src/data/liveData.json` — the six real audited losses of one real Pilot, transcribed from `External Memory/Debit reason master table.xlsx`, sheet "Sample data": real AWBs, real hubs, real amounts (₹2,368 in all), real audit date (16 Sep, against a "today" of 18 Sep) and real photographs. All six await his answer; nothing else is in the lists. | Taking the prototype to that Pilot. Nothing on screen is invented, so every figure survives him checking it. |

**Four things the dataset owns besides the loss rows:**

- `today` — read by `state/helpers.js` as `TODAY`, which every countdown and
  cycle test derives from. It is per-dataset because the Live losses were
  audited on 16 Sep: a "today" of 15 Aug would file all six outside the
  current cycle and read every clock backwards.
- `productImages` — the stock catalogue behind row thumbs and stand-in
  evidence tiles, now `/catalog/*.avif` under `public/` rather than remote
  `images.meesho.com` URLs, so the prototype renders identically on Vercel,
  on a laptop and offline.
- `photos` on a loss row — `{ own: [...], qc: [...] }` of real photograph
  paths under `public/evidence/<awb>/`. `buildEvidence` (in
  `resolveCaseView.js`) prefers these over the stock catalogue, and the L0 row
  thumb prefers `photos.own[0]`, so the list and the page it opens show the
  same real photo. Every Live row has them; no Mock row does.
- `layerDefaults.catalogImages` — whether the catalog photo row starts on.
  On for Mock, off for Live; see § Registration-only layers above for why.

**Switching reloads the page**, and that is deliberate rather than a
limitation worked around: the dataset is read at import time by the date
helpers, the case pool and the catalogue, all three by design, and this is a
control flipped once a demo. The choice persists in `localStorage`, and
`?data=mock` / `?data=live` on the URL overrides it — which is how you send
someone straight to one.

**Adding a third dataset** is one JSON file plus one line in `DATASETS` in
`activeDataset.js`. Give it a `today`, and give any row with real photographs
a `photos` block.

### Where the reason copy comes from

Both datasets read the same reason registry, so this is copy neither of them
owns. `src/config/lossReasons.js` is transcribed from sheet 1 of the same
workbook — the debit-reason master table:

| Registry field | Sheet column |
|---|---|
| `masterReason` | Debit reason |
| `debitableEntity` | Debitable entity |
| `explain` | Short Description |
| `tip` **and** `prevention.steps` | Tip |
| each evidence group's `source` | imagess to show |
| each evidence group's `count` | Total images count ÷ image sets (the sheet counts photographs, two to a set) |

The master table holds **twelve** rows; the registry carries the **five** whose
debitable entity is the last-mile FE, which is whose app this is. The other
seven are debited to LM hub QC, FM or FM QC, and putting them in front of a
Pilot would show them money that never leaves their hands. If that changes,
each is one row here plus a row in `lossReasons.js`.

Three things are deliberately **not** the sheet's:

- **`feName`.** The sheet's "Debit reason" is the internal name of the debit
  ("ICUD images junk"); `feName` is what a Pilot reads.
- **`prevention.habits`.** The insight banner's two-or-three-word reminders
  ("light the parcel · hold phone still"). No column is in that register.
- **Anything the sheet leaves blank.** "Pickup images junk" has no Short
  Description, so that one `explain` is still the prototype's own.

**`tip` and `prevention.steps` must stay one thought.** Both render under the
heading "Next time" — the steps on the loss page, the tip in the accept sheet —
which is the design's deliberate "the app names this one thing one way". So
the steps ARE the Tip, a sentence to a step. Sourcing them separately puts two
sets of words under one heading, which is exactly what happened the first time
the Tip was replaced and the steps were not. The `photo-not-clear` merged
group in `remedyGroups.js` is the one place advice is written rather than
transcribed — the merge has no row in the sheet — and it is written from the
intersection of its two members' Tips for the same reason.

---

### Money grammar (all variants)

**One statement per case state, rendered in two places** — the list row's
amount column and the loss page's hero figure. Declared as `money` in
`config/caseStates.js`; `resolveCaseView` calls it once and hands the same
object to both.

| State | Amount | Struck | Tone | Badge |
|---|---|---|---|---|
| `ATTRIBUTED` · `OPEN_DISPUTE_PAUSED` · `IN_DISPUTE` · `ACCEPTED` | at stake | — | primary | the clock |
| `LIF_RECOVERY_OPEN` · `LIF_CLAIM_SENT` | at stake | — | primary | the clock |
| `DEBITED` | `₹210` | — | settled (gray) | none |
| `WAIVED` · `NOT_DEDUCTED` · `GRACE_WAIVED` | `₹0` | the stake | kept (green) | none |
| `RETURNED_CREDITED` | `+₹65` | — | kept (green) | none |
| `INFO_ONLY` (wrong pickups) | `₹0` | the stake | kept (green) | none |

**Why one field.** It was three — `figure`, `figureWas` on the state for the
hero, and a separate `listMoney` for the row — and three declarations of one
fact drift. They did: a returned shipment read `+₹65` in the list and `₹0` with
₹65 struck on its own page, for the same case, one tap apart. A state now says
what a case's money is once. `caseStates.js` throws at import if a state
declares no `money()`, so a new state cannot ship with a silent gap.

**A decided row carries no badge.** The amount says the outcome, and it was
saying it twice — `₹90` in the column and "Not deducted" in a pill beside it,
the pill being the slower of the two to read. What is left in `listChip` is the
shapes that are about a clock, not about money.

**Returned is a credit, not a zero** — the debit stayed on the statement and
this came back on top of it (KRD F18/F19). `₹0` would describe a loss that
never happened.

**Wrong Pickups take the struck figure** like any other kept case (design call,
16 Sep). It states the parcel's value and that the Pilot was not charged for
it; KRD F24's actual requirements — no red, no minus signs — still hold.

Applies to every surface that renders a `ListRow`: the sectioned, unified and
Loss Wise layouts, the historic ledger, and the insight sheet.

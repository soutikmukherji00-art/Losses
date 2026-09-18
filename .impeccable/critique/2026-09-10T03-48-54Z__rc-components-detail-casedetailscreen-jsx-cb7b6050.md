---
target: L1 loss detail flows
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 4
p1_count: 3
target_identity: "file:/Users/soutik.mukherji/Meesho_Projects/POD/Losses/react-prototype/src/components/detail/CaseDetailScreen.jsx"
target_fingerprint: "sha256:86fbf17bf5290d38a17d12f2261b27f47025b0791b4df105030f47bc725553f0"
target_path: /Users/soutik.mukherji/Meesho_Projects/POD/Losses/react-prototype/src/components/detail/CaseDetailScreen.jsx
timestamp: 2026-09-10T03-48-54Z
slug: rc-components-detail-casedetailscreen-jsx-cb7b6050
closed: true
---
# Design Critique — L1 Loss-Detail Flows

Method: dual-agent (A: design review · B: detector + browser measurement), isolated and parallel.
11 L1 states captured at 360x780, viewport and full-page.

Scope honored: the 8-slot IA is settled. No finding asks for slot reordering or changes to
f(reason x state). Everything below is about what goes IN the slots — copy, construction,
visual balance, cognitive clarity.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | F5 countdown chip exists on list rows, dropped on entering L1; StatusTracker never receives isLast/nextDone so the rail dangles and never lights. |
| 2 | Match System / Real World | 2 | "right action in 5 days might prevent it", "raise a request for reviewing again". "Secondary QC mismatch" is internal vocabulary as a page title on 3 of 11 states. |
| 3 | User Control and Freedom | 2 | case-lif-open renders zero interactive elements; its only escape hatch is non-tappable grey footer text. |
| 4 | Consistency and Standards | 3 | Slot order is rigorous. Undercut by WhatToDoCard.css abandoning --space-* for raw 14px and ~10 hardcoded hex values across the three most important cards. |
| 5 | Error Prevention | 2 | The once-only irreversible action states neither ending on L1 (KRD F9 requires both). buildAction's intersection rule pulls this up from 1. |
| 6 | Recognition Rather Than Recall | 2 | On case-in-dispute, case-accepted, case-waived, case-not-deducted the amount at stake never renders. |
| 7 | Flexibility and Efficiency | 2 | No progressive disclosure. Terminal cases render full evidence grids plus "Tap a photo to see it full size". |
| 8 | Aesthetic and Minimalist Design | 2 | 17 distinct colour values on case-attributed; six off-whites across the L1 set; 3-4 voice chips per page; one fact stated three times on case-lif-returned. |
| 9 | Error Recovery | 2 | "Returned already? Raise a ticket" is 11px grey centred prose at 2.98:1 contrast, and inert. |
| 10 | Help and Documentation | 2 | One sentence per reason; no "why was I marked"; no hub-captain route except the dead footer line. |
| **Total** | | **21/40** | **Mid-band — strong spine, soft surface** |

## Design Specificity Verdict

Authored at the IA layer. Category-interchangeable at the pixel and copy layer.

Genuinely specific: the LiF credit pair (debit row kept, credit added); the payment pointer naming
the exact payout line; the silence consequence inside the choices card; the voice-out chip as a
real affordance.

But cover the code and case-attributed is a beige strip, two grey boxes, a white text card, a
blue-outlined card with two buttons. Nothing visible is sized or positioned as though Rs 142
leaving a delivery partner's payout is the subject. The amount renders at 13px inside a two-line
paragraph; the loudest object is a navy button reading "Accept — add justification."

Deterministic scan: source-path detector returned 0 findings on detail/, common/, and all of src —
NOT meaningful. Established by controlled experiment that the static analyzer does not resolve JSX
className to sibling .css files (a synthetic file with 9px text and 20x20 buttons scored 0 as .jsx,
7 findings as .html). This project styles entirely in co-located CSS, so the source scan is inert.
Substituted a live-URL scan (19 findings, exit 2) plus in-page injection on 5 presets.

Discarded as false positives: presenter-chrome findings (10px labels, #9096a2 text in src/presenter/,
outside the phone frame); one self-detection artifact (dark-glow #ffba00 is the overlay's own badge
colour — no such value in the codebase). Real product findings: low-contrast on #8E96A3 and #1E8A45,
corroborated by independent contrast maths.

Overlays: injection succeeded on 5 presets but ran in headless Chrome — there is NO human-visible
overlay tab. Findings were read out of returned objects. Live server started on 8400 and confirmed
stopped.

Correction to Assessment B: it reported src/config/lossReasons.js and src/config/caseStates.js as
non-existent. Both exist; B resolved from the wrong working directory. Measurements unaffected.

## Overall Impression

The architecture is better than the surface rendering it. f(reason x state), tone-by-money-position,
and the intersection guard on actions will still hold when reason #9 arrives.

The slots got filled with prose instead of design. Nearly every problem is one of three shapes: the
same fact in three slots at once; a critical fact at 11px grey; or a slot producing content nothing
renders.

Biggest opportunity: slot 3 is inverted. On case-attributed (money at risk, action possible) the
Money & Remedy block does not render — showsPaymentPointer: false. On case-debited (money gone,
nothing to do) it does. The 10-Sep promotion of money to slot 3 has no effect on the state it was
meant to serve.

## What's Working

1. Tone-by-money-position is real, not aspirational. Four tones assigned by money position in
   caseStates.js with zero exceptions, including the counter-intuitive correct call of amber for LiF.
2. buildAction's intersection rule (resolveCaseView.js:213) — reason.actions ∩ state.actionBlock —
   means an info-only reason can never surface Dispute however reached. Enforced in one place.
3. "Our delay is never your cost." (case-waived-sla footer) — a company taking the hit in plain
   language. The emotional peak of the surface, and earned.

## Priority Issues

### [P0] Slot 3 is inverted — money absent where money is still saveable
Where: caseStates.js showsPaymentPointer: false on ATTRIBUTED / OPEN_DISPUTE_PAUSED. Confirmed by
block-composition measurement (case-attributed = banner, photo-group, info-block, what-to-do, foot;
no money block).
Why: the 10-Sep decision promoted Money & Remedy to slot 3 because "where the money sits" is
second-most-critical. That reasoning is strongest for a Pilot who can still act, and the block is
missing there. Closed cases get a money block; live cases get a sentence fragment.
Fix: fill slot 3 on at-risk states with the at-risk money statement — amount, what will happen, when.
The pointer is one of several things slot 3 can hold; currently it is the only one.
Suggested command: /impeccable layout

### [P0] The third choice is below the fold on the state built to present three choices
Where: case-attributed scrollHeight 798 vs 693 visible (105px below fold); case-cooloff 834 vs 693
(141px).
What is clipped: both CTAs are visible (Accept offsetTop 412, Dispute ~600). Cut is
.what-to-do__silence: "IF YOU DO NOTHING / If you do nothing for 5 days, the full Rs 142 will be
deducted." On case-cooloff the entire paused explanation goes with it.
Why: PRODUCT.md's bar is three choices in 10-15 seconds; the viewport delivers two. Silence is the
default behaviour of a Pilot on 2G between deliveries. At 1.3x type, below-fold grows to 164px and
215px.
Fix: replace the What-to-do subtitle "Pick one of these two" (redundant with the buttons) with "Do
nothing and Rs 142 is deducted in 5 days." Third choice moves above both buttons at zero vertical
cost. Reclaim further height by collapsing the evidence grid on live states to "2 photos ›".
Suggested command: /impeccable layout

### [P0] Lost-in-Field renders a page with no tappable element
Where: buildAction returns { mode: 'recovery', secondary: 'Returned already? Raise a ticket' }
(resolveCaseView.js:230); CaseDetailScreen.jsx:58-59 renders only 'offers' and 'add_side'. Slot 7 is
silently dropped. Verified directly in source.
Why: this is the state where money has already left the payout and the app's job is helping get it
back. A Pilot who returned the parcel yesterday has one thing to do and no way to do it. Page ends
with ~190px of white space. Breaks the documented slot contract.
Fix: render the recovery block — one primary-weight control ("I already returned it") in slot 7;
delete the footer duplicate.
Suggested command: /impeccable harden

### [P0] The irreversible action states neither of its endings
Where: WhatToDoCard.jsx:47-49 — "If you are not satisfied with the debit, you can raise a request
for reviewing again."
Why: KRD F9 requires both endings (Rs 0 if right / full Rs if wrong). Neither appears, nor the
amount. "Only once" is demoted to 11px grey footer. The L2 sheet shows only the bad ending, so the
upside is never stated at either decision point. 13 words of subordinate-clause English — the least
translatable string in the project.
Fix: "Say it was not your mistake. If you are right, Rs 0 is cut. If you are wrong, the full Rs 142
is cut. One try only." Mirror the Rs 0 half onto the sheet.
Suggested command: /impeccable clarify

### [P1] Money and time have no typographic rank on a money-and-time surface
Where: InfoBanner.css:11-17 (13px), caseStates.js:40.
Measurement: 6 distinct font sizes across the L1 set — 11,12,13,14,15,16px, every consecutive
integer, no gaps. Largest type is 1.45x the smallest. Rs 142 and "5 days" render at 13px, smaller
than the button label, card titles, page title and body text. The F5 countdown chip exists on list
rows (caseStates.js:49) and is dropped on entering L1.
Why: tone is a background colour; it says "at risk" but not how much or how long. In daylight on a
low-end screen a 13px amber-on-cream paragraph is the hardest thing on the page, carrying the two
most important facts. This is why the page reads generic.
Fix: amount-first slot 2 on money states — Rs 142 at display scale, countdown as an amber pill on
the same row, prose reduced to one supporting line. No height cost. Collapse 6 sizes to 4.
Suggested command: /impeccable typeset

### [P1] "What the team decided" is untrue in three states and repeats the banner
Where: resolveCaseView.js:88-92 hardcodes one heading for any record.outcome.
- case-debited: claims a team decided; body says the 7-day window closed. No team decided anything.
  Banner 200px above already said the same sentence.
- case-lif-returned: claims a team decided; body says "You returned the parcel." Banner and
  credit-pair rows already said it twice more. Three tellings of one fact.
- case-waived-sla: banner, secondary block and footer all say "we missed the SLA."
Why: attributing a silence-timeout to "the team" manufactures a human antagonist for an angry Pilot
and is exactly the process-fiction the brand voice bans. The duplication is why terminal pages run
600-740px to convey one bit.
Fix: three headings chosen by what produced the outcome — "What the team decided" (agent review),
"What happened to the money" (timer paths), "What you did" (Pilot-caused). Suppress the block when
it restates the banner.
Suggested command: /impeccable clarify

### [P1] Contrast and touch targets miss the Android floor on every page
- 8 failing contrast pairs. Worst: 2.34:1 "Dispute — paused till 28 Aug" label; 2.49:1 Add-your-side
  Submit; 2.89:1 "If you do nothing" label (the F9 requirement, below threshold). #8E96A3 on white
  at 2.98:1 appears on all 11 presets. The passing risk banner clears 4.5:1 by 0.05.
- Back button 24x24 on all 11 pages — half Material's 48x48 dp floor. Voice chip 32-36px tall,
  3-4x per page. Add-your-side textarea 40px tall.
- Type is fixed px throughout: html { font-size: 130% } produced byte-identical layout. Android type
  must scale with the system font setting; this cannot.
Why: the audience is low-literacy readers on low-end screens in outdoor daylight, and the strings at
those ratios are the consequence warnings.
Suggested command: /impeccable audit

## Persona Red Flags

Low-literacy Pilot, non-English localisation, 2G:
- Four identical voice chips on case-attributed with no indication of scope; at four instances the
  affordance reads as decoration.
- Evidence grid renders striped grey placeholders as the dominant visual mass — 180px of prime
  above-fold space, and the real state for many seconds on 2G. PRODUCT.md's "comprehensible with
  images absent" is met by the caption but not by the composition.
- Every fold problem worsens in every non-English language, and the fold is where the silence
  consequence sits.
- "Secondary QC mismatch" is untranslated internal vocabulary used as a page title on three states.

Pilot who believes the attribution is wrong:
- The page never says who marked this. "Loss marked to you" — passive, no accountable party.
- Dispute is the quieter button (outline vs solid navy Accept) on the page whose thesis is the right
  of reply.
- Cool-off says dispute reopens 28 Aug while days: 5 puts deduction around 17 Aug — told twice to
  wait for a date eleven days after the money is gone. coolOffEnds is a hardcoded default unrelated
  to the case's own window.
- On case-in-dispute the amount at stake appears only in the third tracker step, below the fold, at
  4.02:1.

Pilot in case-debited, money already gone:
- Opens grey, closes with "Kept in your history for 3 months" — a retention notice as the last thing
  read on the page they will re-read.
- No "how to avoid this next time." The coaching tip exists on all five reasons and is structurally
  blocked from every debitable one: the gate reason.evidence.length === 0 (resolveCaseView.js:83)
  passes only for LiF, where a second condition suppresses it too. Verified: tips render on ZERO of
  the eleven L1 states. PRODUCT.md's success metric is behaviour change.
- The payment pointer is correct and unclickable — an instruction with no way to follow it.

## Minor Observations

- StatusTracker renders a dangling rail: buildTracker sets neither isLast nor nextDone, so !isLast is
  always true and the rail never lights. Two-line fix.
- Token discipline breaks in the wrong components: WhatToDoCard.css raw 14px at lines 2,10,30,93;
  #F6F9FE, #DCE6F5, #4A5C77, #F1F3F7, #9AA1AD, #FBFBFD, #071F45 hardcoded across WhatToDoCard.css,
  MoneyRemedyBlock.css, InfoBanner.css. Six off-whites now load-bearing.
- record.days carries two opposite meanings: days-until-deduction on ATTRIBUTED, days-until-reply on
  IN_DISPUTE.
- The hedge is above the fold and the certainty below it: "might prevent it" vs "will be deducted."
  "might prevent it" is the closest thing to an implied waiver, which PRODUCT.md forbids.
- "Adding proper justification may prevent deduction but does not guarantee it" is legal register and
  still does not explain the Y% model.
- case-info-only says "No money is deducted for this" in the banner and again 900px later.
- Add-your-side Submit is disabled grey with no visible relationship to the empty textarea, and sits
  3px past the fold.
- "Tap a photo to see it full size" appears on all 8 photo-bearing states and opens nothing.
- Zero console errors or React warnings on all 11 presets.

## Questions to Consider

1. If the coaching tip renders on zero of eleven states, what is the behaviour-change flywheel built on?
2. Why is Dispute the quieter button on the page whose thesis is the right of reply?
3. What should the last sentence a debited Pilot reads be? It is currently a retention notice.
4. Does the full evidence grid belong at slot 4, or does "2 photos ›" belong there with the grid
   behind a tap? The slot stays; only its density changes.

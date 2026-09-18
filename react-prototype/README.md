# FE Loss Report Card — React prototype

React port of `Input Prototype/FE Report Card V9 - Payments Tab (WIP).html`
(a Claude Design canvas bundle) — same screens, same state machine, same
visual design tokens, now as reusable components + JSON mock data, presented
through a reusable **presenter/control-panel template** instead of one
compiled/compressed HTML file.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Structure

```
src/
  presenter/               — GENERIC, app-agnostic. Knows nothing about
                              Losses/Earnings/this app. Lift this whole
                              folder into the next prototype unchanged.
    PresenterShell.jsx      — layout: a "stage" (whatever the prototype is)
                              + a control panel docked on the right.
    ControlPanel.jsx        — renders {title, sections[{title, controls[]}]}
                              generically; dispatches each control's `type`
                              to a renderer in controls/.
    controls/               — control atoms: SegmentedControl (pill toggle),
                              Select (native dropdown). Add a new control
                              kind by adding one file here + one entry in
                              ControlPanel.jsx's CONTROL_TYPES map.

  config/                  — the loss-domain configuration the whole L1/L2
                              architecture rests on (see Design System/
                              LOSS_DETAIL_ARCHITECTURE_AUDIT.md).
    lossReasons.js          — REASON REGISTRY (axis 1). One row per loss type:
                              FE name, money behaviour, evidence set, explain,
                              tip, actions, payment line. ADDING A LOSS TYPE =
                              ADDING A ROW HERE. Business owns these mappings.
    caseStates.js           — CASE-STATE TABLE (axis 2), straight from the KRD
                              status lifecycle. Each state declares tone, money
                              statement, action block, tracker, footer.
    screenPresets.js        — what the control panel's screen dropdown offers;
                              a case preset is (record + state), so every
                              lifecycle state is reviewable without its own
                              screen id.

  app/
    presenterSections.js    — THE ONLY file that connects the generic
                              presenter/ to this app's state. Defines the
                              3 section kinds: Global variants (tab
                              structure), Sectional variants (one section's
                              swappable design), Screens (jump to any of
                              the 14 screens, compacted into a dropdown).
                              Edit this when you add/change a variant.

  data/
    activeDataset.js       — THE DATASET SWITCH. Picks Mock or Live (the
                              panel's Session > Data source dropdown) and is
                              what every other module imports. Switching
                              persists to localStorage and reloads;
                              ?data=mock / ?data=live overrides it.
    mockData.json          — the demo fixture: every hardcoded array from the
                              original prototype (losses, wrong pickups,
                              closed cases, payments, payment-details line
                              items, current cycle, daily earnings), covering
                              every loss type and lifecycle state.
    liveData.json          — one real Pilot's nine audited losses, transcribed
                              from "External Memory/Debit reason master
                              table.xlsx" (sheet "Sheet4"): six debitable rows
                              with real AWBs, hubs, amounts, audit date and
                              photographs, plus three wrong pickups carrying
                              the real answers he gave the pickup
                              questionnaire that day. The variant you show him.
                              Which rows of the sheet are in, and why, is in
                              the file's own `_debitRowsNote` / `_wrongNote`.
                              Either one swaps for a real API response shaped
                              the same way.

  public/
    evidence/<awb>/*.jpg   — the Live rows' real pickup / delivery / secondary
                              QC photographs and listing covers, downloaded
                              from images.meesho.com so they are part of the
                              build and ship with every Vercel deploy. Every
                              file's source URL is in data/evidence-sources.md.
    catalog/*.avif         — the stock catalogue behind row thumbs and
                              stand-in evidence tiles (was three remote URLs).
  state/
    useLossesApp.js        — the ONE controller hook: owns state (incl. the
                              active global/sectional variants) and derives
                              every value screens need. All branching logic
                              lives here — screens stay presentational.
    resolveCaseView.js     — THE L1 TEMPLATE: `L1 = f(reasonCode, caseState)`.
                              Turns a record + state into the 8 fixed slots the
                              loss detail page renders. Every loss type and
                              every lifecycle state goes through this one
                              function — there is no per-type screen.
    helpers.js              — small pure date/format helpers.
  styles/tokens.css        — design tokens (colors, type scale, spacing, radii),
                              ported verbatim from Design System/VISUAL_DESIGN_SPEC.md.
                              Change a value here, not in a component file.
                              (presenter/ deliberately does NOT use these —
                              see "Decoupling" below.)
  components/
    layout/    — PhoneFrame (the 360x780 mobile frame)
    common/    — shared primitives: Chip, AlertPill, AudioChip, BottomSheet,
                 ListRow, SectionHeader, SectionDivider, PaymentListItem,
                 UtilityChipRow, icons.
    earnings/  — Earnings shell: header, segmented tabs, the Losses list body
                 (sectioned, unified and loss-wise layouts live side by side
                 here, gated by vm.isUnified / vm.showLossWiseSection),
                 My Earnings tab content, the Current Cycle card, and the
                 Losses entry-point widget (card/banner sectional variant).
    losses/    — LossesL1Screen: Losses promoted out of the tab bar into its
                 own page (entry points that free the tab). Reuses LossesBody
                 unchanged — only the header chrome around it differs.
    payments/  — Payments tab list + Payment Details drill-down + collapsible
                 pd-cards + Lost Shipments modal
    detail/    — CaseDetailScreen: the SINGLE loss detail page for every loss
                 type and every lifecycle state, rendering resolveCaseView's
                 slots in a fixed order. Slot renderers alongside it:
                 PhotoEvidenceGroup, InfoBlock, StatusTracker,
                 MoneyRemedyBlock (payment pointer / recovery / credit pair),
                 AddYourSideCard. The offers case has no explanation block of
                 its own — the hero carries the stake, the countdown and the
                 status, and the sticky ActionBar carries the choice.
    sheet/     — Accept/Dispute reason-picker sheet
    awareness/ — safety overlay
```

## Adding a new loss type

The whole point of the `f(reasonCode, caseState)` architecture (see
`Design System/LOSS_DETAIL_ARCHITECTURE_AUDIT.md`):

1. Add a row to `src/config/lossReasons.js` — FE name, `money` behaviour,
   evidence set, explain, tip, actions, payment line.
2. Mark which lifecycle states are legal for it (audit §4f's matrix).
3. Only if it needs a remedy the app doesn't have yet: one new `remedy.kind`
   + one L2 intent.
4. To review it, add presets in `src/config/screenPresets.js`.

No new screen, no new branch in `CaseDetailScreen`, no new visual treatment —
tone comes from where the money is, not from the loss type.

## Variants: how to add one

Two independent kinds, both driven by plain state in `useLossesApp.js` and
both exposed as controls via `app/presenterSections.js`:

- **Global variant** — reshapes the whole app. The losses area's shape is three
  independent axes in `config/lossesStructure.js` — `lossesTab` (a Losses
  segment), `earningsEntry` (the My Earnings widget) and `historicPlacement`
  (`hidden` / `subtab` / `own-tab`, i.e. *where* the ledger lives, not
  whether). 12 points, 9 distinct arrangements; `resolveLossesStructure`
  normalises the impossible one. Named arrangements are gone — they described
  whole configurations rather than what varied between them.
- **Sectional variant** — reshapes one section/widget only, e.g. `lossesLayout`
  (Sectioned/Unified/Loss Wise list) or `insightBannerMode` (Single/Rolling
  insight banner). To add one: give the section component a `variant` prop,
  branch on it, add the state field + setter in `useLossesApp.js`, then add the
  control in `presenterSections.js`.

Because both live as named state fields (not booleans threaded ad hoc
through props), the control panel just binds directly to them — no wiring
needed anywhere else when a variant is switched live.

## Decoupling — why this scales

- `presenter/` never imports anything from `state/`, `data/`, or
  `components/`. It only knows "sections of typed controls" and "a stage."
  That's what makes it liftable into a completely different prototype.
- `app/presenterSections.js` is the single seam between the generic
  presenter and this app — the only file that would need to be rewritten
  (not the whole `presenter/` folder) to present something else.
- Components stay presentational; `useLossesApp.js` is the only place that
  branches on variant/screen state. A component never checks
  `state.lossesTab` itself — it receives an already-resolved `vm` prop.

## What's still prototype, not production

- **Font**: `--font-brand` ("Mier B02") is a commercial face not bundled here.
  Add your own `@font-face` (see the original `.html`'s webfont block for the
  substitution it used — Manrope as a stand-in) once you have licensed files.
- **Control panel** (`presenter/`, `app/presenterSections.js`): this is a
  presentation/QA tool for reviewing variants side by side, not real product
  UI — drop it at handover and drive `screen`/variant state from real
  navigation and real feature flags instead.
- **Data**: both datasets (`data/mockData.json`, `data/liveData.json`) are
  static. `useLossesApp`'s derived fields (`needsActionRows`, `paymentRows`,
  etc.) are pure functions of the active dataset + local state — point them at
  real API responses shaped the same way and the components don't need to
  change. Everything outside the Live dataset's six loss rows — earnings,
  payments, base pay, PD cards — has no column in the source sheet and
  carries the prototype's own numbers, rebased onto September.
- **Photos**: the Live rows carry real photographs, via a `photos:
  { own: [...], qc: [...] }` block on the record that `buildEvidence` prefers
  over anything else. Mock rows have no such block, so they fall back to the
  stock catalogue, and a group with no source at all still gets the striped
  placeholder (`PhotoEvidenceGroup`). Real sources are a per-record field, not
  a code change.
- Pixel fidelity: colors/type/spacing all reference `tokens.css` variables
  rather than hardcoded values, specifically so a pixel-perfect pass only
  ever touches that one file plus per-component layout tweaks — not a
  find-and-replace across every component.

import { useMemo, useState } from 'react'
import data from '../data/activeDataset.js'
import { fmt, inCurrentCycle, parseShortDate, settledOn, TODAY } from './helpers'
import { resolveCaseView } from './resolveCaseView.js'
import { getReason, INFO_ONLY_NOTE, INFO_ONLY_TOTAL } from '../config/lossReasons.js'
import { SCREEN_PRESETS, getPreset } from '../config/screenPresets.js'
import { productImage } from './productImages.js'
import { CATALOG_IMAGES_DEFAULT, CATALOG_IMAGES_LAYER, COOL_OFF_NOTICE_LAYER } from '../config/layerIds.js'
import { getConfirmation } from '../config/confirmations.js'
import { getOutcomes } from '../config/caseTransitions.js'
import { DEFAULT_LOSSES_STRUCTURE, resolveLossesStructure } from '../config/lossesStructure.js'
import { BUCKET_NAME, bucketName } from '../config/lossBuckets.js'
import {
  DEFAULT_LINE_ITEM_DESIGN, DEFAULT_LINE_ITEM_HEADING,
  resolveLineItemDesign, resolveLineItemHeading,
} from '../config/lineItemDesigns.js'
import {
  ENTRY_STATE_TREATMENT, entryTimerText, resolveEntryState,
} from '../config/lossesEntryStates.js'
import { getDisputeStanding } from '../config/disputeCoolOff.js'
import { resolveGrace } from '../config/gracePeriod.js'
import { applyGrace } from './grace.js'
import { getRemedyGroup, REMEDY_GROUP_ORDER } from '../config/remedyGroups.js'
import { seedCases, seedIdAt } from './caseStore.js'
import { buildHistoricLedger } from './historicLedger.js'
import { buildInsights, INSIGHT_BANNER_COUNT } from './insights.js'
import { buildPaymentBreakdown } from './paymentBreakdown.js'
import { useLayerRegistry } from '../presenter/LayerVisibilityContext.jsx'

const PD_EXPANDED_DEFAULT = data.pdExpandedDefault


/**
 * Surfaces, not screens-per-state. Every loss detail page is the single
 * 'case' surface, parameterised by `caseRef` — which is what lets a new loss
 * type or lifecycle state arrive without a new screen id.
 *
 * The cases themselves are NOT in here: they live in their own pool (see
 * caseStore.js), because acting on a case has to outlive the screen you acted
 * on it from. This object is UI state — where you are, what's open, what
 * you've typed into the sheet you haven't submitted yet.
 */
const initialState = {
  // My Earnings, not the Losses list. Under the default entry arrangement
  // (`active-plus-historic`) losses are reached FROM My Earnings, so opening
  // on the list would skip the entry point the arrangement exists to test.
  screen: 'myearnings',
  // Which losses surface a case was opened from, so Back returns there.
  caseReturnTo: 'home',
  // Which case the detail screen and both sheets are addressing. `id` points
  // into the case pool; `stateOverride` is a VIEW-only override, used by the
  // presets that want to preview a state without moving the case into it.
  caseRef: { id: seedIdAt('marked', 2), stateOverride: null },

  acceptReason: null,
  disputeReason: null,
  acceptNote: '',
  disputeNote: '',
  pdExpanded: PD_EXPANDED_DEFAULT,
  pdModal: null,
  pdetailReturnTo: 'payments',
  lossFilter: null,
  // Which half of the Losses surface is showing — 'current' (the working
  // list) or 'historic' (the ledger). Every entry-point arrangement has both
  // now; see components/losses/LossesTabbedBody.jsx. It persists across
  // navigation on purpose: open a case from Historic, come back, and you are
  // still in Historic rather than dropped into a list you did not leave from.
  lossesSubTab: 'current',
  awSeen: false,
  // Whether the Lost-in-Field claim sheet is open. That the claim was SENT is
  // not recorded here at all — it's the case's own state (LIF_CLAIM_SENT).
  // The Pilot's "add your side" text is likewise per-case.
  returnedClaimOpen: false,
  // The "settling this cycle" drill-down, opened from the Current Cycle card.
  cycleSheetOpen: false,
  // Which insight's detail sheet is open, by insight id.
  insightOpen: null,
  // Whether the Historic tab's break-up sheet is up.
  breakupOpen: false,
  // Which banner treatment to force, for review: 'auto' follows the data.
  // See config/lossesEntryStates.js.
  entryStateOverride: 'auto',
  // Which evidence photo the full-screen viewer is showing, if any:
  // { src, label, group }. UI state, not a fact about the case — which is why
  // it is here and not on the record.
  photoViewer: null,
  // Which insight the rolling banner is showing.
  insightIndex: 0,
  // Which confirmation popup is up, by id from config/confirmations.js.
  // Every flow that submits something sets this; the popup clears it itself
  // after 3 seconds.
  confirmation: null,

  // ---- Presenter-controlled variants (see src/app/presenterSections.js and
  // Design System/CONFIG_REFERENCE.md) ----
  // Dispute cool-off has no state key here — it IS the Layers panel's
  // "Cool-off notice (Losses list)" toggle (see COOL_OFF_NOTICE_LAYER below).
  // One toggle, one meaning: showing the banner and pausing dispute are the
  // same fact, not two settings that happen to agree.
  //
  // These four are the config the prototype opens on — the arrangement
  // currently being shown and reviewed, not a neutral baseline. Every other
  // option is still one select away in the presenter panel; changing what
  // loads first is a row here and nothing else.
  // The Pilot's consecutive-wrong-dispute count. Seeded from the fixture and
  // settable from the panel, because the dispute sheet reads differently at
  // 0, 1 and 2 and all three have to be walkable.
  wrongDisputes: data.pilot?.wrongDisputesInARow ?? 0,
  // The new-Pilot grace window (config/gracePeriod.js). OFF by default: it is
  // a policy under review, and the dataset without it is the app as it stands
  // today — which is the thing the covered version has to be compared against.
  gracePeriod: false,
  // The losses area's shape, as three independent axes rather than one named
  // arrangement — see config/lossesStructure.js.
  ...DEFAULT_LOSSES_STRUCTURE,
  flowVariant: 'dispute-only',
  lossesLayout: 'sectioned',
  // How one loss reads in a list — photo, AWB, and where the clock sits.
  // One setting for every surface that lists losses, so the list and the
  // sheets over it cannot disagree (config/lineItemDesigns.js).
  lineItemDesign: DEFAULT_LINE_ITEM_DESIGN,
  // Which of the row's two body lines leads — see LINE_ITEM_HEADINGS.
  lineItemHeading: DEFAULT_LINE_ITEM_HEADING,
  // Rolling by default: a Pilot usually has more than one habit costing them
  // money, and the single banner spent the whole surface on the costliest
  // while saying nothing about the rest. The rolling track shows the same one
  // first and lets the others be swiped to (components/losses/InsightBanner).
  insightBannerMode: 'rolling',
  // Whether accept/dispute is a pushed page or a bottom sheet over the case.
  // Sheet by default — see CONFIG_REFERENCE.md § Accept / Dispute
  // presentation for the four objections it has to keep answering.
  // Which case+mode the part-written accept/dispute answer belongs to, so a
  // draft is restored when the same sheet reopens and never leaks onto a
  // different loss. Only the sheet presentation keeps drafts — see openL2.
  l2DraftFor: null,
}

// Prototype-level props (formerly the Claude Design "data-props" QA panel).
// Flip these to explore the other states.
const props = {
  replyDays: 7,
  // How long the hub-scan check takes. Promised in the claim sheet and
  // counted down on the case afterwards — one number so the two can't drift.
  hubCheckDays: 2,
  showClosed: true,
  emptyMarked: false,
  coolOffEnds: '28 Aug',
  awarenessOverlay: false,
  awarenessRule: 'Once a week',
  awarenessMessage: '10+ pilots were removed from the system for fraudulent practices',
}

/**
 * Which preset best describes where we are, for the dropdown's own value.
 * It lives here rather than in `config/screenPresets.js` so that file can
 * stay pure data: presets address cases the readable way, as a pointer into
 * the fixture (`{ list: 'marked', index: 2 }`), and the pointer is resolved
 * to a case id here.
 *
 * A jumped-to case shows whatever state it is actually in now, which is the
 * point of a walkable prototype — so once you have accepted "Loss · needs
 * action", that preset's label no longer describes it. "Reset to mock data"
 * in the panel puts every case back.
 */
function findPresetId(state) {
  const ref = state.caseRef || {}
  const match = SCREEN_PRESETS.find((p) => {
    if (p.screen !== state.screen) return false
    if (!p.caseRef) return true
    return seedIdAt(p.caseRef.list, p.caseRef.index) === ref.id
      && (p.caseRef.stateOverride || null) === (ref.stateOverride || null)
  })
  return match ? match.id : ''
}

/** Which list section a case belongs in — derived from its state, not hardcoded per row. */
const SECTION_OF_STATE = {
  ATTRIBUTED: 'needsAction',
  OPEN_DISPUTE_PAUSED: 'needsAction',
  LIF_RECOVERY_OPEN: 'needsAction',
  IN_DISPUTE: 'pending',
  ACCEPTED: 'pending',
  LIF_CLAIM_SENT: 'pending',
  INFO_ONLY: 'wrong',
  DEBITED: 'closed',
  WAIVED: 'closed',
  NOT_DEDUCTED: 'closed',
  RETURNED_CREDITED: 'closed',
  GRACE_WAIVED: 'closed',
}

export function useLossesApp() {
  const [state, setState] = useState(initialState)
  // Seeded, never persisted: a refresh restores the fixtures (caseStore.js).
  const [cases, setCases] = useState(seedCases)
  const patch = (obj) => setState((s) => ({ ...s, ...obj }))

  /** The one way a case ever changes. Everything else is a view of the pool. */
  const updateCase = (id, changes) => {
    setCases((cs) => cs.map((c) => (c.id === id ? { ...c, ...changes } : c)))
  }

  const resetPrototype = () => {
    setCases(seedCases())
    setState(initialState)
  }

  /** Presenter navigation: every jump target is a preset (surface or case). */
  const go = (presetId) => {
    const preset = getPreset(presetId)
    // A jump is a new context, so any confirmation still counting down on the
    // old screen goes with it rather than floating over the new one.
    const next = { screen: preset.screen, confirmation: null }
    if (preset.caseRef) {
      next.caseRef = {
        id: seedIdAt(preset.caseRef.list, preset.caseRef.index),
        stateOverride: preset.caseRef.stateOverride || null,
      }
    }
    if (preset.screen === 'awareness') next.awSeen = false
    patch(next)
  }

  const togglePdCard = (key) => {
    const cur = state.pdExpanded || PD_EXPANDED_DEFAULT
    patch({ pdExpanded: { ...cur, [key]: !cur[key] } })
  }

  const setWrongDisputes = (n) => patch({ wrongDisputes: Number(n) })
  const setGracePeriod = (on) => patch({ gracePeriod: on })
  const setEntryStateOverride = (id) => patch({ entryStateOverride: id })
  const setLossesTab = (on) => patch({ lossesTab: on })
  const setEarningsEntry = (on) => patch({ earningsEntry: on })
  const setHistoricPlacement = (id) => patch({ historicPlacement: id })
  const setFlowVariant = (id) => patch({ flowVariant: id })
  const setLossesLayout = (id) => patch({ lossesLayout: id })
  const setLineItemDesign = (id) => patch({ lineItemDesign: id })
  const setLineItemHeading = (id) => patch({ lineItemHeading: id })
  const setInsightBannerMode = (id) => patch({ insightBannerMode: id, insightIndex: 0 })

  // The one business flag that's driven by a Layers toggle rather than its
  // own state key — see the comment on `initialState` above and
  // CONFIG_REFERENCE.md § Layer visibility. `layerRegistry` is undefined
  // outside the provider (e.g. a unit test); `coolOff` then just defaults off.
  const layerRegistry = useLayerRegistry()

  const vm = useMemo(
    () => computeViewModel(state, props, cases, { patch, go, togglePdCard, updateCase, layerRegistry }),
    [state, cases, layerRegistry],
  )

  return {
    state,
    vm,
    actions: {
      patch, go, togglePdCard, resetPrototype, setWrongDisputes, setGracePeriod,
      setLossesTab, setEarningsEntry, setHistoricPlacement,
      setFlowVariant, setLossesLayout, setLineItemDesign, setLineItemHeading,
      setInsightBannerMode,
      setEntryStateOverride,
    },
  }
}

function computeViewModel(state, props, pool, { patch, go, togglePdCard, updateCase, layerRegistry }) {
  const {
    payments: PAYMENTS,
    acceptChips: ACCEPT_CHIPS, disputeChips: DISPUTE_CHIPS,
    lossFilterChips: LOSS_FILTER_CHIPS, pdCards: PD_CARDS_RAW,
    currentCycle: CURRENT_CYCLE, dailyEarnings: DAILY_EARNINGS,
    dailyEarningsMonth: DAILY_EARNINGS_MONTH,
  } = data

  const replyDays = props.replyDays ?? 7
  const hubCheckDays = props.hubCheckDays ?? 2
  const showClosed = props.showClosed ?? true
  const emptyMarked = props.emptyMarked ?? false
  // Off by default — same as the toggle's own `defaultVisible={false}` on
  // the `<Layer>` in LossesBody.jsx; the two defaults have to agree, since
  // this is the fallback for whenever that Layer hasn't mounted yet (e.g. on
  // first load, before the Losses list has ever rendered).
  const coolOff = layerRegistry?.isVisible(COOL_OFF_NOTICE_LAYER, false) ?? false
  const coolOffEnds = props.coolOffEnds ?? '28 Aug'
  // Only Dispute (see Design System/CONFIG_REFERENCE.md § Global variants):
  // hides every accept-related affordance across the app. Threaded through
  // `ctx` rather than read off `state` inside resolveCaseView, so the L1
  // template stays a pure function of (record, state, ctx) — same contract
  // as replyDays/coolOffEnds.
  const onlyDispute = state.flowVariant === 'dispute-only'
  // The product-listing photo row on EVERY loss page. Same shape as
  // `coolOff` above: one Layers toggle drives it, and the id/default pair
  // here has to match the `<Layer>`s that register it (LossesBody and
  // CaseDetailScreen) — see CONFIG_REFERENCE.md § Layer visibility.
  // Both values come from `config/layerIds.js` so there is one answer rather
  // than three that agree by hand; the default is per-dataset (on for Mock,
  // off for Live) and that file says why.
  const catalogImages = layerRegistry?.isVisible(CATALOG_IMAGES_LAYER, CATALOG_IMAGES_DEFAULT) ?? CATALOG_IMAGES_DEFAULT

  // THE GRACE WINDOW (config/gracePeriod.js), resolved against the Pilot on
  // the fixture and applied to the pool ONCE, right here, before any surface
  // has read it. Everything below — the buckets, the totals, the insight
  // engine, the ledger, the payment breakdown, the cycle card, the entry
  // banner — is computed from `cases`, so the policy reaches all of them
  // without any of them knowing it exists. See state/grace.js.
  const grace = resolveGrace({
    on: state.gracePeriod,
    joinedOn: data.pilot?.joinedOn,
    today: TODAY,
  })
  const cases = applyGrace(pool, grace)

  const ctx = { replyDays, coolOffEnds, onlyDispute, catalogImages, grace }

  const confirmationContent = getConfirmation(state.confirmation)

  const rawScreen = state.screen
  const s = rawScreen === 'awareness' ? 'home' : rawScreen

  const isPayments = s === 'payments'
  const isMyEarnings = s === 'myearnings'
  const inPaymentDetail = s === 'pdetail'
  // The losses area's shape — see config/lossesStructure.js.
  const struct = resolveLossesStructure(state)
  // Two possible losses surfaces, and which of them exist depends on the axes:
  //   'home'          — the Losses tab, when there is one
  //   'losses-active' — the pushed page, when the tab is absent or taken
  // They coexist only in the split arrangement, where the tab IS the ledger
  // and the working list needs somewhere else to be.
  const onLossesTab = s === 'home' && struct.lossesTab
  // Without a tab there is nothing for 'home' to land on, so it resolves to
  // the pushed page instead of to a screen that isn't there.
  const onLossesPage = s === 'losses-active' || (s === 'home' && !struct.lossesTab)
  const inShell = isPayments || isMyEarnings || onLossesTab
  const inLossesL1 = onLossesPage
  const inCase = s === 'case'
  const inSheet = s === 'accept' || s === 'dispute'
  // Accept/dispute as a sheet over the case rather than a pushed page. The
  // case detail stays mounted underneath, so the Pilot keeps sight of the
  // loss they are acting on.

  // Which half is up. Three arrangements, and only the middle one asks the
  // sub-tab:
  //   hidden   — the working list is the whole area
  //   sub-tab  — both halves on one surface, `state.lossesSubTab` picks
  //   own-tab  — the halves are on DIFFERENT surfaces, so the surface picks
  //
  // Everything below that belongs to the working list is gated on
  // `onLossesList` — the Current Cycle half specifically, never the surface —
  // so the filter chips and the bucket sections cannot render behind the
  // ledger.
  const onAnyLossesSurface = onLossesTab || onLossesPage
  const subTab = struct.hasSubTabs ? state.lossesSubTab : 'current'
  const onLossesList = struct.splitHistoric
    ? onLossesPage
    : onAnyLossesSurface && subTab === 'current'
  const onHistoric = struct.splitHistoric
    ? onLossesTab
    : struct.showHistoric && onAnyLossesSurface && subTab === 'historic'

  // Three layouts now, so this is a named value rather than the boolean it
  // used to be. `altLayout` meant "unified", which stopped being answerable
  // the moment a third arrangement existed.
  const layout = state.lossesLayout
  const isUnified = layout === 'unified'
  const isLossWise = layout === 'loss-wise'
  const isSectioned = !isUnified && !isLossWise

  // Loss Wise already cuts the list by loss TYPE, so the only axis left for
  // its chip row is decision state. "Wrong Pickups" is a loss type, and a chip
  // row that mixes the two axes asks a Pilot to filter by two different things
  // in one row. The chip drops out below — and a 'wrong' filter carried in
  // from another layout drops with it, so the list can't sit silently trimmed
  // by a chip that isn't on screen to un-tap.
  const lossFilter = isLossWise && state.lossFilter === 'wrong' ? null : (state.lossFilter || null)

  // ---- the case currently addressed (detail screen + both sheets share it) ----
  const ref = state.caseRef || initialState.caseRef
  const record = cases.find((c) => c.id === ref.id) || cases[0]
  // Cool-off is a policy overlay on an open case, so the prop can force it the
  // same way a preset can (KRD F17: accept and silence stay open throughout).
  const forcedState = coolOff && (ref.stateOverride || record.caseState) === 'ATTRIBUTED'
    ? 'OPEN_DISPUTE_PAUSED'
    : ref.stateOverride
  const caseView = resolveCaseView({ record, stateId: forcedState, ctx })
  const caseReason = getReason(record.reasonCode)

  // ---------------- list rows (L0) ----------------
  // One builder for every row in the pool. Title, chip and money treatment all
  // come from the registry + state table, so a new loss type shows up
  // correctly in the list without touching this function — and so does a case
  // the Pilot just moved, since `_cat` below is read off its current state.
  const buildRow = (rec) => {
    const view = resolveCaseView({ record: rec, ctx })
    const chip = view.listChip
    const section = SECTION_OF_STATE[view.stateId] || 'needsAction'
    // Names, not colours. What each tone looks like is ListRow's business and
    // the badge palette is Chip's — this file only knows what a row MEANS.
    //
    // The money comes from the state table, not from this file, and it is the
    // same object the loss page's hero renders — see the money grammar in
    // config/caseStates.js.
    const money = view.listMoney

    return {
      id: rec.id,
      title: view.identity.title,
      // The AWB rides between the reason and the clock, and it is the row's
      // LAST rank — it is how a Pilot confirms which parcel once something
      // has already caught their eye, never what catches it. Position is not
      // what ranks it here; weight and colour are (see .list-row__sub).
      sub: view.identity.sub,
      amount: money.amount,
      // What it would have been, struck — absent unless the outcome changed it.
      amountWas: money.was || null,
      amountTone: money.tone,
      chip: chip?.text,
      chipKind: chip?.kind || 'info',
      // A row's own first photograph when it has one (every Live-data row
      // does), and only then the stock catalogue — so the list shows the
      // Pilot the actual photo the loss was raised on, and the page he opens
      // shows the same one enlarged.
      thumb: rec.photos?.own?.[0] || productImage(rec.awb),
      _sortDate: rec.date,
      // Which payout cycle this case's money settled in — only decided cases
      // ever read it (see `closedRows` below).
      _settledOn: settledOn(rec),
      _cat: section,
      _state: view.stateId,
      _settlesThisCycle: view.settlesThisCycle,
      _days: rec.days ?? 99,
      // Which remedy this loss needs — derived from the reason registry's own
      // fields, so a new loss type groups itself (config/remedyGroups.js).
      _remedy: getRemedyGroup(getReason(rec.reasonCode)).id,
      open: () => patch({ screen: 'case', caseRef: { id: rec.id, stateOverride: null }, caseReturnTo: s }),
    }
  }

  // What keeps costing this Pilot (state/insights.js). The contextual banner
  // reads EVERY case, not just open ones: "this keeps happening to you" is a
  // claim about a track record, and the handful of open cases can never carry
  // it. The historic block reads settled cases only.
  // Top 3 by money, always three — the contextual banner is a fixed-length
  // row of cards now, not a list of however many patterns qualified.
  const insights = buildInsights(cases, { scope: 'all', rowFor: buildRow, topN: INSIGHT_BANNER_COUNT })
  // Every kind of loss in history, threshold and all — the historic scope has
  // only one reader now and it is the break-up sheet, which has to reconcile
  // with the figure that sent the Pilot to it and so cannot drop the rare
  // ones. See HistoricBreakupSheet.
  const historicKinds = buildInsights(cases, { scope: 'historic', rowFor: buildRow, minCases: 1 })
  // The open sheet remembers WHICH banner opened it, not just which loss type.
  // Both scopes produce the same group ids, so an id alone resolved to the
  // all-scope insight every time — and the historic banner ("₹384 across 3
  // losses") opened a sheet reading ₹715 across 5. A sheet must show the
  // number the Pilot just tapped.
  const insightScopes = { all: insights, historic: historicKinds }
  const openInsight = state.insightOpen
    ? (insightScopes[state.insightOpen.scope] || insights)
      .find((i) => i.id === state.insightOpen.id) || null
    : null

  // The ledger behind the split arrangement's Losses tab (historicLedger.js).
  // Rows come from the app's one row builder, so a historic row IS a losses
  // list row — same shape, same status chip vocabulary.
  const historic = buildHistoricLedger(cases, { rowFor: buildRow })

  // Every bucket is a filter over the one pool, by the case's CURRENT state.
  // That is the whole mechanism behind "act on a loss and watch it move": the
  // action rewrites the case, and these four lines re-sort it.
  const allRows = cases.map(buildRow)
  const inBucket = (bucket) => allRows.filter((r) => r._cat === bucket)

  const byUrgency = (a, b) => a._days - b._days
  // `emptyMarked` empties the two actionable buckets — the "nothing to do"
  // state of the list, which is about open cases, not the whole history.
  const needsActionAll = emptyMarked ? [] : inBucket('needsAction').sort(byUrgency)
  const pendingAll = emptyMarked ? [] : inBucket('pending').sort(byUrgency)
  const wrongRows = inBucket('wrong')
  // Past Losses is THIS CYCLE's decisions. A decided loss from an earlier cycle
  // is history, not a thing the Pilot is still reading the list for — and it
  // already has a home: the historic ledger below keeps the full run, cycle by
  // cycle, for the Losses tab in the 'active-plus-historic' arrangement.
  // Nothing drops out of the app, it stops repeating itself.
  //
  // Only the terminal bucket is cycled: the three active buckets are current
  // by definition (an open case belongs to whatever cycle finally settles it).
  const closedRows = inBucket('closed').filter((r) => inCurrentCycle(r._settledOn))
  // What the list actually renders, so a chip count and the section beneath it
  // are read off the same array — the Past Losses bucket is cycled, and a chip
  // saying "Past Losses (8)" over three rows would be the first lie.
  const listedBuckets = {
    needsAction: needsActionAll, pending: pendingAll, wrong: wrongRows, closed: closedRows,
  }
  const listedRows = [].concat(...Object.values(listedBuckets))

  const sumOf = (rows) => rows.reduce((t, r) => t + Number(String(r.amount).replace(/[^0-9.]/g, '')), 0)
  const needsActionTotal = sumOf(needsActionAll)
  const pendingTotal = sumOf(pendingAll)
  const wrongTotal = sumOf(wrongRows)

  // ---------- the loss entry banner's state (config/lossesEntryStates.js) ----
  // Derived from the pool, so the banner cannot promise a state the list it
  // opens does not have. The panel can force one for review; forcing changes
  // the TREATMENT over whatever the real numbers are, which is the point —
  // the Live dataset only ever produces `actionable`.
  const dataEntryState = resolveEntryState({
    actionableCount: needsActionAll.length,
    pendingCount: pendingAll.length,
  })
  const entryState = state.entryStateOverride === 'auto'
    ? dataEntryState
    : state.entryStateOverride
  const entryTreatment = ENTRY_STATE_TREATMENT[entryState] || ENTRY_STATE_TREATMENT[dataEntryState]

  // `needsActionAll` is sorted by `byUrgency` above, so [0] carries the
  // soonest deadline — the only one that can bite next.
  const entryTimer = (entryTreatment.showTimer && needsActionAll.length)
    ? entryTimerText({ days: needsActionAll[0]._days })
    : null
  // The Past Losses section's total has to state what actually left the Pilot's
  // pocket — now that DEBITED cases exist, "₹0 adjusted" would be a lie.
  const closedDeducted = sumOf(closedRows.filter((r) => r._state === 'DEBITED'))
  const closedTotalLabel = closedDeducted > 0 ? `${fmt(closedDeducted)} deducted` : '₹0 adjusted'

  // "What settles against THIS cycle before it closes" — the middle of the
  // three structural types. Not a state of its own: it is a projection over
  // every case still in play. Two kinds qualify and both really do settle
  // this cycle — the ones the Pilot has not acted on (silence deducts them)
  // and the ones already accepted or disputed, whose decision lands either
  // way before payout. Once a case is terminal it is history, not this cycle.
  // Only what actually comes out of THIS cycle. A disputed loss is excluded —
  // the money is parked until the team replies (see `settlesThisCycle` in
  // config/caseStates.js) — while staying in the active list, still at stake.
  // Kept apart by bucket rather than concatenated flat: the sheet this feeds
  // heads its rows the way the losses list does ("Needs Decision" /
  // "Disputes in Review"), and a flat array cannot say which head a row
  // belongs under.
  const thisCycleNeedsAction = needsActionAll.filter((r) => r._settlesThisCycle)
  const thisCyclePending = pendingAll.filter((r) => r._settlesThisCycle)
  const thisCycleRows = thisCycleNeedsAction.concat(thisCyclePending)
  const thisCycleTotal = sumOf(thisCycleRows)
  const cycleLossLine = thisCycleRows.length > 0
    ? {
      // Copy follows the reference card (Figma WCghUzecsonToq8dCxpm3W ·
      // 7064:37457): "-₹340 from 6 losses to be settled" — no space after the
      // minus, and "losses", not "loss items".
      amount: `-${fmt(thisCycleTotal)}`,
      count: thisCycleRows.length,
      noun: thisCycleRows.length === 1 ? 'loss' : 'losses',
      open: () => patch({ cycleSheetOpen: true }),
    }
    : null

  // Every section head answers the same question on its right-hand side —
  // "what is this group of losses doing to me?" — so every one of them names
  // what its figure IS, not just how big it is. Wrong Pickups says "No
  // deductions" and Past Losses says "₹210 deducted"; these two used to print
  // a bare "₹363", which is the only kind of total a reader has to guess at.
  const NEEDS_ACTION_TOTAL = (total) => `${fmt(total)} at stake`
  const PENDING_TOTAL = (total) => `${fmt(total)} held`

  const withGroup = (rows, group, groupTotal) => rows.map((r, idx) => ({
    ...r, showGroup: idx === 0, group, groupTotal,
  }))
  const needsActionRows = onLossesList ? withGroup(needsActionAll, BUCKET_NAME.needsAction, NEEDS_ACTION_TOTAL(needsActionTotal)) : []
  const pendingRows = onLossesList ? withGroup(pendingAll, BUCKET_NAME.pending, PENDING_TOTAL(pendingTotal)) : []

  // Unified and Loss Wise both show the WHOLE list, so they share one ordering
  // — urgent open cases first, then history newest-first — and differ only in
  // whether that order is then cut into groups.
  let orderedRows = []
  if (onLossesList && (isUnified || isLossWise)) {
    const actionable = needsActionAll.concat(pendingAll).sort(byUrgency)
    const history = wrongRows.concat(closedRows).slice()
      .sort((a, b) => parseShortDate(b._sortDate) - parseShortDate(a._sortDate))
    orderedRows = actionable.concat(history).filter((r) => lossFilter === null || r._cat === lossFilter)
  }
  const unifiedRows = isUnified ? orderedRows : []

  // Grouped by what the Pilot has to DO about each loss. Groups with nothing
  // in them drop out rather than leaving a bare heading.
  const lossWiseGroups = isLossWise
    ? REMEDY_GROUP_ORDER
      .map((group) => {
        const rows = orderedRows.filter((r) => r._remedy === group.id)
        return {
          id: group.id,
          label: group.label,
          rows,
          // An info-only type has no total to state, but it does have an
          // answer — the same one the sectioned layout's Wrong Pickups head
          // gives, so the two layouts can't say different things about the
          // same money.
          total: group.showsTotal ? fmt(sumOf(rows)) : INFO_ONLY_TOTAL,
          info: group.showsTotal ? null : INFO_ONLY_NOTE,
        }
      })
      .filter((group) => group.rows.length > 0)
    : []

  const showUnifiedSection = onLossesList && isUnified && unifiedRows.length > 0
  const showLossWiseSection = onLossesList && isLossWise && lossWiseGroups.length > 0
  const showNeedsActionSection = onLossesList && isSectioned && needsActionRows.length > 0 && (lossFilter === null || lossFilter === 'needsAction')
  const showPendingSection = onLossesList && isSectioned && pendingRows.length > 0 && (lossFilter === null || lossFilter === 'pending')
  // `.length > 0` on these two for the same reason the two above have it: a
  // section head is a label for rows, and with no rows it is a heading that
  // describes nothing — "Wrong Pickups · No deductions" over empty space.
  // Every dataset used to have some of each, so the guard was never missed
  // until the Live fixture arrived with six awaiting-answer losses and no
  // decided cases or wrong pickups at all.
  const showWrongSection = onLossesList && isSectioned && wrongRows.length > 0 && (lossFilter === null || lossFilter === 'wrong')
  const showClosedFiltered = lossFilter === null || lossFilter === 'closed'

  // ---------------- L2 sheets ----------------
  const isAccept = s === 'accept'
  const isDispute = s === 'dispute'
  const picked = isAccept ? state.acceptReason : state.disputeReason
  const chipList = isAccept ? ACCEPT_CHIPS : DISPUTE_CHIPS
  const noteText = (isAccept ? state.acceptNote : state.disputeNote) || ''
  const needsNote = picked === 'Other'
  const canSubmit = !!picked && (!needsNote || noteText.trim().length > 0)
  const amountLabel = fmt(record.amt)

  /**
   * Open the accept or dispute form.
   *
   * A pushed page clears the form every time, as it always has. The SHEET
   * keeps it: a scrim tap or a swipe down is far easier to do by accident
   * than a back press, and silently binning a part-written answer for an
   * irreversible decision is the one thing that presentation must not do.
   * The draft is stamped with the case and mode it belongs to, so it is
   * restored only by reopening the same sheet — never carried onto another
   * loss, the way the old global "add your side" text used to be.
   */
  const openL2 = (mode) => {
    const draftKey = `${record.id}:${mode}`
    const keepDraft = state.l2DraftFor === draftKey
    const cleared = mode === 'accept'
      ? { acceptReason: null, acceptNote: '' }
      : { disputeReason: null, disputeNote: '' }
    patch({ screen: mode, l2DraftFor: draftKey, ...(keepDraft ? {} : cleared) })
  }

  const submitSheet = () => {
    if (!canSubmit) return
    // The case itself moves — which is what carries the change back to the
    // list, where it lands in "Disputes in Review" instead of "Needs Decision".
    //
    // Every field here is load-bearing. Without `actedOn` the page it lands
    // on has no date to work from: the accepted banner read "Accepted on
    // undefined", and the dispute tracker crashed outright computing the
    // reply date off it. And without re-setting `days`, the case keeps the
    // countdown it had as an open case — so the banner chip said "Reply in 5
    // days" (what was left before deduction) while the tracker beneath it
    // said "By 22 Aug" (actedOn + replyDays). That is the exact two-clocks
    // confusion resolveCaseView.js names in its `daysToDeduction` /
    // `daysToReply` comment.
    updateCase(record.id, {
      caseState: isAccept ? 'ACCEPTED' : 'IN_DISPUTE',
      actedReason: picked,
      actedOn: TODAY,
      days: replyDays,
    })
    patch({
      screen: 'case',
      caseRef: { id: record.id, stateOverride: null },
      confirmation: isAccept ? 'accept' : 'dispute',
    })
  }

  // The verdicts nobody in the app can tap for — see config/caseTransitions.js.
  const caseOutcomes = getOutcomes(caseView.stateId).map((outcome) => ({
    id: outcome.id,
    label: outcome.label,
    run: () => {
      updateCase(record.id, { caseState: outcome.id, ...outcome.patch(record) })
      patch({ caseRef: { id: record.id, stateOverride: null } })
    },
  }))

  // Payment Details, derived from the same pool as everything else — see
  // paymentBreakdown.js. It was a static fixture, so the "Lost Shipments"
  // line and the case that pointed at it were free to describe different
  // money, and did.
  const payment = buildPaymentBreakdown(cases, {
    basePay: data.basePay,
    staticCards: PD_CARDS_RAW,
    expanded: state.pdExpanded || PD_EXPANDED_DEFAULT,
    openLine: (key, isModal) => (isModal
      ? patch({ pdModal: 'lostShipments' })
      : togglePdCard(key)),
    // A line in the breakdown opens the case behind it, which is the other
    // half of the loss page's promise about where its money went.
    openCase: (id) => patch({
      screen: 'case',
      caseRef: { id, stateOverride: null },
      caseReturnTo: 'pdetail',
      pdModal: null,
    }),
  })

  return {
    // ---- presenter ----
    presetId: findPresetId(state),

    // ---- which surface ----
    inShell, inLossesL1, inCase, inSheet, inPaymentDetail, isPayments, isMyEarnings,
    // The case detail stays mounted under the sheet, so the loss being acted
    // on is still on screen behind the scrim.
    showCaseDetail: inCase || inSheet,
    // Accept and dispute are always a bottom sheet — the case stays in view
    // behind the scrim, which is the point on a decision about a specific
    // loss. The full-page presentation that used to be the alternative is
    // gone, and with it the config that chose between them.
    showReasonSheet: inSheet,
    lossesStructure: struct,
    flowVariant: state.flowVariant,
    onlyDispute,
    lossesLayout: state.lossesLayout,
    // Resolved here, not in the component: `ListRowDesignProvider` hands one
    // object to every ListRow in the tree, so an unknown id falls back once
    // rather than in each of the six places a row is rendered.
    // The design and the heading order travel together as one object, so a
    // ListRow asks one context for the whole reading rather than two.
    lineItemDesign: {
      ...resolveLineItemDesign(state.lineItemDesign),
      heading: resolveLineItemHeading(state.lineItemHeading),
    },

    // ---- L1: the whole detail page, resolved ----
    caseView,
    // Where you came from, not always the tab: in the split arrangement the
    // tab is the historic ledger, so a case opened from the active page has
    // to go back there.
    goBackFromCase: () => patch({ screen: state.caseReturnTo || 'home' }),
    openAccept: () => openL2('accept'),
    openDispute: () => openL2('dispute'),
    // Lost in Field's one action — the return-claim sheet (slot 7). Whether
    // the sheet is OPEN is screen state; the claim itself MOVES THE CASE, the
    // same way accept and dispute do, into LIF_CLAIM_SENT: the Pilot has done
    // everything they can and the hub scan decides. Recording it as a flag on
    // an otherwise-unchanged case left the loss sitting in "Needs Decision",
    // still counting down, still being told to hand the parcel over.
    openReturnedClaim: () => patch({ returnedClaimOpen: true }),
    closeReturnedClaim: () => patch({ returnedClaimOpen: false }),
    confirmReturnedClaim: () => {
      updateCase(record.id, {
        caseState: 'LIF_CLAIM_SENT',
        actedOn: TODAY,
        days: hubCheckDays,
      })
      patch({ returnedClaimOpen: false, confirmation: 'returnedClaim' })
    },
    showReturnedClaim: state.returnedClaimOpen && s === 'case',
    hubCheckDays,
    // "Add your side" (info-only cases). Per-case for the same reason: one
    // Pilot's note about one wrong pickup is not a note about every case.
    sideText: record.sideText || '',
    sideSent: !!record.sideSent,
    sideLabel: record.sideSent ? 'Saved ✓' : 'Submit',
    secondaryCtaLabel: record.sideSent ? 'Your side is saved' : 'Add your side (optional)',
    onSide: (e) => updateCase(record.id, { sideText: e.target.value, sideSent: false }),
    submitSide: () => {
      if (!(record.sideText || '').trim()) return
      updateCase(record.id, { sideSent: true })
      patch({ confirmation: 'addSide' })
    },

    // ---- case lifecycle (presenter § Case lifecycle) ----
    caseOutcomes,
    caseStateLabel: caseView.outcomeLabel,

    // ---- insights (state/insights.js, Design System/INSIGHTS_SPEC.md) ----
    insights,
    // The Historic tab's break-up (HistoricBreakupSheet), and the card line
    // that opens it.
    //
    // Ranked and figured by what was actually DEDUCTED, not what was charged.
    // A loss type whose cases were all waived cost the Pilot nothing, and a
    // list headed "what the ₹306 went on" cannot put it first — but it does
    // still appear, at ₹0 against its struck charge, because a break-up that
    // drops a kind of loss does not add up.
    historicBreakup: {
      kinds: historicKinds.length,
      total: historic.totals.deductedLabel,
      subtitle: `${historic.count} ${historic.count === 1 ? 'loss' : 'losses'} ${historic.spanPhrase}`.trim(),
      open: () => patch({ breakupOpen: true }),
      close: () => patch({ breakupOpen: false }),
      rows: historicKinds
        .slice()
        .sort((a, b) => b.deducted - a.deducted || b.charged - a.charged)
        .map((i) => ({
          id: i.id,
          label: i.label,
          count: i.count,
          amountLabel: i.deductedLabel,
          // The stake that never left, struck beside the outcome — the list
          // row's own grammar. Absent where nothing was ever charged (an
          // informational loss) or where all of it was.
          chargedLabel: i.charged > i.deducted ? i.chargedLabel : null,
          amountTone: i.deducted === 0 ? 'kept' : 'settled',
          // Share of everything deducted. Only where something was.
          shareLabel: i.deducted > 0 && historic.totals.deducted > 0
            ? `${Math.round((i.deducted / historic.totals.deducted) * 100)}%`
            : null,
          // Opening the per-type sheet replaces this one rather than stacking
          // on it: two sheets deep is a place a Pilot cannot get out of with
          // one Back.
          open: () => patch({ breakupOpen: false, insightOpen: { id: i.id, scope: 'historic' } }),
        })),
    },
    showBreakupSheet: state.breakupOpen,
    insightBannerMode: state.insightBannerMode,
    // Which one the rolling banner is on, clamped so a shrinking list (a case
    // settling, a reset) can never strand the index past the end.
    insightIndex: insights.length ? state.insightIndex % insights.length : 0,
    showInsightIndex: (i) => patch({ insightIndex: i }),
    openInsight: (id) => patch({ insightOpen: { id, scope: 'all' } }),
    insightSheet: openInsight && {
      ...openInsight,
      // A sheet must show the number the Pilot just tapped (see the scope
      // comment on `openInsight`). The historic panel states what was
      // deducted, so the sheet it opens does too — otherwise "₹210" opens a
      // sheet headed "₹384", which is the same disagreement the scope bug was.
      ...(state.insightOpen?.scope === 'historic'
        ? { amountLabel: openInsight.deductedLabel, countsDeducted: true }
        : {}),
      close: () => patch({ insightOpen: null }),
      rows: openInsight.rows.map((row) => ({
        ...row,
        open: () => { row.open(); patch({ insightOpen: null }) },
      })),
    },

    // ---- "settling this cycle" drill-down (CycleLossesSheet) ----
    showCycleLossesSheet: state.cycleSheetOpen,
    cycleLossesSheet: {
      // The same rows the losses list renders, under the same two heads with
      // the same running total on the right — this sheet is a filtered view
      // of that list, so it cannot bucket or label its rows differently.
      // Tapping one opens the same L1 page, and closes the sheet on the way
      // so Back doesn't return into it. A bucket with nothing settling this
      // cycle is left out rather than headed at ₹0.
      groups: [
        { id: 'needsAction', label: BUCKET_NAME.needsAction, total: NEEDS_ACTION_TOTAL, rows: thisCycleNeedsAction },
        { id: 'pending', label: BUCKET_NAME.pending, total: PENDING_TOTAL, rows: thisCyclePending },
      ]
        .filter((group) => group.rows.length > 0)
        .map((group) => ({
          ...group,
          total: group.total(sumOf(group.rows)),
          rows: group.rows.map((row) => ({
            ...row,
            open: () => { row.open(); patch({ cycleSheetOpen: false }) },
          })),
        })),
      close: () => patch({ cycleSheetOpen: false }),
    },

    // ---- full-screen photo viewer (components/common/ImageViewer.jsx) ----
    // Handed to every evidence tile that HAS a photo. A tile standing in for a
    // missing image (KRD F8) has nothing to enlarge, and PhotoEvidenceGroup
    // decides that per tile rather than this deciding it for all of them.
    openPhoto: (photo) => patch({ photoViewer: photo }),
    photoViewer: state.photoViewer && {
      ...state.photoViewer,
      close: () => patch({ photoViewer: null }),
    },

    // ---- confirmation popup (config/confirmations.js) ----
    confirmation: confirmationContent && { id: state.confirmation, ...confirmationContent },
    dismissConfirmation: () => patch({ confirmation: null }),

    // ---- Earnings shell ----
    showEmptyMarked: s === 'home' && emptyMarked,
    // The Losses tab shows the working list, or — in the split arrangement —
    // the historic ledger in its place. Both are "the losses tab"; which one
    // is a config fact, not a screen.
    // Is the Losses surface the one showing? The shell asks so it can hand the
    // whole segment over to LossesTabbedBody, which owns its own scroll region.
    // Is the Losses tab the segment showing? The shell asks so it can hand the
    // whole segment over to LossesTabbedBody, which owns its own scroll region.
    onLossesTab,
    // The row only exists where one surface holds both halves.
    showLossesSubTabs: struct.hasSubTabs && onAnyLossesSurface,
    // …and which half is up.
    showLossesBody: onLossesList,
    showHistoricBody: onHistoric,
    lossesSubTabs: [
      { id: 'current', label: 'Current Cycle' },
      { id: 'historic', label: 'Historic' },
    ].map((t) => ({
      ...t,
      active: state.lossesSubTab === t.id,
      pick: () => patch({ lossesSubTab: t.id }),
    })),
    historic,

    earningsSegs: [
      { id: 'myearnings', label: 'My Earnings', active: isMyEarnings, pick: () => patch({ screen: 'myearnings' }) },
      { id: 'payments', label: 'Payments', active: isPayments || (inPaymentDetail && state.pdetailReturnTo !== 'myearnings'), pick: () => patch({ screen: 'payments' }) },
      ...(struct.lossesTab ? [
        { id: 'losses', label: 'Losses', active: !isPayments && !isMyEarnings && !inPaymentDetail, pick: () => patch({ screen: 'home' }) },
      ] : []),
    ].map((e) => ({
      id: e.id, label: e.label, pick: e.pick, active: e.active,
      // "Losses (4)" — how many losses are WAITING ON THE PILOT, not how many
      // exist. It counted decision-pending cases too, which are waiting on the
      // team and are nothing the Pilot can act on; a Pilot who cleared their
      // four still saw a 6 and went looking for work that wasn't there.
      //
      // It hangs off the tab regardless of which tab is showing, because a
      // count is what makes a Pilot go there — and a label that gained and
      // lost its number as you moved along the row was a worse thing to read
      // than either state on its own.
      //
      // Absent where that tab is the historic ledger (split arrangement): the
      // active losses live on My Earnings there, and the number would point at
      // a list it isn't about.
      count: e.id === 'losses' && !struct.splitHistoric && needsActionAll.length
        ? needsActionAll.length
        : null,
    })),

    // ---- Losses list (L0) ----
    showLossMetrics: onLossesList,
    // The Summary-card metric row belongs to Unified; Sectioned and Loss Wise
    // both take the filter-chip row.
    isUnified,
    showLossWiseSection, lossWiseGroups,
    // Each chip carries how many losses it would show — "Needs Decision (4)" —
    // so a Pilot can see where their losses are before tapping anything, and a
    // chip that would open an empty list says so up front. Counts come from the
    // same bucket arrays the sections render, so a chip can never disagree with
    // the list beneath it. Reference: Figma WCghUzecsonToq8dCxpm3W · 6147:45126.
    lossFilterChips: LOSS_FILTER_CHIPS.filter((fc) => !(isLossWise && fc.id === 'wrong')).map((fc) => {
      const count = fc.id === null ? listedRows.length : (listedBuckets[fc.id] || []).length
      return {
        // The bucket's name, by id — the fixture's own `label` survives only
        // for "All", which is a filter rather than a group. Two data files
        // carried these names and could drift from the heads they filter.
        label: `${bucketName(fc.id, fc.label)} (${count})`,
        active: lossFilter === fc.id,
        pick: fc.id === null
          ? () => patch({ lossFilter: null })
          : () => patch({ lossFilter: state.lossFilter === fc.id ? null : fc.id }),
      }
    }),
    showNeedsActionSection, needsActionRows,
    showPendingSection, pendingRows,
    showWrongSection, wrongRows,
    showUnifiedSection, unifiedRows,
    showClosedSection: onLossesList && isSectioned && showClosed && !emptyMarked && showClosedFiltered && closedRows.length > 0,
    closedTotal: closedTotalLabel,
    closedRows,
    summaryCards: [
      { id: 'needsAction', label: BUCKET_NAME.needsAction, amount: fmt(needsActionTotal), sub: needsActionAll.length + (needsActionAll.length === 1 ? ' item' : ' items'), amountTone: 'primary' },
      { id: 'pending', label: BUCKET_NAME.pending, amount: fmt(pendingTotal), sub: pendingAll.length + (pendingAll.length === 1 ? ' item' : ' items'), amountTone: 'primary' },
      { id: 'wrong', label: BUCKET_NAME.wrong, amount: fmt(wrongTotal), sub: wrongRows.length + (wrongRows.length === 1 ? ' item' : ' items'), amountTone: 'muted' },
      { id: 'closed', label: BUCKET_NAME.closed, amount: closedTotalLabel, sub: closedRows.length + (closedRows.length === 1 ? ' item' : ' items'), amountTone: 'primary' },
    ].map((card) => ({
      ...card,
      active: lossFilter === card.id,
      pick: () => patch({ lossFilter: state.lossFilter === card.id ? null : card.id }),
    })),
    shellFoot: onLossesList ? 'Updated today, 6:00 am' : '',
    // No `showCoolOffNotice` flag: LossesBody's <Layer> decides its own
    // visibility now — see CONFIG_REFERENCE.md § Layer visibility.
    coolOffEnds,

    // ---- the entry widget on My Earnings ----
    // Shape from config/lossesStructure.js (is there a widget at all),
    // treatment from config/lossesEntryStates.js (which of its three states).
    lossesEntryPoint: {
      // Everything still in play, waiting-on-them and pending together. The
      // widget opens the whole working list, and this figure is the one the
      // Current Cycle card cross-references.
      amount: fmt(needsActionTotal + pendingTotal),
      // Everything in play, which is what the headline counts alongside the
      // money it belongs to — "₹624 at stake from 6 losses". Note this is NOT
      // the Losses tab's badge, which counts only what is waiting on the
      // Pilot; the two answer different questions and sit far apart.
      count: needsActionAll.length + pendingAll.length,
      actionableCount: needsActionAll.length,
      // With us. The Review headline counts these, and only these: a Pilot
      // told "we are checking 6" when two of those are sitting with them
      // would be waiting on work they own.
      pendingCount: pendingAll.length,
      ...entryTreatment,
      timer: entryTimer,
      // Always the working list. That is the Losses tab where the tab holds
      // it, and its own page where there is no tab or the ledger has taken it.
      open: () => patch({
        screen: struct.lossesTab && !struct.splitHistoric ? 'home' : 'losses-active',
        lossesSubTab: 'current',
      }),
    },
    goBackFromLossesL1: () => patch({ screen: 'myearnings' }),

    // ---- Payments ----
    paymentRows: PAYMENTS.map((p) => ({
      date: p.date,
      caption: p.caption,
      amount: fmt(p.amt),
      incentive: '(' + fmt(p.inc) + ' Incentives)',
      open: () => patch({ screen: 'pdetail', pdetailReturnTo: 'payments' }),
    })),
    goBackPayments: () => patch({ screen: state.pdetailReturnTo || 'payments' }),
    // The cycle figure nets off what those losses will take, with the gross
    // struck through beside it. Floored at zero: a payout cannot go negative,
    // and what a real overflow does — carry to the next cycle — is a product
    // rule this prototype does not model, so it must not be implied here.
    currentCycle: {
      ...CURRENT_CYCLE,
      amount: fmt(Math.max(0, CURRENT_CYCLE.gross - thisCycleTotal)),
      grossAmount: fmt(CURRENT_CYCLE.gross),
      showsStrike: thisCycleTotal > 0,
      lossLine: cycleLossLine,
    },
    dailyEarningsMonth: DAILY_EARNINGS_MONTH,
    dailyEarningsRows: DAILY_EARNINGS.map((p) => ({
      date: p.date,
      amount: fmt(p.amt),
      incentive: '(' + fmt(p.inc) + ' Incentives)',
      open: () => patch({ screen: 'pdetail', pdetailReturnTo: 'myearnings' }),
    })),
    paymentForDate: data.paymentForDate,
    paymentAmount: payment.paymentTotal,
    basePay: payment.basePay,
    pdCards: payment.cards,
    showLostShipmentsModal: state.pdModal === 'lostShipments',
    closeLostShipmentsModal: () => patch({ pdModal: null }),
    lostShipmentsSubtitle: payment.lostShipments.subtitle,
    lostShipmentItems: payment.lostShipments.items,
    lostShipmentsTotal: payment.lostShipments.total,

    // ---- awareness overlay ----
    showAwareness: (rawScreen === 'awareness' || (props.awarenessOverlay ?? false)) && s === 'home' && !state.awSeen,
    awTitle: props.awarenessMessage,
    awBody: 'Wrong pickup photos, false delivery marks and missing parcels are checked every week. Do your pickups and deliveries honestly — your losses stay low and your ID stays safe.',
    awRuleLabel: {
      'Once a week': 'Shown once a week',
      'Once a month': 'Shown once a month',
      'After 3rd open loss': 'Shown when your open losses cross 3',
      'Every visit (demo)': 'Demo: shown on every visit',
    }[props.awarenessRule ?? 'Once a week'],
    dismissAwareness: () => patch({ awSeen: true }),

    // ---- L2 sheets ----
    isAccept, isDispute,
    // The Pilot's standing, stated before the reason chips — context for the
    // decision, not a consequence of it (see components/sheet/DisputeRecord).
    disputeRecord: getDisputeStanding(state.wrongDisputes),
    sheetTitle: isAccept ? 'Accept this loss' : 'Dispute this loss',
    sheetSub: 'AWB ' + record.awb,
    amountLabel, replyDays,
    chipPrompt: isAccept ? 'Why did it happen?' : 'Why is this not your mistake?',
    reasonChips: chipList.map((label) => ({
      label,
      picked: picked === label,
      pick: () => patch(isAccept
        ? { acceptReason: picked === label ? null : label }
        : { disputeReason: picked === label ? null : label }),
    })),
    noteText,
    noteLabel: needsNote ? 'Tell us what happened (required)' : 'Say more (optional)',
    notePlaceholder: needsNote ? 'Type what happened…' : 'Type here…',
    noteInvalid: needsNote && !noteText.trim(),
    onNote: (e) => patch(isAccept ? { acceptNote: e.target.value } : { disputeNote: e.target.value }),
    // The "Next time" coaching line comes from the reason registry, not the row.
    acceptTip: record.tip || caseReason.tip,
    submitLabel: isAccept ? 'Confirm accept' : 'Send dispute',
    canSubmit,
    submitSheet,
    closeSheet: () => patch({ screen: 'case', caseRef: { id: record.id, stateOverride: null } }),
  }
}

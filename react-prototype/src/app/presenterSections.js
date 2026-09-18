import { SCREEN_PRESETS } from '../config/screenPresets.js'
import { HISTORIC_PLACEMENTS } from '../config/lossesStructure.js'
import { LINE_ITEM_DESIGNS, LINE_ITEM_HEADINGS } from '../config/lineItemDesigns.js'
import { presetResolves } from '../state/caseStore.js'
import { ENTRY_STATE_OPTIONS } from '../config/lossesEntryStates.js'
import { DATA_SOURCE, DATA_SOURCES, setDataSource } from '../data/activeDataset.js'

/**
 * This app's control-panel configuration — the only place that connects
 * the generic `presenter/` system to Losses/Earnings-specific state. If
 * this prototype's screens change, this is the file to edit; the
 * `presenter/` folder itself should never need to change.
 *
 * Section kinds, per the brief:
 *  1. Global variants   — reshape the whole app (tab structure, flow policy).
 *  2. Sectional variants — reshape one section/widget's design.
 *  3. Layers             — per-section show/hide, self-populated from
 *                          whatever `<Layer>`s are mounted (see
 *                          presenter/LayerVisibilityContext.jsx).
 *  4. Screens            — jump straight to any screen or lifecycle state.
 *
 * Every config in this file — and every new one you add — is catalogued in
 * `Design System/CONFIG_REFERENCE.md`. Update that doc in the same change.
 */
export function getPresenterSections({ state, actions, vm }) {
  return [
    {
      title: 'Global variants',
      controls: [
        // The losses area's shape, as three independent axes rather than a
        // list of named arrangements — see config/lossesStructure.js. The
        // names described whole arrangements instead of what varied between
        // them, so you could not tell from the panel what any name stood for.
        {
          type: 'toggle',
          label: 'Losses as a Tab',
          checked: state.lossesTab,
          onChange: actions.setLossesTab,
          // On: a third segment beside My Earnings and Payments.
        },
        {
          type: 'toggle',
          label: 'Loss entry point in My Earnings',
          checked: state.earningsEntry,
          onChange: actions.setEarningsEntry,
          // The widget this governs is the "₹X at stake from N losses"
          // banner on My Earnings.
          //
          // Both doors can be off. That is not a broken state — the Current
          // Cycle card keeps its own drill-down into this cycle's losses in
          // every arrangement, so cases stay reachable; what goes away is the
          // losses LIST having a surface of its own.
        },
        {
          type: 'select',
          label: 'Loss banner state',
          value: state.entryStateOverride,
          // WHICH of the banner's three treatments to show, over whatever the
          // real numbers are. It is a preview, not a variant: the state is
          // normally read off the case pool, and 'Auto' is that reading. It
          // is here because the data cannot reach all three on demand — the
          // Live dataset is six waiting losses, so it only ever produces
          // Actionable, and Resolved needs every case decided.
          //
          // Acting on cases really does move it: accept the last waiting loss
          // on Auto and the banner drops to Review by itself.
          options: ENTRY_STATE_OPTIONS,
          onChange: actions.setEntryStateOverride,
        },
        {
          type: 'segmented',
          label: 'Historic losses',
          value: state.historicPlacement,
          // Where, not whether. "Own tab" is the arrangement where the tab IS
          // the ledger and the working list moves to its own page — a
          // different IA, which a show/hide boolean cannot express. It needs
          // both doors open (see config/lossesStructure.js), so it disables
          // itself rather than stranding the working list.
          options: HISTORIC_PLACEMENTS.map((pl) => ({
            id: pl.id,
            label: pl.label,
            disabled: pl.needsBothDoors && !(state.lossesTab && state.earningsEntry),
          })),
          onChange: actions.setHistoricPlacement,
        },
        {
          type: 'select',
          label: 'Flow',
          value: state.flowVariant,
          // Dispute-only hides every accept-related affordance (CTA, sheet,
          // accept route) app-wide — see CONFIG_REFERENCE.md.
          options: [
            { id: 'accept-dispute', label: 'Accept + Dispute' },
            { id: 'dispute-only', label: 'Only Dispute' },
          ],
          onChange: actions.setFlowVariant,
        },
        {
          type: 'toggle',
          label: 'Grace period (first weeks free)',
          checked: state.gracePeriod,
          onChange: actions.setGracePeriod,
          // A business policy, not a show/hide: on, a loss raised inside the
          // Pilot's first weeks settles at ₹0 instead of being deducted.
          //
          // NOTHING ELSE MOVES, and that is the design — the window is never
          // announced, so an open loss looks and counts exactly as it does
          // without it. Flipping this toggle changes one kind of screen: a
          // settled loss, and the payment and history figures that follow
          // from it. If you flip it expecting the losses list to change, it
          // will not. See state/grace.js for why, and config/gracePeriod.js
          // and `pilot.joinedOn` for the window itself.
          //
          // Off by default: the app without the policy is what the covered
          // version has to be compared against.
        },
        {
          type: 'select',
          label: 'Dispute record (wrong in a row)',
          value: String(state.wrongDisputes),
          // The dispute sheet reads differently at each count — clean record,
          // one gone, and the last one before the pause — so all three are
          // reachable without editing the fixture.
          options: [
            { id: '0', label: 'Clean record' },
            { id: '1', label: '1 wrong' },
            { id: '2', label: '2 wrong — last one' },
          ],
          onChange: actions.setWrongDisputes,
        },
        // Deliberately no "Accept / Dispute presentation" control here
        // either: accept and dispute are always a bottom sheet now. It was a
        // choice between that and a full page, and the sheet won — it keeps
        // the case in view behind the scrim, which is what a decision about
        // one specific loss wants. A config whose answer has been settled is
        // a question the panel keeps asking for no reason, so both the
        // control and the page presentation are gone.
        //
        // Deliberately no "Dispute cool-off" control here: it's the
        // Layers panel's "Cool-off notice (Losses list)" toggle — one
        // toggle for one fact (see CONFIG_REFERENCE.md § Layer visibility),
        // not a second control that could disagree with it.
      ],
    },
    {
      title: 'Sectional variants',
      controls: [
        {
          type: 'select',
          label: 'Losses list layout',
          value: state.lossesLayout,
          // Sectioned groups by lifecycle bucket, Unified is one flat feed,
          // Loss Wise groups by the remedy each loss needs — see
          // config/remedyGroups.js.
          options: [
            { id: 'sectioned', label: 'Sectioned' },
            { id: 'unified', label: 'Unified' },
            { id: 'loss-wise', label: 'Loss Wise' },
          ],
          onChange: actions.setLossesLayout,
        },
        {
          type: 'select',
          label: 'Line item design',
          value: state.lineItemDesign,
          // How ONE loss reads, wherever it is listed — the sectioned list,
          // the unified feed, the Loss Wise groups, the historic ledger, the
          // cycle sheet and the insight drill-downs all render the same
          // `ListRow`, so this moves all six at once. Two axes behind four
          // options: what the row states about the parcel, and whether the
          // clock closes the left-hand statement or stacks under the amount
          // — see config/lineItemDesigns.js.
          options: LINE_ITEM_DESIGNS.map((d) => ({ id: d.id, label: d.label })),
          onChange: actions.setLineItemDesign,
        },
        {
          type: 'select',
          label: 'Row heading',
          value: state.lineItemHeading,
          // WHICH of the row's two body lines leads. A third axis, and
          // independent of the four designs above — any design that states
          // the AWB can be read either way round, and a design that states
          // no AWB ignores this.
          //
          // Reason is and stays the default: a Pilot scanning the list is
          // choosing which row to open, and they choose on what went wrong
          // and what it costs. The AWB is what they check after choosing.
          // The swap is here because that other reading — arriving with a
          // parcel in hand, hunting for its row — is worth being able to
          // look at rather than argue about.
          options: LINE_ITEM_HEADINGS.map((h) => ({ id: h.id, label: h.label })),
          onChange: actions.setLineItemHeading,
        },
        {
          type: 'select',
          label: 'Insight banner',
          value: state.insightBannerMode,
          // On/off is the Layers toggle; this is how it behaves when on.
          // Rolling leads because it is the default — a swipeable row of
          // cards, each one short of the full width so the next one shows.
          options: [
            { id: 'rolling', label: 'Rolling (swipe)' },
            { id: 'single', label: 'Single (costliest)' },
          ],
          onChange: actions.setInsightBannerMode,
        },
      ],
    },
    {
      // Populated from whichever `<Layer>`s are currently mounted on the
      // active screen — not from data this file owns. See
      // presenter/controls/LayersControl.jsx and CONFIG_REFERENCE.md
      // § Layer visibility.
      title: 'Layers',
      controls: [{ type: 'layers', label: 'Layers' }],
    },
    {
      title: 'Screens',
      controls: [
        {
          type: 'select',
          label: 'Jump to screen',
          value: vm.presetId,
          // Presets, not screen ids — a loss detail page is one surface
          // parameterised by (record, state), so every lifecycle state is
          // reviewable without its own screen. See config/screenPresets.js.
          // Only the presets the ACTIVE dataset can actually honour — Live
          // seeds no decided cases and no Lost-in-Field, so those entries are
          // not offered rather than offered and broken (state/caseStore.js).
          options: SCREEN_PRESETS.filter(presetResolves).map((p) => ({ id: p.id, label: p.label })),
          onChange: (id) => actions.go(id),
        },
      ],
    },
    // Only while you're looking at a case that has somewhere left to go. The
    // Pilot's own moves are the app's CTAs; these are the verdicts nobody in
    // the app can tap for — see config/caseTransitions.js.
    ...(vm.inCase && vm.caseOutcomes.length > 0 ? [{
      title: 'Case lifecycle',
      controls: [{
        type: 'actions',
        label: `This case: ${vm.caseStateLabel}`,
        // Each of these simulates the review team, the deduction timer or the
        // hub scan. The case REALLY moves — the list buckets, the cycle total
        // and the ledger all follow, because they are all views of one pool.
        actions: vm.caseOutcomes,
      }],
    }] : []),
    {
      title: 'Session',
      controls: [
        // WHICH SET OF FACTS THE PROTOTYPE IS STANDING ON. Not a variant of
        // the design — every control above still means the same thing in
        // either — so it sits at the bottom with Reset rather than among the
        // design axes.
        //
        // Mock is the demo fixture: every loss type crossed with every
        // lifecycle state, which is what makes the presets above reachable.
        // Live is one real Pilot's nine audited losses out of the debit-reason
        // master sheet — real AWBs, real amounts, real photographs, and his
        // own recorded pickup answers — and nothing else, which is what you
        // show HIM.
        //
        // Changing it reloads the page, because the dataset is read at import
        // time by the date helpers and the case pool; see
        // data/activeDataset.js for why that is the right trade here.
        {
          type: 'select',
          label: 'Data source',
          value: DATA_SOURCE,
          options: DATA_SOURCES,
          onChange: setDataSource,
        },
        {
          type: 'actions',
          actions: [{
            id: 'reset',
            label: 'Reset Data',
            tone: 'danger',
            run: actions.resetPrototype,
          }],
          // Puts every case back to its fixture state, in whichever data
          // source is selected. A browser refresh does the same thing —
          // nothing here persists (state/caseStore.js).
        },
      ],
    },
  ]
}

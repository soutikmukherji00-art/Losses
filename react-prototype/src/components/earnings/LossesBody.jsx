import FilterChipRow from './FilterChipRow.jsx'
import SummaryCardRow from './SummaryCardRow.jsx'
import EmptyState from './EmptyState.jsx'
import CoolOffNotice from './CoolOffNotice.jsx'
import ListRow from '../common/ListRow.jsx'
import SectionHeader from '../common/SectionHeader.jsx'
import Layer from '../common/Layer.jsx'
import InsightBanner from '../losses/InsightBanner.jsx'
import GraceBanner from '../losses/GraceBanner.jsx'
import CatalogImagesLayer from '../common/CatalogImagesLayer.jsx'
import { COOL_OFF_NOTICE_LAYER, CONTEXTUAL_INSIGHTS_LAYER } from '../../config/layerIds.js'
import { INFO_ONLY_NOTE, INFO_ONLY_TOTAL } from '../../config/lossReasons.js'
import { BUCKET_NAME } from '../../config/lossBuckets.js'
import './LossesBody.css'

/**
 * The Losses tab's scrollable content. Three layouts live side by side here,
 * each gated by its own `vm.show*Section` flag:
 *
 *  · Sectioned — grouped by lifecycle bucket (Needs Attention / Team is
 *    checking / Wrong Pickups / History — config/lossBuckets.js)
 *  · Unified   — one flat, date-ordered feed
 *  · Loss Wise — grouped by LOSS TYPE, so a Pilot sees how many of each kind
 *    of problem they have (config/remedyGroups.js)
 *
 * All three render the same `ListRow` and `SectionHeader`; a layout decides
 * the order and the grouping, never how a loss looks.
 */
export default function LossesBody({ vm }) {
  return (
    <>
      {/* Above the filter chips: the pattern is context for the whole list,
          so it reads before the Pilot starts narrowing it. */}
      {/* While the grace window is open the cover takes the banner slot and
          the insights step aside: it is the fact that decides how every loss
          below reads, and two banners here is two rows of chrome. */}
      {vm.showLossMetrics && vm.grace.active && <GraceBanner grace={vm.grace} />}
      {vm.showLossMetrics && !vm.grace.active && vm.insights.length > 0 && (
        <Layer id={CONTEXTUAL_INSIGHTS_LAYER} label="Contextual insights (Losses list)">
          <InsightBanner
            insights={vm.insights}
            mode={vm.insightBannerMode}
            index={vm.insightIndex}
            onShowIndex={vm.showInsightIndex}
            onOpen={vm.openInsight}
          />
        </Layer>
      )}

      {!vm.isUnified && vm.showLossMetrics && <FilterChipRow chips={vm.lossFilterChips} />}
      {vm.isUnified && vm.showLossMetrics && <SummaryCardRow cards={vm.summaryCards} />}

      {/* This layer's toggle IS the dispute cool-off switch, not just a
          cosmetic show/hide — see CONFIG_REFERENCE.md § Layer visibility.
          `useLossesApp` reads this exact id/default to decide whether to
          pause dispute on the needs-action case, wherever that's rendered —
          so there's one toggle, in one place, for one fact, instead of a
          separate app-wide flag that could disagree with this banner. */}
      <Layer id={COOL_OFF_NOTICE_LAYER} label="Cool-off notice (Losses list)" defaultVisible={false}>
        <CoolOffNotice
          coolOffEnds={vm.coolOffEnds}
          onlyDispute={vm.onlyDispute}
          disputeHistory={vm.disputeHistory}
        />
      </Layer>

      {/* Nothing of this one shows HERE — it is the app-wide catalog photo
          row, and it lands on the loss pages this list opens. */}
      <CatalogImagesLayer />

      {vm.showEmptyMarked && <EmptyState />}

      {/* `ftuxFirst` marks the first needs-action row as the first-run
          tour's second target — the loss the Pilot is asked to open. */}
      {vm.showNeedsActionSection && <RowGroup rows={vm.needsActionRows} ftuxFirst />}
      {vm.showPendingSection && <RowGroup rows={vm.pendingRows} />}

      {vm.showUnifiedSection && (
        <div>
          {vm.unifiedRows.map((r) => <ListRow key={r.id} row={r} onClick={r.open} />)}
        </div>
      )}

      {vm.showLossWiseSection && vm.lossWiseGroups.map((group) => (
        <div key={group.id}>
          {/* An info-only group carries the same "No deductions" + tooltip
              here as the sectioned layout's Wrong Pickups head. */}
          <SectionHeader label={group.label} total={group.total} info={group.info} />
          {group.rows.map((r) => <ListRow key={r.id} row={r} onClick={r.open} />)}
        </div>
      ))}

      {/* Wrong Pickups sits ABOVE History, and the order is the list's whole
          argument: the two sections above are open, this one is a standing
          advisory the Pilot can still act on next time, and History is the
          only part of the page that is finished. Settled losses used to come
          between them, so the list closed on an advisory after having
          already told the Pilot it was done. */}
      {vm.showWrongSection && (
        <div>
          {/* The same head every other section gets, answering the same
              question on the same side — the standing banner underneath said
              this in three lines and pushed the rows it described off the
              first screenful. */}
          <SectionHeader label={BUCKET_NAME.wrong} total={INFO_ONLY_TOTAL} info={INFO_ONLY_NOTE} />
          {vm.wrongRows.map((r, i) => <ListRow key={i} row={r} onClick={r.open} />)}
        </div>
      )}

      {vm.showClosedSection && (
        <div>
          {/* The window, as a lighter qualifier beside the name — the same
              pairing My Earnings uses for "Daily Earnings History (last 30
              days)". */}
          <SectionHeader
            label={<>{BUCKET_NAME.closed} <span className="section-header__qualifier">(last 3 months)</span></>}
            total={vm.closedTotal}
          />
          {vm.closedRows.map((r, i) => <ListRow key={i} row={r} onClick={r.open} />)}
        </div>
      )}

      <div className="losses-body__foot">{vm.shellFoot}</div>
    </>
  )
}

function RowGroup({ rows, ftuxFirst = false }) {
  return (
    <div>
      {rows.map((r, i) => (
        <div key={i}>
          {r.showGroup && <SectionHeader label={r.group} total={r.groupTotal} />}
          <ListRow row={r} onClick={r.open} ftux={ftuxFirst && i === 0 ? 'loss-row' : undefined} />
        </div>
      ))}
    </div>
  )
}

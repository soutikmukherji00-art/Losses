import SectionHeader from '../common/SectionHeader.jsx'
import ListRow from '../common/ListRow.jsx'
import EmptyState from '../earnings/EmptyState.jsx'
import Layer from '../common/Layer.jsx'
import CatalogImagesLayer from '../common/CatalogImagesLayer.jsx'
import HistoricSummaryCard from './HistoricSummaryCard.jsx'

/** Only this file needs it, so it lives here rather than in layerIds.js —
 *  see that file's opening note. */
const SUMMARY_CARD_LAYER = 'losses-tab.summaryCard'

/**
 * The Losses tab in the "Active in My Earnings + Historic as a Tab"
 * arrangement (config/lossesStructure.js).
 *
 * Not a filtered working list — a different question. The working list asks
 * "what must I do?"; this asks "what have losses actually cost me?", so it is
 * grouped by the cycle the money moved in, under a totals block.
 *
 * The rows are `ListRow`, the same shape and the same status chips as every
 * other loss list, so a settled loss reads identically wherever a Pilot meets
 * it. Above them sits ONE card, this tab's own, answering the two questions
 * only a history surface asks — what has all this cost me, and what did it go
 * on — as one continued thought rather than two blocks.
 *
 * The whole card is one layer — the question worth asking the panel is
 * whether this tab opens with a summary at all, not whether half a card does.
 * The break-up behind the card's figure lives in a sheet, mounted by App.jsx
 * with the app's other sheets rather than here, so nothing inside this scroll
 * can clip it.
 */
export default function HistoricLossesBody({ historic, breakup }) {
  // Empty history is not empty losses — see EmptyState's own note. Losses
  // still in play live on the working list, and this tab must not answer for
  // them.
  if (historic.empty) {
    return (
      <EmptyState
        title="No decided losses yet"
        body="Once a loss is settled — deducted, waived, or credited back — it is filed here under the payout cycle its money moved in."
      />
    )
  }

  return (
    <>
      <Layer id={SUMMARY_CARD_LAYER} label="Summary card (Losses tab)">
        <HistoricSummaryCard historic={historic} breakup={breakup} />
      </Layer>

      {/* This tab is what the default arrangement loads first, and its rows
          open the same loss pages — so the catalog switch is reachable here
          too, not only from the active list. */}
      <CatalogImagesLayer />

      {historic.groups.map((group) => (
        <div key={group.id}>
          <SectionHeader label={group.label} total={`${group.deductedLabel} deducted`} />
          {group.rows.map((row) => (
            <ListRow key={row.id} row={row} onClick={row.open} />
          ))}
        </div>
      ))}
    </>
  )
}

import BottomSheet from '../common/BottomSheet.jsx'
import ListRow from '../common/ListRow.jsx'
import SectionHeader from '../common/SectionHeader.jsx'

/**
 * Everything that will settle against the current cycle before it closes —
 * opened from the Current Cycle card's loss line.
 *
 * Two kinds of case qualify, and both genuinely settle this cycle: the ones
 * the Pilot has not acted on (silence deducts them) and the ones already
 * accepted or disputed, whose decision lands either way before payout. Those
 * two kinds are the two groups here, headed exactly as the losses list heads
 * them — "Needs Attention" and "Team is checking", label left, its own
 * total right — because this sheet is a filtered view of that list, and a
 * Pilot who has learnt the list's buckets should not have to re-learn them.
 *
 * The rows are `ListRow` — the same card the losses list uses, so an item
 * here carries the same title, amount and status chip it does everywhere
 * else, and tapping it opens the same L1 page.
 *
 * The heading says the whole thing, so there is no byline: the amount and the
 * count were already on the card that opened this, and the rows below carry
 * them again. Stating them a third time is a sum a reader has to reconcile,
 * not information.
 */
export default function CycleLossesSheet({ sheet }) {
  return (
    <BottomSheet
      flush
      maxHeight="80%"
      title="Losses Settling this Cycle"
      onClose={sheet.close}
    >
      {sheet.groups.map((group) => (
        <div key={group.id}>
          <SectionHeader label={group.label} total={group.total} />
          {group.rows.map((row) => (
            <ListRow key={row.id} row={row} onClick={row.open} />
          ))}
        </div>
      ))}
    </BottomSheet>
  )
}

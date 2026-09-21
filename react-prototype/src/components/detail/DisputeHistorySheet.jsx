import BottomSheet from '../common/BottomSheet.jsx'
import ListRow from '../common/ListRow.jsx'
import SectionHeader from '../common/SectionHeader.jsx'

/**
 * The cool-off notice's ingress — every dispute this Pilot has lost, so "you
 * can't raise dispute again" reads as the consequence of specific decisions
 * rather than an opaque penalty.
 *
 * Same molecules as the losses list and the cycle sheet — `SectionHeader`
 * band over `ListRow`s — because this is a filtered view of that list and a
 * Pilot who has learnt its rows should not meet a new kind of row here. What
 * the band names is the difference: not a bucket but the DATE the dispute was
 * decided, newest first, with what it cost on the right. Tapping a row opens
 * that case's own L1 page, where the resolved dispute log is.
 */
export default function DisputeHistorySheet({ disputeHistory, onClose }) {
  return (
    <BottomSheet
      flush
      maxHeight="80%"
      title="Disputes found wrong"
      onClose={onClose}
    >
      {disputeHistory.groups.map((group) => (
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

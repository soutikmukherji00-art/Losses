import BottomSheet from '../common/BottomSheet.jsx'
import ListRow from '../common/ListRow.jsx'
import SectionHeader from '../common/SectionHeader.jsx'

/**
 * The losses behind one line of the payment breakdown — opened by tapping
 * that line (state/paymentBreakdown.js builds both).
 *
 * ONE SHEET FOR EVERY LOSS-DERIVED LINE. "Lost Shipments" used to have a
 * bespoke modal of its own and no other line had anything, so the same
 * question — which losses is this figure? — had an answer on one row of the
 * breakdown and a dead end on the next.
 *
 * IT IS THE LOSSES-TAB SHEET, not a payments one (design call, 22 Sep). The
 * old modal had drifted into a third dialect: its own AWB/date/amount row
 * that existed nowhere else, no chevron on a row that opens a page, its total
 * stranded at the FOOT under the list, and a "Got it" button closing a sheet
 * that already has a close control and a scrim. Every one of those disagreed
 * with the sheet a Pilot meets one tab over (CycleLossesSheet), and the two
 * are the same object: a filtered view of the losses list.
 *
 * So the shape is that one, exactly —
 *   · `SectionHeader` FIRST, count left and total right, because the total is
 *     what the Pilot tapped and it should not be something they scroll to
 *     confirm;
 *   · `ListRow` rows, which bring the reason, the AWB, the amount treatment
 *     and the chevron the app uses everywhere a row opens a page;
 *   · no footer button — the scrim and the close control are the way out on
 *     every other sheet in the app.
 */
export default function PaymentLineSheet({ sheet }) {
  return (
    <BottomSheet flush maxHeight="80%" title={sheet.title} onClose={sheet.close}>
      <SectionHeader label={sheet.countLabel} total={sheet.total} />
      {sheet.rows.map((row) => (
        <ListRow key={row.id} row={row} onClick={row.open} />
      ))}
    </BottomSheet>
  )
}

import Chip from './Chip.jsx'
import { ChevronRightIcon } from './icons.jsx'
import { useListRowDesign } from './ListRowDesign.jsx'
import './ListRow.css'

/**
 * The one row shape reused by Needs Decision, Disputes in Review, Wrong
 * Pickups, Past Losses and the unified list — and by the historic ledger, which is how a
 * settled loss reads identically wherever a Pilot meets it.
 *
 * WHAT VARIES is the line-item design (config/lineItemDesigns.js): whether
 * the row carries a photograph, whether it carries an AWB, and whether the
 * clock closes the left-hand statement or stacks under the amount. WHAT
 * NEVER VARIES is the order of the ranks below — a design that reordered
 * them would not be a different reading of the row, it would be a worse one.
 *
 *   1 · WHAT HAPPENED, AND BY WHEN — the reason, and the clock, in the
 *       grammar the losses entry banner on My Earnings already established:
 *       same weight on both, emphasis carried by COLOUR, the clock a step
 *       smaller. The two-row design is the one where they sit at opposite
 *       corners instead — reason top-left, clock bottom-right, the money in
 *       between — which is the thing that design is there to be compared
 *       against.
 *
 *   1b · WHICH PARCEL — the photograph, and the AWB threaded between reason
 *       and clock. The AWB sits in the middle and ranks LAST, which only
 *       works because nothing about it is loud: thinnest weight in the row,
 *       secondary grey, no accent. It is the line a Pilot reads to confirm a
 *       row they have already chosen, so it has to be findable without ever
 *       being in the way of the two lines that do the choosing. The heading
 *       axis can put it first instead — see `awbLeads` below — but that is a
 *       different errand, not the default one.
 *
 *   2 · WHAT IT COSTS — the amount, alone in its rail and centred against
 *       the statement. Centred rather than top-aligned on purpose: level
 *       with the whole block it is the row's VALUE, level with the first
 *       line it reads as a second heading competing with the reason.
 *
 *   3 · THAT IT OPENS — the chevron, the quietest mark in the row. On every
 *       row in every section, including the decided ones that open only to a
 *       receipt: a mark that appears conditionally becomes a second signal to
 *       decode, and this one only has to be findable, never noticed. The
 *       payments list can afford 20px at secondary because nothing competes
 *       for its right edge; here it steps down to 16px tertiary.
 *
 * Both colour decisions on the row are named, not passed as hex: the status
 * badge asks `Chip` for a `kind`, and the amount asks for a `tone`. They used
 * to arrive as inline `style={{ color }}` from raw hex in the view model,
 * which put the app's status palette in a state file where no other component
 * could reach it.
 *
 * On a decided row the amount carries the outcome and there is no badge: the
 * two were saying the same thing, and "₹0" over a struck "₹90" says it faster
 * than a pill reading "Not deducted". See the L0 money grammar in
 * config/caseStates.js. Such a row is a line shorter than its neighbours, and
 * wherever there is a thumb the thumb still sets the height, so the list
 * keeps its rhythm.
 */
export default function ListRow({ row, onClick }) {
  const design = useListRowDesign()

  // Which of the two body lines leads (config/lineItemDesigns.js). Only the
  // lines swap — the heading slot keeps its weight and ink and so does the
  // byline, so whichever fact leads is read the same way. A design that
  // states no AWB has nothing to swap, so it falls back rather than
  // promoting an empty line.
  const awbLeads = design.heading === 'awb' && design.awb
  const heading = awbLeads ? row.sub : row.title
  const byline = awbLeads ? row.title : row.sub
  // Built once and placed by the design, rather than written twice: the two
  // positions are the same object in different company, and a second copy is
  // how they would start to differ.
  const clock = row.chip
    ? <Chip variant="status" kind={row.chipKind}>{row.chip}</Chip>
    : null

  // `data-clock` rather than `data-design` drives the one layout override in
  // the stylesheet: the rail's width is a consequence of the CLOCK being in
  // it, and two of the four designs put it there.
  return (
    <div className="list-row" data-design={design.id} data-clock={design.clock} onClick={onClick}>
      {design.thumb && <img className="list-row__thumb" src={row.thumb} alt="" />}

      <div className="list-row__body">
        <div className="list-row__title">{heading}</div>
        {design.awb && <div className="list-row__sub">{byline}</div>}
        {design.clock === 'body' && clock}
      </div>

      <div className="list-row__end">
        <div className="list-row__amount" data-tone={row.amountTone}>
          {row.amount}
          {/* What it would have been. The loss page's hero and the earnings
              card use the same device, so a struck figure means one thing
              wherever a Pilot meets it. */}
          {row.amountWas && <s className="list-row__was">{row.amountWas}</s>}
        </div>
        {design.clock === 'rail' && clock}
      </div>

      <span className="list-row__go">
        <ChevronRightIcon size={16} stroke="var(--text-tertiary)" />
      </span>
    </div>
  )
}

/**
 * LINE ITEM DESIGN — how one loss reads in a list, as two independent axes.
 *
 * Every surface that lists losses renders the same `ListRow`: the sectioned
 * list, the unified feed, the Loss Wise groups, the historic ledger, the
 * "settling this cycle" sheet and the insight drill-downs. Switching this
 * switches all of them at once, which is the point — a loss that looked one
 * way in the list and another way in a sheet would be two components again.
 *
 * TWO AXES, and the four options below are the points on them worth looking
 * at rather than four hand-built layouts:
 *
 *   contents  — which of the three facts about the parcel the row states:
 *               its photograph, its AWB, or neither.
 *   clock     — WHERE the countdown sits. In the body it is the last line of
 *               a statement that reads reason → parcel → deadline, and the
 *               amount centres against that whole block. In the rail it
 *               stacks under the amount, which is the arrangement this list
 *               shipped with — and which is also what makes a row two
 *               lines instead of three, so it is the axis the two dense
 *               options both turn on.
 *
 * The clock's position is the axis that actually changes the row's grammar,
 * and it is why this is a config rather than two booleans: "show the AWB"
 * and "show the photo" are visibility, but body-vs-rail decides whether the
 * row is one statement with a value beside it, or two columns of facts.
 *
 * WHAT NEVER VARIES: the reason leads, the amount is the counterweight, the
 * chevron is the quietest mark and is on every row. Those are the row's
 * hierarchy (see ListRow.jsx), not a variant of it — an option that dropped
 * one of them would not be a different design, it would be a worse one.
 */

export const LINE_ITEM_DESIGNS = [
  {
    id: 'no-image',
    label: 'No image',
    // The densest row: no photograph, and the clock in the rail, so the
    // whole thing is two lines. Two trades at once — the AWB becomes the
    // only thing naming the parcel, so a Pilot reads a number instead of
    // recognising a picture; and the reason and the deadline sit at
    // opposite corners rather than next to each other. What it buys is
    // roughly half again as many losses per screenful.
    thumb: false,
    awb: true,
    clock: 'rail',
  },
  {
    id: 'no-awb',
    label: 'No AWB',
    // The photograph identifies the parcel and the AWB waits on the page
    // this row opens. Two lines — reason and deadline — so the statement is
    // uninterrupted, at the cost of a Pilot being unable to match a row
    // against a label without tapping it.
    thumb: true,
    awb: false,
    clock: 'body',
  },
  {
    id: 'three-row',
    label: 'All details — 3 rows',
    // Everything, stacked: reason, AWB, deadline, with the amount centred
    // against the block. The AWB rides in the middle and ranks last, which
    // holds only because it is the one line with no emphasis on it.
    thumb: true,
    awb: true,
    clock: 'body',
  },
  {
    id: 'two-row',
    label: 'All details — 2 rows',
    // The original. Two facts on the left (reason, AWB) and two on the right
    // (amount, deadline), so the row is two columns rather than a statement.
    // It is the shortest of the three "all details" readings, and the reason
    // and the deadline — the two facts that decide the row — end up at
    // opposite corners of it.
    thumb: true,
    awb: true,
    clock: 'rail',
  },
]

// The densest reading. It carries no photograph, so the AWB is what names
// the parcel, and it fits roughly half again as many losses on a screenful —
// which is what the list is for: a Pilot opens it to see how many and how
// much, and reads one row properly only once they have chosen it.
export const DEFAULT_LINE_ITEM_DESIGN = 'no-image'

export function resolveLineItemDesign(id) {
  return LINE_ITEM_DESIGNS.find((d) => d.id === id)
    || LINE_ITEM_DESIGNS.find((d) => d.id === DEFAULT_LINE_ITEM_DESIGN)
}

/**
 * WHICH OF THE TWO BODY LINES LEADS — a third axis, and independent of the
 * four designs above: any design that states the AWB at all can be read
 * either way round.
 *
 * `reason` is the default and stays the default. A Pilot scanning this list
 * is deciding which row to open, and they decide on what went wrong and what
 * it costs — the AWB is what they check AFTER choosing, to confirm they have
 * the right parcel in front of them. Leading with it would put the row's
 * least decisive fact in its loudest slot.
 *
 * `awb` is here because that reading is worth being able to see rather than
 * argue about: it is the right one if a Pilot arrives at this list already
 * holding a parcel, looking for its row, which is a different errand from
 * the one the default is built for.
 *
 * Only the lines swap. Weight, colour and order of the ranks do not — the
 * heading slot is still 13/18 demi near-black and the byline still 12/16
 * book grey, so whichever fact leads is read the same way.
 */
export const LINE_ITEM_HEADINGS = [
  { id: 'reason', label: 'Reason, AWB below' },
  { id: 'awb', label: 'AWB, reason below' },
]

export const DEFAULT_LINE_ITEM_HEADING = 'reason'

export function resolveLineItemHeading(id) {
  return LINE_ITEM_HEADINGS.some((h) => h.id === id) ? id : DEFAULT_LINE_ITEM_HEADING
}

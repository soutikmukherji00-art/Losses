import { fmt, parseShortDate, settledOn } from './helpers.js'

/**
 * THE HISTORIC LEDGER — the Losses tab in the "Active in My Earnings +
 * Historic as a Tab" arrangement (config/lossesStructure.js).
 *
 * The working list answers "what must I do?". This answers a different
 * question it cannot: "what have losses actually COST me?" — which is why it
 * groups by cycle and carries money totals.
 *
 * It deliberately owns NOTHING about how a loss looks. Rows come from the
 * app's one row builder, so a historic row is the same object the Needs-action
 * list renders, chip and all — and the chip already says "Deducted" /
 * "Not deducted" / "Returned", straight out of the state table's badge
 * grammar. This file adds only what is genuinely new: which cycle a loss is
 * filed under, and three money figures that are easy to conflate:
 *
 *   incurred  — what was charged to the Pilot in the first place
 *   deducted  — what actually left their pocket and stayed gone
 *   cameBack  — what did not: waived, never deducted, or deducted and then
 *               credited back after a hub scan (KRD F19's bank-statement
 *               rule — the debit row stays, the credit is added)
 *
 * Wrong pickups sit in here as history but contribute to no figure: no money
 * was ever at stake on them, so counting their value as "came back" would
 * invent a saving the Pilot never made.
 */

/**
 * Which states belong to history at all. GRACE_WAIVED is history like any
 * other closed loss: it contributes its amount to `incurred` and to
 * `cameBack` and nothing to `deducted`, which is precisely what the window
 * did to it — the Pilot was charged for it and kept the money.
 */
const HISTORIC_STATES = [
  'DEBITED', 'WAIVED', 'NOT_DEDUCTED', 'RETURNED_CREDITED', 'GRACE_WAIVED', 'INFO_ONLY',
]

/** Money never moved on an informational case, so it counts toward nothing. */
const INFORMATIONAL = 'INFO_ONLY'

/**
 * The date the money settled lives in `helpers.js`, because the losses list
 * needs the same answer: it shows only THIS cycle's decided losses, and this
 * ledger shows every cycle. One rule, so the two can't file a case under
 * different cycles.
 */

const MONTHS = {
  Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April',
  May: 'May', Jun: 'June', Jul: 'July', Aug: 'August',
  Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
}

export function buildHistoricLedger(cases, { rowFor }) {
  const entries = cases
    .filter((rec) => HISTORIC_STATES.includes(rec.caseState))
    .map((rec) => {
      const informational = rec.caseState === INFORMATIONAL
      const deducted = rec.caseState === 'DEBITED' ? rec.amt : 0
      const on = settledOn(rec)
      return {
        // The shared row — identical to the one the working list renders.
        row: rowFor(rec),
        incurred: informational ? 0 : rec.amt,
        deducted,
        cameBack: informational || deducted ? 0 : rec.amt,
        month: (on || '').split(' ')[1] || '',
        _sort: parseShortDate(on),
      }
    })
    .sort((a, b) => b._sort - a._sort)

  const groups = []
  entries.forEach((entry) => {
    let group = groups.find((g) => g.id === entry.month)
    if (!group) {
      group = { id: entry.month, label: MONTHS[entry.month] || entry.month, rows: [], ...zero() }
      groups.push(group)
    }
    group.rows.push(entry.row)
    add(group, entry)
  })

  const totals = zero()
  entries.forEach((entry) => add(totals, entry))

  // Groups are newest-first, so the last one is where this history starts.
  // The card states it because a lifetime total with no period attached is a
  // number a Pilot cannot judge — ₹1,240 over two months and ₹1,240 over two
  // years are not the same fact about them.
  const oldest = groups[groups.length - 1]

  return {
    empty: entries.length === 0,
    count: entries.length,
    // One month of history has no span to state; it has a month. Two forms
    // because the card uses it as a label and the sheet inside a sentence.
    spanLabel: groups.length > 1 ? `Since ${oldest.label}` : (oldest ? oldest.label : ''),
    spanPhrase: groups.length > 1 ? `since ${oldest.label}` : (oldest ? `in ${oldest.label}` : ''),
    totals: labelled(totals),
    groups: groups.map((g) => ({ ...labelled(g), id: g.id, label: g.label, rows: g.rows })),
  }
}

const zero = () => ({ incurred: 0, deducted: 0, cameBack: 0 })

function add(target, entry) {
  target.incurred += entry.incurred
  target.deducted += entry.deducted
  target.cameBack += entry.cameBack
}

function labelled(t) {
  return {
    ...t,
    incurredLabel: fmt(t.incurred),
    deductedLabel: fmt(t.deducted),
    cameBackLabel: fmt(t.cameBack),
  }
}

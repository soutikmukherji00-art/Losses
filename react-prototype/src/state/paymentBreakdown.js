import { getReason } from '../config/lossReasons.js'
import { fmt } from './helpers.js'

/**
 * THE PAYMENT BREAKDOWN — Payment Details, derived from the case pool.
 *
 * Every loss that moves money already names the payment line it lands on
 * (`reason.paymentLine` in config/lossReasons.js), and every case already
 * knows whether its money has actually moved. So the breakdown is not a
 * fixture: it is the same pool the losses list reads, grouped by payment line.
 *
 * It used to be a static list, and the two drifted exactly as you would
 * expect: the "Lost Shipments" drill-down listed four `VLM…` AWBs that existed
 * in no case anywhere, while the loss detail page promised the Pilot their
 * case was "in your 12 Aug payment · Deductions → Lost Shipments". The line
 * they were sent to look at could not contain the case that sent them.
 *
 * WHICH CASES HAVE MOVED MONEY — the only question that decides membership:
 *
 *   DEBITED             debit. The amount left and stayed gone.
 *   RETURNED_CREDITED   debit AND credit. KRD F19's bank-statement rule: the
 *                       debit row stays and the credit is added beside it,
 *                       because deleting the debit would erase the history of
 *                       what actually happened to the Pilot's money.
 *   LIF_RECOVERY_OPEN   debit. Lost in Field is pre-deducted: the money left
 *   LIF_CLAIM_SENT      before the Pilot ever saw the case.
 *
 * Everything else is absent, and absence is the point: ATTRIBUTED, ACCEPTED
 * and IN_DISPUTE have not been deducted yet (a payment breakdown that showed
 * them would be charging for a decision still pending), and WAIVED /
 * NOT_DEDUCTED never cost anything at all.
 *
 * A loss the grace window covered is absent for the same reason: the lens
 * upstream has already turned it into GRACE_WAIVED (state/grace.js), which is
 * not a debit state, so nothing here has to know the window exists.
 */
const DEBIT_STATES = ['DEBITED', 'RETURNED_CREDITED', 'LIF_RECOVERY_OPEN', 'LIF_CLAIM_SENT']
const CREDIT_STATES = ['RETURNED_CREDITED']

/** The money a returned parcel gives back, filed where the Pilot gains. */
const RETURN_CREDIT_LINE = { section: 'Adjustments', label: 'Returned Shipments Credited' }

const sum = (rows, pick) => rows.reduce((t, r) => t + pick(r), 0)

/** "- ₹48" / "+ ₹20" — a signed figure, so a line states its own direction. */
const signed = (n) => (n < 0 ? `- ${fmt(Math.abs(n))}` : `+ ${fmt(n)}`)

export function buildPaymentBreakdown(cases, { basePay, staticCards, expanded, openLine, openCase }) {
  const moved = cases
    .map((rec) => ({ rec, line: getReason(rec.reasonCode).paymentLine }))
    .filter((x) => x.line)

  const debits = moved.filter((x) => DEBIT_STATES.includes(x.rec.caseState))
  const credits = moved.filter((x) => CREDIT_STATES.includes(x.rec.caseState))

  // The Deductions → "Lost Shipments" line, and the cases behind it. This is
  // the set the drill-down lists, so the line and its detail cannot disagree.
  const lostShipments = debits
    .filter((x) => x.line.label === 'Lost Shipments')
    .map(({ rec }) => ({
      id: rec.id,
      awb: rec.awb,
      date: rec.debitDate || rec.date,
      amt: rec.amt,
      open: () => openCase(rec.id),
    }))
    .sort((a, b) => b.amt - a.amt)

  /** Loss-derived rows for one card, one row per distinct payment line. */
  const lossItemsFor = (section) => {
    const items = []

    const debitLines = [...new Set(debits
      .filter((x) => x.line.section === section)
      .map((x) => x.line.label))]

    debitLines.forEach((label) => {
      const rows = debits.filter((x) => x.line.section === section && x.line.label === label)
      items.push({
        label,
        amt: -sum(rows, (x) => x.rec.amt),
        // Only the line with a drill-down behind it is tappable.
        clickable: label === 'Lost Shipments',
      })
    })

    if (section === RETURN_CREDIT_LINE.section && credits.length) {
      items.push({ label: RETURN_CREDIT_LINE.label, amt: sum(credits, (x) => x.rec.amt) })
    }

    return items
  }

  const cards = staticCards.map((card) => {
    const items = [...card.items, ...lossItemsFor(card.title)]
    const total = sum(items, (i) => i.amt)
    const isOpen = !!expanded[card.key]
    return {
      key: card.key,
      title: card.title,
      // Computed, never stated. The fixture used to carry its own total and
      // three of the four disagreed with the items underneath them.
      total: signed(total),
      value: total,
      expanded: isOpen,
      chevronDeg: isOpen ? 180 : 0,
      toggle: () => openLine(card.key),
      items: items.map((it) => ({
        label: it.label,
        amt: signed(it.amt),
        cursor: it.clickable ? 'pointer' : 'default',
        underline: !!it.clickable,
        onClick: it.clickable ? () => openLine('lostShipments', true) : () => {},
      })),
    }
  })

  const baseTotal = sum(basePay.delivery, (l) => l.amt) + sum(basePay.pickup, (l) => l.amt)
  const paymentTotal = baseTotal + sum(cards, (c) => c.value)

  return {
    basePay: {
      total: baseTotal,
      totalLabel: fmt(baseTotal),
      delivery: basePay.delivery.map((l) => ({ label: l.label, amt: fmt(l.amt) })),
      pickup: basePay.pickup.map((l) => ({ label: l.label, amt: fmt(l.amt) })),
    },
    cards,
    paymentTotal: fmt(paymentTotal),
    lostShipments: {
      items: lostShipments.map((x) => ({ ...x, amtLabel: fmt(x.amt) })),
      total: fmt(sum(lostShipments, (x) => x.amt)),
      subtitle: `${lostShipments.length} ${lostShipments.length === 1 ? 'shipment' : 'shipments'} deducted from this payment`,
    },
  }
}

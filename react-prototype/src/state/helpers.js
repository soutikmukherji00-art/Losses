import data from '../data/activeDataset.js'

/**
 * The prototype's "now". Every relative date on the loss surface is derived
 * from it, so a countdown and a fixed calendar date can be compared instead of
 * printed side by side and left to contradict each other.
 *
 * It belongs to the DATASET, not to this file: the Live fixture's debitable
 * losses were audited on 16 Sep, so a "today" of 15 Aug would put them
 * outside the current cycle and read every countdown backwards. Mock keeps
 * 15 Aug, Live says 18 Sep, and `inCurrentCycle` below follows either.
 */
export const TODAY = data.today || "15 Aug"

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

export const fmt = (n) => "₹" + n

export const addDays = (d, n) => {
  const p = d.split(" ")
  const dt = new Date(2025, MONTHS.indexOf(p[1]), parseInt(p[0], 10) + n)
  return dt.getDate() + " " + MONTHS[dt.getMonth()]
}

/**
 * A "12 Aug" into a sortable number. Its two callers are both SORTS — the
 * unified list's history tail and the historic ledger's cycle groups — so a
 * record it cannot read has to fall to the end of the order, not take the
 * page down with it.
 *
 * It used to call `.split` on whatever it was handed, which meant one record
 * missing one optional field blanked the entire app with a TypeError: the
 * wrong-RVP feed has no date column, and the first dateless row seeded from it
 * rendered a white screen. That is the same failure the reason registry and
 * the evidence builder each already refuse (an unmapped reason falls back, a
 * missing image draws a placeholder — "never a blocked row"), and this was the
 * one date path with no such floor under it.
 */
export const parseShortDate = (d) => {
  const p = String(d ?? '').split(" ")
  const day = parseInt(p[0], 10)
  const month = MONTHS.indexOf(p[1])
  if (month < 0 || Number.isNaN(day)) return 0
  return month * 31 + day
}

/** "1 day" / "3 days" — the L0 badges are the only place a count of 1 can occur. */
export const days = (n) => n + (Number(n) === 1 ? " day" : " days")

/**
 * The date a case's money actually settled — the credit if one came, else the
 * debit, else the day the loss was raised (a waived case never touches a
 * payment at all). That is what decides which cycle a decided loss is filed
 * under, on the losses list and in the historic ledger alike.
 */
export const settledOn = (rec) => rec.creditDate || rec.debitDate || rec.date

/**
 * One payout cycle per month, which is the grouping the historic ledger
 * already uses — so "this cycle" and "the August group" cannot disagree.
 *
 * The working losses list is THIS cycle's list: decided losses older than it
 * are history, and history has its own home (the Losses tab in the
 * 'active-plus-historic' arrangement), where the full run is kept.
 */
const cycleOf = (d) => (d || '').split(' ')[1] || ''

const CURRENT_CYCLE_MONTH = cycleOf(TODAY)

export const inCurrentCycle = (d) => cycleOf(d) === CURRENT_CYCLE_MONTH

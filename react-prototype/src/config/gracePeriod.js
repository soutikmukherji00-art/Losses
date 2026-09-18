import { TODAY } from '../state/helpers.js'

/**
 * THE GRACE PERIOD — a new Pilot's first weeks cost them nothing.
 *
 * The second of the app's two account-level policies (the first is the
 * dispute cool-off, config/disputeCoolOff.js). Both are about the PILOT's
 * record rather than about any one case, and both are stated in exactly one
 * file so the four surfaces that mention them cannot drift.
 *
 * THE RULE: for `weeks` weeks from the day a Pilot joins, no loss is deducted.
 * After it closes, the normal rule resumes: a loss left alone is deducted,
 * and so is a dispute that is not upheld.
 *
 * WHAT THIS IS NOT: something the Pilot is told in advance. The window is
 * never announced — not on the losses list, not on My Earnings, not on an
 * open loss. Telling a new Pilot their first four weeks are free hands them a
 * reason to ignore every loss in those four weeks, which is exactly the four
 * weeks the window exists to let them learn in. They see it once, on a loss
 * that has settled, as money returned with a sentence saying why. See
 * state/grace.js for where that is enforced.
 *
 * ⚠️ `weeks` IS A PLACEHOLDER, not a decision — the same standing as X and T
 * in disputeCoolOff.js. Four weeks is what the brief named; this file exists
 * so Business changing it is one number, not six strings.
 *
 * The Pilot's joining date is a fact about the Pilot, so it lives on the
 * FIXTURE (`pilot.joinedOn`), next to their dispute record — not here.
 */
export const GRACE_PERIOD = {
  /** How long a new Pilot's losses are covered for. */
  weeks: 4,
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/**
 * "22 Jul" → a real Date, so the window's end and its countdown are day
 * arithmetic rather than the month*31 ordering `parseShortDate` uses. That
 * ordering sorts correctly and subtracts wrongly, and this file subtracts.
 */
const toDate = (d) => {
  const p = String(d ?? '').split(' ')
  const month = MONTHS.indexOf(p[1])
  const day = parseInt(p[0], 10)
  if (month < 0 || Number.isNaN(day)) return null
  return new Date(2025, month, day)
}

const label = (dt) => `${dt.getDate()} ${MONTHS[dt.getMonth()]}`

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * The window, resolved against one Pilot and one "today".
 *
 * `on` is the toggle; everything else is what the toggle means. A resolved
 * grace is handed to the case pool (state/grace.js) and to the surfaces that
 * announce it, so the banner's date, the loss page's figure and the payment
 * breakdown's silence are all the same reading.
 *
 * `active` is the one a caller should test: the toggle can be on while the
 * window has already closed, and a closed window covers nothing.
 */
export function resolveGrace({ on = false, joinedOn, today = TODAY, weeks = GRACE_PERIOD.weeks } = {}) {
  const joined = toDate(joinedOn)
  const now = toDate(today)

  if (!joined || !now) return { on, active: false, weeks, covers: () => false }

  const end = new Date(joined.getTime() + weeks * 7 * DAY_MS)
  const daysLeft = Math.ceil((end - now) / DAY_MS)
  const active = on && daysLeft > 0

  return {
    on,
    active,
    weeks,
    joinedOn,
    endsOn: label(end),
    daysLeft,
    /**
     * Whether a loss raised on this date falls inside the window. Measured on
     * the day the LOSS happened, not the day it settles: a loss earned inside
     * the window is covered even if the team decides it a week after the
     * window shuts, which is the only reading a Pilot can predict.
     */
    covers: (date) => {
      if (!active) return false
      const d = toDate(date)
      return !!d && d >= joined && d <= end
    },
  }
}

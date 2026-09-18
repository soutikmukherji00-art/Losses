/**
 * BUCKET NAMES — what each group of losses is called, in one place.
 *
 * A bucket name appears on at least five surfaces: the sectioned list's
 * section heads, the filter chips above them, the Unified layout's summary
 * cards, the "settling this cycle" sheet's group heads, and the lifecycle
 * label a case carries on its own page. Until this file existed the same
 * words were typed into `caseStates.js`, `useLossesApp.js`, `LossesBody.jsx`
 * and both data fixtures — and had already drifted: the section head said
 * "Wrong Pickups" while the summary card beside it said "Wrong pickups".
 *
 * Keyed by BUCKET ID, which is what the filter chips, the summary cards and
 * `_cat` on a row all already carry, so a surface looks a name up by the
 * thing it is already holding rather than by matching a string.
 *
 * The names say what the PILOT has to do, or what has already happened —
 * never what our system calls the state:
 *
 *   needsAction — a decision is theirs to make, and the clock is running.
 *   pending     — they made it, they disputed, and the decision is ours.
 *                 "Disputes in Review" says whose turn it is; the older
 *                 "Decision pending" left that open, which is the one thing
 *                 a Pilot waiting on us needs to be sure of. It also names
 *                 the thing in the group — disputes — rather than the state
 *                 those things are in, which is what the other three names
 *                 do too.
 *   closed      — settled, one way or the other. "Past Losses" is a plain
 *                 description of a record; the older "Decisions" named the
 *                 event that closed the case rather than the thing the
 *                 group is, and read as a place to go and decide something.
 *   wrong       — informational, deducts nothing (see INFO_ONLY_NOTE).
 */
export const BUCKET_NAME = {
  needsAction: 'Needs Decision',
  pending: 'Disputes in Review',
  closed: 'Past Losses',
  wrong: 'Wrong Pickups',
}

/** The name, or whatever the caller already had for anything not a bucket
 *  (the "All" chip, which is a filter and not a group). */
export const bucketName = (id, fallback = '') => BUCKET_NAME[id] || fallback

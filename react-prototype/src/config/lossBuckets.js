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
 *   needsAction — something is theirs to do, and the clock is running.
 *                 "Needs Attention" over the older "Needs Decision": a
 *                 decision is what WE want from them, attention is what they
 *                 have to give, and one of those is a word a Pilot uses.
 *   pending     — they acted, and it is with us now. "Team is checking"
 *                 says whose turn it is in the plainest available words —
 *                 a sentence about people, where "Disputes in Review" was a
 *                 noun phrase about a process. It also survives a group that
 *                 holds accepted cases as well as disputes, which the older
 *                 name quietly did not.
 *   closed      — settled, one way or the other. "History" is the shortest
 *                 true description of the group and the only one of these
 *                 names that never has to be read twice.
 *   wrong       — informational, deducts nothing (see INFO_ONLY_NOTE).
 */
export const BUCKET_NAME = {
  needsAction: 'Needs Attention',
  pending: 'Team is checking',
  closed: 'History',
  wrong: 'Wrong Pickups',
}

/** The name, or whatever the caller already had for anything not a bucket
 *  (the "All" chip, which is a filter and not a group). */
export const bucketName = (id, fallback = '') => BUCKET_NAME[id] || fallback

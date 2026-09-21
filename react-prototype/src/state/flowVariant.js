/**
 * THE ONLY-DISPUTE LENS — making the DATA agree with the flow.
 *
 * "Only Dispute" (config: `flowVariant`) removes accept from the app: no
 * Accept button, no accept sheet, no accept route. That was applied to the
 * CONTROLS and stopped there, so the fixture went on carrying cases that only
 * an accept could have produced — a loss sitting in "Team is checking"
 * reading "Accepted on 14 Aug", in a build where the Pilot has never been
 * offered an Accept button in his life. The most-scrutinised state in the
 * variant was evidence that the variant was not real.
 *
 * A variant that hides a door has to account for everything behind it. This
 * is the same shape as the grace lens (state/grace.js): the pool is read
 * through it once, before any surface sees it, and the pool itself is never
 * edited — so switching back to Accept + Dispute restores every case exactly.
 *
 * THREE STATES ARE ACCEPT-ONLY, and each has one honest dispute equivalent:
 *
 *   ACCEPTED       → IN_DISPUTE. The same loss, acted on the same day,
 *                    through the only door that exists. Its reason has to
 *                    change with it: "I was in a hurry" is an admission, and
 *                    a dispute is a denial — carrying the accept reason over
 *                    would put a confession inside a dispute.
 *   NOT_DEDUCTED   → WAIVED. Both mean the Pilot kept the money; the
 *                    difference is who decided and why, and NOT_DEDUCTED is
 *                    reachable only from ACCEPTED (config/caseTransitions).
 *   DEBITED, via   → the same DEBITED with the dispute's path. `pathLabel` is
 *   "you accepted     printed verbatim in the hero ("Deducted — you accepted
 *   it"              it"), so leaving it is the accept flow speaking on a
 *                    page the accept flow cannot have produced.
 *
 * Silence-path DEBITED cases are untouched: a window closing with no reply is
 * the one outcome both flows share.
 *
 * WHAT IT DOES NOT DO. It never invents a case and never moves one between
 * buckets — ACCEPTED and IN_DISPUTE are both `pending`, NOT_DEDUCTED and
 * WAIVED are both `closed`. Every count, every total and every section on
 * every surface is identical under both flows; what changes is that the
 * cases are ones this Pilot could actually have created.
 */

/** Said by a Pilot who is disputing, not confessing. One of `disputeChips`. */
const DISPUTE_REASON = 'Not my parcel'

const ACCEPT_PATH_LABEL = 'you accepted it'

export function applyDisputeOnly(cases, onlyDispute) {
  if (!onlyDispute) return cases

  return cases.map((rec) => {
    // `trackerKind` rides along on every branch: a closed case rebuilds its
    // timeline from it (resolveCaseView's tracker slot), and left as
    // 'accepted' it would head that timeline "Your accepted case" on a page
    // the accept flow cannot have produced.
    if (rec.caseState === 'ACCEPTED') {
      return {
        ...rec,
        caseState: 'IN_DISPUTE',
        actedReason: DISPUTE_REASON,
        trackerKind: 'dispute',
      }
    }

    if (rec.caseState === 'NOT_DEDUCTED') {
      return {
        ...rec,
        caseState: 'WAIVED',
        trackerKind: rec.trackerKind && 'dispute',
        // Not an SLA breach — a real verdict, which is what the case was.
        waiveReason: 'agent_right',
        outcome: rec.outcome
          ? 'You disputed this loss. After review the team agreed with you, so nothing was deducted.'
          : rec.outcome,
      }
    }

    if (rec.caseState === 'DEBITED' && rec.pathLabel === ACCEPT_PATH_LABEL) {
      return {
        ...rec,
        pathLabel: 'your dispute was not upheld',
        trackerKind: rec.trackerKind && 'dispute',
        outcome: rec.outcome
          ? 'You disputed this loss. After review the team kept the deduction.'
          : rec.outcome,
      }
    }

    return rec
  })
}

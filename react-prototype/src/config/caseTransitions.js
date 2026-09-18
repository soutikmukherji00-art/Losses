import { TODAY } from '../state/helpers.js'

/**
 * WHAT HAPPENS TO A CASE THAT ISN'T THE PILOT'S DOING.
 *
 * The Pilot's own moves are the app's own CTAs — accept, dispute, claim a
 * return, add your side — and those live in `useLossesApp.js` next to the
 * flows that raise them. This file covers the other half of the lifecycle:
 * the verdicts handed down by the review team, the timer, or the hub scan.
 * Without them a walkthrough can never reach the Past Losses bucket, because
 * nothing a Pilot can tap closes a case.
 *
 * The presenter panel turns each row into a button (§ Case lifecycle), so a
 * reviewer can push the case they're looking at to any legitimate next state
 * and watch it move buckets.
 *
 * `patch` is not optional decoration: every terminal state reads fields that
 * an open case doesn't carry yet, and a state that lands without them renders
 * "Returned on undefined" or drops its payment line. Whatever the destination
 * state's entry in `caseStates.js` reads, supply it here.
 */
const CASE_OUTCOMES = {
  ATTRIBUTED: [
    {
      id: 'DEBITED',
      label: 'Window closed → deducted',
      patch: () => ({ pathLabel: 'no reply in 7 days', debitDate: TODAY }),
    },
  ],

  OPEN_DISPUTE_PAUSED: [
    {
      id: 'DEBITED',
      label: 'Window closed → deducted',
      patch: () => ({ pathLabel: 'no reply in 7 days', debitDate: TODAY }),
    },
  ],

  ACCEPTED: [
    {
      id: 'NOT_DEDUCTED',
      label: 'Review → not deducted',
      patch: () => ({ outcome: 'Review found this was not your mistake after all. Nothing was deducted.' }),
    },
    {
      id: 'DEBITED',
      label: 'Review → deducted',
      patch: () => ({ pathLabel: 'you accepted it', debitDate: TODAY }),
    },
  ],

  IN_DISPUTE: [
    {
      id: 'WAIVED',
      label: 'Dispute upheld → waived',
      patch: () => ({ outcome: 'We checked your photos. You were right, so nothing was deducted.' }),
    },
    {
      id: 'DEBITED',
      label: 'Dispute rejected → deducted',
      patch: () => ({ pathLabel: 'your dispute was not upheld', debitDate: TODAY }),
    },
  ],

  LIF_RECOVERY_OPEN: [
    {
      id: 'RETURNED_CREDITED',
      label: 'Hub scanned it → credited',
      patch: () => ({ returnedOn: TODAY, creditDate: TODAY }),
    },
    {
      id: 'DEBITED',
      label: 'Never returned → stays deducted',
      patch: () => ({ pathLabel: 'the parcel was not returned' }),
    },
  ],

  // The Pilot has claimed the parcel is back; the scan is the verdict.
  LIF_CLAIM_SENT: [
    {
      id: 'RETURNED_CREDITED',
      label: 'Scan found it → credited',
      patch: () => ({ returnedOn: TODAY, creditDate: TODAY }),
    },
    {
      id: 'DEBITED',
      label: 'Not at the hub → stays deducted',
      patch: () => ({ pathLabel: 'the parcel was not found at the hub' }),
    },
  ],
}

/** The moves available to a case in this state. Terminal states have none. */
export function getOutcomes(stateId) {
  return CASE_OUTCOMES[stateId] || []
}

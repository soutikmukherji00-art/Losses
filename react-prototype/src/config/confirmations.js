/**
 * CONFIRMATION POPUPS — what each submitted flow says back to the Pilot.
 *
 * Structure is fixed (icon · headline · byline, auto-closing in 3s — see
 * components/common/ConfirmationPopup.jsx); only these words change per flow.
 * Adding a confirmation to a new flow is a row here plus one `confirmation:`
 * key in the action that submits it — never a new component.
 *
 * The copy rules these lines are written against, because they are easy to
 * break by accident:
 *  · ~3 seconds of reading. Bylines stay at 6-8 words; anything longer isn't
 *    finished before the popup closes. The dispute byline now runs to 14 and
 *    is the exception, not a new licence: it carries two facts because both
 *    were asked for. If a third flow wants two facts, raise CONFIRMATION_MS
 *    rather than letting every popup outgrow its own dwell time.
 *  · Accept may never promise a waiver, odds, or a dated reply (KRD F12/F7).
 *    "We will tell you before your payout" is the only timing it can honestly
 *    give — no "the team may cancel it", no "reply in 7 days".
 *  · Each flow says its own most useful TRUE fact, not a house line. Accept
 *    has no honest money reassurance to offer, so it gives timing; dispute's
 *    strongest fact is that the money stays put meanwhile.
 *  · The page underneath already states the outcome in full. These lines
 *    confirm the tap and carry one fact — they are not a summary.
 */
const CONFIRMATIONS = {
  accept: {
    headline: 'Accept recorded',
    byline: 'We will tell you before your payout.',
  },
  dispute: {
    headline: 'Raised Dispute',
    // Two facts, in the order the Pilot wants them: it left, and nothing
    // moves while it is away. This is the one byline over the 6-8 word rule
    // above — see the note on CONFIRMATION_MS.
    byline: 'Your dispute is sent to the team. Nothing is deducted while we check.',
  },
  // Wrong pickup's PSEUDO dispute — on record, not under review. It must not
  // borrow `dispute` above: "while we check" promises a check nobody runs,
  // on the one loss type where nothing was ever going to be deducted.
  pseudoDispute: {
    headline: 'Raised Dispute',
    byline: 'Thank you. Your side is on record with the team.',
  },
  // Lost in Field — a claim that the parcel is already back at the hub. It
  // promises the check, never the credit: the hub scan decides that.
  returnedClaim: {
    headline: 'Check requested',
    byline: 'We will check the hub scan.',
  },
  // Wrong pickup (info-only). Restates the one thing that matters about this
  // whole category — it costs nothing.
  addSide: {
    headline: 'Your side is saved',
    byline: 'No money is deducted for this.',
  },
}

/** How long the popup stays up. The whole reason its copy is kept short. */
export const CONFIRMATION_MS = 3000

export function getConfirmation(id) {
  if (!id) return null
  const confirmation = CONFIRMATIONS[id]
  if (confirmation) return confirmation
  console.warn('[confirmations] unknown confirmation id, showing nothing:', id)
  return null
}

/**
 * THE GRACE LENS — where the grace period reaches the data, and the only
 * place in the app that knows the window exists.
 *
 * The policy lives in config/gracePeriod.js. This applies it, at the ONE
 * moment it is allowed to show: the moment a loss would have been deducted.
 *
 * WHY ONLY THERE. The window's whole value depends on the Pilot not being
 * told about it in advance. A new Pilot who reads "your first four weeks are
 * free" on the losses list has been given a reason to ignore every loss on
 * it — and the four weeks the window was meant to buy, the ones where they
 * learn what a clear photo is and what a dispute costs, are spent learning
 * that none of it matters. So an open loss under grace is indistinguishable
 * from an open loss without it: same amount at stake, same countdown, same
 * warm tone, same reason to act. The Pilot behaves as they will have to
 * behave from week five.
 *
 * The window shows up once, on the settled loss, as money they got back and
 * a sentence saying why — which is the moment it teaches the rule instead of
 * undermining it (see GRACE_WAIVED in config/caseStates.js).
 *
 * WHAT IT DOES. Exactly one rewrite: a DEBITED case raised inside the window
 * becomes GRACE_WAIVED and loses its `debitDate`, because a debit date is a
 * claim about a payment the Pilot can go and look at. DEBITED is the app's
 * only state in which money has left and stayed gone, so it is the whole of
 * "the deducted amounts" — everything upstream of it (attributed, accepted,
 * in dispute, and Lost in Field's recovery window) is still in play and still
 * reads as it always did. A case only reaches the lens when it settles.
 *
 * Downstream, nothing needs changing and nothing was: GRACE_WAIVED is not a
 * debit state, so the payment breakdown drops it by the rule it already had;
 * the historic ledger and the insight engine count it as money that came
 * back, like every other loss the Pilot was not charged for.
 *
 * It is a LENS, not an edit: the pool itself is untouched, so turning the
 * toggle off restores every deduction exactly as it was — the same dataset,
 * seen under the policy and without it.
 */
export function applyGrace(cases, grace) {
  if (!grace?.active) return cases

  return cases.map((rec) => {
    if (rec.caseState !== 'DEBITED') return rec
    if (!grace.covers(rec.date)) return rec
    return { ...rec, caseState: 'GRACE_WAIVED', debitDate: null }
  })
}

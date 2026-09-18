/**
 * DISPUTE COOL-OFF — the one policy in the app that is about the PILOT's
 * record rather than about a case.
 *
 * The rule (PRODUCT.md, KRD F17): X consecutive WRONG disputes pause disputing
 * for T days. Accept and silence stay open throughout. **One won dispute
 * resets the counter to zero.**
 *
 * WHAT THIS IS NOT: a quota on disputing. A Pilot who disputes accurately can
 * dispute every loss they ever receive. The count is on being WRONG, and every
 * string below has to survive that distinction — "2 disputes left" would state
 * a limit that does not exist and would suppress the honest disputes the whole
 * feature is for. Business wants accurate disputes, not fewer of them.
 *
 * ⚠️ X AND T ARE [TBD] IN PRODUCT.md — "do not invent values". The numbers
 * here are the prototype's standing placeholders, not decisions: 3 was already
 * hardcoded in the cool-off notice's copy and the loss page's paused-dispute
 * copy, and this file exists so there is ONE of it to change when Business
 * rules, instead of three strings to find.
 */
export const DISPUTE_COOL_OFF = {
  /** X — consecutive wrong disputes that trigger the pause. */
  wrongLimit: 3,
  /** T — how long disputing stays paused. */
  pauseDays: 15,
}

/**
 * The Pilot's standing, as the dispute sheet states it.
 *
 * A fraction and one line under it. The fraction IS the counter — "2/3" needs
 * no colour, no pips and no card to be understood, and it survives being read
 * by someone who cannot read the byline at all.
 *
 * The consequence clause is conditional on purpose. A Pilot with a clean
 * record opening a dispute does not need to be told what would happen after
 * three losses they have not had; leading with it turns a neutral form into a
 * warning about a threat that isn't there yet.
 */
export function getDisputeStanding(wrongInARow, { wrongLimit, pauseDays } = DISPUTE_COOL_OFF) {
  const wrong = Math.max(0, Math.min(wrongInARow ?? 0, wrongLimit))
  const left = wrongLimit - wrong

  const consequence = wrong === 0
    ? null
    : left === 1
      ? `One more and disputing pauses for ${pauseDays} days.`
      : `${left} more and disputing pauses for ${pauseDays} days.`

  return {
    wrong,
    limit: wrongLimit,
    left,
    fraction: `${wrong}/${wrongLimit}`,
    // One label, always the same words, so the fraction never has to be
    // re-learned; the consequence is appended to it rather than stacked under
    // it, which would make a two-line block out of a one-line fact.
    byline: ['Recent disputes found wrong.', consequence].filter(Boolean).join(' '),
    // The last step is the only one that earns emphasis. Carried by the
    // figure's own ink now — a tinted panel made a standing look like an
    // alert at every count.
    atLimit: left <= 1,
  }
}

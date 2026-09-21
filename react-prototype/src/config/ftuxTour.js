/**
 * THE FIRST-RUN TOUR — five coach marks that introduce Losses, in the order
 * a Pilot asks the questions: where → which → why → what it costs → what I
 * can do.
 *
 * WHEN IT FIRES. Not on signup: on signup there is nothing to point at. The
 * losses entry point on My Earnings only exists while a loss is waiting on
 * the Pilot (`lossesEntryStates.js` → `actionable`), so the tour's real
 * trigger is the FIRST session in which that is true. The presenter's
 * "Start FTUX" button forces it for review.
 *
 * STEP 4 CARRIES THE ONE FACT THE WHOLE FEATURE TURNS ON — silence deducts.
 * It sits on the money card rather than on the action step because that is
 * where the Pilot is looking at the figure it is about.
 *
 * STEP 5 ENDS ON "Got it", NOT ON A TAP. Every other step is advanced by
 * doing the thing, which is how a Pilot learns it; the last control is a
 * dispute — once only, irreversible — and a tour must never walk someone
 * into one to get to the end.
 *
 * `title` and `body` may be functions of the tour context (the action the
 * page is actually offering), so step 5 can never name a button that this
 * loss type does not have: a Lost-in-Field loss is "needs attention" too,
 * and its control is "I already returned it".
 */

/** Which tour screen a `state.screen` value counts as. */
export const FTUX_SCREEN = {
  myearnings: 'myearnings',
  home: 'losses',
  'losses-active': 'losses',
  case: 'case',
}

export const FTUX_STEPS = [
  {
    id: 'entry',
    screen: 'myearnings',
    target: 'losses-entry',
    // Advanced by tapping the real control, which navigates on its own —
    // the tour follows the Pilot rather than driving them.
    advance: 'tap',
    title: 'Losses show up here',
    body: 'When a loss is marked to you, this is where you will see it — what it may cost, and how long you have.',
  },
  {
    id: 'row',
    screen: 'losses',
    target: 'loss-row',
    advance: 'tap',
    title: 'One row, one loss',
    body: 'Each row names what happened, which parcel, what it may cost, and the days you have left.',
  },
  {
    id: 'what',
    screen: 'case',
    target: 'what-happened',
    advance: 'next',
    title: 'Why this loss was marked',
    body: 'The reason it was marked to you, and which parcel it is about.',
  },
  {
    id: 'money',
    screen: 'case',
    target: 'money',
    advance: 'next',
    // Centred: on a 360x780 frame this block sits below the fold once the
    // first section has been read.
    scroll: 'center',
    title: 'What is at stake',
    body: 'How much this loss is worth, and where that money stands. If you do nothing before the days run out, it comes out of your payout.',
  },
  {
    id: 'action',
    screen: 'case',
    target: 'action-bar',
    advance: 'end',
    title: ({ actionMode }) => (actionMode === 'recovery'
      ? 'If you already returned it'
      : 'If this is not your mistake'),
    body: ({ actionMode, ctaLabel, replyDays }) => (actionMode === 'recovery'
      ? `Tap ‘${ctaLabel}’ and we will check the hub scan. If the parcel is there, the money comes back as a credit.`
      : `Tap ‘${ctaLabel}’ and tell us why. The team replies in ${replyDays} days — nothing is deducted while they check.`),
  },
]

/** A step with its copy resolved against the page the Pilot is actually on. */
export function resolveFtuxStep(index, ctx) {
  const step = FTUX_STEPS[index]
  if (!step) return null
  const read = (v) => (typeof v === 'function' ? v(ctx) : v)
  return { ...step, title: read(step.title), body: read(step.body) }
}

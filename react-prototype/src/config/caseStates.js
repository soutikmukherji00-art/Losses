import { days, settledOn } from '../state/helpers.js'
import { BUCKET_NAME } from './lossBuckets.js'

/**
 * CASE-STATE TABLE — axis 2 of `L1 = f(reasonCode, caseState)`.
 *
 * Straight from the KRD's status lifecycle (§6b):
 *   ATTRIBUTED → (viewed) → IN-DISPUTE / ACCEPTED → DEBITED / WAIVED /
 *   NOT-DEDUCTED, plus LiF RETURNED-CREDITED.
 *
 * A state declares *presentation*, never layout: which tone the banner takes,
 * what the money statement says, which action block is offered, whether a
 * tracker shows, what the footer promises. The slot order itself is fixed —
 * see resolveCaseView.js.
 */

/**
 * Tone is chosen by MONEY POSITION, not by severity and not by reason. That
 * rule is what stops a new loss type from inventing a new visual language.
 * Red is reserved for system errors — never for a loss (KRD F24: wrong
 * pickups carry "no red, no minus signs").
 */
const TONE = {
  RISK: 'risk',                       // money at stake, action still open
  PROGRESS: 'progress',               // in flight, nothing cut yet
  RESOLVED_GOOD: 'resolved_good',     // no money lost
  RESOLVED_NEUTRAL: 'resolved_neutral', // money cut, case closed
}

const ACTION = {
  OFFERS: 'offers',
  OFFERS_DISPUTE_PAUSED: 'offers_dispute_paused',
  ADD_SIDE: 'add_side',
  RECOVERY: 'recovery',
  NONE: 'none',
}

/**
 * L0 BADGE GRAMMAR (`listChip`). The loss list is scanned, not read, so every
 * badge on it takes one of four shapes and nothing else — a Pilot learns the
 * vocabulary once and it holds for every loss type that arrives later:
 *
 *   1. "<n> days left"      — the case is actionable; n is the Pilot's clock,
 *                             whether it runs to a deduction or to a return.
 *   2. "Deducted"/"Returned"— terminal money movement, no amount (the row's
 *                             own amount column already carries the figure).
 *                             Returned is green, Deducted grey.
 *   3. "Not deducted"       — money was at risk and was kept, or never was.
 *   4. "Decision in <n> days" — waiting on the team.
 *
 * The amount stays out of shapes 2-4 on purpose: it used to appear twice in
 * the same row, once in the amount column and once inside the badge.
 *
 * Shapes 2 and 3 are now GONE from the badge and carried by the amount column
 * instead — see the money grammar below. What is left here is the two shapes
 * that are about a clock, not about money.
 */

/**
 * THE MONEY GRAMMAR (`money`) — ONE statement per state, rendered in two
 * places: the list row's amount column, and the loss page's hero figure.
 *
 * It is one field because it was three — `figure`, `figureWas` and a separate
 * `listMoney` — and three declarations of one fact drift. They did: a returned
 * shipment read "+₹65" in the list and "₹0" with ₹65 struck on its own page,
 * for the same case, one tap apart. A state now says what a case's money is
 * once, and both surfaces render that.
 *
 *   { amount, was?, tone }
 *
 *   ₹145            at stake — primary, the case is still live
 *   ₹210            deducted — settled (gray): the money is gone and closed
 *   ₹0  ₹̶9̶0̶          kept — the ₹0 is what happened, the struck figure what
 *                   nearly did. Waived, not-deducted, and wrong pickups.
 *   +₹65            returned — a credit, because the debit stayed on the
 *                   statement and this came back on top of it (KRD F18/F19).
 *                   Not "₹0", which would describe a loss that never happened.
 *
 * A decided row carries no badge: the amount says the outcome, and it used to
 * say it twice — "₹90" in the column and "Not deducted" in a pill beside it,
 * the pill being the slower of the two to read. What is left in `listChip` is
 * the shapes that are about a clock, not about money.
 *
 * Wrong pickups take the struck figure like any other kept case (design call,
 * 16 Sep). It states the parcel's value and that the Pilot was not charged for
 * it, and KRD F24's actual requirements — no red, no minus signs — still hold.
 */
/**
 * THE HERO CONTRACT — what slot 2 owes the Pilot in EVERY state.
 *
 * The hero is the one block a Pilot is guaranteed to read: it is the first
 * thing on the page and, on a phone, often the only thing before they decide
 * whether to scroll. So it answers four questions, in this order, and a state
 * may choose the WORDS for each but never whether the question gets answered:
 *
 *   figure    · how much money is this about?      ) both from `money` —
 *   figureWas · what it was going to be, struck     ) see the grammar above
 *   chip      · what is my clock?
 *   statement · where does the money stand right now?
 *   guidance  · what can I do about it?
 *
 * Each of those used to be independently optional, and the gaps were not
 * theoretical: an accepted case showed no clock at all while its own list row
 * promised "Decision in 3 days"; a waived ₹118 case showed ₹0 and lost the
 * ₹118 entirely; cool-off rendered byte-identical to a live needs-action
 * case; and NO state, in any lifecycle, said what the Pilot could do — that
 * lived three sections below, past the photos.
 *
 * TWO ROWS, TWO JOBS, NO OVERLAP. `statement` reports what HAPPENED — past
 * tense, never an instruction. `guidance` says what to do NOW — never
 * history. The rows were drifting into each other and the cards were saying
 * the same thing two and three times: a waived case stated "nothing was
 * deducted" in the figure (₹0), again in the statement, and a third time in
 * the guidance; Lost-in-Field told the Pilot to return the parcel in the
 * status row and again in the guidance row. If a fact is in the figure or the
 * chip, no sentence repeats it.
 *
 * `guidance` is the one that changes the page's job. The controls stay in the
 * sticky ActionBar at the foot (design call: the action is at the bottom);
 * this line is what tells a Pilot, before they have scrolled anything, that
 * there is something down there worth scrolling to — or that there isn't.
 *
 * ---
 *
 * Does this state's money land in the CURRENT payout cycle?
 *
 * Each state already says the answer in its own `statement`, and the two were
 * free to disagree until this flag existed:
 *   · "Not deducted yet."                   → yes, silence deducts it
 *   · "We will tell you before your payout" → yes, the decision lands by then
 *   · "Nothing is deducted while we check"  → NO. A dispute parks the money
 *     until the team replies, so it cannot come out of this cycle.
 *   · "Already deducted."                   → no, it left before the Pilot saw it
 *
 * A disputed loss therefore drops out of the cycle figure while staying in the
 * active list — it is still at stake (lose the dispute and the full amount
 * goes), just not this cycle. That is the whole reason the banner's "at stake"
 * total and the cycle card's "to be settled" total are different numbers.
 */
const CASE_STATES = {
  ATTRIBUTED: {
    id: 'ATTRIBUTED',
    label: BUCKET_NAME.needsAction,
    tone: TONE.RISK,
    money: (c) => ({ amount: c.amount, tone: 'primary' }),
    chip: (c) => `${days(c.daysToDeduction)} left`,
    statement: () => 'Not deducted yet.',
    // The Pilot's own sentence, on the one page where the money is still
    // saveable. It names the dispute rather than both choices because accept
    // is the path silence already takes; the ActionBar names both.
    guidance: (c) => (c.reason.actions.includes('dispute')
      ? 'Raise a dispute if you think this is an incorrect deduction.'
      : 'Accept and tell us why it happened.'),
    settlesThisCycle: true,
    actionBlock: ACTION.OFFERS,
    tracker: null,
    // KRD F9's silence consequence has no field of its own: the hero already
    // states it, in the three fields above. `figure` is what's at stake,
    // `chip` is how long they have, and `statement` is that it hasn't happened
    // yet — which is the whole sentence. A separate line saying "if you do
    // nothing for 3 days the full ₹145 will be deducted" was those same three
    // facts again, further down the page.
    footer: () => null,
    listChip: (c) => ({ text: `${days(c.daysToDeduction)} left`, kind: 'countdown' }),
  },

  OPEN_DISPUTE_PAUSED: {
    id: 'OPEN_DISPUTE_PAUSED',
    label: 'Cool-off',
    tone: TONE.RISK,
    money: (c) => ({ amount: c.amount, tone: 'primary' }),
    chip: (c) => `${days(c.daysToDeduction)} left`,
    statement: () => 'Not deducted yet.',
    // Cool-off used to be invisible here: this state rendered identically to
    // ATTRIBUTED, so the one fact that actually distinguishes it — the door
    // the Pilot will reach for is shut — was nowhere in the hero.
    guidance: (c) => `Dispute is paused till ${c.coolOffEnds}. You can still accept.`,
    settlesThisCycle: true,
    actionBlock: ACTION.OFFERS_DISPUTE_PAUSED,
    tracker: null,
    // Silence consequence: carried by figure + chip + statement, as in
    // ATTRIBUTED above.
    // The hero's guidance line states the pause and its date; a bare date
    // repeated here would say it twice and explain less.
    footer: () => null,
    listChip: (c) => ({ text: `${days(c.daysToDeduction)} left`, kind: 'countdown' }),
  },

  IN_DISPUTE: {
    id: 'IN_DISPUTE',
    label: BUCKET_NAME.pending,
    tone: TONE.PROGRESS,
    money: (c) => ({ amount: c.amount, tone: 'primary' }),
    // One countdown grammar across the app: the same words this state's list
    // badge uses. "Reply in 6 days" and "Decision in 6 days" were the same
    // fact in two vocabularies, one per surface.
    chip: (c) => `Decision in ${days(c.daysToReply)}`,
    statement: (c) => `Sent ${c.record.actedOn}. Nothing is deducted while we check.`,
    guidance: () => 'Nothing to do — we will tell you here.',
    actionBlock: ACTION.NONE,
    tracker: 'dispute',
    // Said in the hero now, where it answers "what do I do?" on landing
    // instead of at the foot of a page the Pilot has no reason to reach.
    footer: () => null,
    listChip: (c) => ({ text: `Decision in ${days(c.daysToReply)}`, kind: 'state' }),
  },

  ACCEPTED: {
    id: 'ACCEPTED',
    label: BUCKET_NAME.pending,
    tone: TONE.PROGRESS,
    money: (c) => ({ amount: c.amount, tone: 'primary' }),
    // Never promises a waiver, never shows odds or Y% (KRD F12).
    // This state had NO chip, while its own list row promised "Decision in
    // 3 days" — the list started a clock the detail page then dropped.
    chip: (c) => `Decision in ${days(c.daysToReply)}`,
    // "We will tell you before your payout" was the guidance row's sentence,
    // printed here as well. The status row takes the money position instead,
    // which nothing on the card was stating.
    statement: (c) => `Accepted on ${c.record.actedOn}. Not deducted yet.`,
    guidance: () => 'Nothing to do — we will tell you before your payout.',
    settlesThisCycle: true,
    actionBlock: ACTION.NONE,
    tracker: 'accepted',
    footer: () => null,
    listChip: (c) => ({ text: `Decision in ${days(c.daysToReply)}`, kind: 'state' }),
  },

  DEBITED: {
    id: 'DEBITED',
    terminal: true,
    label: 'Deducted',
    tone: TONE.RESOLVED_NEUTRAL,
    money: (c) => ({ amount: c.amount, tone: 'settled' }),
    // A closed case still owes the clock slot an answer: the clock stopped,
    // and the day it stopped is the answer.
    chip: (c) => `Closed ${settledOn(c.record)}`,
    statement: (c) => `Deducted — ${c.record.pathLabel || 'no reply in 7 days'}.`,
    // KRD F22 — a debited item has to tell the Pilot where the money went.
    // It does it here, as a sentence, instead of in a slot-3 section headed
    // "Where this money went" whose body was a breadcrumb: "In your 12 Aug
    // payment · Adjustments → Shipment Loss for Junk/Mismatch". That named
    // the exact ledger line and read like a filing reference — the Pilot
    // does not go looking for a section name, they go looking for the
    // payment. So the sentence names the payment and the tab, and the
    // Payments tab itself (built from this same case pool — see
    // paymentBreakdown.js) shows the line when they get there.
    //
    // It replaces "Nothing more will be deducted for this." — true, but the
    // chip already says Closed and the statement already says Deducted, so
    // the one line the Pilot could act on was spent on reassurance.
    guidance: (c) => (c.debitedOn
      ? `See this deduction in your ${c.debitedOn} payment, under Payments.`
      : 'See this deduction in your payment history, under Payments.'),
    actionBlock: ACTION.NONE,
    tracker: null,
    // The banner already says "deducted · no action taken in the 7-day
    // window"; the narrative block repeated it verbatim under a heading that
    // credited a team for what a timer did. The slot goes to the lesson.
    outcomeNarrative: () => null,
    // Nothing to close with: the chip, the statement and the guidance line
    // have already said closed, deducted, and where to see it.
    footer: () => null,
    listChip: null,
  },

  WAIVED: {
    id: 'WAIVED',
    terminal: true,
    label: 'Waived',
    tone: TONE.RESOLVED_GOOD,
    money: (c) => ({ amount: '₹0', was: c.amount, tone: 'kept' }),
    mark: 'good',
    // ₹0 alone deleted the fact the Pilot came for: a waived ₹118 case is a
    // ₹118 win, and the page showed no ₹118 anywhere. The struck figure is
    // the earnings card's own device — what it was going to be, and what it
    // became — so the outcome and the stake are one reading, not two.
    chip: (c) => `Closed ${settledOn(c.record)}`,
    // "Nothing was deducted" was the third telling on this card — the ₹0 and
    // its struck ₹118 say it, and the guidance row says it. What is left is
    // the only thing the other two rows cannot say: the verdict.
    statement: (c) => (c.record.waiveReason === 'sla_breach'
      ? 'We did not reply in time.'
      : 'You were right.'),
    // "Nothing MORE" would be a lie here: nothing was deducted in the first
    // place. It is the right word only where money actually moved.
    guidance: (c) => (c.record.waiveReason === 'sla_breach'
      ? 'Our delay is never your cost. Nothing will be deducted.'
      : 'Nothing will be deducted for this.'),
    actionBlock: ACTION.NONE,
    tracker: null,
    // Prevention is suppressed wherever the case was resolved in the Pilot's
    // favour. "Next time, do this differently" on a loss we have just agreed
    // was not their fault reads as an accusation, not as help.
    hidesPrevention: true,
    // A real agent read the evidence and ruled — except on an SLA breach,
    // where nobody decided anything and the banner plus footer already say so.
    outcomeNarrative: (c) => (c.record.waiveReason === 'sla_breach' ? null : 'team'),
    footer: () => null,
    listChip: null,
  },

  NOT_DEDUCTED: {
    id: 'NOT_DEDUCTED',
    terminal: true,
    label: 'Not deducted',
    tone: TONE.RESOLVED_GOOD,
    money: (c) => ({ amount: '₹0', was: c.amount, tone: 'kept' }),
    mark: 'good',
    chip: (c) => `Closed ${settledOn(c.record)}`,
    // "Closed" three times on one card — chip, statement, guidance.
    statement: () => 'The team decided in your favour.',
    guidance: () => 'Nothing will be deducted for this.',
    actionBlock: ACTION.NONE,
    tracker: null,
    // Resolved in the Pilot's favour — see WAIVED above.
    hidesPrevention: true,
    outcomeNarrative: () => 'team',
    footer: () => null,
    listChip: null,
  },

  /**
   * A loss the grace window covered (config/gracePeriod.js) — and the ONLY
   * place in the app the window is ever mentioned.
   *
   * Reached by no transition in caseTransitions.js, because nobody decides
   * it: the lens (state/grace.js) reads a DEBITED case raised inside the
   * window and this is what it becomes. So the Pilot meets it exactly once —
   * on a loss that has just settled for ₹0 — and never before, which is the
   * whole design. An open loss under grace is indistinguishable from one
   * without it: the window must not be the reason a new Pilot ignores their
   * first month of losses.
   *
   * THE HERO IS THE WHOLE EXPLANATION, in the order it is read:
   *
   *   ₹0  ₹̶2̶1̶0̶     what happened to the money
   *   statement   why — the window, named the one time it pays out
   *   guidance    and what happens to the next one, which is the sentence
   *               the window was bought for
   *
   * It is WAIVED's shape with a different verdict, and that difference is why
   * it is its own state. "You were right" and "we did not charge you because
   * you are new" are two different things to have learned about your own
   * record, and a Pilot who reads the first when the second is true will
   * dispute the next one expecting to win.
   *
   * Prevention is NOT suppressed here, where WAIVED suppresses it. A waived
   * case was not the Pilot's fault, so advice reads as an accusation; a
   * grace-covered one may well have been, and the advice is the only thing
   * the window leaves behind — this is the state that most needs it.
   */
  GRACE_WAIVED: {
    id: 'GRACE_WAIVED',
    terminal: true,
    label: 'Not deducted',
    tone: TONE.RESOLVED_GOOD,
    money: (c) => ({ amount: '₹0', was: c.amount, tone: 'kept' }),
    mark: 'good',
    chip: (c) => `Closed ${settledOn(c.record)}`,
    // Sits directly under the figure, and is the only sentence in the app
    // that says the window exists. "Not deducted" rather than "waived": the
    // Pilot was not found right about anything, and the difference is the
    // point.
    statement: (c) => `Not deducted — this loss fell in your first ${c.graceWeeks} weeks.`,
    // The rule the free one bought. A Pilot who reads only the ₹0 has learned
    // that losses are free; this is the line that finishes the sentence, and
    // it is worth the guidance slot because there is nothing to do about a
    // closed loss except understand the next one.
    guidance: (c) => `From ${c.graceEndsOn}, a loss you ignore or a dispute you lose comes out of your payout.`,
    actionBlock: ACTION.NONE,
    tracker: null,
    outcomeNarrative: () => null,
    footer: () => null,
    listChip: null,
  },

  // ---- Lost-in-Field only. Money left before the Pilot saw the case, so the
  // app's job is the remedy, not the argument (KRD §6b, F18/F19). ----
  LIF_RECOVERY_OPEN: {
    id: 'LIF_RECOVERY_OPEN',
    label: 'Return to recover',
    tone: TONE.RISK,
    money: (c) => ({ amount: c.amount, tone: 'primary' }),
    // A deadline date, where every other actionable state ran a countdown —
    // three grammars for one fact across the lifecycle.
    chip: (c) => `${days(c.daysToDeduction)} left`,
    // The status row reports; it does not instruct. "Return the parcel to get
    // it back" is the guidance row's job, and it was doing it one line lower.
    statement: () => 'Already deducted.',
    // Both halves earn their place. The imperative is the remedy; "the money
    // comes back after the hub scans it" is the only statement of HOW on the
    // page — slot 3's "Get your ₹40 back" section is gone, and the recovery
    // block below only asks whether the parcel is already returned. It reads
    // like a trimmable second sentence; it isn't.
    guidance: () => 'Give the parcel to your hub captain. The money comes back after the hub scans it.',
    actionBlock: ACTION.RECOVERY,
    tracker: null,
    footer: () => null,
    // Same countdown shape as every other actionable case. The return date
    // itself is not lost — the hero and the recovery card both still name it,
    // on the page where the Pilot acts on it.
    listChip: (c) => ({ text: `${days(c.daysToDeduction)} left`, kind: 'countdown' }),
  },

  /**
   * The Pilot says the parcel is already back. They have now done everything
   * they can — the hub scan decides — so this is the recovery flow's
   * equivalent of IN_DISPUTE: out of their hands, waiting on us.
   *
   * Without it, claiming a return changed nothing a Pilot could see: the case
   * sat in "Needs Decision" still counting down, and the page went on telling
   * them to give the parcel to their hub captain.
   */
  LIF_CLAIM_SENT: {
    id: 'LIF_CLAIM_SENT',
    label: BUCKET_NAME.pending,
    tone: TONE.PROGRESS,
    money: (c) => ({ amount: c.amount, tone: 'primary' }),
    chip: (c) => `Decision in ${days(c.daysToHubCheck)}`,
    statement: () => 'You said the parcel is back.',
    guidance: () => 'Nothing to do — the hub scan decides.',
    actionBlock: ACTION.NONE,
    tracker: null,
    footer: () => 'If the hub has it, the money comes back as a credit in your next payment.',
    listChip: (c) => ({ text: `Decision in ${days(c.daysToHubCheck)}`, kind: 'state' }),
  },

  RETURNED_CREDITED: {
    id: 'RETURNED_CREDITED',
    terminal: true,
    label: 'Returned',
    tone: TONE.RESOLVED_GOOD,
    money: (c) => ({ amount: `+${c.amount}`, tone: 'kept' }),
    mark: 'good',
    // Same struck device as WAIVED: it was going to cost ₹65, it cost ₹0.
    // "+ ₹65" stated the credit without ever stating the debit it cancelled,
    // so the pair below was the only place the story was complete.
    chip: (c) => `Closed ${settledOn(c.record)}`,
    // "Credited back" is what ₹0 beside a struck ₹65 already means, and the
    // money-movement table below spells the pair out in full.
    statement: (c) => `Returned on ${c.record.returnedOn}.`,
    guidance: () => 'Nothing more will be deducted for this.',
    actionBlock: ACTION.NONE,
    tracker: null,
    // Bank-statement rule: the debit row stays, the credit is added — nothing
    // is deleted (KRD F19).
    showsCreditPair: true,
    // The banner and the credit pair have both already said it. A third
    // telling under "What the team decided" also credited the team for
    // something the Pilot did.
    outcomeNarrative: () => null,
    footer: () => 'The debit and its credit both stay in your history.',
    listChip: null,
  },

  INFO_ONLY: {
    id: 'INFO_ONLY',
    label: 'For information',
    tone: TONE.PROGRESS,
    money: (c) => ({ amount: '₹0', was: c.amount, tone: 'kept' }),
    // The only state whose figure is ₹0 with nothing struck behind it: no
    // money was ever going to be deducted, so there is no "was" to show
    // (KRD F24). It had no figure at all, while its own list row carried the
    // parcel's ₹65 — the list and the page disagreed about the money.
    // No clock runs on an advisory, and the slot says so rather than
    // vanishing — an empty clock reads as a missing one.
    chip: () => 'No deadline',
    // Not "for this" — for wrong pickups at all. The ₹0 covers this case; the
    // sentence is only worth its space if it states the policy behind it.
    statement: () => 'No money is deducted for wrong pickups.',
    guidance: () => 'Add your side if this was not your pickup.',
    actionBlock: ACTION.ADD_SIDE,
    tracker: null,
    footer: () => 'Repeated wrong pickups may be reviewed by your hub.',
    listChip: null,
  },
}

export const ACTION_BLOCKS = ACTION

/**
 * Every state owes a money statement, because BOTH the list row and the loss
 * page's hero read this one — that is the point of it being one field. It used
 * to be three (`figure`, `figureWas`, `listMoney`), and they drifted exactly
 * as you would expect: a returned shipment read "+₹65" in the list and "₹0"
 * with ₹65 struck on its own page. This throws at import rather than letting
 * a new state ship with a silent gap.
 */
Object.entries(CASE_STATES).forEach(([id, state]) => {
  if (typeof state.money !== 'function') {
    throw new Error(`caseStates: ${id} declares no money() — see the L0/L1 money grammar above.`)
  }
})

export function getCaseState(id) {
  const state = CASE_STATES[id]
  if (state) return state
  console.warn('[caseStates] unknown case state, falling back to ATTRIBUTED:', id)
  return CASE_STATES.ATTRIBUTED
}

/**
 * THE LOSS ENTRY BANNER'S THREE STATES — the widget at the top of My Earnings.
 *
 * One widget, three jobs, decided by what is actually in the Pilot's list:
 *
 *   ACTIONABLE — at least one loss is waiting on them. The banner's job is to
 *                pull, so it carries a shaking clock and says how long is
 *                left. This is the only state that animates.
 *   REVIEW     — nothing waiting on them, but money is still in play (a
 *                decision is pending). The banner's job is to reassure and
 *                stay reachable, so it is the calm version — the parcel mark,
 *                no clock, no countdown. This is the banner as it was.
 *   RESOLVED   — nothing waiting and nothing pending. There is no money at
 *                stake, so the widget is HIDDEN rather than shown empty: a
 *                banner reading "₹0 from 0 losses may be deducted" is a thing to
 *                read and dismiss every single day, on the screen a Pilot
 *                opens to see what they earned. The losses list is still
 *                reachable from the Losses tab and from the Current Cycle
 *                card in every arrangement — see config/lossesStructure.js.
 *
 * The state is DERIVED, never stored: it is a reading of the case pool, so it
 * cannot disagree with the list the banner opens. `useLossesApp` calls
 * `resolveEntryState` and the panel can force one for review (which is a
 * preview of the treatment, over whatever the real numbers happen to be).
 */

export const ENTRY_STATES = {
  ACTIONABLE: 'actionable',
  REVIEW: 'review',
  RESOLVED: 'resolved',
}

/** What the panel's "Loss banner state" dropdown offers. `null` = follow the data. */
export const ENTRY_STATE_OPTIONS = [
  { id: 'auto', label: 'Auto (follow the data)' },
  { id: ENTRY_STATES.ACTIONABLE, label: 'Actionable' },
  { id: ENTRY_STATES.REVIEW, label: 'Review' },
  { id: ENTRY_STATES.RESOLVED, label: 'Resolved (hidden)' },
]

/**
 * The per-state treatment. `icon` is a name, not a component — this is config,
 * and what a name looks like is the component's business (the same rule the
 * badge palette follows; see CONFIG_REFERENCE.md § 0a).
 */
export const ENTRY_STATE_TREATMENT = {
  [ENTRY_STATES.ACTIONABLE]: {
    id: ENTRY_STATES.ACTIONABLE,
    visible: true,
    icon: 'clock',
    // The one animation in this widget. A countdown is the only thing here
    // that is actually running, so it is the only thing that moves.
    animateIcon: true,
    showTimer: true,
    // Money at risk, on the app's attention tone. Picked by MONEY POSITION,
    // which is the product rule (PRODUCT.md: "at risk / held / already cut /
    // not deducted / recovered"), not by how loud we want to be — so the
    // widget cannot drift into a hue the design system does not contain.
    // The name is the tone's, not the state's: see components/common/Banner.css.
    // It was 'warn' (the app's yellow) for one build; the banner mock puts
    // money-at-risk back on the orange ramp the case-detail status card
    // already uses for the same money position.
    tone: 'risk',
    cta: 'Review',
    // The count is back in the headline, where it belongs to the money it
    // qualifies ("₹624 from 6 losses may be deducted"). It rode on the CTA for one
    // build, while the headline was a single line with no room for it.
    ctaShowsCount: false,
  },
  [ENTRY_STATES.REVIEW]: {
    id: ENTRY_STATES.REVIEW,
    visible: true,
    icon: 'package',
    animateIcon: false,
    showTimer: false,
    // Money held while a decision is made — the cool tone, and not one red
    // pixel anywhere on it. Nothing here is running out.
    tone: 'progress',
    // Not "Review": there is nothing for the Pilot to review, it is with us.
    // A control names its own action.
    cta: 'Track',
    // Redundant here — this headline already states the count.
    ctaShowsCount: false,
  },
  [ENTRY_STATES.RESOLVED]: {
    id: ENTRY_STATES.RESOLVED,
    visible: false,
    icon: 'package',
    animateIcon: false,
    showTimer: false,
    tone: 'progress',
    cta: 'Track',
    ctaShowsCount: false,
  },
}

export function resolveEntryState({ actionableCount, pendingCount }) {
  if (actionableCount > 0) return ENTRY_STATES.ACTIONABLE
  if (pendingCount > 0) return ENTRY_STATES.REVIEW
  return ENTRY_STATES.RESOLVED
}

/**
 * THE TIMER — Actionable only, and it lives INSIDE the headline rather than
 * beside it: "₹624 … may be deducted", then **3 days left**. It is the only red thing in
 * the widget and the only bold one, so a Pilot's eye lands on the clock
 * first and the sentence explains it.
 *
 * It states the SOONEST deadline among the losses waiting on them — the only
 * one that can bite next. An earlier build qualified that with "· 1 of 4"
 * when the losses did not share a date. That is gone: three numbers in one
 * row asked the Pilot to hold a set relationship in their head to read a
 * countdown, and the per-loss clocks are one tap away on the list. The
 * headline says how long is left before the first one closes, which is the
 * thing that decides whether they open the list today.
 */
export function entryTimerText({ days }) {
  // A window that has run out is not a countdown any more, and "0 days left"
  // would be a countdown reading zero.
  if (days <= 0) return 'Closes today'
  return `${days} ${days === 1 ? 'day' : 'days'} left`
}

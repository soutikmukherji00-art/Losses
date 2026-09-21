import { PackageXIcon, AlarmClockIcon, ChevronRightIcon } from '../common/icons.jsx'
import '../common/Banner.css'
import './LossesEntryPoint.css'

/**
 * Entry point into the Losses list, at the top of My Earnings — shown when
 * the arrangement asks for it (`lossesStructure.earningsEntry`) AND the
 * banner's state is a visible one (`lossesEntryStates.js`; Resolved hides it).
 *
 * Its shape is the shared BANNER PATTERN — mark · text block · action — which
 * it has in common with the contextual insight above the losses list. Both
 * are banners in the same sense, so both are built from
 * components/common/Banner.css, and the rules of the pattern (one tone, one
 * weight, emphasis by colour, a word-and-chevron action) are stated there.
 *
 * What this banner adds is the second line and the movement: the state's facts
 * stack, so the money gets its own full-width line and the clock becomes a
 * statement of its own rather than a clause competing with it.
 *
 * EACH STATE SAYS ITS OWN SENTENCE, because the Pilot's position differs and
 * a shared template would flatten that:
 *
 *   Actionable — "₹624 from 6 losses may be deducted" / "3 days left" · Review ›
 *       Money and count on the first line, the clock on its own beneath it in
 *       the at-risk accent. The clock is the only coloured thing in the
 *       widget, so it is what the eye lands on; the line above explains it —
 *       its money and count are emphasised by weight alone.
 *
 *   Review — "2 losses are under review" · Track ›
 *       One line, because nothing is running out. It leads with the count, so
 *       the accented words are in the same place the money is on the other
 *       state. No money figure: with no clock and no decision to make, what
 *       it is worth is not what they came for, and it is one tap away.
 *
 * TONE FOLLOWS MONEY POSITION, which is the product rule rather than a
 * loudness dial: at-risk is the warm surface, held is the cool one, one flat
 * tone at a time.
 *
 * The card is ONE `<button>`; the CTA is a styled `<span>`. A button inside a
 * button is a coin toss about which one fires.
 */

/** Config names a mark; this decides what a name looks like. */
const ICONS = {
  clock: AlarmClockIcon,
  package: PackageXIcon,
}

export default function LossesEntryPoint({ entryPoint }) {
  const {
    amount, count, pendingCount, timer, open, icon, animateIcon, tone, cta,
  } = entryPoint
  const Icon = ICONS[icon] || PackageXIcon

  return (
    <button className="banner losses-entry" data-tone={tone} onClick={open}>
      {/* `data-animate` rather than a second class: one mark that may or may
          not be moving, not two kinds of mark. */}
      <span className="banner__icon losses-entry__icon" data-animate={animateIcon || undefined}>
        <Icon size={24} stroke="currentColor" />
      </span>

      <span className="banner__text">
        {timer ? (
          /* The headline emphasises in the primary ink only — the colour on
             this state belongs to the countdown below it, and a banner gets
             one coloured thing. */
          <span className="banner__headline">
            {/* WORD ORDER IS NOT FREE HERE. "₹624 may be deducted from 6
                losses" is the direct swap and it is wrong: "deducted from"
                names where money is taken OUT of, so it reads as the ₹624
                coming out of the losses rather than out of his payout. The
                verb goes to the end, which keeps the app's existing "from N
                losses" phrasing and leaves both figures sitting against the
                nouns they belong to. */}
            <span className="banner__strong">{amount}</span> from{' '}
            <span className="banner__strong">
              {count} {count === 1 ? 'loss' : 'losses'}
            </span>
            {' '}may be deducted
          </span>
        ) : (
          <span className="banner__headline">
            {/* No body line, so the headline's own emphasis carries the
                accent. The count goes quiet rather than printing a zero: the
                data path cannot reach Review with nothing pending — that is
                Resolved, and Resolved hides — but the panel can force the
                treatment over a dataset that has none. */}
            <b>{pendingCount > 0
              ? `${pendingCount} ${pendingCount === 1 ? 'loss' : 'losses'}`
              : 'Your losses'}</b>
            {pendingCount === 1 ? ' is' : ' are'} under review
          </span>
        )}

        {/* Second line: the body (the countdown, where there is one) and the
            way in, sharing the row — the banner pattern's shape. */}
        <span className="banner__row">
          {timer && <span className="banner__sub banner__accent losses-entry__timer">{timer}</span>}
          <span className="banner__action">
            <span className="banner__cta">{cta}</span>
            <ChevronRightIcon size={18} stroke="var(--valmo-navy)" />
          </span>
        </span>
      </span>
    </button>
  )
}

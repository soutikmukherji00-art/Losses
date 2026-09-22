import { ShieldCheckIcon } from '../common/icons.jsx'
import '../common/Banner.css'
import './GraceBanner.css'

/**
 * The grace window, announced — above the losses list, in the insight
 * banner's slot, while the window is open (design call, 21 Sep; it reverses
 * config/gracePeriod.js's "never announced" and that file says so).
 *
 * The banner pattern's shape with nothing to press: a mark and two lines,
 * no CTA, because there is no L1 behind it — the whole fact fits here. The
 * headline is the cover; the byline is its edge and what changes at it,
 * which is the sentence the window was bought for: a Pilot who reads only
 * "covered" has learned that losses are free.
 *
 * It replaces the insight banner rather than stacking on it: two banners
 * over the list is two rows of chrome before the losses, and while the
 * window is open the cover is the fact that decides how every loss below
 * reads.
 */
export default function GraceBanner({ grace }) {
  return (
    <div className="banner-slot">
      <div className="banner grace-banner" data-tone="progress" role="note">
        <span className="banner__icon">
          <ShieldCheckIcon size={24} stroke="currentColor" />
        </span>
        <span className="banner__text">
          {/* THE WHOLE HEADLINE IS DEMI, exactly as the insight banner's is
              (InsightBanner → `.banner__strong` around the entire habit
              sentence). The two banners share one slot above the list and a
              Pilot meets them in the same place on different days, so their
              top line has to hold the same rank — it was Book with only "4
              weeks" stepped up, which made the cover read a step quieter
              than the education line it replaces. */}
          <span className="banner__headline">
            <span className="banner__strong">Your first {grace.weeks} weeks are covered</span>
          </span>
          <span className="banner__sub">
            Losses till <span className="banner__strong">{grace.endsOn}</span> are not deducted. From then, they come out of your payout.
          </span>
        </span>
      </div>
    </div>
  )
}

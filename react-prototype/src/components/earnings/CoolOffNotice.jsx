import AlertPill from '../common/AlertPill.jsx'
import { ChevronRightIcon } from '../common/icons.jsx'
import { DISPUTE_COOL_OFF } from '../../config/disputeCoolOff.js'
import './CoolOffNotice.css'

/**
 * "Dispute paused till {date}" notice on the losses list.
 *
 * Under Only Dispute it drops its "Accepting still works" tail: that variant
 * has no accept, so the sentence would point at a door the build does not
 * have.
 *
 * It is a consequence attached to a date, so it takes the same AlertPill the
 * L1 silence consequence and the reference frame's deadline alert use, rather
 * than the one-off inline-styled banner it used to be (14px/12px hardcoded,
 * a hand-mixed #8A5A11, and a transparent-colour hack on InfoBanner).
 *
 * "View ›" is the ingress the notice owed a Pilot and didn't have: WHICH
 * disputes put them here (DisputeHistorySheet). One word, in the pill's own
 * action slot — the same word-and-chevron every banner in the app ends with
 * — rather than a second strip under the pill saying the dates out loud.
 * Absent history (an empty pool) drops the CTA rather than opening a sheet
 * with nothing in it.
 */
export default function CoolOffNotice({ coolOffEnds, onlyDispute, disputeHistory }) {
  const hasHistory = (disputeHistory?.groups?.length ?? 0) > 0

  return (
    <div className="cool-off">
      <AlertPill
        tone="warning"
        title={<span className="cool-off__title">You can&apos;t raise dispute again till {coolOffEnds}</span>}
        action={hasHistory && (
          <button type="button" className="alert-pill__cta" onClick={disputeHistory.open}>
            View
            <ChevronRightIcon size={14} stroke="var(--valmo-navy)" />
          </button>
        )}
      >
        {/* The title carries the date and the restriction, so the body drops
            the "you can dispute again after {date}" it used to end on — that
            was the same date and the same fact, said twice in two grammars
            one line apart. What is left is the half the title cannot say: WHY
            the door is shut, and that the other one is open. */}
        <span className="cool-off__body">
          Your last {DISPUTE_COOL_OFF.wrongLimit} disputes were found wrong.
          {/* Only Dispute removes accept everywhere; this notice is not
              allowed to be the one place that still offers it. */}
          {!onlyDispute && ' Accepting still works.'}
        </span>
      </AlertPill>
    </div>
  )
}

import AlertPill from '../common/AlertPill.jsx'
import { DISPUTE_COOL_OFF } from '../../config/disputeCoolOff.js'
import './CoolOffNotice.css'

/**
 * "Dispute paused till {date}" notice on the losses list.
 *
 * It is a consequence attached to a date, so it takes the same AlertPill the
 * L1 silence consequence and the reference frame's deadline alert use, rather
 * than the one-off inline-styled banner it used to be (14px/12px hardcoded,
 * a hand-mixed #8A5A11, and a transparent-colour hack on InfoBanner).
 */
export default function CoolOffNotice({ coolOffEnds }) {
  return (
    <div className="cool-off">
      <AlertPill tone="warning">
        <span className="cool-off__title">Dispute paused till {coolOffEnds}</span>
        <span className="cool-off__body">
          Your last {DISPUTE_COOL_OFF.wrongLimit} disputes were found wrong. You can dispute again after {coolOffEnds}.
          Accepting still works.
        </span>
      </AlertPill>
    </div>
  )
}

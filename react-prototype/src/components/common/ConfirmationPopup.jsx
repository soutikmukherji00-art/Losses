import { useEffect, useRef } from 'react'
import { CheckCircleIcon, CloseIcon } from './icons.jsx'
import { CONFIRMATION_MS } from '../../config/confirmations.js'
import './ConfirmationPopup.css'

/**
 * The app's standard confirmation popup, from the Partner App design system
 * (Figma WCghUzecsonToq8dCxpm3W · 6256:10328): scrim + centred card, a 64px
 * icon, a headline, a byline, and a close in the top-right corner.
 *
 * Two deliberate departures from that reference, both design calls:
 *
 *  · The tick is NAVY, not the reference's green. Emerald already means one
 *    specific thing on these screens — "no money was lost" (the Waived,
 *    Returned and Not-deducted badges all wear it). A green tick over a case
 *    a Pilot has just accepted would read as "sorted, you're fine", which is
 *    the one promise KRD F12 forbids this flow from making.
 *  · It closes itself after 3s. The ✕ and the scrim stay tappable for anyone
 *    who wants it gone sooner.
 *
 * Content comes from config/confirmations.js — this component knows nothing
 * about which flow raised it.
 */
export default function ConfirmationPopup({ headline, byline, onClose }) {
  // The timer is set once per mount and never restarted. Depending on
  // `onClose` instead would reset the 3 seconds on every unrelated re-render,
  // so a busy screen could hold the popup open indefinitely.
  const latestClose = useRef(onClose)
  latestClose.current = onClose

  useEffect(() => {
    const timer = setTimeout(() => latestClose.current(), CONFIRMATION_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="confirm-scrim" onClick={onClose}>
      <div
        className="confirm-popup"
        role="alertdialog"
        aria-label={headline}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="confirm-popup__close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} stroke="var(--valmo-white)" />
        </button>

        <div className="confirm-popup__icon">
          <CheckCircleIcon size={30} stroke="var(--valmo-navy)" />
        </div>

        <div className="confirm-popup__text">
          <div className="confirm-popup__headline">{headline}</div>
          <div className="confirm-popup__byline">{byline}</div>
        </div>
      </div>
    </div>
  )
}

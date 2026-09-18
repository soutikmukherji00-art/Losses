import { InfoDotIcon } from './icons.jsx'
import './AlertPill.css'

/**
 * The soft tinted alert from the reference frame — "Accept by 18 Jun to
 * receive payment on time" (Figma WCghUzecsonToq8dCxpm3W · 1636:20763).
 *
 * It is the language's device for a consequence attached to a deadline, which
 * is exactly the job of the silence consequence on a loss (KRD F9). Rounded,
 * tinted, no border, filled icon — the only rounded surfaces in this design
 * language are panels like this one.
 */
export default function AlertPill({ children, tone = 'warning' }) {
  return (
    <div className={`alert-pill alert-pill--${tone}`}>
      <span className="alert-pill__icon" aria-hidden="true">
        <InfoDotIcon size={18} fill={tone === 'warning' ? 'var(--valmo-orange-main)' : 'var(--valmo-navy)'} />
      </span>
      <span className="alert-pill__text">{children}</span>
    </div>
  )
}

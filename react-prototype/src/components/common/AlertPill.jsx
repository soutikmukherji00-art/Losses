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
 *
 * Same shape as every banner in the product: [icon] [title / body + action].
 * `title` is the optional first line; `children` the body; `action` the
 * optional way in, on the body's row. With no `title` the pill is the
 * one-line alert the reference draws. The action is a slot rather than a
 * prop pair because the pill itself is not a button: whatever fills the slot
 * owns the tap.
 */
export default function AlertPill({ children, title = null, tone = 'warning', action = null }) {
  return (
    <div className={`alert-pill alert-pill--${tone}`}>
      <span className="alert-pill__icon" aria-hidden="true">
        <InfoDotIcon size={18} fill={tone === 'warning' ? 'var(--valmo-orange-main)' : 'var(--valmo-navy)'} />
      </span>
      <span className="alert-pill__text">
        {title && <span className="alert-pill__title">{title}</span>}
        <span className="alert-pill__row">
          <span className="alert-pill__body">{children}</span>
          {action && <span className="alert-pill__action">{action}</span>}
        </span>
      </span>
    </div>
  )
}

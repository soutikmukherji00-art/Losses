import { BackIcon } from './icons.jsx'
import './ScreenHeader.css'

/**
 * The back-arrow + title bar at the top of every pushed screen — the loss
 * detail page, the Losses L1 page, and Payment Details.
 *
 * All three had their own copy, and they had drifted: two different gutter
 * tokens, a divider on some and not others, and — the reason this is one
 * component now — only the loss detail page gave the back arrow a real 48px
 * target. The other two left it at glyph size, under Android's floor, on the
 * one control every screen depends on.
 *
 * `sub` is the second line (the AWB on a case). `divider` is off where the
 * header sits directly on a white block that supplies its own separation.
 */
export default function ScreenHeader({ title, sub, onBack, action, divider = true }) {
  return (
    <div className="screen-header" data-divider={divider}>
      {onBack && (
        <button type="button" className="screen-header__back" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
      )}
      <div className="screen-header__text">
        <div className="screen-header__title">{title}</div>
        {sub && <div className="screen-header__sub">{sub}</div>}
      </div>
      {action}
    </div>
  )
}

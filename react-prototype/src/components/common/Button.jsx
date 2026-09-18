import './Button.css'

/**
 * THE button. Every navy CTA in the app is this component.
 *
 * It exists because the same control had been written six times — the action
 * bar, both sheets, the awareness overlay, the lost-shipments modal and the
 * payments footer — and had drifted to three different corner radii, two type
 * ramps and three border widths. A Pilot met the same button looking
 * different on every screen.
 *
 * Geometry and type are fixed here and are not overridable: that is the whole
 * point. What a caller may decide is the variant, whether it fills its
 * container, and — via `className` on the parent's own stylesheet — how it
 * flexes inside a row, which is layout and belongs to the layout owner.
 *
 *   primary   — solid navy. The commit action.
 *   secondary — navy outline on white. The alternative to a primary.
 *   ghost     — borderless navy text. A dismissal sitting under a primary.
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  icon = null,
  fullWidth = false,
  className = '',
}) {
  return (
    <button
      type="button"
      className={`btn${fullWidth ? ' btn--full' : ''}${className ? ` ${className}` : ''}`}
      data-variant={variant}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}

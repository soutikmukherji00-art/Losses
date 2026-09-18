import './Chip.css'

/**
 * Generic pill/chip — loss-filter chips, accept/dispute reason chips, the
 * "How payments work" utility chips, and the **status badge** every loss list
 * row carries.
 *
 * `variant` picks the treatment. For `status`, `kind` picks the palette, and
 * those five kinds are the app's whole badge vocabulary (see the L0 badge
 * grammar in config/caseStates.js) — a screen that needs a status badge asks
 * for a kind, never for a colour. That badge is coloured TYPE rather than a
 * pill; the reasoning is on `.chip--status` in Chip.css, and the rule it
 * keeps is the one that matters here: the colour still comes from the kind.
 *
 * Renders a <button> only when it does something. A status badge is a label,
 * not a control, so it comes out as a <span>.
 */
export default function Chip({
  children,
  active = false,
  onClick,
  variant = 'filter',
  kind,
  icon = null,
  trailingIcon = null,
}) {
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      {...(onClick ? { type: 'button', onClick } : {})}
      className={`chip chip--${variant}`}
      data-active={active}
      data-kind={kind}
    >
      {icon}
      <span>{children}</span>
      {trailingIcon}
    </Tag>
  )
}

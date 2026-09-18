import Button from './Button.jsx'
import { InfoIcon } from './icons.jsx'
import './ActionBar.css'

/**
 * Sticky two-button footer, from the Rider App pattern
 * (Figma 8BqXD6Tkt7d5zDx9fPtnZX · 37:49110): a white bar pinned below the
 * scroll, hairline on top, secondary outline on the left and the primary
 * solid on the right.
 *
 * The actions used to live inside the "What to do" card, each under its own
 * paragraph of explanation. That coupled two jobs: understanding the choice,
 * and making it. The section keeps the first job; the bar owns the second,
 * which means the controls are reachable from anywhere on the page instead of
 * only once the Pilot has scrolled to them.
 *
 * Buttons are `{ label, onClick, variant, disabled }`. One button fills the
 * bar; two split it with the primary taking the greater share.
 *
 * `note` is an optional line above them (or several, as an array), for the
 * case where a control is present but unusable, or where the money the bar
 * commits has already been settled by a policy. A disabled button keeps its own name — it is still
 * the Dispute button — and the reason it cannot be pressed is a separate
 * fact, said in words above the bar rather than crammed into the label.
 *
 * The button itself is the shared `Button` primitive — this component owns
 * only the bar: the sticky chrome, and how the buttons divide its width.
 */
export default function ActionBar({ buttons = [], note = null }) {
  const shown = buttons.filter(Boolean)
  const notes = [].concat(note || []).filter(Boolean)
  // A note with no buttons is a legitimate bar: the states with nothing to
  // press are exactly the ones where "nothing is deducted" is news.
  if (!shown.length && !notes.length) return null

  return (
    <div className="action-bar">
      {notes.map((text) => (
        <div className="action-bar__note" key={text}>
          <InfoIcon />
          <span>{text}</span>
        </div>
      ))}
      {shown.length > 0 && (
      <div className="action-bar__buttons">
        {shown.map((b) => (
          <Button
            key={b.label}
            variant={b.variant || 'primary'}
            disabled={b.disabled}
            onClick={b.onClick}
            icon={b.icon}
          >
            {b.label}
          </Button>
        ))}
      </div>
      )}
    </div>
  )
}

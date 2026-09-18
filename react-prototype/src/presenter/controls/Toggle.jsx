/** Generic label + on/off switch. Used for any boolean control — a single
 * layer's visibility, or a future boolean variant. No knowledge of what
 * flipping it does.
 *
 * No byline under the label: the panel's controls carry their name and
 * nothing else. What each one does is in `app/presenterSections.js` beside
 * the control, and in Design System/CONFIG_REFERENCE.md. */
export default function Toggle({ label, checked, onChange }) {
  return (
    <div className="control-toggle-row">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className="control-toggle"
        data-on={checked}
        onClick={() => onChange(!checked)}
      >
        <span className="control-toggle__knob" />
      </button>
      <div className="control-toggle-row__text">
        {label && <div className="control-toggle-row__label">{label}</div>}
      </div>
    </div>
  )
}

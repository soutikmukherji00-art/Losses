/** Generic label + row of buttons, for controls that DO something rather than
 * hold a value — advancing a case, resetting the prototype. No knowledge of
 * what any of them do; each action brings its own `run`.
 *
 * No byline under the label — see Toggle.jsx. */
export default function ActionButtons({ label, actions = [] }) {
  if (actions.length === 0) return null

  return (
    <div className="control-field">
      {label && <div className="control-field__label">{label}</div>}
      <div className="control-actions">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="control-actions__btn"
            data-tone={action.tone || 'default'}
            onClick={action.run}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}

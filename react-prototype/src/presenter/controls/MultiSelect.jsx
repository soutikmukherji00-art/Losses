/**
 * A SET, not a stack of switches. Several options, any number on at once —
 * where `segmented` picks one of a few and `select` picks one of many.
 *
 * It is checkboxes rather than a column of `Toggle`s on purpose: a toggle
 * says "this thing is on or off, independently", and these options are
 * members of one list being filtered. The box says they belong together.
 *
 * `onChange` is handed ONE id and toggles it, the same contract the Layers
 * control uses — the caller owns the array, so it also owns what an empty
 * one means.
 */
export default function MultiSelect({ label, options = [], values = [], onChange }) {
  if (!options.length) return <div className="control-note">Nothing to choose from on this screen.</div>

  return (
    <div className="control-field">
      {label && <div className="control-field__label">{label}</div>}
      <div className="control-multi">
        {options.map((opt) => {
          const on = values.includes(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              className="control-multi__opt"
              data-on={on}
              aria-pressed={on}
              onClick={() => onChange(opt.id)}
            >
              <span className="control-multi__box" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.2l2.4 2.4 4.6-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="control-multi__label">{opt.label}</span>
              {opt.meta && <span className="control-multi__meta">{opt.meta}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

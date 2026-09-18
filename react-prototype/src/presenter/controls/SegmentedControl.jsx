/** Generic label + row-of-options control. Used for any variant that's a
 * small closed set of choices (2-4 options) — global variants, sectional
 * variants, boolean toggles. No knowledge of what the options *mean*. */
export default function SegmentedControl({ label, value, options, onChange }) {
  return (
    <div className="control-field">
      {label && <div className="control-field__label">{label}</div>}
      <div className="segmented-control">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="segmented-control__opt"
            data-active={opt.id === value}
            // An option can be unavailable because of another control's value
            // (see the Historic placement control). It stays visible so the
            // choice is still legible — it just can't be picked.
            disabled={opt.disabled}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

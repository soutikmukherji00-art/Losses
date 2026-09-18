/** Generic label + native-select control — used wherever the option set is
 * long (e.g. "jump to any screen") and a segmented row would be unwieldy.
 * A native <select> is deliberate: no listbox component to build/maintain,
 * accessible and keyboard-operable for free.
 *
 * No byline under the label — see Toggle.jsx. */
export default function Select({ label, value, options, onChange }) {
  return (
    <div className="control-field">
      {label && <div className="control-field__label">{label}</div>}
      <div className="control-select-wrap">
        <select className="control-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

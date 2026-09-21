import './Section.css'

/**
 * The sectioning device of this design language, taken from the Invoice
 * Details frame (Figma WCghUzecsonToq8dCxpm3W, node 1636:20763).
 *
 * A section is a FULL-BLEED WHITE BLOCK on the app's grey ground, with a 4px
 * gap of that ground showing between it and the next one. There is no card,
 * no border and no radius — the gap does all the separating. Rounded tinted
 * panels exist inside sections (the hero figure, the deadline alert), never
 * as the section itself.
 *
 * `title` is Heading 04 (15/700); `value` is the right-aligned figure a
 * section can carry, the way "Base pay" carries its total.
 */
export default function Section({
  title, value, action, children, flush = false, panel = false, lead = false,
}) {
  // `lead` is the one section per page that names the page's subject (the
  // loss detail's reason): its head steps up to Heading 03, between the
  // page title and the other heads.
  return (
    <section className={`sec${panel ? ' sec--panel' : ''}${lead ? ' sec--lead' : ''}`}>
      {(title || value) && (
        <header className="sec__head">
          <h2 className="sec__title">{title}</h2>
          {value && <div className="sec__value">{value}</div>}
          {action}
        </header>
      )}
      <div className={`sec__body${flush ? ' sec__body--flush' : ''}`}>{children}</div>
    </section>
  )
}

/**
 * One label/value line inside a section, separated from its neighbours by the
 * reference's dashed hairline. `strong` is the totals row, which takes a solid
 * rule and bold on both sides.
 */
export function SectionRow({ label, value, strong = false, sub }) {
  return (
    <div className={`sec-row${strong ? ' sec-row--strong' : ''}`}>
      <div className="sec-row__label">
        {label}
        {sub && <span className="sec-row__sub">{sub}</span>}
      </div>
      {value && <div className="sec-row__value">{value}</div>}
    </div>
  )
}

import './Tabs.css'

/**
 * The app's tab row, at either level of the hierarchy.
 *
 * `variant` is the LEVEL, not a look you pick per screen:
 *
 *   underline  — PRIMARY. My Earnings / Payments / Losses. The row that
 *                changes which surface you are on.
 *   segmented  — SECONDARY. Current Cycle / Historic. A row that reshapes
 *                the surface you are already on.
 *
 * These were two components with the treatments the other way round, and the
 * hierarchy read backwards: the outer choice wore the heavier, more contained
 * control, and the inner one wore the lighter. An underline row is the
 * conventional primary — it belongs to the page, sits on a full-bleed rail,
 * and carries a badge — while a segmented control is a contained, bounded
 * thing, which is what a choice *within* a surface actually is.
 *
 * One component, because "which treatment" is now a fact about depth that the
 * app must apply consistently, not a decision each screen makes for itself.
 *
 * Both variants render real tabs — `role="tablist"` with `<button role="tab">`
 * and `aria-selected`. The segmented row used to be clickable `<div>`s with no
 * roles at all, reachable by neither keyboard nor screen reader.
 *
 * Both variants also FILL the width, in equal shares. A hugged row leaves the
 * tabs bunched at one edge with dead space after them, and the underline then
 * measures the label rather than the tab — so the active marker changed width
 * with the word above it.
 */
export default function Tabs({ tabs, variant = 'underline' }) {
  return (
    <div className={`tabs tabs--${variant}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.active}
          className="tabs__tab"
          data-active={tab.active}
          onClick={tab.pick}
        >
          {/* The count rides in the label, in brackets — "Losses (4)" — not
              in a badge beside it. A badge is an alert, and it was reading as
              one for a number that is just how much work is waiting. Only a
              tab that actually holds those losses carries it. */}
          <span>{tab.label}{tab.count != null && ` (${tab.count})`}</span>
        </button>
      ))}
    </div>
  )
}

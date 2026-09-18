import { ChevronDownIcon } from '../common/icons.jsx'
import './CollapsiblePdCard.css'

/** Incentives / Adjustments / Deductions card — collapsible, chevron
 * rotates on expand. "Lost Shipments" is the only clickable line item
 * (opens the drill-down modal via `it.onClick`). */
export default function CollapsiblePdCard({ card }) {
  return (
    <div className="pd-card" data-expanded={!!card.expanded}>
      <div className="pd-card__header" onClick={card.toggle}>
        <div className="pd-card__header-left">
          <ChevronDownIcon deg={card.chevronDeg} />
          <span className="pd-card__title">{card.title}</span>
        </div>
        <span className="pd-card__total">{card.total}</span>
      </div>
      {card.expanded && (
        <div className="pd-card__items">
          {card.items.map((it, i) => (
            <div key={i} className="pd-card__item" style={{ cursor: it.cursor }} onClick={it.onClick}>
              <span className="pd-card__item-label" data-underline={it.underline}>{it.label}</span>
              <span className="pd-card__item-amt">{it.amt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

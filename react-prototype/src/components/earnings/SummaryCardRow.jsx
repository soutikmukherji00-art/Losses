import './SummaryCardRow.css'

/** Unified-layout mode's 4-card totals strip (Needs Attention /
 * Team is checking / Wrong Pickups / History) — tap a card to filter
 * the list. */
export default function SummaryCardRow({ cards }) {
  return (
    <div className="summary-card-row fe-nowrap-scroll">
      {cards.map((card) => (
        <div key={card.id} className="summary-card" data-active={card.active} onClick={card.pick}>
          <div className="summary-card__label">{card.label}</div>
          <div className="summary-card__amount" style={{ color: card.amountColor }}>{card.amount}</div>
          <div className="summary-card__sub">{card.sub}</div>
        </div>
      ))}
    </div>
  )
}

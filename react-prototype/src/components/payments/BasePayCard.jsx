import './BasePayCard.css'

/** Base Pay card — always expanded, no chevron, unlike the other three
 * (Incentives/Adjustments/Deductions) pd-cards. */
export default function BasePayCard({ basePay }) {
  return (
    <div className="base-pay-card">
      <div className="base-pay-card__header">
        <span>Base Pay</span>
        <span>{basePay.totalLabel}</span>
      </div>
      <div className="base-pay-card__group-title">Delivery</div>
      <div className="base-pay-card__lines">
        {basePay.delivery.map((l, i) => (
          <div key={i} className="base-pay-card__line">
            <span>{l.label}</span>
            <span className="base-pay-card__line-amt">{l.amt}</span>
          </div>
        ))}
      </div>
      <div className="base-pay-card__group-title">Pickup</div>
      <div className="base-pay-card__lines">
        {basePay.pickup.map((l, i) => (
          <div key={i} className="base-pay-card__line">
            <span>{l.label}</span>
            <span className="base-pay-card__line-amt">{l.amt}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

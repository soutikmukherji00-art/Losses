import SectionDivider from '../common/SectionDivider.jsx'
import PaymentListItem from '../common/PaymentListItem.jsx'
import { InfoBookIcon } from '../common/icons.jsx'
import './PaymentsTabContent.css'

/** Payments tab (list) — Figma SOT_Valmo node 275:10421 "Daily Payout". */
export default function PaymentsTabContent({ vm }) {
  return (
    <>
      <SectionDivider label="Past Payments" />

      {vm.paymentRows.map((p, i) => (
        <PaymentListItem key={i} date={p.date} caption={p.caption} amount={p.amount} incentive={p.incentive} onClick={p.open} />
      ))}

      <div className="payments-tab__view-more">
        <InfoBookIcon />
        <span>View More Payments</span>
      </div>
    </>
  )
}

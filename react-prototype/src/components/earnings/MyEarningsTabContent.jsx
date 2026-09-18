import SectionDivider from '../common/SectionDivider.jsx'
import PaymentListItem from '../common/PaymentListItem.jsx'
import CurrentCycleCard from './CurrentCycleCard.jsx'
import LossesEntryPoint from './LossesEntryPoint.jsx'
import './MyEarningsTabContent.css'

/** My Earnings tab — Figma "Valmo - Earnings Dashboard" node 1939:25543
 * ("Daily Payout"). Current-cycle summary card + a daily earnings history
 * list, reusing the same utility-chip row, divider and payment-row shapes
 * the Payments tab already established. */
export default function MyEarningsTabContent({ vm }) {
  return (
    <>
      {/* Above the cycle card, not below it: losses are the thing a Pilot has
          to act on, and the cycle card is a figure they only read.
          Two gates, and they answer different questions: the arrangement
          decides whether this surface has an entry widget at all
          (config/lossesStructure.js), the banner's own state decides whether
          there is anything for it to say (config/lossesEntryStates.js — with
          nothing waiting and nothing pending it hides rather than reading
          "₹0 at stake from 0 Losses"). */}
      {vm.lossesStructure.earningsEntry && vm.lossesEntryPoint.visible && (
        <div className="banner-slot">
          <LossesEntryPoint entryPoint={vm.lossesEntryPoint} />
        </div>
      )}

      <div className="my-earnings__section-title">{vm.currentCycle.title}</div>
      <div className="my-earnings__cycle-card-wrap">
        <CurrentCycleCard cycle={vm.currentCycle} />
      </div>

      <div className="my-earnings__section-title">
        Daily Earnings History <span>(last 30 days)</span>
      </div>
      <SectionDivider label={vm.dailyEarningsMonth} />

      {vm.dailyEarningsRows.map((p, i) => (
        <PaymentListItem key={i} date={p.date} amount={p.amount} incentive={p.incentive} onClick={p.open} />
      ))}
    </>
  )
}

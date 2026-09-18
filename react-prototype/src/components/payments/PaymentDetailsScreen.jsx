import { HelpIcon, NotificationIcon } from '../common/icons.jsx'
import ScreenHeader from '../common/ScreenHeader.jsx'
import BasePayCard from './BasePayCard.jsx'
import CollapsiblePdCard from './CollapsiblePdCard.jsx'
import BottomActionBar from './BottomActionBar.jsx'
import LostShipmentsModal from './LostShipmentsModal.jsx'
import './PaymentDetailsScreen.css'

/** Payment Details drill-down — Figma SOT_Valmo node 275:9263. */
export default function PaymentDetailsScreen({ vm }) {
  return (
    <div className="payment-details">
      <ScreenHeader
        title="Payment Details"
        onBack={vm.goBackPayments}
        action={(
          <div className="payment-details__actions">
            <div className="payment-details__help"><HelpIcon /><span>Help</span></div>
            <NotificationIcon dot={false} />
          </div>
        )}
      />

      <div className="payment-details__scroll fe-scroll">
        <div className="payment-details__summary-wrap">
          <div className="payment-details__summary-card">
            <div className="payment-details__summary-header">
              <span>Payment for <b>{vm.paymentForDate}</b></span>
            </div>
            <div className="payment-details__summary-amount">{vm.paymentAmount}</div>
          </div>
        </div>

        <div className="payment-details__cards">
          <BasePayCard basePay={vm.basePay} />
          {vm.pdCards.map((c) => <CollapsiblePdCard key={c.key} card={c} />)}
        </div>
      </div>

      <BottomActionBar />

      {vm.showLostShipmentsModal && <LostShipmentsModal vm={vm} />}
    </div>
  )
}

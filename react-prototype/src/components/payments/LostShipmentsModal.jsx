import BottomSheet from '../common/BottomSheet.jsx'
import Button from '../common/Button.jsx'
import './LostShipmentsModal.css'

/** Drill-down modal opened by tapping "Lost Shipments" inside the Deductions
 * card. Both the rows and the total are derived from the case pool
 * (state/paymentBreakdown.js), so this list IS the line above it — and each
 * row opens the loss it stands for, which is what the loss page means when it
 * tells a Pilot their money is "in your payment · Deductions → Lost
 * Shipments". */
export default function LostShipmentsModal({ vm }) {
  return (
    <BottomSheet
      maxHeight="80%"
      title="Lost shipments"
      subtitle={vm.lostShipmentsSubtitle}
      onClose={vm.closeLostShipmentsModal}
    >
      <div className="lost-shipments__col-heads">
        <span>AWB Number</span>
        <span>Amount</span>
      </div>

      {vm.lostShipmentItems.map((ls) => (
        <button type="button" key={ls.id} className="lost-shipments__row" onClick={ls.open}>
          <div>
            <div className="lost-shipments__awb">{ls.awb}</div>
            <div className="lost-shipments__date">Marked lost on {ls.date}</div>
          </div>
          <div className="lost-shipments__amt">{ls.amtLabel}</div>
        </button>
      ))}

      <div className="lost-shipments__total">
        <span>Total deducted</span>
        <span>{vm.lostShipmentsTotal}</span>
      </div>

      <div className="lost-shipments__actions">
        <Button fullWidth onClick={vm.closeLostShipmentsModal}>Got it</Button>
      </div>
    </BottomSheet>
  )
}

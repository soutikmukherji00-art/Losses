import BottomSheet from '../common/BottomSheet.jsx'
import Button from '../common/Button.jsx'
import './ReturnedClaimSheet.css'

/**
 * The destination of Lost in Field's one action. A Pilot who has already
 * handed the parcel back needs a way to say so — the hub scan is the only
 * thing that closes the loop from their side, and before this the page told
 * them to "raise a ticket" in grey footer text that did nothing.
 *
 * It promises a check, never an outcome: the credit depends on the scan.
 */
export default function ReturnedClaimSheet({ view, vm }) {
  return (
    <BottomSheet>
      <div className="returned-claim">
        <div className="returned-claim__title">You already returned it?</div>
        <div className="returned-claim__body">
          We will check the hub scan for AWB {view.awb}. If the parcel is there,
          {' '}{view.amount} comes back as a credit in your next payment.
        </div>
        <div className="returned-claim__note">
          Checking takes up to {vm.hubCheckDays} days. You will be told here.
        </div>
        <div className="returned-claim__actions">
          <Button fullWidth onClick={vm.confirmReturnedClaim}>Ask us to check</Button>
          <Button fullWidth variant="ghost" onClick={vm.closeReturnedClaim}>Not yet</Button>
        </div>
      </div>
    </BottomSheet>
  )
}

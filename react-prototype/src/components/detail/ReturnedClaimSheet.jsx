import BottomSheet from '../common/BottomSheet.jsx'
import Button from '../common/Button.jsx'
import Section from '../common/Section.jsx'
import AlertPill from '../common/AlertPill.jsx'
import '../sheet/ReasonSheetOverlay.css'
import '../sheet/ReasonSheetBody.css'

/**
 * The destination of Lost in Field's one action. A Pilot who has already
 * handed the parcel back needs a way to say so — the hub scan is the only
 * thing that closes the loop from their side.
 *
 * SAME SHEET AS ACCEPT / DISPUTE (design call, 21 Sep): titled head with a
 * close, a grey body of white sections, the commit in a footer outside the
 * scroll. It used to be a one-off card — its own title style, prose, and a
 * second "Not yet" button — the only sheet in the app shaped that way. The
 * close in the head is "not yet"; a form does not need to say it twice. The
 * chrome classes are ReasonSheetOverlay's, because this IS that object.
 *
 * It promises a check, never an outcome: the credit depends on the scan.
 */
export default function ReturnedClaimSheet({ view, vm }) {
  return (
    <BottomSheet scrollBody maxHeight="90%" title="You already returned it?" onClose={vm.closeReturnedClaim}>
      <div className="reason-overlay__scroll fe-scroll">
        <Section panel>
          <AlertPill tone="info">
            If the hub scan finds it, <b>{view.amount}</b> comes back as a credit in your next payment.
          </AlertPill>
          <div className="reason-sheet__after">
            We check the scan for AWB {view.awb}. It takes up to {vm.hubCheckDays} days — you will be told here.
          </div>
        </Section>
      </div>

      <div className="reason-overlay__bar">
        <Button fullWidth onClick={vm.confirmReturnedClaim}>Ask us to check</Button>
      </div>
    </BottomSheet>
  )
}

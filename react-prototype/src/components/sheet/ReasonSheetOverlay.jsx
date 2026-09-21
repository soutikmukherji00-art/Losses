import BottomSheet from '../common/BottomSheet.jsx'
import Button from '../common/Button.jsx'
import ReasonSheetBody from './ReasonSheetBody.jsx'
import DisputeRecord from './DisputeRecord.jsx'
import './ReasonSheetOverlay.css'

/**
 * Accept / Dispute as a BOTTOM SHEET — the only presentation. The case
 * detail stays mounted behind the scrim, so the Pilot keeps sight of the
 * loss they are acting on, which is what decided it: a full-page version
 * existed as the alternative and replaced the case with a form, and there is
 * no reading of this decision that is helped by taking the loss off screen.
 *
 * Three things here are requirements rather than styling, because a bottom
 * sheet is a risky container for an irreversible, money-affecting decision:
 *
 *  · The commit button sits in a footer OUTSIDE the scrolling body, so it
 *    can never scroll away or hide behind the note field's keyboard.
 *  · The sheet opens tall (90%) so KRD F9's consequence copy — the dispute's
 *    "one try only / if right ₹0, if wrong the full ₹X" — is on screen
 *    before the tap rather than below the fold.
 *  · Dismissing does NOT discard a part-written answer: the draft is kept
 *    per case, and reopening this sheet restores it (see `openAccept` /
 *    `openDispute` in useLossesApp.js).
 *
 * No AWB under the title. The sheet sits over the case detail, whose own
 * header is still showing that AWB two inches above it — so the byline was
 * the same string twice in one viewport, and it was costing the sheet a line
 * at the top of a form the Pilot has to fill in.
 *
 * The form is `ReasonSheetBody`, whose stylesheet is now its own
 * (`ReasonSheetBody.css`) rather than the departed page's.
 */
export default function ReasonSheetOverlay({ vm }) {
  return (
    <BottomSheet
      scrollBody
      maxHeight="90%"
      title={vm.sheetTitle}
      onClose={vm.closeSheet}
    >
      <div className="reason-overlay__scroll fe-scroll">
        <ReasonSheetBody vm={vm} />
      </div>

      <div className="reason-overlay__bar">
        {/* The Pilot's cool-off standing, directly above the button that
            spends a try — the ActionBar's note slot, in the sheet. Dispute
            only, and nothing at all on a clean record. */}
        {vm.isDispute && !vm.pseudoDispute && <DisputeRecord record={vm.disputeRecord} />}
        <Button fullWidth disabled={!vm.canSubmit} onClick={vm.submitSheet}>
          {vm.submitLabel}
        </Button>
      </div>
    </BottomSheet>
  )
}

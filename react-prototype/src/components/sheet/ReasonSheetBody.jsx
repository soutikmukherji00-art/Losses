import Section from '../common/Section.jsx'
import AlertPill from '../common/AlertPill.jsx'
import AudioChip from '../common/AudioChip.jsx'
import Chip from '../common/Chip.jsx'
import DisputeRecord from './DisputeRecord.jsx'
import './ReasonSheetBody.css'

/**
 * The accept/dispute form itself — reason chips, the note, and what happens
 * after the tap.
 *
 * It lives apart from both of its presentations (the full page and the bottom
 * sheet — see `config` "Accept / Dispute presentation") for one reason: this
 * is the markup that carries KRD F9's consequence copy, and two copies of it
 * would be two copies free to drift. Presentations own chrome — header,
 * scrolling, where the commit button sits — and nothing else.
 */
export default function ReasonSheetBody({ vm }) {
  return (
    <>
      {/* Where the Pilot stands on the cool-off counter — before the chips,
          because it is context for the choice rather than a consequence of
          it. Dispute only: nothing about accepting is ever counted. */}
      {vm.isDispute && <DisputeRecord record={vm.disputeRecord} />}

      <Section title={vm.chipPrompt} action={<AudioChip size="sm" />}>
        <div className="reason-sheet__chips">
          {vm.reasonChips.map((c) => (
            <Chip key={c.label} variant="reason" active={c.picked} onClick={c.pick}>{c.label}</Chip>
          ))}
        </div>

        <div className="sec__group">
          <label className="reason-sheet__note-label" data-invalid={vm.noteInvalid} htmlFor="sheet-note">
            {vm.noteLabel}
          </label>
          <textarea
            id="sheet-note"
            className="reason-sheet__note"
            data-invalid={vm.noteInvalid}
            rows={2}
            value={vm.noteText}
            onChange={vm.onNote}
            placeholder={vm.notePlaceholder}
          />
        </div>
      </Section>

      {/* What happens after this tap — the one thing the Pilot is owed
          before an irreversible action. Accept and dispute say different
          true things; neither promises an outcome. */}
      <Section title="What happens next">
        {vm.isAccept && (
          <>
            <AlertPill tone="info">
              The team still reviews it. The deduction may be cancelled — not always.
            </AlertPill>
            <div className="reason-sheet__after">
              We will tell you the result here, before your payout.
            </div>
          </>
        )}
        {vm.isDispute && (
          <>
            <AlertPill tone="warning">
              You get one try only. If you are right, ₹0 is deducted. If you are wrong,
              the full {vm.amountLabel} is deducted.
            </AlertPill>
            <div className="reason-sheet__after">
              The team replies here in {vm.replyDays} days.
            </div>
          </>
        )}
      </Section>

      {vm.isAccept && (
        <Section title="Next time" action={<AudioChip size="sm" />}>
          <div className="reason-sheet__tip">{vm.acceptTip}</div>
        </Section>
      )}
    </>
  )
}

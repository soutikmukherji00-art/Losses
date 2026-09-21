import Section from '../common/Section.jsx'
import AlertPill from '../common/AlertPill.jsx'
import AudioChip from '../common/AudioChip.jsx'
import Chip from '../common/Chip.jsx'
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
      {/* WHAT THIS TAP DOES — first, before the form, the way the reference
          frame leads with "Accept by 18 Jun to receive payment on time"
          (1636:20763): one tinted line with the deciding fact in Demi, and
          the timing under it in grey. It was a "What happens next" section
          at the foot of the form, in three sentences — the one thing a Pilot
          is owed before an irreversible tap, placed after they had already
          filled the form in. Accept and dispute say different true things;
          neither promises an outcome. */}
      <Section panel>
        {vm.isAccept && (
          <AlertPill tone="info">
            The team still reviews this — the deduction <b>may</b> be cancelled.
          </AlertPill>
        )}
        {vm.isDispute && vm.pseudoDispute && (
          /* A wrong pickup: no money, no review — the dispute puts the
             Pilot's side on record, and the sheet says exactly that much. */
          <AlertPill tone="info">
            <b>No money is deducted</b> for wrong pickups — this puts your side on record.
          </AlertPill>
        )}
        {vm.isDispute && !vm.pseudoDispute && (
          /* One fact, one line. What a wrong dispute costs is the sad case
             under "What happens next", where it sits beside the good one
             rather than doing the frightening on its own up here. */
          <AlertPill tone="warning">
            You can dispute this loss <b>only once</b>.
          </AlertPill>
        )}
      </Section>

      {/* The Pilot's cool-off standing is NOT here: it sits in the sheet's
          foot, above the commit button (ReasonSheetOverlay → DisputeRecord),
          where the try is about to be spent. */}
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

      {/* WHAT HAPPENS NEXT — the hopeful half. The pill above carries the
          risk (one try, what a wrong dispute costs); this section carries the
          timing and the good outcome, so the Pilot commits knowing both.

          "Nothing is deducted", not "returned": a dispute is only ever
          offered BEFORE the money moves (ATTRIBUTED / cool-off, on DEBITABLE
          reasons — resolveCaseView's buildAction), so on every page that can
          open this sheet the win is money that stays, not money that comes
          back. Lost in Field, the one reason where money does come back, has
          no dispute at all; its return-claim sheet says "credited" instead.
          If a post-debit dispute path ever ships, this line has to switch
          to "is credited back" for it. */}
      <Section title="What happens next" action={<AudioChip size="sm" />}>
        <div className="reason-sheet__next">
          {vm.pseudoDispute
            ? <>The team notes your side against this pickup. Nothing is deducted either way.</>
            : vm.isDispute
              ? <>The team reviews it and replies within <b>{vm.replyDays} days</b>.</>
              : <>The team reviews it before your payout.</>}
        </div>
        {/* The two outcomes, side by side and the same shape — the good one
            first. Neither is promised. A wrong pickup has no outcomes to
            list: there is no money for either branch to be about. */}
        {!vm.pseudoDispute && (
        <ul className="reason-sheet__outcomes">
          {/* One span per bullet: the row is a two-column grid (marker,
              text), and bare text runs with a <b> between them would each
              take a cell of their own. */}
          <li>
            <span>
              {vm.isDispute ? 'If you are right' : 'If it was not your mistake'}: nothing is deducted — the full <b>{vm.amountLabel}</b> stays in your payout.
            </span>
          </li>
          <li>
            <span>If not: the full <b>{vm.amountLabel}</b> is deducted.</span>
          </li>
        </ul>
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

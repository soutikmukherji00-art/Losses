import Section from '../common/Section.jsx'
import Button from '../common/Button.jsx'
import './AddYourSideCard.css'

/**
 * Action block for info-only cases (wrong-RVP). KRD F24: the tab is
 * information only, shows the Pilot's recorded responses, and offers an
 * optional "Add your side" — never money, never a dispute.
 *
 * The submit lives here, under the field, rather than in the sticky
 * ActionBar: an optional note on a case with nothing at stake should not
 * pin a greyed primary button to the bottom of an advisory page.
 */
export default function AddYourSideCard({ vm }) {
  return (
    <Section title={vm.secondaryCtaLabel}>
      <div className="add-side__body">
        If something about this pickup was different, tell us here. No money is deducted for this.
      </div>
      <div className="add-side__field">
        <textarea rows={2} value={vm.sideText} onChange={vm.onSide} placeholder="Type here…" />
      </div>
      <div className="add-side__actions">
        <Button
          variant="secondary"
          disabled={!vm.sideText.trim() || vm.sideSent}
          onClick={vm.submitSide}
        >
          {vm.sideLabel}
        </Button>
      </div>
    </Section>
  )
}

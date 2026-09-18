import Section from '../common/Section.jsx'
import './AddYourSideCard.css'

/**
 * Action block for info-only cases (wrong-RVP). KRD F24: the tab is
 * information only, shows the Pilot's recorded responses, and offers an
 * optional "Add your side" — never money, never a dispute.
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
    </Section>
  )
}

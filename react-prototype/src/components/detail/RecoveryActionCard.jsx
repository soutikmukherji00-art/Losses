import Section from '../common/Section.jsx'
import AudioChip from '../common/AudioChip.jsx'
import './RecoveryActionCard.css'

/**
 * Slot-7 action block for Lost in Field.
 *
 * This state has no argument to make — the money already left on day 0 — so
 * the only action the page owes is the remedy. Until this existed, `buildAction`
 * returned `{ mode: 'recovery' }` and nothing rendered it: the one state where
 * the Pilot's money is recoverable was the one page with nothing to tap, and
 * its only route out was a line of grey footer prose.
 *
 * The claim path is deliberately separate from the return itself: a Pilot who
 * has already handed the parcel over needs to say so, because the hub scan is
 * the only thing that closes the loop from their side.
 */
export default function RecoveryActionCard({ action }) {
  return (
    <Section title="Already returned it?" action={<AudioChip size="sm" />}>
      <div className="recovery-action__hint">{action.hint}</div>
    </Section>
  )
}

import Section from '../common/Section.jsx'
import './StatusTracker.css'

/** Vertical timeline used on the "Team is checking" detail screen —
 * step dots + connecting rail, done/pending states.
 *
 * NO सुनें ON THIS SECTION, where every other section on the page has one.
 * The सुनें control reads a block out loud, and this block is not prose: it
 * is a diagram — dots, a rail, and four-word labels whose meaning is carried
 * by WHICH dot is lit and how far down the rail the Pilot has got. Read
 * aloud, "Dispute sent · 15 Aug · Your reason · my photo was correct · Reply
 * expected · by 22 Aug" loses the one thing the timeline exists to show, and
 * says the dates and the quoted reason a Pilot can already see. Every fact
 * on it is also stated in prose in the money card above and, once the case
 * closes, in the verdict section below — both of which do have the control.
 */
export default function StatusTracker({ title, steps }) {
  return (
    <Section title={title}>
      <div className="status-tracker__steps">
        {steps.map((t, i) => (
          <div key={i} className="status-tracker__step">
            <div className="status-tracker__rail-col">
              <div className="status-tracker__dot" data-done={t.done}>
                <div className="status-tracker__dot-inner" data-done={t.done} />
              </div>
              {!t.isLast && (
                <div className="status-tracker__rail" data-lit={t.nextDone} />
              )}
            </div>
            <div className="status-tracker__body" data-last={t.isLast}>
              <div className="status-tracker__label" data-done={t.done}>{t.label}</div>
              <div className="status-tracker__meta" data-done={t.done}>{t.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

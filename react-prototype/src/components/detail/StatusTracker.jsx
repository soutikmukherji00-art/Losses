import Section from '../common/Section.jsx'
import AudioChip from '../common/AudioChip.jsx'
import './StatusTracker.css'

/** Vertical timeline used on the "Disputes in Review" detail screen —
 * step dots + connecting rail, done/pending states. */
export default function StatusTracker({ title, steps }) {
  return (
    <Section title={title} action={<AudioChip size="sm" />}>
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

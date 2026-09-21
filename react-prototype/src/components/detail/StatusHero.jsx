import AudioChip from '../common/AudioChip.jsx'
import { CheckCircleIcon } from '../common/icons.jsx'
import './StatusHero.css'

/**
 * The money card — the one block a Pilot is guaranteed to read. Four
 * answers in a fixed order: how much (the figure, and what it was going to
 * be), the clock (a badge while one runs, a dated byline once it has
 * stopped), where the money stands (the statement), and what to do about it
 * (the guidance, divided off by a rule, with the one सुनें on the page that
 * reads a sentence a Pilot actually needs to hear). Every state fills all
 * four; the hero contract in config/caseStates.js enforces it.
 *
 * The surface is neutral in every state; tone lives on the figure and its
 * byline, and on the badge while a clock runs.
 */
export default function StatusHero({
  tone, mark, figure, figureWas, chip, chipAttention, text, guidance,
}) {
  const toneClass = tone ? ` status-hero--${tone.replace(/_/g, '-')}` : ''

  return (
    /* A status region: after a Pilot accepts or disputes, this block is what
       changed, and a screen reader should be told so without being dragged
       back to the top of the page. */
    <div className={`status-hero${toneClass}`} role="status">
      <div className="status-hero__lead">
        <span className="status-hero__figure">{figure}</span>
        {figureWas && <s className="status-hero__was">{figureWas}</s>}
        {chip && chipAttention && <span className="status-hero__chip">{chip}</span>}
      </div>

      <div className="status-hero__line">
        {mark === 'good' && (
          <span className="status-hero__mark" aria-hidden="true">
            <CheckCircleIcon size={16} stroke="currentColor" />
          </span>
        )}
        <span className="status-hero__text">{text}</span>
      </div>

      {chip && !chipAttention && <div className="status-hero__date">{chip}</div>}

      {guidance && (
        <>
          <div className="status-hero__rule" />
          <div className="status-hero__foot">
            <div className="status-hero__guidance">{guidance}</div>
            <AudioChip />
          </div>
        </>
      )}
    </div>
  )
}

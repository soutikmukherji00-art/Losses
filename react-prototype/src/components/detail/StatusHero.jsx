import AudioChip from '../common/AudioChip.jsx'
import { CheckCircleIcon } from '../common/icons.jsx'
import './StatusHero.css'

/**
 * Slot 2 — the one block a Pilot is guaranteed to read, and on a phone often
 * the only one they read before deciding whether to scroll.
 *
 * It answers four questions in a fixed order, and the order is the design:
 * the money first (it is what the Pilot came for and what the list row
 * promised), then the clock beside it, then where that money stands, then
 * what to do about it. Nothing here is optional — every state fills all four,
 * which is enforced upstream by the hero contract in config/caseStates.js.
 *
 * TWO POLES, TWO NATURES. Row 1 is money left, clock right, and the top-right
 * corner belongs to the clock alone. The सुनें control used to sit there too —
 * two white pills of the same size and shape, one of them read-only
 * information and the other a control, separated by nothing but a 1px border.
 * It now sits below the rule, ON the guidance line, which is the sentence on
 * this card actually worth hearing: the figure and the clock do not need
 * reading aloud, and the instruction does. Sharing the row rather than taking
 * one of its own is what keeps the card short — the control costs the
 * sentence some width, which is cheaper than costing the card a whole row.
 *
 * (It is therefore the one audio control on the page that is NOT top-right of
 * its block. That inconsistency is deliberate and was weighed — see the design
 * call; the alternative was two indistinguishable pills in one corner.)
 *
 * The payment line is NOT here. It used to ride in as a third line under the
 * status — a filing reference sitting between "where your money stands" and
 * "what you can do about it", in the one block that has to be readable at a
 * glance. It lives with the other money facts in slot 3 now.
 *
 * Tone still comes from money position, never severity — the one thing on the
 * page that says where the money stands without being read.
 */
export default function StatusHero({
  tone, mark, figure, figureWas, chip, text, guidance, audio = true,
}) {
  const toneClass = tone ? ` status-hero--${tone.replace(/_/g, '-')}` : ''

  return (
    /* A status region: after a Pilot accepts or disputes, this block is what
       changed, and a screen reader should be told so without being dragged
       back to the top of the page. */
    <div className={`status-hero${toneClass}`} role="status">
      <div className="status-hero__lead">
        <span className="status-hero__figure">{figure}</span>
        {/* What it was going to be. The earnings card's own device, so a
            struck figure means the same thing wherever it appears. */}
        {figureWas && <s className="status-hero__was">{figureWas}</s>}
        {chip && <span className="status-hero__chip">{chip}</span>}
      </div>

      <div className="status-hero__line">
        {mark === 'good' && (
          <span className="status-hero__mark" aria-hidden="true">
            <CheckCircleIcon size={16} stroke="currentColor" />
          </span>
        )}
        <span className="status-hero__text">{text}</span>
      </div>

      {(guidance || audio) && (
        <>
          <div className="status-hero__rule" />
          <div className="status-hero__foot">
            {guidance && <div className="status-hero__guidance">{guidance}</div>}
            {audio && <AudioChip />}
          </div>
        </>
      )}
    </div>
  )
}

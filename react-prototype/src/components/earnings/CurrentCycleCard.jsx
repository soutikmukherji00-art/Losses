import { ClockIcon } from '../common/icons.jsx'
import './CurrentCycleCard.css'

/**
 * "Current Cycle" summary card on the My Earnings tab — structure from
 * Figma WCghUzecsonToq8dCxpm3W · 7064:37457.
 *
 * The reference inverts what this card used to do: the payment status moves
 * OUT of a footnote under the figure and INTO the amber strip at the top,
 * next to a clock — because when the money lands is the first thing a Pilot
 * reads, not the last. The strip's old "Total Earning for <date>" label moves
 * down into the body, where it belongs to the figure it names.
 *
 * So the card reads top to bottom: when it arrives · what it is · how much ·
 * what is being taken out of it.
 */
export default function CurrentCycleCard({ cycle }) {
  return (
    <div className="current-cycle-card">
      <div className="current-cycle-card__status">
        <ClockIcon size={14} stroke="var(--text-primary)" />
        <span className="current-cycle-card__status-text">
          {cycle.statusLead} <b>{cycle.statusHighlight}</b>
        </span>
      </div>

      <div className="current-cycle-card__body">
        <div className="current-cycle-card__label">
          Total Earnings for <b>{cycle.date}</b>
        </div>
        <div className="current-cycle-card__figures">
          <span className="current-cycle-card__amount">{cycle.amount}</span>
          {/* The gross, struck. It comes second and quieter because what the
              Pilot is actually paid is the number they came here for. */}
          {cycle.showsStrike && (
            <s className="current-cycle-card__gross">{cycle.grossAmount}</s>
          )}
        </div>

        {/* What losses will take out of THIS cycle, stated against the figure
            they will be taken from. One sentence, with the two numbers that
            matter lifted out of it in red — the rest is grammar. The rule
            comes with it: with no losses there is nothing to divide off. */}
        {cycle.lossLine && (
          <>
            <div className="current-cycle-card__rule" />
            <button type="button" className="current-cycle-card__loss" onClick={cycle.lossLine.open}>
              <span className="current-cycle-card__loss-text">
                <b className="current-cycle-card__loss-amount">{cycle.lossLine.amount}</b>
                {' '}from <b>{cycle.lossLine.count}</b>
                {' '}{cycle.lossLine.noun} to be settled
              </span>
              <span className="current-cycle-card__loss-cta">View Details</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

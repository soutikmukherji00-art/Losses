import { ClockIcon } from '../common/icons.jsx'
import './HistoricSummaryCard.css'

/**
 * "What losses have cost you" on the Historic tab — the answer to the one
 * question this tab exists for.
 *
 * It replaced three label/value rows (Charged to you · Not deducted or
 * returned · Deducted) in a `Section`, which is the payment breakdown's
 * device: a ledger table. Three rows gave the three figures equal weight, and
 * they are not equal. Two are arithmetic; one is the answer.
 *
 * So the card echoes `CurrentCycleCard` instead, which is the shape a Pilot
 * already reads money in on My Earnings: a strip on top saying what this
 * covers, then the figure, then what is being taken off it. What was charged
 * rides in STRUCK beside what was actually deducted — the app's existing
 * device for "it was going to be X, it was Y" (the loss hero, `ListRow`, the
 * WAIVED state), so it needs no legend here.
 *
 * The strip states the period. A lifetime total with no period attached is a
 * number nobody can judge: ₹1,240 over two months and ₹1,240 over two years
 * are not the same fact about a Pilot.
 *
 * The break-up used to be here too, as ranked rows under the figure. It cost
 * four rows on the first card of the tab — every one of them something a
 * Pilot scrolls past to reach their own losses — and a top-two ranking is the
 * one shape that cannot add up to the number above it. It is a sheet now
 * (HistoricBreakupSheet); what stays is one line naming how many kinds of
 * loss are behind the figure, and the control that opens them.
 *
 * That line is the CurrentCycleCard's own foot pattern — a claim on the
 * figure, with the link that takes you to it — so the two money cards behave
 * the same way one tab apart.
 */
export default function HistoricSummaryCard({ historic, breakup }) {
  const { totals, count, spanLabel } = historic
  // Only where something actually came back. With nothing waived the struck
  // figure equals the live one, and a number struck through beside its own
  // twin reads as a rendering fault rather than a saving.
  const showsStrike = totals.cameBack > 0

  return (
    <div className="historic-summary">
      <div className="historic-summary__strip">
        <ClockIcon size={14} stroke="var(--text-primary)" />
        <span className="historic-summary__strip-text">
          {spanLabel && <><b>{spanLabel}</b> · </>}
          {count} {count === 1 ? 'loss' : 'losses'}
        </span>
      </div>

      <div className="historic-summary__body">
        <div className="historic-summary__label">Deducted from your earnings</div>
        <div className="historic-summary__figures">
          <span className="historic-summary__amount">{totals.deductedLabel}</span>
          {showsStrike && (
            <s className="historic-summary__gross">{totals.incurredLabel}</s>
          )}
        </div>

        {/* The recovered figure, as a sentence rather than a row of its own.
            It is the good news on this card, but it is a note ON the figure
            above — the Pilot's money question was answered by that number. */}
        {showsStrike && (
          <div className="historic-summary__note">
            <b>{totals.cameBackLabel}</b> was waived, never deducted, or returned to you.
          </div>
        )}

        {/* One kind of loss has no break-up to show — the figure above is
            already the whole of it, and a link promising otherwise wastes a
            tap. */}
        {breakup.kinds > 1 && (
          <>
            <div className="historic-summary__rule" />
            <button type="button" className="historic-summary__more" onClick={breakup.open}>
              <span className="historic-summary__more-text">
                From <b>{breakup.kinds} kinds</b> of loss
              </span>
              <span className="historic-summary__more-cta">View break-up</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

import BottomSheet from '../common/BottomSheet.jsx'
import Section from '../common/Section.jsx'
import ListRow from '../common/ListRow.jsx'
import './InsightSheet.css'

/**
 * The insight's detail, opened from the banner.
 * See Design System/INSIGHTS_SPEC.md § 3.
 *
 * Three things in the order a Pilot needs them: what it has cost, what to do
 * about it, and which losses these actually were — as `ListRow`s, so they can
 * go straight to any of them rather than hunting the list afterwards.
 *
 * The steps are the reason registry's own `prevention.steps`, the same lines
 * the loss detail page renders under "Next time" — one deck, one heading, so
 * the advice is recognisable as the same advice on either surface.
 */
export default function InsightSheet({ insight }) {
  return (
    <BottomSheet flush maxHeight="85%" title={insight.label} onClose={insight.close}>
      <div className="insight-sheet__lead">
        <span className="insight-sheet__amount">{insight.amountLabel}</span>
        <span className="insight-sheet__count">
          {insight.countsDeducted ? 'deducted across' : 'across'}{' '}
          {insight.count} {insight.count === 1 ? 'loss' : 'losses'}
        </span>
      </div>

      <Section title="Next time">
        <ol className="insight-sheet__steps">
          {insight.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </Section>

      <Section title="These losses" flush>
        {insight.rows.map((row) => (
          <ListRow key={row.id} row={row} onClick={row.open} />
        ))}
      </Section>
    </BottomSheet>
  )
}

import BottomSheet from '../common/BottomSheet.jsx'
import { SectionRow } from '../common/Section.jsx'
import { ChevronRightIcon } from '../common/icons.jsx'
import './HistoricBreakupSheet.css'

/**
 * The break-up behind the Historic tab's figure — every kind of loss the
 * Pilot has had, what each one actually took, and a total that comes back to
 * the number on the card they tapped.
 *
 * It was two ranked rows inside that card. On a phone the card is the first
 * thing on the tab, so every row it carries is a loss the Pilot has to scroll
 * past to reach their own history — and a ranking that shows the top two is
 * the one shape that cannot add up. Moved into a sheet, the card keeps the
 * money and loses four rows of height, and this list stops being a highlight
 * reel and becomes an audit: it names every kind, including the ones that
 * cost nothing, and reconciles.
 *
 * NO THRESHOLD HERE. The banner's 3-case minimum protects two lines of
 * budget; a break-up that quietly dropped a kind of loss would not add up to
 * its own total, which is the one thing this surface owes.
 *
 * The zero rows are the point as much as the costly ones. "₹0" against a
 * struck charge is the app's grammar for money that was at stake and stayed
 * with the Pilot — the same device the list rows and the loss hero use — so
 * a kind of loss that never cost anything says so in one glance, with no new
 * vocabulary to learn.
 */
export default function HistoricBreakupSheet({ breakup }) {
  return (
    <BottomSheet
      flush
      maxHeight="85%"
      title={`What the ${breakup.total} went on`}
      subtitle={breakup.subtitle}
      onClose={breakup.close}
    >
      <ul className="breakup__list">
        {breakup.rows.map((row) => (
          <li key={row.id}>
            <button type="button" className="breakup__row" onClick={row.open}>
              <span className="breakup__text">
                <span className="breakup__label">{row.label}</span>
                <span className="breakup__sub">
                  {row.count} {row.count === 1 ? 'loss' : 'losses'}
                  {row.shareLabel && <> · {row.shareLabel}</>}
                </span>
              </span>

              <span className="breakup__amount" data-tone={row.amountTone}>
                {row.amountLabel}
                {row.chargedLabel && <s className="breakup__was">{row.chargedLabel}</s>}
              </span>
              <span className="breakup__chev" aria-hidden="true">
                <ChevronRightIcon size={18} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* The line that closes the audit. It is the card's own figure, so a
          Pilot can check the sum they were shown rather than take it. */}
      <div className="breakup__total">
        <SectionRow label="Deducted" value={breakup.total} strong />
      </div>
    </BottomSheet>
  )
}

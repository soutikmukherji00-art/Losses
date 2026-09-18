import Chip from './Chip.jsx'
import { HowPaymentsIcon, RateCardIcon, ChevronRightIcon } from './icons.jsx'
import './UtilityChipRow.css'

/** "How payments work" / "Rate card" utility chip row — shown above the
 * segmented tabs on both the Payments tab and the My Earnings tab (Figma
 * SOT_Valmo node 275:10421 and the Daily Payout / Earnings Dashboard file). */
export default function UtilityChipRow() {
  return (
    <div className="utility-chip-row">
      <Chip variant="utility" icon={<HowPaymentsIcon />} trailingIcon={<ChevronRightIcon size={16} />}>
        How payments work
      </Chip>
      <Chip variant="utility" icon={<RateCardIcon />} trailingIcon={<ChevronRightIcon size={16} />}>
        Rate card
      </Chip>
    </div>
  )
}

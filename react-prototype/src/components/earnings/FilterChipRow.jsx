import Chip from '../common/Chip.jsx'
import './FilterChipRow.css'

/** Horizontally-scrolling row of loss-filter chips (All / Needs Decision / …). */
export default function FilterChipRow({ chips }) {
  return (
    <div className="filter-chip-row fe-nowrap-scroll">
      {chips.map((c) => (
        <Chip key={c.label} variant="filter" active={c.active} onClick={c.pick}>{c.label}</Chip>
      ))}
    </div>
  )
}

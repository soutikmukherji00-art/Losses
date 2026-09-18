import './SectionDivider.css'

/** Plain grey label divider — "Past Payments" (Payments tab) and the
 * "May 2025" month divider (My Earnings tab) both use this same shape. */
export default function SectionDivider({ label }) {
  return (
    <div className="section-divider">
      <span>{label}</span>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { InfoIcon } from './icons.jsx'
import './SectionHeader.css'

/**
 * Group header row above a list section — label left, running total right.
 * Used for "Needs Attention", "Team is checking", "Wrong Pickups" and
 * "History" (config/lossBuckets.js), the Loss Wise groups and the
 * historic ledger's cycle groups.
 *
 * ONE container for every section head. "Wrong Pickups" used to carry its own
 * blue tint, which made it read as a different KIND of thing — and it isn't:
 * it is the same list of losses, with a different answer to the one question
 * every head answers on its right-hand side ("what did this section cost
 * me?"). So the answer goes in the `total` slot the other heads already use
 * — "No deductions" — and the sentence that used to need a banner of its own
 * underneath moves into `info`, behind the icon beside it.
 */
export default function SectionHeader({ label, total, info }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef(null)

  // A tooltip that only closes on its own button is a trap on touch, where
  // there is no pointer to move away. Anything else tapped dismisses it.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => { if (!anchor.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="section-header" data-tip-open={open || undefined}>
      <div className="section-header__label">{label}</div>

      {total && (
        /* Flex, so the icon centres against the total — while the group's own
           baseline stays the total's, which is what keeps it aligned with the
           label across the header. */
        <div className="section-header__end" ref={anchor}>
          <div className="section-header__total">{total}</div>

          {info && (
            <>
              <button
                type="button"
                className="section-header__info"
                aria-label={`What "${total}" means`}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <InfoIcon size={16} stroke="currentColor" />
              </button>
              {open && <div className="section-header__tip" role="tooltip">{info}</div>}
            </>
          )}
        </div>
      )}
    </div>
  )
}

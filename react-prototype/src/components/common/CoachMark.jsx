import { useLayoutEffect, useState } from 'react'
import './CoachMark.css'

/**
 * One coach mark of the first-run tour (config/ftuxTour.js): the screen
 * dimmed, the step's target left at full opacity, and a bubble beside it.
 *
 * THE CUT-OUT IS A HOLE, NOT A COPY. The target is never cloned or
 * re-rendered — the dim is one element with a 9999px spread shadow around
 * the target's own rectangle, and it takes no pointer events, so the real
 * control underneath stays exactly as bright and exactly as tappable as it
 * was. Everything OUTSIDE the hole is covered by four transparent blockers,
 * which is what makes the tour impossible to wander out of: the only things
 * a Pilot can hit are the highlighted control and the bubble's own buttons.
 * On a step the Pilot is not meant to tap (the money card, the action bar
 * they would commit with), a fifth blocker covers the hole as well.
 *
 * Measured against `.phone-frame` rather than the viewport, because the dim
 * belongs to the device, not to the page the device is sitting on.
 *
 * A step whose target is not on screen — an arrangement without the entry
 * point, a loss type with no action bar — is skipped rather than dimming a
 * screen with nothing lit on it.
 */

/** Breathing room between the target's edge and the hole's. */
const PAD = 6

/** Room a bubble needs under the target before it flips above it. */
const BUBBLE_ROOM = 190

/** Long enough for `scrollIntoView` to settle before the second measure. */
const SETTLE_MS = 300

export default function CoachMark({ ftux }) {
  const { step, index, total, next, skip } = ftux
  const [box, setBox] = useState(null)

  useLayoutEffect(() => {
    const frame = document.querySelector('.phone-frame')
    const el = document.querySelector(`[data-ftux="${step.target}"]`)
    // Nothing to point at on this arrangement — move on rather than dim a
    // screen with nothing lit.
    if (!frame || !el) {
      next()
      return undefined
    }

    el.scrollIntoView({ block: step.scroll || 'nearest', inline: 'nearest' })

    const measure = () => {
      const f = frame.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      setBox({
        top: r.top - f.top,
        left: r.left - f.left,
        width: r.width,
        height: r.height,
        frameH: f.height,
        frameW: f.width,
      })
    }

    measure()
    // Again once any scrolling has stopped, or the hole sits where the
    // target used to be.
    const settle = setTimeout(measure, SETTLE_MS)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(settle)
      window.removeEventListener('resize', measure)
    }
    // `next` is re-created every render; the target is what this measures.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.target])

  if (!box) return null

  const top = Math.max(0, box.top - PAD)
  const left = Math.max(0, box.left - PAD)
  const width = Math.min(box.frameW - left, box.width + PAD * 2)
  const height = Math.min(box.frameH - top, box.height + PAD * 2)
  const bottom = top + height

  const below = box.frameH - bottom >= BUBBLE_ROOM
  const place = below ? 'below' : 'above'
  const bubbleStyle = below
    ? { top: bottom + 10 }
    : { bottom: box.frameH - top + 10 }

  // The caret points at the target's middle, inside a bubble that runs the
  // page gutters — clamped so it cannot slide off its own corners.
  const gutter = 16
  const caretLeft = Math.min(
    Math.max(box.left + box.width / 2 - gutter - 6, 12),
    box.frameW - gutter * 2 - 24,
  )

  const isTap = step.advance === 'tap'

  return (
    <div className="coach">
      <div className="coach__hole" style={{ top, left, width, height }} />

      {/* The four sides of the hole: transparent, and the reason the tour
          cannot be tapped out of. */}
      <div className="coach__block" style={{ top: 0, left: 0, right: 0, height: top }} />
      <div className="coach__block" style={{ top: bottom, left: 0, right: 0, bottom: 0 }} />
      <div className="coach__block" style={{ top, left: 0, width: left, height }} />
      <div className="coach__block" style={{ top, left: left + width, right: 0, height }} />
      {/* A step the Pilot reads rather than presses keeps its control
          covered — the last one is a dispute. */}
      {!isTap && <div className="coach__block" style={{ top, left, width, height }} />}

      <div className="coach__bubble" data-place={place} style={bubbleStyle}>
        <span className="coach__caret" style={{ left: caretLeft }} />
        <div className="coach__title">{step.title}</div>
        <div className="coach__body">{step.body}</div>
        <div className="coach__foot">
          <span className="coach__count">{index + 1} of {total}</span>
          {/* Skip always, Next only where the bubble owns the advance — on a
              'tap' step the highlighted control is the way forward, so the
              bubble must not offer a second one. Next is rightmost: it is
              the move, and the app puts its primary on the right (ActionBar). */}
          <div className="coach__buttons">
            <button type="button" className="coach__btn coach__btn--skip" onClick={skip}>Skip</button>
            {!isTap && (
              <button type="button" className="coach__btn coach__btn--next" onClick={next}>
                {step.advance === 'end' ? 'Got it' : 'Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

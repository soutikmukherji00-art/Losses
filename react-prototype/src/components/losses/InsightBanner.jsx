import { useEffect, useRef, useState } from 'react'
import { LightbulbIcon, ChevronRightIcon } from '../common/icons.jsx'
import '../common/Banner.css'
import './InsightBanner.css'

/**
 * How long a rolling banner rests on one insight before it moves on.
 *
 * 7s, not the 5 it was. Five was set when the banner swapped its text in
 * place; a card that SLIDES has to be read from a standing start, and the
 * claim is only half of it — the habit underneath is the line the Pilot is
 * meant to act on, and it was going past before it had been taken in.
 */
const ROLL_MS = 7000

/** How far a mouse travels before the gesture is a drag rather than a tap. */
const DRAG_SLOP = 6

/** Quiet time after the last scroll event before the track is read as settled. */
const SETTLE_MS = 120

/**
 * Contextual insight banner — "this keeps costing you, and here is the habit
 * that fixes it" — above the filter chips on the losses list, and at the head
 * of the historic ledger. See Design System/INSIGHTS_SPEC.md § 3.
 *
 * An inset card, not a full-width band. Full bleed reads as page chrome,
 * which is wrong directly under a segmented tab bar: two stacked full-width
 * bands, and the advice looked like a second row of navigation instead of a
 * card sitting on the list.
 *
 * Its shape is the shared BANNER PATTERN — mark · text block · action — which
 * it has in common with the loss entry point on My Earnings. Both are banners
 * in the same sense, so both are built from components/common/Banner.css and
 * the rules of the pattern live there. This file keeps only what is its own:
 * the carousel.
 *
 * Two lines, ~65px, about the height of one list row. That is the whole design
 * constraint: the block sits on top of the Needs-action list a Pilot opened the
 * screen for, so anything it takes is a loss they have to scroll to reach.
 *
 * LESSON ON TOP, BILL BENEATH (design call, 21 Sep): the heading is the habit
 * as one sentence, the byline is "<loss type> cost you <amount>" with the
 * amount as the card's one coloured thing. The loss count is deliberately
 * absent from both — it is the fact a Pilot acts on least, and the sheet
 * states it the moment they tap through.
 *
 *
 * `mode` is a sectional variant: 'rolling' — the default — lays every pattern
 * worth naming out as a swipeable row, 'single' shows the costliest only.
 */
export default function InsightBanner({ insights, mode, index, onShowIndex, onOpen }) {
  const rolling = mode === 'rolling' && insights.length > 1
  const carousel = useCarousel({ enabled: rolling, index, count: insights.length, onShowIndex })

  if (!insights.length) return null

  // One card, the whole width, nothing to index. The rolling track below is
  // not this with extra parts — it is a different object (a scroll port), so
  // it gets its own branch rather than a pile of conditionals inside one.
  if (!rolling) {
    return (
      <div className="banner-slot insight">
        <InsightCard insight={insights[index] || insights[0]} onOpen={onOpen} />
      </div>
    )
  }

  return (
    <div className="banner-slot insight" data-rolling="true">
      {/* THE CUT-OFF CARD IS THE AFFORDANCE. Every insight is laid out in one
          scroll port at a width that leaves the next one part-visible at the
          right edge, so "there is more advice than this" is a fact the Pilot
          can see rather than something the dots have to claim. The row is
          draggable by hand and advances itself every ROLL_MS; both settle on
          the same snap points, so hand and timer cannot leave it half-way. */}
      <div
        ref={carousel.ref}
        className="insight__track fe-scroll"
        {...carousel.handlers}
      >
        {insights.map((insight) => (
          <div className="insight__slide" key={insight.id}>
            <InsightCard insight={insight} onOpen={onOpen} />
          </div>
        ))}
      </div>

    </div>
  )
}

/** One insight, in the banner pattern's own shape. */
function InsightCard({ insight, onOpen }) {
  if (!insight) return null

  return (
    <button type="button" className="banner insight__body" data-tone="progress" onClick={() => onOpen(insight.id)}>
      <span className="banner__icon">
        <LightbulbIcon size={24} stroke="currentColor" />
      </span>

      <span className="banner__text">
        {/* THE LESSON LEADS (design call, 21 Sep). The heading is the habit,
            as one short imperative sentence in the primary ink — the banner
            teaches first. It never wraps: the reason registry caps it at one
            line (lossReasons.js `prevention.headline`) and the stylesheet
            clips as the backstop, because a two-line heading here costs the
            Pilot a list row they came for. */}
        <span className="banner__headline insight__headline">
          <span className="banner__strong">{insight.headline}</span>
        </span>

        <span className="banner__sub insight__byline">
          {/* THE BILL IS THE BYLINE — "Captain QC cost you ₹715" — and the
              amount is the one coloured thing on the card: Demi in the tone's
              accent, so it is noticed without being the heading.

              CONDITIONAL ON A LOSS TYPE THAT DEDUCTS NOTHING. A wrong pickup
              is informational — the Pilot was never charged for one — so
              "wrong pickups cost you ₹65" is a bill he never got. "Can cost
              you" keeps the figure, which is the parcels' real value and the
              reason the habit is worth fixing, and states it as exposure. */}
          <span className="insight__claim">
            {insight.noun}
            {insight.costsMoney === false ? ' can cost you ' : ' cost you '}
            <span className="banner__accent insight__amount">{insight.amountLabel}</span>
          </span>

          {/* The way in, on the body's own row — the banner pattern's shape:
              [icon] [heading / body + CTA]. A word and a chevron, and
              deliberately not a nested button: the whole banner is already
              the tap target that opens the sheet where the rest of the method
              lives. The claim gives way to it, never the other way round. */}
          <span className="banner__action">
            <span className="banner__cta">See how</span>
            <ChevronRightIcon size={18} stroke="var(--valmo-navy)" />
          </span>
        </span>
      </span>
    </button>
  )
}

/**
 * THE ROLLING TRACK — one horizontal scroll port, driven from two places that
 * have to agree on which card is showing: the Pilot's thumb, and a timer.
 *
 * The index in app state stays the single answer to "which one is showing".
 * Scrolling reports the settled card up to it; the timer writes it down; and a
 * written index scrolls the track. That loop closes without a
 * feedback fight because the report is taken only once the track has been
 * QUIET for SETTLE_MS — an animated scroll passes over the cards between here
 * and its target, and reporting those would fire the timer's own advance back
 * at it as a manual swipe.
 *
 * Only the MOUSE needs the drag handlers. A thumb already drags a scroll port;
 * a mouse does not, and this prototype is reviewed on a desktop as often as on
 * a phone, so "drag to scroll" has to be built for the pointer that can't.
 */
function useCarousel({ enabled, index, count, onShowIndex }) {
  const ref = useRef(null)
  const drag = useRef(null)
  // Set by a completed drag so the click it may end with does not open the
  // sheet the Pilot was only sliding out of the way; cleared by the next
  // press, not by that click, which is not guaranteed to arrive.
  const dragged = useRef(false)
  const [held, setHeld] = useState(false)

  const show = useRef(onShowIndex)
  show.current = onShowIndex

  // A card the Pilot did not scroll to — a dot tap, or the timer — is brought
  // to the gutter. Already-there is the common case (the index usually
  // changed BECAUSE the track scrolled), and it must not scroll again.
  useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return
    const target = offsetOf(el, index)
    if (target == null || Math.abs(el.scrollLeft - target) < 2) return
    el.scrollTo({ left: target, behavior: 'smooth' })
  }, [enabled, index, count])

  // The track, read back once it is still. This is what makes a swipe move
  // the dots and reset the clock, and it is also the backstop for a drag that
  // ends between two cards: the index moves, which scrolls the track to it.
  useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return undefined
    let t = null
    const onScroll = () => {
      clearTimeout(t)
      t = setTimeout(() => {
        const i = nearestIndex(el)
        if (i != null && i !== index) show.current(i)
      }, SETTLE_MS)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => { clearTimeout(t); el.removeEventListener('scroll', onScroll) }
  }, [enabled, index])

  // The clock restarts whenever the shown insight changes — including when a
  // swipe or a dot changes it — so a Pilot who picks a card gets a full read
  // of it. It does not run at all while a finger is down.
  useEffect(() => {
    if (!enabled || held || count < 2) return undefined
    const t = setTimeout(() => show.current((index + 1) % count), ROLL_MS)
    return () => clearTimeout(t)
  }, [enabled, held, index, count])

  const endDrag = () => {
    setHeld(false)
    const d = drag.current
    const el = ref.current
    drag.current = null
    if (!el) return
    delete el.dataset.dragging
    if (!d?.moved) return
    // Snap by hand rather than trusting the re-enabled snap-type to re-run:
    // a drag that ends on the card it started on would otherwise rest askew
    // with no index change to correct it.
    dragged.current = true
    const target = offsetOf(el, nearestIndex(el))
    if (target != null) el.scrollTo({ left: target, behavior: 'smooth' })
  }

  const handlers = !enabled ? {} : {
    onPointerDown(e) {
      setHeld(true)
      // Cleared HERE rather than by the click it is meant to swallow: a drag
      // does not reliably end in a click at all (a pointer that travelled far
      // enough, or was captured, may produce none), and a flag left standing
      // then eats the Pilot's NEXT tap — the one that meant to open the sheet.
      dragged.current = false
      if (e.pointerType !== 'mouse') return
      // NOT captured here. Pointer capture retargets the CLICK to the element
      // holding it, so capturing on press means every tap is delivered to the
      // track and the card underneath — the thing the Pilot actually aimed at
      // — never gets its click. Capture is taken below, once the gesture has
      // proved itself a drag, which is the only case that needs it.
      if (!ref.current) return
      drag.current = { x: e.clientX, id: e.pointerId, left: ref.current.scrollLeft, moved: false }
    },
    onPointerMove(e) {
      const d = drag.current
      const el = ref.current
      if (!d || !el) return
      const dx = e.clientX - d.x
      if (!d.moved && Math.abs(dx) < DRAG_SLOP) return
      if (!d.moved) {
        // Past the slop: this is a drag. Take the pointer now so it keeps
        // reporting once the cursor leaves the row, and turn snapping off —
        // it fights a scrollLeft written by hand. Both come back at the end.
        d.moved = true
        el.setPointerCapture?.(d.id)
        el.dataset.dragging = 'true'
      }
      el.scrollLeft = d.left - dx
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    // Capture, because the click is about to land on the card underneath.
    onClickCapture(e) {
      if (!dragged.current) return
      e.preventDefault()
      e.stopPropagation()
    },
  }

  return { ref, handlers }
}

/** Where the track's own gutter sits on screen — the line cards snap to. */
function snapLine(el) {
  const pad = parseFloat(getComputedStyle(el).paddingInlineStart) || 0
  return el.getBoundingClientRect().left + pad
}

/** The `scrollLeft` that puts card `i` on the snap line. */
function offsetOf(el, i) {
  const card = el.children[i]
  if (!card) return null
  return el.scrollLeft + card.getBoundingClientRect().left - snapLine(el)
}

/** Which card is nearest the snap line right now. */
function nearestIndex(el) {
  const line = snapLine(el)
  let best = null
  let bestGap = Infinity
  for (let i = 0; i < el.children.length; i += 1) {
    const gap = Math.abs(el.children[i].getBoundingClientRect().left - line)
    if (gap < bestGap) { bestGap = gap; best = i }
  }
  return best
}


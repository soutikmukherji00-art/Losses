import { useEffect, useState } from 'react'
import './PresenterShell.css'

/**
 * Generic prototype-presentation layout: a main "stage" (whatever the
 * prototype is — a phone frame, a desktop screen, anything) starting from
 * the top of the viewport, plus a control panel docked on the right.
 *
 * This component knows nothing about Losses/Earnings/any specific app —
 * it only lays out two children. That's deliberate: this whole `presenter/`
 * folder is meant to be lifted wholesale into the next prototype and
 * re-fed a different `stage` and `controlPanel`. The chevron below is drawn
 * inline for the same reason: the folder owes itself no dependency on any
 * one app's icon set.
 *
 * ---
 *
 * THE PANEL COLLAPSES, and the stage takes the width back.
 *
 * The panel is a tool, not part of the thing being shown. It earns its 272px
 * while an arrangement is being set up and costs them for the rest of the
 * session — when the prototype is being shown to a Pilot, photographed for a
 * deck, or simply looked at, a column of switches beside the phone is the
 * loudest object on a screen whose subject is the phone.
 *
 * THE AFFORDANCE IS ONE BUTTON, on the seam, vertically centred and half over
 * the border — the place a reader's hand already goes for a docked panel, and
 * the only spot that belongs to neither side so it cannot be mistaken for a
 * control of either. It stays put when the panel is shut, which is the whole
 * requirement a collapsed panel has: the way back must be visible without
 * knowing where to look. The arrow points where the panel will GO — right to
 * close it, left to bring it back — rather than at what it currently is.
 *
 * Kept, deliberately:
 *
 *   · the panel stays MOUNTED when collapsed, clipped to zero width. The
 *     layer registry lives off it, its scroll position survives, and a
 *     reviewer who reopens it is looking at the panel they left. `inert`
 *     keeps it off the tab order while it is shut, so the button is the only
 *     way in — clipped controls that could still be tabbed into would be a
 *     hidden panel that can be changed by accident.
 *   · CMD/CTRL + \ toggles it, the editor convention for exactly this. A
 *     demo is driven one-handed with a phone in the other.
 *   · the choice PERSISTS, like the dataset switch: open it once and the next
 *     reload is still open, because the reason for wanting the panel rarely
 *     lasts less than a session. It starts SHUT — see `readStored`.
 */

const STORAGE_KEY = 'presenter:panelOpen'

/**
 * Storage can throw (private mode, sandboxed iframe). **Default: collapsed** —
 * only an explicit `'true'` opens it.
 *
 * The prototype opens on the thing it is a prototype of. Anyone who needs the
 * switches knows the panel is there and is one click from it; everyone else —
 * a Pilot being shown a screen, a link opened from Slack, a screenshot taken
 * for a deck — was being handed a column of controls they had no use for,
 * beside the phone that was the point. The cost is asymmetric: a reviewer
 * pays one click a session, a viewer paid every time.
 */
function readStored() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export default function PresenterShell({ stage, controlPanel }) {
  const [open, setOpen] = useState(readStored)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(open))
    } catch { /* not worth failing a render over */ }
  }, [open])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '\\' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="presenter-shell" data-panel-open={open}>
      <div className="presenter-shell__stage">{stage}</div>

      <button
        type="button"
        className="presenter-shell__handle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="presenter-panel"
        title={`${open ? 'Hide' : 'Show'} controls  (⌘\\)`}
      >
        <span className="presenter-shell__handle-label">
          {open ? 'Hide controls' : 'Show controls'}
        </span>
        <Chevron />
      </button>

      <aside
        id="presenter-panel"
        className="presenter-shell__panel"
        // React 18 has no boolean `inert`; the empty string is the attribute.
        {...(open ? {} : { inert: '', 'aria-hidden': 'true' })}
      >
        <div className="presenter-shell__panel-inner">{controlPanel}</div>
      </aside>
    </div>
  )
}

/**
 * One chevron, pointing right. Which way it actually points is the CSS's job
 * (`[data-panel-open]` flips it), so the arrow's direction and the panel's
 * state cannot be set from two places and disagree.
 */
const Chevron = () => (
  <svg className="presenter-shell__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

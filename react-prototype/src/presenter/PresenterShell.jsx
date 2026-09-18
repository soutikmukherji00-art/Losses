import './PresenterShell.css'

/**
 * Generic prototype-presentation layout: a main "stage" (whatever the
 * prototype is — a phone frame, a desktop screen, anything) starting from
 * the top of the viewport, plus a control panel docked on the right.
 *
 * This component knows nothing about Losses/Earnings/any specific app —
 * it only lays out two children. That's deliberate: this whole `presenter/`
 * folder is meant to be lifted wholesale into the next prototype and
 * re-fed a different `stage` and `controlPanel`.
 */
export default function PresenterShell({ stage, controlPanel }) {
  return (
    <div className="presenter-shell">
      <div className="presenter-shell__stage">{stage}</div>
      <aside className="presenter-shell__panel">{controlPanel}</aside>
    </div>
  )
}

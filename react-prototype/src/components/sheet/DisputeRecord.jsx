import Section from '../common/Section.jsx'
import './DisputeRecord.css'

/**
 * The Pilot's dispute standing, above the reason chips in the dispute sheet.
 *
 * It is here — before the chips, not after them — because it is context for
 * the decision, not a consequence of it. By the time a Pilot has picked a
 * reason and reached "What happens next", they have already decided.
 *
 * A fraction and a line. It was a tinted panel with a row of pips and two
 * stacked sentences, which gave a standing the weight of an alert at every
 * count — including the counts where nothing is wrong. "2/3" carries the
 * whole fact, needs no colour to be read, and is legible to a Pilot who
 * cannot read the byline under it.
 *
 * What the fraction counts is WRONG disputes, never disputes. See the warning
 * in config/disputeCoolOff.js — there is no limit on disputing, and every
 * string here has to keep saying so.
 */
export default function DisputeRecord({ record }) {
  return (
    <Section title="Your dispute record">
      <div className="dispute-record" data-at-limit={record.atLimit || undefined}>
        <div className="dispute-record__figure">{record.fraction}</div>
        <div className="dispute-record__byline">{record.byline}</div>
      </div>
    </Section>
  )
}

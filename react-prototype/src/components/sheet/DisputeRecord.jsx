import './DisputeRecord.css'

/**
 * The Pilot's standing on the cool-off counter (config/disputeCoolOff.js),
 * as ONE note above the Raise Dispute button — the place a Pilot is about
 * to spend a try, and the only place the count is a fact they can act on.
 *
 * A hairline meter, then a sentence: three thin segments filled to the
 * count, and the fraction as the sentence's first word. The segments are
 * grey until the last step, where they and the fraction take the warning
 * ink — the one count that earns emphasis. Nothing renders on a clean
 * record: a warning about a threat that is not there yet turns a neutral
 * form into a caution (design call, 21 Sep).
 *
 * It was a section of its own at the top of the sheet — "Your dispute
 * record" over a display-size 2/3 — which made the Pilot's record the
 * subject of a sheet whose subject is this loss.
 */
export default function DisputeRecord({ record }) {
  if (!record?.show) return null

  return (
    <div className="dispute-record" data-last={record.atLimit || undefined} role="status">
      <div className="dispute-record__meter" aria-hidden="true">
        {Array.from({ length: record.limit }, (_, i) => (
          <span key={i} className="dispute-record__seg" data-on={i < record.wrong || undefined} />
        ))}
      </div>
      <div className="dispute-record__line">
        <b className="dispute-record__fraction">{record.fraction}</b> {record.byline}
      </div>
    </div>
  )
}

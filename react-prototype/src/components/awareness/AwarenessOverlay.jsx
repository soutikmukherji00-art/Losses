import BottomSheet from '../common/BottomSheet.jsx'
import AudioChip from '../common/AudioChip.jsx'
import Button from '../common/Button.jsx'
import { WarningIcon } from '../common/icons.jsx'
import './AwarenessOverlay.css'

/** Safety-awareness overlay shown on landing in Losses (frequency controlled
 * by the `awarenessRule`/`awarenessOverlay` demo props). */
export default function AwarenessOverlay({ vm }) {
  return (
    <BottomSheet>
      <div className="awareness__head">
        <div className="awareness__icon"><WarningIcon /></div>
        {/* No eyebrow. "SAFETY UPDATE" above the headline was a label doing
            work the headline already does, and it pushed the actual message
            down a line. */}
        <div className="awareness__body">
          <div className="awareness__title">{vm.awTitle}</div>
        </div>
      </div>
      <div className="awareness__text">{vm.awBody}</div>
      <div className="awareness__actions">
        <Button onClick={vm.dismissAwareness}>Got it</Button>
        <AudioChip />
      </div>
      <div className="awareness__rule">{vm.awRuleLabel}</div>
    </BottomSheet>
  )
}

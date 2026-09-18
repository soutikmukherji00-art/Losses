import { ClockIcon } from '../common/icons.jsx'
import Button from '../common/Button.jsx'
import './BottomActionBar.css'

/** Fixed footer on Payment Details: info row + Help/Track Payment CTAs. */
export default function BottomActionBar() {
  return (
    <div className="bottom-action-bar">
      <div className="bottom-action-bar__info">
        <ClockIcon />
        <span>Payment initiated &amp; will be credited in 2-3 days</span>
      </div>
      <div className="bottom-action-bar__buttons">
        <Button variant="secondary">Help</Button>
        <Button>Track Payment</Button>
      </div>
    </div>
  )
}

import { HelpIcon, NotificationIcon } from '../common/icons.jsx'
import './AppHeader.css'

/** Top app-bar for the Earnings shell: title + Help/Notification actions. */
export default function AppHeader({ title = 'Earnings' }) {
  return (
    <div className="app-header">
      <div className="app-header__title">{title}</div>
      <div className="app-header__actions">
        <div className="app-header__action">
          <HelpIcon />
          <span>Help</span>
        </div>
        <NotificationIcon />
      </div>
    </div>
  )
}

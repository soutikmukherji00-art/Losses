import StatusBar from './StatusBar.jsx'
import './PhoneFrame.css'

/** The 360x780 mobile-screen frame every real "app" screen renders inside. */
export default function PhoneFrame({ children }) {
  return (
    <div className="phone-frame-shell">
      <div className="phone-frame">
        <StatusBar />
        <div className="phone-frame__body">{children}</div>
      </div>
    </div>
  )
}

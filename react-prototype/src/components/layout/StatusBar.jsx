import bluetooth from '../../assets/statusbar/bluetooth.svg'
import wifi from '../../assets/statusbar/wifi.svg'
import cellular from '../../assets/statusbar/cellular.svg'
import battery from '../../assets/statusbar/battery.svg'
import './StatusBar.css'

/**
 * The Android status bar, from the design system's own component
 * (Figma WCghUzecsonToq8dCxpm3W · 5843:60180).
 *
 * It replaces a 22px navy block. That block was standing in for the device's
 * chrome and reading as part of OUR app — a brand-coloured bar above every
 * screen, which the Valmo app does not have. A real status bar is white, so
 * the screen now starts where the app actually starts.
 *
 * This is device chrome, not product UI: the icons are the exported assets
 * rather than redrawn glyphs, and the 6px "5G" is the one place in this
 * prototype that renders below the 12px floor — the floor is about text a
 * Pilot has to read, and nobody reads their own status bar.
 */
export default function StatusBar() {
  return (
    <div className="status-bar">
      <span className="status-bar__time">9:30 PM</span>

      <span className="status-bar__icons">
        <img className="status-bar__icon status-bar__icon--bluetooth" src={bluetooth} alt="" />
        <img className="status-bar__icon status-bar__icon--wifi" src={wifi} alt="" />
        <span className="status-bar__cellular">
          <span className="status-bar__network">5G</span>
          <img className="status-bar__icon status-bar__icon--cellular" src={cellular} alt="" />
        </span>
        <img className="status-bar__icon status-bar__icon--battery" src={battery} alt="" />
      </span>
    </div>
  )
}

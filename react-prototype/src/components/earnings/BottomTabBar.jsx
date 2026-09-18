import './BottomTabBar.css'

/** Bottom nav bar under the Earnings shell (Earnings / Profile). Profile is
 * an inert placeholder in the prototype, same as in the original bundle. */
export default function BottomTabBar() {
  return (
    <div className="bottom-tab-bar">
      <div className="bottom-tab-bar__tab bottom-tab-bar__tab--active">
        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="var(--valmo-navy)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.4 5h7.2M6.4 8.6h7.2M12.4 5v3.2a3.4 3.4 0 0 1-3.4 3.4H6.6l5.2 4.4" />
        </svg>
        <span>Earnings</span>
      </div>
      <div className="bottom-tab-bar__tab">
        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="7" r="3.2" />
          <path d="M4.4 16.4a5.8 5.8 0 0 1 11.2 0" />
        </svg>
        <span>Profile</span>
      </div>
    </div>
  )
}

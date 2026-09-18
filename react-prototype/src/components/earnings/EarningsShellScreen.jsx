import AppHeader from './AppHeader.jsx'
import UtilityChipRow from '../common/UtilityChipRow.jsx'
import Tabs from '../common/Tabs.jsx'
import LossesTabbedBody from '../losses/LossesTabbedBody.jsx'
import BottomTabBar from './BottomTabBar.jsx'
import PaymentsTabContent from '../payments/PaymentsTabContent.jsx'
import MyEarningsTabContent from './MyEarningsTabContent.jsx'
import './EarningsShellScreen.css'

/** The "home" shell: Earnings header + utility chips + the primary
 * My Earnings/Payments/Losses tab row + a body that swaps with the active tab.
 *
 * Losses is the one segment whose body is not a plain scroll region: it has
 * its own Current Cycle / Historic sub-tabs, so it arrives as one component
 * (`LossesTabbedBody`) that owns the row and the scrolling half beneath it.
 *
 * The chips sit ABOVE the tabs and belong to the shell, not to a tab — they
 * are the same two shortcuts whichever tab you are on (Figma
 * TxIUrBKg7mRQhksWl4IS9y · 1939:25543). They used to be rendered inside each
 * tab's own content, which put them below the tabs, duplicated them in two
 * files, and left the Losses tab without them entirely. */
export default function EarningsShellScreen({ vm }) {
  return (
    <div className="earnings-shell">
      <AppHeader title="Earnings" />
      <UtilityChipRow />
      {/* Primary level — underline (components/common/Tabs.jsx). */}
      <Tabs variant="underline" tabs={vm.earningsSegs} />
      {/* The Losses tab brings its own sub-tab row and its own scroll region,
          because that row has to stay put while the list under it scrolls.
          The other two tabs are a single scrolling body, as before. */}
      {vm.onLossesTab ? (
        <LossesTabbedBody vm={vm} />
      ) : (
        <div className="earnings-shell__scroll fe-scroll">
          {vm.isPayments && <PaymentsTabContent vm={vm} />}
          {vm.isMyEarnings && <MyEarningsTabContent vm={vm} />}
        </div>
      )}
      <BottomTabBar />
    </div>
  )
}

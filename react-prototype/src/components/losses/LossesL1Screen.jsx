import ScreenHeader from '../common/ScreenHeader.jsx'
import LossesTabbedBody from './LossesTabbedBody.jsx'
import './LossesL1Screen.css'

/**
 * Losses as a pushed page — the 'entry-in-earnings' arrangement, where there
 * is no Losses tab and the entry widget on My Earnings is the way in.
 *
 * It is the same surface the tab shows, sub-tabs and all (`LossesTabbedBody`);
 * only the chrome differs — a header with a back arrow instead of a segmented
 * bar and a bottom tab bar. That is the whole difference between the
 * arrangements, and it is why Historic is reachable here too rather than
 * being a thing only the tab arrangements have.
 */
export default function LossesL1Screen({ vm }) {
  return (
    <div className="losses-l1">
      <ScreenHeader title="Losses" onBack={vm.goBackFromLossesL1} />
      <LossesTabbedBody vm={vm} />
    </div>
  )
}

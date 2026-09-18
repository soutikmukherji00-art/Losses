import Tabs from '../common/Tabs.jsx'
import LossesBody from '../earnings/LossesBody.jsx'
import HistoricLossesBody from './HistoricLossesBody.jsx'
import './LossesTabbedBody.css'

/**
 * THE LOSSES SURFACE — the sub-tab row plus whichever half it selects.
 *
 * Losses divide into two questions, and this is the one place that decides
 * which one is being asked:
 *
 *   Current Cycle — "what must I do?"  → the working list (`LossesBody`)
 *   Historic      — "what have losses actually cost me?" → the cycle-grouped
 *                   ledger (`HistoricLossesBody`)
 *
 * It exists as its own component because the surface has two homes — the
 * Losses tab in the shell, and the standalone Losses page in the arrangement
 * that has no tab — and composing it twice is how the two would drift.
 *
 * The sub-tab row only appears where ONE surface holds both halves. With
 * historic hidden there is nothing to switch to, and in the split arrangement
 * the two halves are on two different surfaces — the surface you are on is
 * already the answer, so a row asking again would be a control with one
 * option. See config/lossesStructure.js.
 *
 * Which arrangement is in play is NOT this component's business: it takes a
 * sub-tab list and three flags, never the structure itself.
 */
export default function LossesTabbedBody({ vm }) {
  return (
    <>
      {/* Secondary level — segmented (components/common/Tabs.jsx). */}
      {vm.showLossesSubTabs && <Tabs variant="segmented" tabs={vm.lossesSubTabs} />}
      <div className="losses-surface__scroll fe-scroll">
        {vm.showLossesBody && <LossesBody vm={vm} />}
        {vm.showHistoricBody && (
          <HistoricLossesBody historic={vm.historic} breakup={vm.historicBreakup} />
        )}
      </div>
    </>
  )
}

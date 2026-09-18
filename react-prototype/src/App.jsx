import { useLossesApp } from './state/useLossesApp.js'
import { getPresenterSections } from './app/presenterSections.js'
import PresenterShell from './presenter/PresenterShell.jsx'
import ControlPanel from './presenter/ControlPanel.jsx'
import PhoneFrame from './components/layout/PhoneFrame.jsx'
import EarningsShellScreen from './components/earnings/EarningsShellScreen.jsx'
import LossesL1Screen from './components/losses/LossesL1Screen.jsx'
import PaymentDetailsScreen from './components/payments/PaymentDetailsScreen.jsx'
import CaseDetailScreen from './components/detail/CaseDetailScreen.jsx'
import ReasonSheetOverlay from './components/sheet/ReasonSheetOverlay.jsx'
import AwarenessOverlay from './components/awareness/AwarenessOverlay.jsx'
import ConfirmationPopup from './components/common/ConfirmationPopup.jsx'
import CycleLossesSheet from './components/earnings/CycleLossesSheet.jsx'
import InsightSheet from './components/losses/InsightSheet.jsx'
import HistoricBreakupSheet from './components/losses/HistoricBreakupSheet.jsx'
import ImageViewer from './components/common/ImageViewer.jsx'
import { ListRowDesignProvider } from './components/common/ListRowDesign.jsx'

/**
 * Root component — composition only.
 *
 * Note how few surfaces there are: every loss detail page, for every loss type
 * and every lifecycle state, is the one `CaseDetailScreen`. That's the point of
 * the `f(reasonCode, caseState)` architecture — see
 * Design System/LOSS_DETAIL_ARCHITECTURE_AUDIT.md.
 *
 * `LayerVisibilityProvider` wraps this component from `main.jsx`, not here —
 * `useLossesApp` itself reads a layer's visibility (the cool-off layer; see
 * CONFIG_REFERENCE.md § Layer visibility), so this component has to be a
 * *descendant* of the provider, not the one rendering it.
 */
export default function App() {
  const { state, vm, actions } = useLossesApp()

  return (
    <PresenterShell
      stage={
        /* One line-item design for every ListRow on every surface — the
           list, the ledger and the sheets over them (config/
           lineItemDesigns.js). */
        <ListRowDesignProvider design={vm.lineItemDesign}>
          <PhoneFrame>
            {vm.inShell && <EarningsShellScreen vm={vm} />}
            {vm.inLossesL1 && <LossesL1Screen vm={vm} />}
            {vm.showCaseDetail && <CaseDetailScreen vm={vm} />}
            {vm.inPaymentDetail && <PaymentDetailsScreen vm={vm} />}
            {/* Accept/dispute is either a pushed page or a sheet over the case
                it belongs to — see "Accept / Dispute presentation". Both render
                the same form; only the chrome differs. */}
            {vm.showReasonSheet && <ReasonSheetOverlay vm={vm} />}
            {vm.showAwareness && <AwarenessOverlay vm={vm} />}
            {vm.showCycleLossesSheet && <CycleLossesSheet sheet={vm.cycleLossesSheet} />}
            {vm.showBreakupSheet && <HistoricBreakupSheet breakup={vm.historicBreakup} />}
            {vm.insightSheet && <InsightSheet insight={vm.insightSheet} />}
            {/* An evidence photo at full size, over whatever raised it. Above
                the sheets and below the confirmation popup — see
                ImageViewer.css. */}
            {vm.photoViewer && <ImageViewer photo={vm.photoViewer} />}
            {/* Raised by whichever flow just submitted, over whatever screen it
                landed on — see config/confirmations.js. `key` so a second
                confirmation gets its own 3-second timer rather than inheriting
                what is left of the first one's. */}
            {vm.confirmation && (
              <ConfirmationPopup
                key={vm.confirmation.id}
                headline={vm.confirmation.headline}
                byline={vm.confirmation.byline}
                onClose={vm.dismissConfirmation}
              />
            )}
          </PhoneFrame>
        </ListRowDesignProvider>
      }
      controlPanel={
        <ControlPanel title="Prototype controls" sections={getPresenterSections({ state, actions, vm })} />
      }
    />
  )
}

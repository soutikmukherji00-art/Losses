import Section, { SectionRow } from '../common/Section.jsx'
import ActionBar from '../common/ActionBar.jsx'
import AudioChip from '../common/AudioChip.jsx'
import ScreenHeader from '../common/ScreenHeader.jsx'
import StatusHero from './StatusHero.jsx'
import PhotoEvidenceGroup from './PhotoEvidenceGroup.jsx'
import StatusTracker from './StatusTracker.jsx'
import MoneyRemedyBlock from './MoneyRemedyBlock.jsx'
import AddYourSideCard from './AddYourSideCard.jsx'
import RecoveryActionCard from './RecoveryActionCard.jsx'
import ReturnedClaimSheet from './ReturnedClaimSheet.jsx'
import CatalogImagesLayer from '../common/CatalogImagesLayer.jsx'
import './CaseDetailScreen.css'

/**
 * THE L1 TEMPLATE — the single loss detail page for every loss type and every
 * lifecycle state. It renders its slots in a fixed order and asks no
 * questions about *which* loss this is: `vm.caseView` (from resolveCaseView)
 * has already decided what each slot holds.
 *
 * That fixed order is the IA promise: a Pilot meeting a brand-new loss type
 * still meets a page shaped exactly like the one they already know.
 *
 * Each slot is a Section — a full-bleed white block on the app's grey ground,
 * separated from its neighbours by 4px of that ground. That is the sectioning
 * device of this design language (Figma WCghUzecsonToq8dCxpm3W · 1636:20763);
 * the page used to stack outlined rounded cards instead, which gave every
 * block the same weight and read as a list of boxes rather than a document.
 *
 * A new loss type must never add a branch to this file.
 */
export default function CaseDetailScreen({ vm }) {
  const v = vm.caseView

  return (
    <div className="case-detail">
      {/* 1 · identity */}
      <ScreenHeader
        title={v.identity.title}
        sub={v.identity.sub}
        onBack={vm.goBackFromCase}
        divider={false}
      />

      <div className="case-detail__scroll fe-scroll">
        {/* 2 · status — tone is set by money position, never by severity */}
        <Section panel>
          <StatusHero {...v.banner} />
        </Section>

        {/* 3 · money & remedy — payment pointer / recovery / credit pair */}
        {v.moneyBlock && <MoneyRemedyBlock money={v.moneyBlock} />}

        {/* 4 · evidence — reason-driven; an empty set is a designed state.
            The catalog row is the last group in that set when its layer is on
            (resolveCaseView's buildEvidence). The <Layer> is mounted
            unconditionally and renders nothing: it is here to put the toggle
            in the panel on every loss page, including the ones carrying no
            evidence at all, where the row would be the section's only group. */}
        <CatalogImagesLayer />
        {v.evidence.length > 0 && <PhotoEvidenceGroup groups={v.evidence} onOpen={vm.openPhoto} />}

        {/* 5 · explanation — the case narrative, and what to do differently.
            Prevention is a sub-group here rather than a section of its own:
            given its own heading and its own white block it read as a second
            topic, when it is the same topic's last sentence — this is what
            happened, and this is how it doesn't happen again. */}
        <Section title={v.explanation.head} action={<AudioChip size="sm" />}>
          <div className="case-detail__prose">{v.explanation.value}</div>

          {/* The narrative sub-group says either one thing in prose (what the
              team decided, what happened to the money) or a list of recorded
              answers — the pickup questionnaire behind a wrong pickup. Rows,
              not a paragraph: a Pilot looking for what he said about the
              colour has to be able to land on that line. Same label/value row
              the Payment Details screen uses, so it is not a new object. */}
          {v.secondary && (
            <div className="sec__group">
              <div className="sec__group-title"><span>{v.secondary.head}</span></div>
              {v.secondary.rows
                ? v.secondary.rows.map((r) => (
                    <SectionRow key={r.label} label={r.label} value={r.value} />
                  ))
                : <div className="case-detail__prose">{v.secondary.value}</div>}
            </div>
          )}

          {v.prevention && (
            <div className="sec__group">
              <div className="sec__group-title"><span>{v.prevention.head}</span></div>
              <ol className="case-detail__steps">
                {v.prevention.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </div>
          )}
        </Section>

        {/* 6 · progress */}
        {v.tracker && <StatusTracker title={v.tracker.title} steps={v.tracker.steps} />}

        {/* 7 · action — the EXPLANATION half, for the modes that still need
            one. The controls are in the sticky ActionBar below, outside the
            scroll.

            'offers' has no block here any more: a "What to do" section that
            spelled out Accept and Dispute in prose restated the hero's own
            guidance line and then named the same two things the bar names,
            one scroll further down. The choice is legible without it.

            KRD F9's silence consequence went with it. The hero already holds
            all three of its facts — the figure (₹145), the countdown chip
            (3 days left) and the statement ("Not deducted yet.") — so a pill
            spelling them back out as a sentence was the same warning twice,
            once at the top of the page and once at the bottom. */}
        {v.action?.mode === 'add_side' && <AddYourSideCard vm={vm} />}
        {v.action?.mode === 'recovery' && <RecoveryActionCard action={v.action} />}

        {/* 9 · consequence / closure */}
        {v.footer && <div className="case-detail__foot">{v.footer}</div>}
      </div>

      <ActionBar buttons={actionButtons(v.action, vm)} note={actionNote(v.action)} />

      {vm.showReturnedClaim && <ReturnedClaimSheet view={v} vm={vm} />}
    </div>
  )
}

/**
 * The bar's contents are a function of the same `action` object the section
 * reads, so the two can never disagree about which choices exist. Labels are
 * one word wherever the language allows: the section above has already said
 * what each one means, so the button only has to name it.
 */
function actionButtons(action, vm) {
  if (!action) return []

  if (action.mode === 'offers') {
    // DISPUTE IS ALWAYS SECONDARY, and in the Only Dispute variant that
    // leaves the bar with no primary button at all. That is the decision,
    // not an oversight: a dispute is a claim a Pilot makes about their own
    // parcel, and it commits them to a review they then wait on and can
    // lose — twice in a row and the cool-off pauses the third
    // (config/disputeCoolOff.js). A solid navy CTA is how this app says
    // "this is the move"; putting Dispute in one would be the app nudging
    // a Pilot into filing, and it would also make the same button change
    // rank between two flows that offer the identical action.
    //
    // It used to promote itself whenever Accept was absent, on the reasoning
    // that a bar owes a primary. A bar owes a primary when there is a
    // commit to make; here there is one thing the Pilot may do, and an
    // outlined control says do it if you mean to, which is the truth.
    //
    // Paused, the button is still the Dispute button: same word, greyed. The
    // label used to become "Paused till 28 Aug", which made the control name
    // its own unavailability and left the Pilot without the word they came
    // looking for — you cannot find a disabled Dispute button if it no longer
    // says Dispute. The date moved to the bar's note (actionNote below).
    return [
      (action.canDispute || action.disputePaused) && {
        label: 'Dispute',
        variant: 'secondary',
        disabled: action.disputePaused,
        onClick: action.disputePaused ? undefined : vm.openDispute,
      },
      action.canAccept && { label: 'Accept', variant: 'primary', onClick: vm.openAccept },
    ]
  }

  if (action.mode === 'recovery') {
    // Only reachable while the claim hasn't been made: making it moves the
    // case to LIF_CLAIM_SENT, which offers no action at all.
    return [{ label: action.primaryLabel, variant: 'primary', onClick: vm.openReturnedClaim }]
  }

  if (action.mode === 'add_side') {
    return [{
      label: vm.sideLabel,
      variant: 'primary',
      disabled: !vm.sideText.trim() || vm.sideSent,
      onClick: vm.submitSide,
    }]
  }

  return []
}

/**
 * The line above the bar, for a control that is present but unpressable.
 *
 * Cool-off is the only such case. When the pause ends before this loss
 * settles, the date is a promise the Pilot can act on. When it outlasts the
 * case, "you can dispute again on 28 Aug" is true and useless — the money
 * goes on the 20th — so the note says that instead of leaving the Pilot to
 * compare two dates himself.
 */
function actionNote(action) {
  if (!action || action.mode !== 'offers' || !action.disputePaused) return null

  return action.coolOffOutlastsCase
    ? `Disputing is paused till ${action.coolOffEnds} — past ${action.deductionOn}, when this loss is settled.`
    : `Disputing is paused till ${action.coolOffEnds}.`
}

export { SectionRow }

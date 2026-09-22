import Section, { SectionRow } from '../common/Section.jsx'
import ActionBar from '../common/ActionBar.jsx'
import AudioChip from '../common/AudioChip.jsx'
import ScreenHeader from '../common/ScreenHeader.jsx'
import StatusHero from './StatusHero.jsx'
import PhotoEvidenceGroup from './PhotoEvidenceGroup.jsx'
import StatusTracker from './StatusTracker.jsx'
import MoneyRemedyBlock from './MoneyRemedyBlock.jsx'
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

  const scrollToEducation = () => {
    document.getElementById('case-detail-education')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="case-detail">
      {/* 1 · header — generic on purpose (design call, 21 Sep). The loss's
          own name used to live here; it now heads the first section of the
          body instead, so a pushed page always opens on the same bar
          whatever kind of loss it is about to explain. */}
      <ScreenHeader title="Loss Detail" onBack={vm.goBackFromCase} />

      <div className="case-detail__scroll fe-scroll">
        {/* 2 · THE LOSS — the reason IS the section head (a "What happened"
            label over it was the question the head already answers), a step
            up from the other heads because it is the page's anchor, the thing
            the list row promised. The AWB is its byline; the prose is the
            sentence behind the name. It leads the page, ahead of the money,
            because the figure only means something once a Pilot knows what
            it is for.

            The jump link takes a Pilot who already knows the story straight
            to Education without scrolling past the money and the proof. */}
        <Section lead title={v.identity.title} action={<AudioChip size="sm" />} ftux="what-happened">
          <div className="case-detail__awb">{v.identity.sub}</div>
          <div className="case-detail__prose">{v.explanation.value}</div>

          {v.explanation.jumpToEducation && (
            <button type="button" className="case-detail__jump" onClick={scrollToEducation}>
              How to avoid this
            </button>
          )}
        </Section>

        {/* 3 · money — figure, byline, clock, and the one "what now" line
            with its सुनें. Neutral card in every state; tone lives on the
            figure and its byline, and on the badge while a clock runs. */}
        <Section panel ftux="money">
          <StatusHero {...v.banner} />
        </Section>

        {/* 4 · money & remedy — payment pointer / recovery / credit pair */}
        {v.moneyBlock && <MoneyRemedyBlock money={v.moneyBlock} />}

        {/* 5 · WHERE THE CASE STANDS — the dispute-to-resolution timeline,
            ABOVE the proof (design call, 22 Sep).

            It used to sit below the photos, the answers and the lesson, which
            put the one thing a Pilot opens a "Team is checking" or a decided
            dispute to find out — what has happened to it, and what happens
            next — at the bottom of a page they had to scroll three sections
            of reference material to reach. The evidence and the lesson are
            what the case is ABOUT; the timeline is where it IS. Once a case
            has a process running on it, where it is outranks what it is
            about.

            Unconditional rather than a branch on "is this a dispute": a
            tracker only exists on a case that has one (resolveCaseView's
            tracker slot — a live state's own, or the one a Pilot's accept or
            dispute left behind), so the cases the design call names are
            exactly the cases this moves, and every other page is unchanged.
            A branch here would also break this file's one invariant: the slot
            order never varies by loss type or state. */}
        {v.tracker && <StatusTracker title={v.tracker.title} steps={v.tracker.steps} />}

        {/* 5b · the verdict — what the team decided, or what happened to the
            money. Directly under the timeline, as its own section: it is the
            last step of that log said in full, so it travels with it. */}
        {v.narrative && (
          <Section title={v.narrative.head} action={<AudioChip size="sm" />}>
            <div className="case-detail__prose">{v.narrative.value}</div>
          </Section>
        )}

        {/* 6 · evidence — reason-driven; an empty set is a designed state.
            The catalog row is the last group in that set when its layer is on
            (resolveCaseView's buildEvidence). The <Layer> is mounted
            unconditionally and renders nothing: it is here to put the toggle
            in the panel on every loss page, including the ones carrying no
            evidence at all, where the row would be the section's only group. */}
        <CatalogImagesLayer />
        {v.evidence.length > 0 && <PhotoEvidenceGroup groups={v.evidence} onOpen={vm.openPhoto} />}

        {/* 6b · the Pilot's own answers — the pickup questionnaire behind a
            wrong pickup, its own section between the proof and the lesson.
            Rows, not a paragraph: a Pilot looking for what he said about the
            colour has to be able to land on that line. Same label/value row
            the Payment Details screen uses, so it is not a new object. */}
        {v.answers && (
          <Section title={v.answers.head} action={<AudioChip size="sm" />}>
            {v.answers.rows
              ? v.answers.rows.map((r) => (
                  <SectionRow key={r.label} label={r.label} value={r.value} />
                ))
              : <div className="case-detail__prose">{v.answers.value}</div>}
          </Section>
        )}

        {/* 7 · education — its own slot now, target of "What happened"'s
            jump link. It used to be a sub-group of that section; giving it
            its own heading and audio control puts it on equal footing with
            every other block the Pilot is asked to read, not just the one
            money and evidence sit between. Last on the page because it is the
            only block about the NEXT loss rather than this one. */}
        {v.education && (
          <div id="case-detail-education">
            <Section title={v.education.head} action={<AudioChip size="sm" />}>
              <ol className="case-detail__steps">
                {v.education.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </Section>
          </div>
        )}

        {/* 9 · action — the EXPLANATION half, for the modes that still need
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
            once at the top of the page and once at the bottom.

            'add_side' has no block here either (design call, 22 Sep). A wrong
            pickup used to carry an "Add your side (optional)" card with its
            own textarea and its own greyed Submit — a SECOND way to say
            something about the loss, sitting one scroll above the Dispute
            button that opens a sheet asking the same question with the same
            free-text field. Two inputs for one sentence is a choice the Pilot
            has to make before they can write anything, and the one that
            reaches the team is the sheet. So the page keeps one way in, the
            same one every other loss type has: Dispute. */}
        {v.action?.mode === 'recovery' && <RecoveryActionCard action={v.action} />}

      </div>

      <ActionBar buttons={actionButtons(v.action, vm)} note={actionNote(v.action)} ftux="action-bar" />

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

  // 'add_side' carries ONE control, and it is the pseudo dispute (WRONG_RVP's
  // `actions`) in the same outlined rank as every other Dispute button. The
  // page used to carry a second one — a "Submit" for an optional note, inside
  // its own card next to the field — which made a wrong pickup the only loss
  // type in the app with two ways to tell us something. The sheet behind
  // Dispute has the same free-text field and actually reaches the team, so it
  // is the one that stayed (design call, 22 Sep).
  if (action.mode === 'add_side') {
    return [action.canDispute && { label: 'Dispute', variant: 'secondary', onClick: vm.openDispute }]
  }

  return []
}

/**
 * The line above the bar, for a control that is present but unpressable.
 *
 * Cool-off is the only such case, and the money card's guidance already
 * states the pause and its date. This note exists for the one fact that
 * line cannot carry: when the pause outlasts the case, "you can dispute
 * again on 28 Aug" is true and useless — the money goes on the 20th — so the
 * bar says so, beside the greyed button, instead of leaving the Pilot to
 * compare two dates himself. When the pause ends in time, the card has
 * already said everything and the bar says nothing twice.
 */
function actionNote(action) {
  if (!action || action.mode !== 'offers' || !action.disputePaused) return null
  if (!action.coolOffOutlastsCase) return null

  return `The pause runs past ${action.deductionOn}, when this loss is settled.`
}

export { SectionRow }

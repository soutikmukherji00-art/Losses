import { getReason } from '../config/lossReasons.js'
import { getCaseState, ACTION_BLOCKS } from '../config/caseStates.js'
import { addDays, fmt, parseShortDate, TODAY } from './helpers.js'
import { productImage } from './productImages.js'

/**
 * THE TEMPLATE. Every loss detail page (L1) in the app is this function's
 * output: `L1 = f(reasonCode, caseState)`.
 *
 * The slot order below is the IA invariant — it never varies by loss type, so
 * a Pilot meeting a brand-new loss type still meets a page shaped like the one
 * they already know. Each (reason, state) pair only decides whether a slot
 * fills and with what:
 *
 *   1 identity     · reason        — FE name + AWB
 *   2 banner       · state         — tone + money statement
 *   3 money        · reason+state  — credit pair (LiF returned); absent otherwise
 *   4 evidence     · reason        — photo groups; [] is a designed state
 *   5 explanation  · reason        — what happened (+ narrative + prevention)
 *   6 tracker      · state         — 3-step progress, awaiting states only
 *   7 action       · reason∩state  — offers / paused / add-side / recovery / none
 *   9 footer       · state         — consequence or closure statement
 *
 * Prevention is the page's only forward-looking block, and it is a sub-group
 * of slot 5 rather than a slot of its own: what happened and how it doesn't
 * happen again are one topic, and a separate white block with its own heading
 * announced them as two. Slot 8 is therefore gone; the numbering keeps its
 * gap so the surviving slots don't renumber under readers of this file.
 *
 * Money sits at 3 (design call, 10 Sep): after the Pilot reads what happened
 * to their money, where that money now sits is the next thing they need —
 * ahead of the proof and the explanation.
 *
 * See Design System/LOSS_DETAIL_ARCHITECTURE_AUDIT.md §4 for the full spec.
 */
export function resolveCaseView({ record, stateId, ctx = {} }) {
  const reason = getReason(record.reasonCode)
  const state = getCaseState(stateId || record.caseState)

  const c = {
    record,
    reason,
    state,
    amount: fmt(record.amt),
    replyDays: ctx.replyDays ?? 7,
    // `record.days` was being read as two different clocks depending on the
    // state — days until the money is cut, and days until the team replies.
    // Same key, opposite meanings, one mock record away from a wrong number
    // on screen. Both readings are named here; states use the one they mean.
    daysToDeduction: record.days,
    daysToReply: record.days,
    daysToHubCheck: record.days,
    coolOffEnds: ctx.coolOffEnds ?? '28 Aug',
    // The payment the money actually left on, for the states that send the
    // Pilot to the Payments tab to see it. Null until it has moved.
    debitedOn: record.debitDate || null,
    // The day this case is decided by silence. Cool-off used to print a bare
    // reopen date with nothing to measure it against, so the screen could
    // promise a reopening days after the money was already gone.
    deductionOn: addDays(ctx.today ?? TODAY, record.days),
    // Only Dispute flow — see buildAction's `canAccept`.
    onlyDispute: ctx.onlyDispute ?? false,
    // The grace window (config/gracePeriod.js). GRACE_WAIVED is the only
    // state that reads these, because it is the only place in the app the
    // window is ever mentioned — see state/grace.js.
    graceWeeks: ctx.grace?.weeks ?? 4,
    graceEndsOn: ctx.grace?.endsOn ?? '',
  }

  // ONE money statement, read by the hero below and by the list row via
  // `listMoney`. See the money grammar in config/caseStates.js — these were
  // separate declarations and they drifted.
  const money = state.money(c)

  const moneyBlock = buildMoneyBlock(reason, state, c)

  return {
    reasonCode: reason.code,
    stateId: state.id,
    money: reason.money,
    amount: c.amount,
    awb: record.awb,

    // 1 — identity. A row may carry a narrower FE-facing name than the reason
    // code's default (e.g. "Parcel picked from wrong seller" under WRONG_RVP).
    identity: {
      title: record.feNameOverride || reason.feName,
      sub: 'AWB ' + record.awb,
    },

    // 2 — status banner
    // The money and the clock are the two facts that decide this page, so
    // they are their own fields rather than words inside the sentence — the
    // banner can then typeset them at the rank they actually hold.
    // Five fields, and the state table owes an answer for all of them — see
    // the hero contract at the top of config/caseStates.js. They are separate
    // fields rather than one sentence so the hero can typeset each at the
    // rank it holds, and so a state cannot quietly drop one.
    banner: {
      tone: state.tone,
      mark: state.mark || null,
      figure: money.amount,
      // What the figure WAS, struck, on the states where the outcome changed
      // it — the stake and the result in one reading.
      figureWas: money.was || null,
      chip: state.chip ? state.chip(c) : null,
      text: state.statement(c),
      // What the Pilot can do about it. The controls stay in the sticky
      // ActionBar at the foot of the page; this is the line that tells them
      // there is something down there — or that there isn't.
      guidance: state.guidance ? state.guidance(c) : null,
    },

    // 3 — money & remedy. Sits here, above the proof and the explanation:
    // after reading what happened to their money, where that money now sits
    // is the next thing the Pilot needs (design call, 10 Sep).
    moneyBlock,

    // 4 — evidence (reason-driven; [] is a legitimate, designed state)
    evidence: buildEvidence(reason, record, ctx.catalogImages ?? false),

    // 5 — explanation. A row may override the registry default when the
    // narrative is case-specific (LiF carries dates, for instance); the
    // registry is the default, per KRD "mappings are config".
    explanation: {
      head: 'What happened',
      value: record.explain || reason.explain,
      audio: true,
    },
    // One generic narrative slot for the two things a case can additionally
    // say: what the team decided (resolved states) or what the Pilot recorded
    // at the time (info-only cases — KRD F24 "shows the Pilot's recorded
    // responses"). Not per-screen special-casing; whichever field exists wins.
    secondary: buildSecondary(state, record, c),

    // 6 — progress tracker
    tracker: state.tracker ? buildTracker(state.tracker, c) : null,

    // 7 — action block
    action: buildAction(reason, state, c),

    // Prevention. Renders as slot 5's last sub-group — the only forward-
    // looking thing on the page. Its content is the reason's own `prevention`
    // block — the same deck the contextual insight banner reads, so a Pilot
    // cannot be told two different things about one habit.
    prevention: buildPrevention(reason, state),

    // 9 — consequence footer
    footer: state.footer(c),

    // extras the surrounding chrome needs
    outcomeLabel: state.label,
    // Whether this case's money lands in the current payout cycle — the
    // earnings surfaces read it to decide what the cycle figure owes.
    settlesThisCycle: !!state.settlesThisCycle,
    listChip: state.listChip ? state.listChip(c) : null,
    // The same statement the hero above is rendering, so the row and the page
    // cannot disagree about one case's money.
    listMoney: money,
  }
}

/**
 * Slot 5's prevention sub-group. Every reason carries a `prevention` block, so
 * this is present on almost every page — the exception is a case resolved in
 * the Pilot's favour, where the state sets `hidesPrevention` and telling them
 * to do better would contradict the verdict we just gave them.
 *
 * "Next time" rather than "How to avoid this next time": the page's other
 * headings are two or three plain words — What happened, What you did, What
 * the team decided — and a heading that explains itself in six stopped
 * matching them. The steps beneath already say what avoiding it takes. It is
 * also the word the accept sheet has always used for the same advice
 * (ReasonSheetBody, KRD F7), so the app now names this one thing one way.
 */
function buildPrevention(reason, state) {
  const steps = reason.prevention?.steps
  if (state.hidesPrevention || !steps?.length) return null
  return { head: 'Next time', steps, audio: true }
}

/**
 * Slot 5's narrative block. One hardcoded heading used to sit above every
 * `record.outcome`, so a silence timeout and a Pilot's own parcel return were
 * both reported as things "the team decided" — process fiction on the two
 * pages an angry Pilot is most likely to be reading. Each state now declares
 * its own author, or declines the block when the banner already said it.
 */
const NARRATIVE_HEADS = {
  team: 'What the team decided',
  money: 'What happened to the money',
  you: 'What you did',
}

function buildSecondary(state, record, c) {
  if (record.outcome) {
    const kind = state.outcomeNarrative ? state.outcomeNarrative(c) : 'team'
    if (!kind) return null
    return { head: NARRATIVE_HEADS[kind], value: record.outcome, audio: true, muted: true }
  }
  // KRD F24's "shows the Pilot's recorded responses", in the shape the real
  // extract actually has them: the wrong-RVP feed records a pickup as a short
  // questionnaire — category, colour, design, damage, quantity — and stores
  // each question with the answer the Pilot chose that day.
  //
  // WHY ROWS RATHER THAN A SENTENCE. The one thing this page has to make
  // legible is "you were asked, and this is what you said", and a paragraph
  // running five answers together ("you said same category, same colour, same
  // design…") is the one form in which a Pilot cannot find his own answer to
  // the question he is arguing about. Each answer gets its own line, with the
  // check on the left and what he chose on the right — the label/value row the
  // Payment Details screen already uses for exactly this reading ("which line
  // is mine, and what does it say").
  //
  // NOTHING IS MARKED RIGHT OR WRONG. The feed attributes the wrong pickup to
  // the shipment as a whole; it does not say which of the five checks was
  // misanswered. A tick or a cross beside any one line would be the app
  // inventing a finding it was never given — and on the rows where the Pilot
  // DID flag a difference ("Different Colour") it would be inventing the
  // opposite of one. The answers are reported; the photographs above make the
  // case.
  //
  // The set is variable-length in the real data (a pickup can be asked four
  // questions, not five), so this renders whatever the record carries and
  // never a fixed five.
  if (record.answers?.length) {
    return {
      head: 'Your answers that day',
      rows: record.answers.map(({ q, a }) => ({ label: q, value: a })),
    }
  }
  // The older single-string form, still what the mock fixture carries.
  if (record.answer) return { head: 'Your answers that day', value: record.answer }
  return null
}

/**
 * Which dummy item a group shows. `own` is the row's own item — the same photo
 * the L0 list shows for this AWB, so the page opens on something the Pilot
 * recognises. Every counterparty group (`qc`, `catalog`) is deliberately a
 * DIFFERENT item: on a mismatch the whole claim is that the two photos are not
 * the same product, and showing one product twice would say the opposite.
 */
const EVIDENCE_ITEM_OFFSET = { own: 0, qc: 1, catalog: 1 }

/**
 * How many photos the product listing contributes when the catalog layer is
 * on. More than fits the row on purpose: at 30% a tile each, the fourth is
 * half-visible at the right edge, which is what tells a Pilot the row scrolls.
 *
 * The prototype's dummy catalogue only holds three distinct shots, so these
 * cycle; a real listing supplies this many different angles of the one item.
 */
const CATALOG_IMAGE_COUNT = 6

/**
 * The product-listing photo row (layer `losses-list.catalogImages`).
 *
 * It starts at the same offset the reason-declared `catalog` group uses, so on
 * a wrong-pickup the first tile is the exact catalog photo that group was
 * already showing beside "Photo at pickup" — the comparison the page is built
 * on is preserved, and the row simply carries on past it.
 */
const catalogGroup = (record) => ({
  title: 'Catalog photos',
  // The one group that overflows its row instead of dividing it.
  scroll: true,
  items: Array.from({ length: CATALOG_IMAGE_COUNT }, (_, n) => ({
    label: `Catalog ${n + 1}`,
    src: productImage(record.awb, EVIDENCE_ITEM_OFFSET.catalog + n) || null,
  })),
})

/** F8: image set per reason-code mapping. Missing images → placeholder, never a blocked row. */
function buildEvidence(reason, record, showCatalog) {
  // With the layer on, the listing row REPLACES any single `catalog` tile the
  // reason declared: it opens on that same photo and then shows five more, so
  // keeping both would put the identical image on the page twice.
  const declared = showCatalog
    ? reason.evidence.filter((group) => group.group !== 'catalog')
    : reason.evidence

  const groups = declared.map((group) => ({
    title: group.title,
    items: Array.from({ length: group.count }, (_, n) => ({
      // A single-photo group names what the photo IS; multi-photo groups
      // number them (repeating the group title would just read twice).
      label: group.itemLabel || (group.count === 1 ? 'Photo' : `Photo ${n + 1}`),
      // Real sources would come off the record; the prototype falls back to a
      // dummy product photo, and to the striped placeholder only when even
      // that is missing (KRD F8's "image missing" state).
      src: (record.photos && record.photos[group.group] && record.photos[group.group][n])
        || productImage(record.awb, EVIDENCE_ITEM_OFFSET[group.group] ?? 0)
        || null,
    })),
  }))

  // Below the photos of what actually happened — the listing is reference, not
  // evidence, so it never leads. On a reason that carries no evidence at all
  // ([] is a designed state) it becomes the section's only group, which is why
  // the slot's own `evidence.length > 0` guard still does the right thing.
  return showCatalog ? [...groups, catalogGroup(record)] : groups
}

function buildTracker(kind, c) {
  const { record, replyDays } = c
  const isDispute = kind === 'dispute'

  const steps = [
      {
        label: isDispute ? 'Dispute sent' : 'Accepted, with your reason',
        meta: record.actedOn,
        done: true,
      },
      {
        label: 'Your reason',
        meta: '“' + (record.actedReason || '—') + '”',
        done: true,
      },
      isDispute
        ? {
            label: 'Decision expected',
            meta: `By ${addDays(record.actedOn, replyDays)} · If right: ₹0 · If wrong: the full ${fmt(record.amt)}`,
            done: false,
          }
        : {
            // KRD F7 + §6d copy correction: an accepted case gets NO dated
            // reply promise — only "before your payout".
            label: 'Decision before your payout',
            meta: 'Review can still stop the deduction. We will tell you the result first.',
            done: false,
          },
  ]

  // The rail belongs BETWEEN dots, so the last step has none; a segment is lit
  // only when the step it leads to is also done.
  return {
    title: isDispute ? 'Your dispute' : 'Your accepted case',
    steps: steps.map((step, i) => ({
      ...step,
      isLast: i === steps.length - 1,
      nextDone: i < steps.length - 1 && steps[i + 1].done,
    })),
  }
}

/**
 * Slot 3. One shape left: `creditPair` — LiF returned, the debit row stays and
 * the credit is added beside it (KRD F19's bank-statement rule).
 *
 * Two others have been taken out, both for the same reason — a section here
 * was saying what the hero had already said:
 *  · `recovery` — "Get your ₹40 back", carrying LiF's return-to-hub
 *    instruction (KRD F18). Word for word the hero's guidance line.
 *  · `pointer` — "Where this money went · In your 12 Aug payment ·
 *    Adjustments → Shipment Loss for Junk/Mismatch". A filing reference, and
 *    the breadcrumb was more precision than a Pilot standing on a doorstep
 *    can use. DEBITED's guidance line now says it as a sentence, and F27's
 *    deep-link — never wired here, there was no target surface — is a better
 *    answer to the same need if it ever lands.
 *
 * `reason.paymentLine` is still load-bearing: paymentBreakdown.js builds the
 * Payments tab from it, so the deduction really is where the sentence says.
 */
function buildMoneyBlock(reason, state, c) {
  const { record } = c
  const block = {}

  if (state.showsCreditPair) {
    block.creditPair = {
      debit: { label: 'Deducted', amount: `- ${c.amount}`, date: record.debitDate },
      credit: { label: 'Credited back', amount: `+ ${c.amount}`, date: record.creditDate },
    }
  }

  return Object.keys(block).length ? block : null
}

function buildAction(reason, state, c) {
  const mode = state.actionBlock

  if (mode === ACTION_BLOCKS.NONE) return null

  // A state may offer an action the reason doesn't have (or vice versa) — the
  // intersection wins, so an info-only reason can never surface accept/dispute
  // however it's reached.
  const allowed = (a) => reason.actions.includes(a)

  if (mode === ACTION_BLOCKS.OFFERS || mode === ACTION_BLOCKS.OFFERS_DISPUTE_PAUSED) {
    if (!allowed('accept') && !allowed('dispute')) return null
    return {
      mode: 'offers',
      amount: c.amount,
      // Only Dispute (KRD variant, see CONFIG_REFERENCE.md) removes the
      // accept path everywhere it would otherwise appear — this is the one
      // place that decides it, so every reader of `action.canAccept` (the
      // ActionBar, the sheet route) agrees automatically.
      canAccept: allowed('accept') && !c.onlyDispute,
      canDispute: allowed('dispute') && mode === ACTION_BLOCKS.OFFERS,
      disputePaused: mode === ACTION_BLOCKS.OFFERS_DISPUTE_PAUSED && allowed('dispute'),
      coolOffEnds: c.coolOffEnds,
      // Whether the pause outlives this case. When it does, telling the Pilot
      // "dispute opens again on 28 Aug" is true and useless — the money is
      // gone on the 20th.
      coolOffOutlastsCase: parseShortDate(c.coolOffEnds) > parseShortDate(c.deductionOn),
      deductionOn: c.deductionOn,
    }
  }

  if (mode === ACTION_BLOCKS.ADD_SIDE && allowed('add_side')) {
    return { mode: 'add_side' }
  }

  if (mode === ACTION_BLOCKS.RECOVERY && reason.remedy?.kind === 'hub_return') {
    // Slot 7 for Lost in Field. Until RecoveryActionCard existed this object
    // was built and never rendered, leaving the one recoverable state with no
    // tappable element at all.
    return {
      mode: 'recovery',
      hint: 'Already given the parcel back? Tell us and we will check the hub scan.',
      primaryLabel: 'I already returned it',
    }
  }

  return null
}

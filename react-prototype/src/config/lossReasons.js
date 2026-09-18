/**
 * REASON REGISTRY — axis 1 of `L1 = f(reasonCode, caseState)`.
 *
 * This is the whitelisted-reasons config the KRD requires:
 *   NFR-5 — "reasons rendered are controlled by a whitelisted-reasons array
 *   (config); the list may grow to ~10 without redesign."
 * Business owns these mappings (KRD §6f: "Reason-code → tip and → image-set
 * mappings (config)").
 *
 * ADDING A LOSS TYPE = ADDING A ROW HERE. No new screen, no new branch in the
 * controller, no new visual treatment. If the new type needs a remedy the app
 * doesn't have yet, that's one new `remedy.kind` + one L2 intent — see
 * Design System/LOSS_DETAIL_ARCHITECTURE_AUDIT.md §4h.
 *
 * Source of the five canonical rows: KRD final-page table (reason → source →
 * image set) + the naming call that "Delivery photo not clear" is ICUD junk.
 *
 * WHERE THE COPY COMES FROM. `masterReason`, `debitableEntity`, `explain`,
 * `tip` and every evidence group's `count` / `source` are transcribed from
 * "External Memory/Debit reason master table.xlsx", sheet 1 — columns
 * "Debit reason", "Debitable entity", "Short Description", "Tip",
 * "imagess to show" and "Total images count". The master table holds twelve
 * rows; these five are every row whose debitable entity is the last-mile FE,
 * which is whose app this is. The other seven are debited to LM hub QC, FM or
 * FM QC and would be showing a Pilot money that never leaves their hands.
 *
 * `masterReason` and `debitableEntity` render nowhere. They are here so that
 * the next person holding that spreadsheet can line it up against this file
 * row by row and see which of the twelve are covered.
 *
 * `prevention.steps` IS the sheet's Tip, one step per sentence. The Tip and
 * the steps are rendered under the same heading — "Next time", on the loss
 * page and in the accept sheet both, which is the design's deliberate "the
 * app names this one thing one way" (see `buildPrevention` in
 * state/resolveCaseView.js). So they cannot be sourced differently: keeping
 * the prototype's own three-step decks while the Tip came off the sheet put
 * two different sets of words under one heading. The steps are therefore
 * shorter than they were, and they are what the business signed off.
 *
 * Two fields are deliberately NOT the sheet's:
 *  · `feName` — the sheet's "Debit reason" is the internal name of the debit
 *    ("ICUD images junk"); these are what a Pilot reads. Kept as designed.
 *  · `prevention.habits` — the insight banner's two-or-three-word reminders
 *    ("light the parcel · hold phone still"). No column in the sheet is that
 *    register, so per the "keep prototype data where the sheet is silent"
 *    rule they stay as written.
 *
 * "Total images count" in the sheet is TOTAL PHOTOGRAPHS, and every image set
 * contributes two: pickup-junk is one set / 2 photos, pickup-vs-QC is two sets
 * / 4 photos, wrong-RVP is two sets / 4 photos. The `count` on each group
 * below is that per-set 2, so the groups add up to the sheet's total.
 */

/** How money behaves for a reason — this, not severity, drives visual tone. */
export const MONEY = {
  /** at risk; accept/dispute available before any deduction */
  DEBITABLE: 'debitable',
  /** never debited, ever (KRD F24) */
  INFO_ONLY: 'info_only',
  /** already deducted upstream on day 0; the app's job is the remedy (KRD F18) */
  PRE_DEDUCTED: 'pre_deducted',
}

/**
 * WHAT AN INFO-ONLY SECTION PUTS WHERE EVERY OTHER SECTION PUTS A TOTAL.
 *
 * Every section head answers "what did this cost me?" on its right-hand side.
 * For an info-only loss type the answer is not a number — it is "nothing" —
 * and that is a better answer than a ₹ figure, which would price a loss that
 * is never charged (KRD F24). The caveat behind it is real, though (this is a
 * policy that can change, and the habit still matters), so it rides in the
 * tooltip rather than in a banner under the heading.
 */
export const INFO_ONLY_TOTAL = 'No deductions'
export const INFO_ONLY_NOTE = 'No money is being deducted for wrong pickups for now. Please be careful in the future.'

export const LOSS_REASONS = {
  ICUD_IMG_JUNK: {
    code: 'ICUD_IMG_JUNK',
    feName: 'Delivery photo not clear',
    // Master table row 3.
    masterReason: 'ICUD images junk',
    debitableEntity: 'Lm FE',
    source: 'sx_claims_gold',
    money: MONEY.DEBITABLE,
    // Sheet: "icud_images" · 2 photographs.
    evidence: [
      { group: 'own', count: 2, source: 'icud_images', title: 'Your photos', note: 'Taken by you at delivery' },
    ],
    explain: 'Images captured during user delivery were not clear.',
    tip: 'Show the whole packet and the label in one clear photo. Do not take a close-up of just the label.',
    actions: ['accept', 'dispute'],
    remedy: null,
    // Reused by the loss page's "how to avoid this" section AND by the
    // contextual insight for this loss type — one deck, so advice cannot
    // differ depending on where a Pilot reads it.
    //
    // `habits` complete the banner's remedy line — "Next time: <habit> ·
    // <habit>. View more" — so they are short, lower-case and reminder-length.
    // The banner fits the SECOND one only if it fits on the line, so order
    // them most-useful first. `steps` are the full instructions the loss page
    // and the sheet render, and those are complete imperative sentences.
    // Plural noun phrase for insight sentences — the feName heads a list
    // group, it does not fit inside one.
    insightNoun: 'unclear delivery photos',
    prevention: {
      habits: ['light the parcel', 'hold phone still', 'show door number'],
      // The sheet's Tip, a sentence to a step.
      steps: [
        'Show the whole packet and the label in one clear photo.',
        'Do not take a close-up of just the label.',
      ],
    },
    paymentLine: { section: 'Adjustments', label: 'Shipment Loss for Junk/Mismatch' },
  },

  PICKUP_IMG_JUNK: {
    code: 'PICKUP_IMG_JUNK',
    feName: 'Pickup photo not clear',
    // Master table row 2.
    masterReason: 'Pickup images junk',
    debitableEntity: 'Lm FE',
    source: 'sx_claims_gold',
    money: MONEY.DEBITABLE,
    // Sheet: "pickup_images" · 2 photographs.
    evidence: [
      { group: 'own', count: 2, source: 'pickup_images', title: 'Your photos', note: 'Taken by you at pickup' },
    ],
    // The one row whose "Short Description" cell in the sheet is empty, so
    // this sentence is still the prototype's own.
    explain: 'Your pickup photo was not clear enough to check the item at QC.',
    tip: 'Take a bright, clear photo showing the whole product and all edges. Do not blur.',
    actions: ['accept', 'dispute'],
    remedy: null,
    // Plural noun phrase for insight sentences — the feName heads a list
    // group, it does not fit inside one.
    insightNoun: 'unclear pickup photos',
    prevention: {
      habits: ['light the parcel', 'hold phone still', 'show full label'],
      // The sheet's Tip, a sentence to a step.
      steps: [
        'Take a bright, clear photo showing the whole product and all edges.',
        'Do not blur.',
      ],
    },
    paymentLine: { section: 'Adjustments', label: 'Shipment Loss for Junk/Mismatch' },
  },

  PICKUP_QC_MISMATCH: {
    code: 'PICKUP_QC_MISMATCH',
    feName: 'Secondary QC mismatch',
    // Master table row 5.
    masterReason: 'Pickup vs QC mismatch',
    debitableEntity: 'Lm FE',
    source: 'sx_claims_gold',
    money: MONEY.DEBITABLE,
    // KRD F8 and the sheet agree: "pickup_images, sec_qc_lm_images" · 4
    // photographs. The only reason with a counterparty evidence group.
    evidence: [
      { group: 'own', count: 2, source: 'pickup_images', title: 'Your photos', note: 'Taken by you at pickup' },
      { group: 'qc', count: 2, source: 'sec_qc_lm_images', title: 'QC photos', note: 'Taken at the QC check' },
    ],
    explain: 'Product returned at hub was different than user pickup.',
    tip: 'Give the hub captain the exact package you picked up from the customer.',
    actions: ['accept', 'dispute'],
    remedy: null,
    // Plural noun phrase for insight sentences — the feName heads a list
    // group, it does not fit inside one.
    insightNoun: 'QC mismatches',
    prevention: {
      habits: ['open pickup list', 'match parcel', 'one seller at a time'],
      // The sheet's Tip. One sentence, so one step.
      steps: [
        'Give the hub captain the exact package you picked up from the customer.',
      ],
    },
    paymentLine: { section: 'Adjustments', label: 'Shipment Loss for Junk/Mismatch' },
  },

  WRONG_RVP: {
    code: 'WRONG_RVP',
    feName: 'Wrong parcel picked up',
    // Master table row 7.
    masterReason: 'Wrong RVP pickup',
    debitableEntity: 'Lm FE',
    source: 'sx_claims_gold',
    money: MONEY.INFO_ONLY,
    // KRD's table says "none (info only)" for the card; the sheet does give
    // this row an image set — "catalog_images_link, pickup_images" · 4
    // photographs — which is the catalog comparison the prototype was already
    // drawing.
    //
    // The 3/1 SPLIT IS THE EXTRACT'S, not a guess at the total. Sheet 1 only
    // gave the count (4); Sheet4's wrong-RVP block gives the columns, and they
    // are `pickup_image_1`, `_2`, `_3` and a single `catalog_image_link`. So
    // the Pilot took three photographs and the listing contributes one cover —
    // which is also the right asymmetry to draw: the three are what he did,
    // the one is what the parcel should have been.
    evidence: [
      { group: 'own', count: 3, source: 'pickup_images', title: 'Your photos', note: 'Taken by you at pickup' },
      { group: 'catalog', count: 1, source: 'catalog_images_link', title: 'Catalog photo', note: 'From the product listing' },
    ],
    explain: 'Pickup questions incorrectly answered.',
    tip: 'Fill out the form carefully.',
    actions: ['add_side'],
    remedy: null,
    // Plural noun phrase for insight sentences — the feName heads a list
    // group, it does not fit inside one.
    insightNoun: 'wrong pickups',
    prevention: {
      habits: ['check seller name', 'match parcel', 'ask hub captain'],
      // The sheet's Tip. One sentence, so one step.
      steps: [
        'Fill out the form carefully.',
      ],
    },
    paymentLine: null,
  },

  LOST_IN_FIELD: {
    code: 'LOST_IN_FIELD',
    feName: 'Shipment Lost',
    // Master table row 8.
    masterReason: 'Lost at field',
    debitableEntity: 'Lm FE',
    source: 'loss_engine',
    money: MONEY.PRE_DEDUCTED,
    // KRD and the sheet agree: no image set, "Total images count" 0 — no
    // photos exist for a parcel that never arrived, so slot 4 is empty and
    // slot 5 carries the tip instead.
    evidence: [],
    // Sheet: "Shipment not receievd back at your hub" (typo theirs).
    explain: 'Shipment not received back at your hub.',
    tip: 'Scan every package at each handoff and keep them secure. You will be credited back if a lost package is found.',
    // "Recover, not argue" (KRD §6b) — no accept, no dispute.
    actions: [],
    remedy: { kind: 'hub_return', windowDays: 7 },
    // Plural noun phrase for insight sentences — the feName heads a list
    // group, it does not fit inside one.
    insightNoun: 'lost shipments',
    prevention: {
      habits: ['count at handover', 'bag by route', 'bring back same day'],
      // The sheet's Tip, a sentence to a step. The second is reassurance
      // rather than an instruction, and it is the business's own wording on
      // the one loss type where the money can come back.
      steps: [
        'Scan every package at each handoff and keep them secure.',
        'You will be credited back if a lost package is found.',
      ],
    },
    paymentLine: { section: 'Deductions', label: 'Lost Shipments' },
  },
}

/**
 * Fallback for an unmapped reason code — KRD edge case: "Reason code missing
 * from tip/image mapping → generic tip / no-image state; gap logged." The row
 * must never be blocked.
 */
const FALLBACK_REASON = {
  code: 'UNKNOWN',
  feName: 'Loss marked to you',
  source: 'unknown',
  money: MONEY.DEBITABLE,
  evidence: [],
  explain: 'This loss was marked to you. The details are being confirmed.',
  tip: 'Contact your hub captain if you need help with this case.',
  insightNoun: 'these losses',
  prevention: {
    habits: ['ask hub captain'],
    steps: ['Your hub captain can tell you what this loss was about.'],
  },
  actions: ['accept', 'dispute'],
  remedy: null,
  paymentLine: null,
}

export function getReason(code) {
  const reason = LOSS_REASONS[code]
  if (reason) return reason
  if (code) console.warn('[lossReasons] unmapped reason code, using fallback:', code)
  return { ...FALLBACK_REASON, code: code || FALLBACK_REASON.code }
}

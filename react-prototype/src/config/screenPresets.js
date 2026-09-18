/**
 * Presenter presets — what the control panel's "Jump to screen" dropdown offers.
 *
 * A preset is either a plain surface, or a **case preset**: a pointer at one
 * mock record plus (optionally) the lifecycle state to render it in. Because
 * every loss detail page is now `f(reasonCode, caseState)`, reviewing a state
 * no longer needs its own screen id — it needs a row here.
 *
 * Adding a state to review = adding a row. Adding a loss type to review = a row
 * per state you want to see it in.
 *
 * `caseRef` is a pointer into the FIXTURE (`mockData.json`'s three lists),
 * which is the readable way to write one by hand; it is resolved to a case id
 * when the jump happens (state/caseStore.js). `stateOverride` is view-only —
 * it previews a state without moving the case into it.
 *
 * Because cases are now really mutable, a preset shows you whatever state its
 * case is in NOW. Accept "Loss · needs action" and that preset stops matching
 * its label until you hit "Reset Data" in the panel.
 *
 * `expect` is what the preset needs to be TRUE OF ITS SEED to be worth
 * offering at all — the (reason, state) pair its label names. It is how the
 * same list serves both datasets: Mock seeds every one of these, Live seeds
 * six real awaiting-answer losses and three real wrong pickups and nothing
 * else, so on Live the panel quietly offers only the presets that exist there
 * rather than a dropdown of dead ends. See `presetResolves` in
 * state/caseStore.js.
 */
export const SCREEN_PRESETS = [
  // ---- surfaces ----
  { id: 'losses-list', label: 'Losses list', screen: 'home' },
  { id: 'myearnings', label: 'My Earnings tab', screen: 'myearnings' },
  { id: 'payments', label: 'Payments tab', screen: 'payments' },
  { id: 'pdetail', label: 'Payment Details', screen: 'pdetail' },
  { id: 'awareness', label: 'Safety overlay', screen: 'awareness' },

  // ---- L1 loss detail, one per lifecycle state (KRD §6b) ----
  { id: 'case-attributed', label: 'Loss · needs action', screen: 'case',
    caseRef: { list: 'marked', index: 2 }, expect: { caseState: 'ATTRIBUTED' } },
  { id: 'case-cooloff', label: 'Loss · cool-off (dispute paused)', screen: 'case',
    caseRef: { list: 'marked', index: 2, stateOverride: 'OPEN_DISPUTE_PAUSED' },
    expect: { caseState: 'ATTRIBUTED' } },
  { id: 'case-in-dispute', label: 'Loss · in dispute', screen: 'case',
    caseRef: { list: 'marked', index: 0 }, expect: { caseState: 'IN_DISPUTE' } },
  { id: 'case-accepted', label: 'Loss · accepted', screen: 'case',
    caseRef: { list: 'marked', index: 1 }, expect: { caseState: 'ACCEPTED' } },
  { id: 'case-debited', label: 'Loss · debited', screen: 'case',
    caseRef: { list: 'closed', index: 2 }, expect: { caseState: 'DEBITED' } },
  { id: 'case-waived', label: 'Loss · waived (you were right)', screen: 'case',
    caseRef: { list: 'closed', index: 0 }, expect: { caseState: 'WAIVED' } },
  { id: 'case-waived-sla', label: 'Loss · waived (we missed the SLA)', screen: 'case',
    caseRef: { list: 'closed', index: 4 }, expect: { caseState: 'WAIVED' } },
  { id: 'case-not-deducted', label: 'Loss · not deducted', screen: 'case',
    caseRef: { list: 'closed', index: 1 }, expect: { caseState: 'NOT_DEDUCTED' } },

  // ---- L1, the two reasons with their own money model ----
  { id: 'case-lif-open', label: 'Lost in Field · return to recover', screen: 'case',
    caseRef: { list: 'marked', index: 3 }, expect: { reasonCode: 'LOST_IN_FIELD' } },
  { id: 'case-lif-returned', label: 'Lost in Field · returned & credited', screen: 'case',
    caseRef: { list: 'closed', index: 3 }, expect: { reasonCode: 'LOST_IN_FIELD' } },
  { id: 'case-info-only', label: 'Wrong pickup · information only', screen: 'case',
    caseRef: { list: 'wrong', index: 0 }, expect: { caseState: 'INFO_ONLY' } },

  // ---- L2 sub-flows ----
  { id: 'sheet-accept', label: 'Sheet · accept', screen: 'accept',
    caseRef: { list: 'marked', index: 2 }, expect: { caseState: 'ATTRIBUTED' } },
  { id: 'sheet-dispute', label: 'Sheet · dispute', screen: 'dispute',
    caseRef: { list: 'marked', index: 2 }, expect: { caseState: 'ATTRIBUTED' } },
]

export const getPreset = (id) => SCREEN_PRESETS.find((p) => p.id === id) || SCREEN_PRESETS[0]

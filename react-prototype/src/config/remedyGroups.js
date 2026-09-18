import { LOSS_REASONS, MONEY } from './lossReasons.js'

/**
 * LOSS-TYPE GROUPS — the "Loss Wise" list layout's grouping.
 *
 * One group per LOSS TYPE: QC mismatch, photo not clear, shipment lost, wrong
 * parcel picked up. The heading is the loss type's own FE-facing name, so the
 * heading and the rows beneath it say the same words.
 *
 * DEFAULT: every reason is its own group. A new loss type therefore gets its
 * own heading automatically — the registry's promise that adding a type is one
 * row in `lossReasons.js` still holds, with no edit here.
 *
 * MERGES are the exception, and remedy is what justifies one: two reasons
 * belong under a single heading only when the Pilot fixes them the exact same
 * way. A pickup photo and a delivery photo that came out unclear are one
 * problem with one fix — take the photo properly — so they read as one group
 * rather than splitting a Pilot's attention across two headings that mean the
 * same thing to them. Nothing else in the registry shares a remedy that
 * closely: a QC mismatch is about what was in the parcel, a lost shipment is
 * about finding it, a wrong pickup is about not taking it in the first place.
 */
const MERGED_GROUPS = [
  {
    id: 'photo-not-clear',
    label: 'Photo not clear',
    insightNoun: 'unclear photos',
    codes: ['PICKUP_IMG_JUNK', 'ICUD_IMG_JUNK'],
    // A merge that borrows a member's advice is only half-merged. Before this,
    // the insight for "unclear photos" took whichever member happened to come
    // first out of the pool — so a Pilot whose photos are mostly DELIVERY
    // photos was told to "show full label", which is the pickup fix and means
    // nothing at a doorstep. The merge decided these are one problem with one
    // fix; this is that one fix, written down.
    //
    // The debit-reason master sheet has no row for the merge — it is a
    // prototype construct — so these steps are written here rather than
    // transcribed. They are written FROM the sheet all the same: what both
    // members' Tips ask for, minus what only one of them does. Pickup junk
    // asks for the whole product and all edges with no blur; delivery junk
    // asks for the whole packet with the label in the same shot and no
    // label-only crop. Everything below holds for both, so a Pilot reading
    // the merged insight is never told something the sheet does not say.
    prevention: {
      habits: ['light the parcel', 'hold phone still', 'check before you send'],
      steps: [
        'Take a bright, clear photo of the whole packet, with the label in the same shot.',
        'Do not blur, and do not take a close-up of just the label.',
        'Look at the photo before you move on. If you cannot read it, take it again.',
      ],
    },
  },
]

/** Reasons the registry doesn't know collapse into one group, not one each. */
const UNKNOWN_GROUP = { id: 'unknown', label: 'Loss marked to you', showsTotal: true }

const mergeFor = (code) => MERGED_GROUPS.find((g) => g.codes.includes(code))

export function getRemedyGroup(reason) {
  if (!LOSS_REASONS[reason.code]) return UNKNOWN_GROUP

  const merged = mergeFor(reason.code)
  return {
    id: merged ? merged.id : reason.code,
    label: merged ? merged.label : reason.feName,
    // A merge speaks for both its members, so it carries its own noun and its
    // own advice — never a member's, which would be true for half the cases.
    insightNoun: merged ? merged.insightNoun : reason.insightNoun,
    prevention: merged ? merged.prevention : reason.prevention,
    // No money was ever at stake on an info-only type, so a ₹ total on its
    // heading would invent a cost — the sectioned layout's Wrong Pickups
    // head omits it for the same reason.
    showsTotal: reason.money !== MONEY.INFO_ONLY,
  }
}

/**
 * Groups in display order, built from the registry so the order follows the
 * order loss types are declared in — and so a merge collapses to one entry
 * at the position of its first member.
 */
export const REMEDY_GROUP_ORDER = (() => {
  const seen = new Map()
  Object.values(LOSS_REASONS).forEach((reason) => {
    const group = getRemedyGroup(reason)
    if (!seen.has(group.id)) seen.set(group.id, group)
  })
  seen.set(UNKNOWN_GROUP.id, UNKNOWN_GROUP)
  return [...seen.values()]
})()

import { getReason } from '../config/lossReasons.js'
import { getRemedyGroup } from '../config/remedyGroups.js'
import { fmt } from './helpers.js'

/**
 * THE INSIGHT ENGINE — what keeps costing this Pilot, and the habit that fixes
 * it. See Design System/INSIGHTS_SPEC.md.
 *
 * One builder feeds every insight surface: the contextual banner on the losses
 * list, its tap-through sheet, and the historic block on the Losses tab. They
 * differ by SCOPE alone, which is what keeps the later global-insights work a
 * call with a different scope rather than a second engine.
 *
 * Insights are grouped by LOSS TYPE, reusing `remedyGroups.js` — so the merge
 * that already decided a pickup photo and a delivery photo are one problem
 * holds here too. Splitting them would produce two weak insights about a
 * single habit.
 *
 * The prevention copy is NOT written here. It lives on the reason
 * (`lossReasons.js` → `prevention`), the same block the loss detail page
 * renders, so advice cannot differ depending on where a Pilot reads it.
 */

const sentenceCase = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t)

/**
 * A loss type has to happen this often before it is a pattern worth NAMING —
 * the banner has room for one claim and spending it on a one-off is how a
 * Pilot learns to ignore it.
 *
 * A caller can lower it. The threshold protects a two-line banner's budget,
 * and a surface with room — the historic break-up sheet, which has to add up
 * to the figure that sent the Pilot there — has no such budget and would lie
 * by omission if it applied one.
 */
const INSIGHT_MIN_CASES = 3

/**
 * How many insights the contextual banner rolls through — the top 3 problems
 * by money, always three.
 *
 * Fixed rather than "however many qualify" because the banner is now a row of
 * cards a Pilot swipes: a row whose length moves with the data is a row whose
 * end they cannot predict, and one card that happens to be alone is a carousel
 * that does not roll. Three is what the pool yields today and what the surface
 * can carry — the card is ~88% of the screen, so three is about two swipes.
 */
export const INSIGHT_BANNER_COUNT = 3

/** Which states each scope counts. */
const SCOPES = {
  active: (r) => ACTIVE_STATES.includes(r.caseState),
  historic: (r) => HISTORIC_STATES.includes(r.caseState),
  all: () => true,
}

const ACTIVE_STATES = [
  'ATTRIBUTED', 'OPEN_DISPUTE_PAUSED', 'IN_DISPUTE', 'ACCEPTED',
  'LIF_RECOVERY_OPEN', 'LIF_CLAIM_SENT', 'INFO_ONLY',
]
const HISTORIC_STATES = [
  'DEBITED', 'WAIVED', 'NOT_DEDUCTED', 'RETURNED_CREDITED', 'GRACE_WAIVED', 'INFO_ONLY',
]

/**
 * @param cases   the whole pool
 * @param scope   'active' | 'historic' | 'all'
 * @param rowFor  the app's row builder, so an insight's cases render as the
 *                same ListRow the losses list shows
 * @param topN    cap the result at this many, and TOP UP to it from below the
 *                pattern threshold if too few clear it — see below
 */
export function buildInsights(cases, { scope = 'all', rowFor, minCases = INSIGHT_MIN_CASES, topN = 0 } = {}) {
  const inScope = cases.filter(SCOPES[scope] || SCOPES.all)

  const groups = new Map()
  inScope.forEach((rec) => {
    const reason = getReason(rec.reasonCode)
    const group = getRemedyGroup(reason)
    if (!groups.has(group.id)) {
      groups.set(group.id, {
        id: group.id, label: group.label, noun: group.insightNoun,
        costsMoney: group.costsMoney !== false,
        prevention: group.prevention, reason, cases: [],
      })
    }
    groups.get(group.id).cases.push(rec)
  })

  const ranked = [...groups.values()]
    .map((g) => {
      const amount = g.cases.reduce((t, r) => t + r.amt, 0)
      // What the group actually TOOK, as opposed to what it was charged at.
      // The two differ by every case that was waived, never deducted, or
      // credited back — so on a history surface, where "cost you" is a claim
      // about money that is already gone, `amount` overstates it. The active
      // banner keeps using `amount`: there, nothing has moved yet and what is
      // at stake is the point.
      const deducted = g.cases.reduce((t, r) => t + (r.caseState === 'DEBITED' ? r.amt : 0), 0)
      // What was ever charged, which is not the same as what the cases are
      // worth: an informational loss carries an amount and was never charged
      // for it, so counting it here would invent a debt the Pilot never had.
      // Same rule as the historic ledger's `incurred` — one definition.
      const charged = g.cases.reduce((t, r) => t + (r.caseState === 'INFO_ONLY' ? 0 : r.amt), 0)
      // The GROUP's advice, not a member reason's: a merged group carries its
      // own `prevention` precisely so an insight covering two loss types does
      // not hand out the fix for one of them.
      const prevention = g.prevention || g.reason.prevention || { habits: [], steps: [] }
      return {
        id: g.id,
        label: g.label,
        count: g.cases.length,
        amount,
        amountLabel: fmt(amount),
        deducted,
        deductedLabel: fmt(deducted),
        charged,
        chargedLabel: fmt(charged),
        // The sentence is assembled where it is rendered, so the banner can
        // weight the money differently from the words around it. This is the
        // subject of that sentence — sentence-cased because the loss type's
        // own `label` heads a list group and will not sit inside a sentence
        // ("Photo not clear have cost you ₹517").
        noun: sentenceCase(g.noun || g.label),
        // Whether this kind of loss takes money at all. The banner reads it
        // to choose between "cost you" and "can cost you" — see InsightBanner.
        costsMoney: g.costsMoney,
        // The banner's first line — the habit as one short sentence. A merged
        // group's own `prevention` may not carry one yet; its first step is
        // the nearest honest sentence, and the banner clips it if it runs.
        headline: prevention.headline || prevention.steps?.[0] || '',
        habits: prevention.habits,
        steps: prevention.steps,
        rows: rowFor ? g.cases.map(rowFor) : [],
      }
    })
    // Ranked by money, not frequency. The two disagree — unclear photos happen
    // most, QC mismatches cost most — and what a Pilot wants back is the money.
    .sort((a, b) => b.amount - a.amount)

  // A loss type has to repeat before it is a PATTERN. Everything above this
  // line is ranking; this is the line between "this keeps happening" and "this
  // happened".
  const patterns = ranked.filter((i) => i.count >= minCases)
  if (!topN) return patterns

  // A FIXED-LENGTH ROW, so it is topped up rather than left short. The
  // threshold protects a single banner's one slot from being spent on a
  // one-off; a row of three has slots to spare, and a third card naming the
  // Pilot's third-biggest loss — even at one case — is worth more than a row
  // that is sometimes two cards long and sometimes three.
  //
  // The threshold decides WHICH three get in; money alone decides the ORDER
  // they are read in. Those are two different questions and the first version
  // answered both with the threshold, which put a ₹30 pattern in front of a
  // ₹500 one-off — a row the Pilot reads as simply unsorted, on a surface
  // whose one ranking rule is the money.
  return (patterns.length >= topN
    ? patterns
    : [...patterns, ...ranked.filter((i) => i.count < minCases)]
  ).slice(0, topN).sort((a, b) => b.amount - a.amount)
}

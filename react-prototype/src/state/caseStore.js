import data from '../data/activeDataset.js'

/**
 * THE CASE POOL — the prototype's one mutable store of losses.
 *
 * Whichever dataset is active (`data/activeDataset.js` — Mock or Live) keeps
 * its three fixture lists (`marked` / `wrong` / `closed`) because they are
 * readable as fixtures, but they are NOT the
 * app's structure: they are seed data for one flat pool, and every bucket
 * the Pilot sees is a filter over that pool by `caseState`
 * (`SECTION_OF_STATE` in useLossesApp.js).
 *
 * That distinction is what makes the prototype walkable. Acting on a case
 * used to write the new state onto the *pointer* to it — so accepting a loss
 * looked right on the detail page, and then the list still showed it under
 * "Needs Decision", because the list was reading the untouched fixture. Now the
 * record itself changes, and the bucket follows from the record.
 *
 * Nothing here persists: the pool is seeded into React state at mount, so a
 * refresh (or the panel's "Reset Data") restores the fixtures exactly.
 * Deliberate — a demo should always start from the same place.
 *
 * The seed lists are already exactly predicted by state (marked = open /
 * in-flight, wrong = INFO_ONLY, closed = terminal), so flattening them
 * changes no bucket on first render.
 */
const SEED_LISTS = ['marked', 'wrong', 'closed']

/** AWB is unique across all three fixture lists, so it is the case id. */
export function seedCases() {
  return SEED_LISTS.flatMap((list) =>
    data[list].map((record) => ({ ...record, id: record.awb })))
}

/**
 * Resolve a fixture pointer to a case id, so `config/screenPresets.js` can go
 * on addressing cases as `{ list: 'marked', index: 2 }` — a readable thing to
 * write by hand — without knowing the pool exists.
 */
export function seedIdAt(list, index) {
  const record = seedRecordAt(list, index)
  return record ? record.awb : null
}

/** The seeded record behind a fixture pointer, or null if the active dataset
 * has no row there. */
export function seedRecordAt(list, index) {
  return (data[list] || [])[index] || null
}

/**
 * Whether a preset still describes something in the ACTIVE dataset.
 *
 * Presets address cases by fixture position, and the two datasets are not the
 * same shape: Live is six real audited losses awaiting the Pilot's answer plus
 * three real wrong pickups, and no decided cases at all. Pointing "Lost in
 * Field · returned & credited" at `closed[3]` there resolves to nothing, and
 * pointing "Loss · in dispute" at `marked[0]` resolves to a case that is not
 * in dispute — a dropdown entry that lies about where it goes.
 *
 * So a preset may state what it expects to find (`expect`), and the panel
 * offers it only where that holds. It is checked against the SEED record, not
 * the live one: a preset is meant to stop matching its label once you act on
 * its case (that is the prototype being walkable), but it should never have
 * been offered against a dataset where it was never true.
 */
export function presetResolves(preset) {
  const ref = preset.caseRef
  if (!ref) return true
  const record = seedRecordAt(ref.list, ref.index)
  if (!record) return false
  const expect = preset.expect
  if (!expect) return true
  if (expect.reasonCode && record.reasonCode !== expect.reasonCode) return false
  if (expect.caseState && record.caseState !== expect.caseState) return false
  return true
}

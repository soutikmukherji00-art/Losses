import mockData from './mockData.json'
import liveData from './liveData.json'

/**
 * THE DATASET SWITCH — which fixture the whole prototype is reading.
 *
 * Two datasets, same shape, different jobs:
 *
 *  · **Mock data** — the demo fixture. Every loss type crossed with every
 *    lifecycle state, so the panel's "Jump to screen" list can reach a
 *    debited case, a waived case, a Lost-in-Field recovery and so on. It is
 *    not any one Pilot's real month; it exists to show all the use cases.
 *
 *  · **Live data** — nine real audited losses belonging to one real Pilot,
 *    straight out of "External Memory/Debit reason master table.xlsx"
 *    (sheet "Sheet4"): real AWBs, real hubs, real amounts, real audit date,
 *    the real pickup / delivery / secondary-QC photographs, and — on the
 *    three wrong pickups — the real answers he gave to the pickup
 *    questionnaire that day. Nothing invented is added to the list. This is
 *    the variant you take TO him.
 *
 * WHY A RELOAD RATHER THAN REACT STATE. The dataset is imported at module
 * scope by `helpers.js` (the prototype's "today"), `caseStore.js` (the seed
 * pool) and `productImages.js` (the stock catalogue) — all of which are read
 * once, at import time, by design. Threading a live dataset id through them
 * would mean making three module constants into hooks for a control that gets
 * flipped once a demo. So the choice is persisted and the page reloads, which
 * also matches what the switch means: start the prototype again, on the other
 * set of facts.
 */
const DATASETS = {
  mock: { id: 'mock', label: 'Mock data', data: mockData },
  live: { id: 'live', label: 'Live data', data: liveData },
}

export const DATA_SOURCES = Object.values(DATASETS).map(({ id, label }) => ({ id, label }))

const DEFAULT_SOURCE = 'mock'
const STORAGE_KEY = 'fe-report-card:dataSource'

/**
 * Storage can throw (Safari private mode, a sandboxed iframe) and it can hold
 * a stale id from a dataset that no longer exists. Either way the prototype
 * opens on the mock fixture rather than on nothing.
 */
function readStoredSource() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return DATASETS[stored] ? stored : DEFAULT_SOURCE
  } catch {
    return DEFAULT_SOURCE
  }
}

/** `?data=live` wins over storage, so a link can open on a given dataset. */
function readSource() {
  if (typeof window === 'undefined') return DEFAULT_SOURCE
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('data')
    if (DATASETS[fromUrl]) return fromUrl
  } catch {
    /* fall through to storage */
  }
  return readStoredSource()
}

export const DATA_SOURCE = readSource()

export function setDataSource(id) {
  if (!DATASETS[id] || id === DATA_SOURCE) return
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {
    /* A reload without storage would land back on the default, so say so
       rather than silently doing nothing. */
    window.alert('This browser is blocking local storage, so the data source cannot be remembered. Open the prototype with ?data=' + id + ' instead.')
    return
  }
  // The query string pins the source, so it has to go or it would win over
  // the choice just made.
  const url = new URL(window.location.href)
  url.searchParams.delete('data')
  window.location.replace(url.toString())
}

/** The active dataset. Every module that used to import `mockData.json` reads this. */
export default DATASETS[DATA_SOURCE].data

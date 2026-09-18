import data from '../data/activeDataset.js'

/**
 * The prototype's dummy product photos — one small catalogue shared by the L0
 * loss list (row thumbnails) and the L1 evidence groups, so a row and the page
 * it opens show the same item.
 *
 * These are STAND-INS, and only ever stand in: a row that carries its own real
 * photographs (`record.photos`, which every Live-data row does) never reaches
 * this catalogue — see `buildEvidence` in resolveCaseView.js. The files live in
 * `public/catalog/`, so they are part of the build and the prototype renders
 * the same on Vercel, on a laptop and with no network at all.
 *
 * AND ON A DATASET THAT MAY NOT HAVE STAND-INS, THEY DO NOT STAND IN AT ALL.
 * `stockPhotos` is false on the Live fixture: every image on that surface has
 * to be traceable to the sheet, and three dummy product shots under a Pilot's
 * own photographs are the one invented thing on a screen whose whole claim is
 * that nothing on it is invented — a soap bar he never handled, presented as
 * his parcel. So `productImage` returns nothing there, and the tile that asked
 * for it says PLACEHOLDER instead of showing somebody else's product.
 *
 * Nothing further down has to know: every caller already treats a missing
 * source as a legitimate state (KRD F8's "never a blocked row").
 */
const PRODUCT_IMAGES = data.productImages

/** Whether this dataset allows the catalogue to stand in for a photograph. */
export const STOCK_PHOTOS = data.stockPhotos ?? true

/** Stable per-AWB index, so a row keeps its item across L0 → L1 and re-renders. */
const seed = (awb) => {
  let s = 0
  for (const ch of String(awb || '')) s = (s * 31 + ch.charCodeAt(0)) >>> 0
  return s
}

/**
 * The item photo for an AWB. `offset` picks a *different* item from the same
 * catalogue — that is what makes a mismatch legible: the QC (or catalog) photo
 * has to show another product, not the same one twice.
 */
export const productImage = (awb, offset = 0) => (STOCK_PHOTOS
  ? PRODUCT_IMAGES[(seed(awb) + offset) % PRODUCT_IMAGES.length]
  : null)

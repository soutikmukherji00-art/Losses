import data from '../data/activeDataset.js'

/**
 * Layer ids that more than one file needs to agree on — i.e. a layer whose
 * toggle isn't just cosmetic (see Design System/CONFIG_REFERENCE.md
 * § Layer visibility, "cool-off" row). Purely-cosmetic layers don't need an
 * entry here: their id only ever appears once, at their own `<Layer>` call
 * site.
 *
 * A DEFAULT can need agreeing on for exactly the same reason, and one now
 * does — see CATALOG_IMAGES_DEFAULT at the bottom.
 */
export const COOL_OFF_NOTICE_LAYER = 'losses-list.coolOffNotice'

/** The contextual insight banner above the losses list's filter chips. */
export const CONTEXTUAL_INSIGHTS_LAYER = 'losses-list.contextualInsights'

/**
 * The product-listing photo row on the loss detail page. Registered from the
 * losses list (where the toggle lives) AND from the case page it actually
 * changes, so it can be flipped from either surface — the effect is applied
 * in `resolveCaseView`, which is why the id has to be agreed here rather than
 * living at a single `<Layer>` call site.
 */
export const CATALOG_IMAGES_LAYER = 'losses-list.catalogImages'

/**
 * ...and whether that row starts ON, which is a fact about the DATASET rather
 * than about the design: it is on for Mock and off for Live, because every
 * Live row carries the Pilot's real photographs and the catalogue is three
 * dummy product shots of things he never handled. See `layerDefaults` in each
 * dataset for the full reasoning.
 *
 * It lives here, next to the id, for the same reason the id does: three files
 * have to agree on it — `CatalogImagesLayer`'s `<Layer>` registration, the
 * `<Layer>` on the case page, and `useLossesApp`, which is what actually
 * applies the effect. All three used to spell it `true` independently, so the
 * shape that was supposed to rule out a disagreeing default was only agreeing
 * by coincidence; the moment the answer stopped being "always true" that would
 * have shown up as a toggle whose position did not match the page.
 */
export const CATALOG_IMAGES_DEFAULT = data.layerDefaults?.catalogImages ?? true

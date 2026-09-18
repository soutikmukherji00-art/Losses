import Layer from './Layer.jsx'
import { CATALOG_IMAGES_DEFAULT, CATALOG_IMAGES_LAYER } from '../../config/layerIds.js'

/**
 * The toggle for the catalog photo row, as a component rather than three
 * copies of the same `<Layer>` call.
 *
 * It is a UNIVERSAL switch — one flip changes every loss page — so it is
 * declared on each surface it belongs to rather than owned by one of them:
 * both losses lists (where the arrangement gets set up) and the case page
 * (so it can be flipped while you look at what it changes). The registry
 * keys on the id and the override outlives any single mount, so those are
 * three doors onto one switch, not three switches.
 *
 * Renders nothing. The effect is applied in `resolveCaseView`'s
 * `buildEvidence`, reached via `useLossesApp` reading this same id out of the
 * registry — see Design System/CONFIG_REFERENCE.md § Registration-only layers.
 *
 * The label lives here and nowhere else; the id and the default live in
 * `config/layerIds.js`, because `useLossesApp` needs the same two values to
 * apply the effect and a default that disagreed with its fallback is
 * precisely the bug that arrangement rules out. (It used to be spelled
 * `true` in both places and merely happened to agree.)
 */
export default function CatalogImagesLayer() {
  return (
    <Layer
      id={CATALOG_IMAGES_LAYER}
      label="Catalog images (all loss pages)"
      defaultVisible={CATALOG_IMAGES_DEFAULT}
    />
  )
}

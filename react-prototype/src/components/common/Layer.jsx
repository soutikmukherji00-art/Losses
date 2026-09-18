import { useLayerVisibility } from '../../presenter/LayerVisibilityContext.jsx'

/**
 * Wrap any section/widget in this to make it independently toggle-able from
 * the presenter's Layers panel — no panel code to touch, no state to wire.
 *
 *   <Layer id="losses-list.someBanner" label="Some banner">
 *     <SomeBanner ... />
 *   </Layer>
 *
 * `id` should be unique and stable (e.g. "<screen>.<thing>") — it's the key
 * both the registry and any future override-persistence key on. `label` is
 * what the human sees in the panel. See Design System/CONFIG_REFERENCE.md
 * § Layer visibility.
 *
 * With NO children it is a registration-only mount: it puts the toggle in the
 * panel while this screen is up, and something else — `useLossesApp` reading
 * the same id out of the registry — applies the effect. That is how a layer
 * reaches past the component it is declared in (the cool-off pause, the
 * catalog photo row); see config/layerIds.js for the ids that work this way.
 */
export default function Layer({ id, label, defaultVisible = true, children = null }) {
  const visible = useLayerVisibility(id, label, defaultVisible)
  return visible ? children : null
}

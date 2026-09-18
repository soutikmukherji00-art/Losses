import Toggle from './Toggle.jsx'
import { useLayerRegistry } from '../LayerVisibilityContext.jsx'

/**
 * The one control that isn't handed its data by presenterSections.js — it
 * reads the live layer registry directly, because that registry only exists
 * once `<Layer>`s have mounted (see LayerVisibilityContext.jsx). Everywhere
 * else in this app, "a new control type" means "a new file in this folder
 * plus one CONTROL_TYPES entry" (see ControlPanel.jsx); this one is no
 * exception, it's just self-fed instead of data-fed.
 */
export default function LayersControl() {
  const registry = useLayerRegistry()
  const layers = registry?.layers ?? []

  if (layers.length === 0) {
    return <div className="control-note">No togglable layers on this screen.</div>
  }

  return (
    <div className="control-field">
      {layers.map((layer) => (
        <Toggle
          key={layer.id}
          label={layer.label}
          checked={registry.isVisible(layer.id, layer.defaultVisible)}
          onChange={() => registry.toggle(layer.id)}
        />
      ))}
    </div>
  )
}

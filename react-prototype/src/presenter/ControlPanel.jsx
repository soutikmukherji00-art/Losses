import SegmentedControl from './controls/SegmentedControl.jsx'
import Select from './controls/Select.jsx'
import Toggle from './controls/Toggle.jsx'
import LayersControl from './controls/LayersControl.jsx'
import ActionButtons from './controls/ActionButtons.jsx'
import './controls/controls.css'
import './ControlPanel.css'

const CONTROL_TYPES = {
  segmented: SegmentedControl,
  select: Select,
  toggle: Toggle,
  layers: LayersControl,
  actions: ActionButtons,
}

/**
 * Generic control panel: renders a list of sections, each a list of typed
 * controls. It has zero knowledge of what any control *does* — the caller
 * (this app's `src/app/presenterSections.js`) supplies plain data, this
 * component just dispatches `type` to a renderer and lays sections out.
 *
 * To add a new control kind (e.g. a checkbox, a text input): add one entry
 * to CONTROL_TYPES and a matching component in `controls/` — nothing else
 * in this file changes, and no calling code outside this folder needs to
 * know it exists.
 */
export default function ControlPanel({ title, sections }) {
  return (
    <div className="control-panel">
      {title && <div className="control-panel__title">{title}</div>}
      {sections.map((section) => (
        <div className="control-panel__section" key={section.title}>
          <div className="control-panel__section-title">{section.title}</div>
          <div className="control-panel__section-body">
            {section.controls.map((control) => {
              const Control = CONTROL_TYPES[control.type]
              if (!Control) return null
              // A control need not be labelled (an action row often isn't),
              // so the type is the fallback key.
              return <Control key={control.label || control.type} {...control} />
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

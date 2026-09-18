import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Generic "layer visibility" system — the mechanism behind the presenter's
 * Layers panel (Figma-style: toggle any wrapped section on/off from the
 * right-hand panel, with no code change to the panel itself).
 *
 * How it works: any piece of the app can wrap itself in `<Layer id label>`
 * (see `components/common/Layer.jsx`). While mounted, it registers itself
 * here; the panel's Layers section (`presenter/controls/LayersControl.jsx`)
 * reads the *live* registry and renders one toggle per registered layer —
 * so the list always matches what's actually on screen right now, the same
 * way Figma's layers panel only ever lists what's in the current frame.
 * Unmount a `<Layer>` (navigate away) and its toggle disappears with it.
 *
 * This file and `Layer.jsx` are the only two files this feature touches —
 * see Design System/CONFIG_REFERENCE.md § Layer visibility for how to add
 * a new togglable layer.
 */
const LayerVisibilityContext = createContext(null)

export function LayerVisibilityProvider({ children }) {
  const [layers, setLayers] = useState([])       // [{ id, label, defaultVisible }], registration order
  const [overrides, setOverrides] = useState({})  // id -> boolean, only once a human has touched it

  const register = useCallback((id, label, defaultVisible) => {
    setLayers((prev) => {
      if (prev.some((l) => l.id === id)) return prev
      return [...prev, { id, label, defaultVisible }]
    })
  }, [])

  const unregister = useCallback((id) => {
    setLayers((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const isVisible = useCallback(
    (id, defaultVisible) => overrides[id] ?? defaultVisible,
    [overrides],
  )

  const toggle = useCallback((id) => {
    setOverrides((prev) => {
      const layer = layers.find((l) => l.id === id)
      const current = prev[id] ?? layer?.defaultVisible ?? true
      return { ...prev, [id]: !current }
    })
  }, [layers])

  const value = useMemo(
    () => ({ layers, register, unregister, isVisible, toggle }),
    [layers, register, unregister, isVisible, toggle],
  )

  return (
    <LayerVisibilityContext.Provider value={value}>
      {children}
    </LayerVisibilityContext.Provider>
  )
}

/** Used by `<Layer>` — registers on mount, unregisters on unmount, returns current visibility. */
export function useLayerVisibility(id, label, defaultVisible = true) {
  const ctx = useContext(LayerVisibilityContext)
  // `register`/`unregister` are the only things this effect needs, and both
  // are stable (`useCallback` with no deps) across the registry's whole
  // lifetime. Depending on `ctx` itself instead would be a bug: `ctx` is
  // re-created every time `layers` changes, which register/unregister cause,
  // which would re-fire this effect, which registers/unregisters again —
  // an infinite render loop.
  const register = ctx?.register
  const unregister = ctx?.unregister

  useEffect(() => {
    if (!register) return undefined
    register(id, label, defaultVisible)
    return () => unregister(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register, unregister, id, label])

  if (!ctx) return true // no provider (e.g. a unit test rendering the component in isolation) — never hide
  return ctx.isVisible(id, defaultVisible)
}

/** Used by `LayersControl` — the presenter panel's read/write access to the whole registry. */
export function useLayerRegistry() {
  return useContext(LayerVisibilityContext)
}

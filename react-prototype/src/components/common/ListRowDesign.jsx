import { createContext, useContext } from 'react'
import { resolveLineItemDesign, DEFAULT_LINE_ITEM_DESIGN } from '../../config/lineItemDesigns.js'

/**
 * Which line-item design every `ListRow` in the tree is wearing
 * (config/lineItemDesigns.js).
 *
 * A context rather than a prop, because a ListRow is rendered from six
 * places — the losses list's three layouts, the historic ledger, the cycle
 * sheet and the insight sheets — and none of those six is making a decision
 * about the row's design. Threading it through each of them would let one
 * of them forget, which is exactly the disagreement this prototype keeps
 * designing out: a loss that reads one way in a list and another way in a
 * sheet over it.
 *
 * The default is the app's default design, so a ListRow rendered outside the
 * provider (a test, a one-off) still looks like the app.
 */
const ListRowDesignContext = createContext(resolveLineItemDesign(DEFAULT_LINE_ITEM_DESIGN))

export function ListRowDesignProvider({ design, children }) {
  return (
    <ListRowDesignContext.Provider value={design}>
      {children}
    </ListRowDesignContext.Provider>
  )
}

export function useListRowDesign() {
  return useContext(ListRowDesignContext)
}

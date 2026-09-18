/**
 * LOSSES STRUCTURE — the shape of the losses area, as independent axes.
 *
 * This replaces a list of named arrangements ('losses-tab',
 * 'active-plus-historic', …). Those names described whole arrangements rather
 * than the facts that actually vary, so you could not tell from the panel what
 * a name stood for, and a new arrangement meant inventing a new name for a
 * point that was already inside the existing options' product.
 *
 * Three axes. Every arrangement is a point in their product:
 *
 *   lossesTab          — is there a Losses tab in the segmented bar?
 *   earningsEntry      — is there an entry widget on the My Earnings tab?
 *   historicPlacement  — WHERE the historic ledger lives
 *
 * `historicPlacement` is the one axis that is not a boolean, and that is the
 * whole reason this file exists rather than three booleans in `initialState`.
 * "Is historic shown?" cannot express the arrangement where the TAB IS the
 * ledger and the working list moves to its own page — the two halves on two
 * separate surfaces. That is a different information architecture, not a
 * visibility flag, so the axis asks *where*, not *whether*.
 *
 * `lossesTab` and `earningsEntry` CAN both be off, and that is not a broken
 * state: the Current Cycle card carries its "settling this cycle" line in
 * every arrangement, and that line opens a drill-down whose rows open real
 * loss pages. Both doors off is the arrangement where losses have no list
 * surface of their own — a real thing to look at, not an accident.
 */

export const HISTORIC_PLACEMENTS = [
  {
    id: 'hidden',
    label: 'Hidden',
    // No ledger anywhere. The working list is the whole losses area.
  },
  {
    id: 'subtab',
    label: 'Sub-tab',
    // Both halves share one surface, switched by a sub-tab row.
  },
  {
    id: 'own-tab',
    label: 'Own tab',
    // The ledger IS the Losses tab; the working list moves to its own page,
    // reached from the My Earnings entry widget.
    //
    // It therefore needs BOTH doors open: a tab for the ledger to be, and the
    // widget to give the working list somewhere to be reached from. With the
    // tab taken and no widget, the working list has no surface at all while
    // the ledger has one — an asymmetry nobody would choose on purpose, so
    // the option withdraws rather than stranding the list.
    needsBothDoors: true,
  },
]

export const DEFAULT_LOSSES_STRUCTURE = {
  lossesTab: true,
  earningsEntry: true,
  // HIDDEN is the baseline, and it is the one placement that is valid at
  // every point of the other two axes — `resolveLossesStructure` below never
  // has to rewrite it, the way it rewrites 'own-tab' when a door is shut. So
  // the app's default arrangement is the same arrangement whatever else is
  // toggled, rather than one that silently becomes 'subtab' underneath you.
  //
  // It is also the honest opening state: the ledger answers "what have losses
  // cost me?", which is a question worth a surface only once there is a run of
  // decided cases to put in it. The working list — "what must I do?" — is what
  // a Pilot opens the app for, and on the Live dataset there is no history at
  // all yet. Both other placements are one click away in the panel.
  historicPlacement: 'hidden',
}

/**
 * The axes, plus the four facts the app actually reads off them. Resolving
 * here rather than in `computeViewModel` keeps the one impossible combination
 * in the same file as the axis that creates it.
 */
export function resolveLossesStructure({ lossesTab, earningsEntry, historicPlacement }) {
  // The only impossible point: splitting the halves across two surfaces needs
  // two doors — a tab for the ledger, the widget for the working list. Short
  // of that it falls back to the sub-tab rather than to hidden, because
  // closing a door should not also take historic away.
  const canSplit = lossesTab && earningsEntry
  const placement = historicPlacement === 'own-tab' && !canSplit ? 'subtab' : historicPlacement

  return {
    lossesTab,
    earningsEntry,
    historicPlacement: placement,
    // The two halves sit on two different surfaces — the only arrangement in
    // which the losses surface carries no sub-tab row.
    splitHistoric: placement === 'own-tab',
    // One surface holding both halves, so it needs a row to switch them.
    hasSubTabs: placement === 'subtab',
    showHistoric: placement !== 'hidden',
  }
}

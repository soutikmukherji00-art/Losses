import { CloseIcon } from './icons.jsx'
import './BottomSheet.css'

/**
 * Shared dim-overlay + slide-up rounded-top card chrome.
 *
 * `title`/`subtitle`/`onClose` render the standard sheet head. They live here
 * rather than in each sheet because every sheet that has ever needed a head
 * has wanted the same one, and the first two built it twice.
 *
 * The close control uses the drawn `CloseIcon`, not the "×" character it was
 * standing in for — the same icon the confirmation popup and the L2 page
 * header already use. A typographic × has a different weight, cap height and
 * optical centre from every other icon in the app.
 *
 * `flush` is for a sheet whose body is a full-bleed list (rows supply their
 * own gutters), so the sheet's side padding doesn't inset them.
 *
 * `scrollBody` hands scrolling to the caller's own body element instead of
 * the sheet. A sheet that scrolls as a whole cannot pin anything to its
 * bottom — so a sheet carrying a commit button, which must never scroll out
 * of reach or hide behind the keyboard, sets this and scrolls its body.
 */
export default function BottomSheet({
  children, maxHeight, title, subtitle, onClose, flush = false, scrollBody = false,
}) {
  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div
        className={`bottom-sheet${flush ? ' bottom-sheet--flush' : ''}${scrollBody ? ' bottom-sheet--scroll-body' : ''}`}
        style={maxHeight ? { maxHeight } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bottom-sheet__grabber" />
        {title && (
          <div className="bottom-sheet__head">
            <div>
              <div className="bottom-sheet__title">{title}</div>
              {subtitle && <div className="bottom-sheet__subtitle">{subtitle}</div>}
            </div>
            {onClose && (
              <button type="button" className="bottom-sheet__close" onClick={onClose} aria-label="Close">
                <CloseIcon size={20} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

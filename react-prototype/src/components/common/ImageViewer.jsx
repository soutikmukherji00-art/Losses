import { useEffect, useRef } from 'react'
import { CloseIcon } from './icons.jsx'
import './ImageViewer.css'

/**
 * FULL-SCREEN PHOTO VIEWER — the other half of the evidence grid.
 *
 * `PhotoEvidenceGroup` has always been thumbnails on purpose: the grid's job
 * on the loss page is to say how many photos there are and let the Pilot
 * reach them, not to be the largest object on the screen. That trade only
 * works if there is somewhere to reach, and until now there wasn't — the
 * tiles carried `cursor: pointer` and a comment saying "tapping enlarges",
 * and tapping did nothing. This is the somewhere.
 *
 * It matters more here than a lightbox usually does. The claim against the
 * Pilot on a junk-photo case is that their own photograph was not clear
 * enough, and a 100px square is not enough to agree or disagree with that.
 * Deciding whether to accept or dispute means actually looking at it.
 *
 * Three ways out, because a viewer you can get stuck in is worse than no
 * viewer: the cross at top right, the ground around the photo, and Escape.
 *
 * Deliberately NOT `BottomSheet`: that chrome is a card sliding up over a
 * surface you can still see, with a grabber and a white ground. A photo
 * wants the opposite — the whole frame, no card, and a near-black ground so
 * nothing tints the image being judged (see `--viewer-ground`).
 */
export default function ImageViewer({ photo }) {
  const dialogRef = useRef(null)
  const { close } = photo

  // Escape closes. Bound to the document rather than the overlay because the
  // key has to work wherever focus happens to be, including on the image.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close])

  // Focus moves into the dialog on open, so a keyboard or screen-reader user
  // is inside the overlay rather than somewhere behind it.
  //
  // The DIALOG takes it, not the close button. Focusing the button looked
  // like the more helpful thing and was worse: Chrome treats a programmatic
  // focus as `:focus-visible`, so the button wore its keyboard ring every
  // time the viewer opened — including on a phone, where the Pilot never
  // pressed a key. The ring is for someone who actually tabbed to it.
  useEffect(() => { dialogRef.current?.focus() }, [])

  return (
    <div
      className="image-viewer"
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={photo.group ? `${photo.group} — ${photo.label}` : photo.label}
      onClick={close}
    >
      <button
        type="button"
        className="image-viewer__close"
        onClick={close}
        aria-label="Close photo"
      >
        <CloseIcon size={20} stroke="var(--viewer-ink)" />
      </button>

      {/* Stops the tap from reaching the ground behind it: tapping the
          photograph itself is not a request to close the photograph. */}
      <div className="image-viewer__stage" onClick={(e) => e.stopPropagation()}>
        <img className="image-viewer__img" src={photo.src} alt={photo.label} />
      </div>

      {/* Which of the four this is. It is the one thing the grid was saying
          that the full-screen view otherwise takes away — on a mismatch case
          "my photo" and "the QC photo" are the whole argument, and a photo
          with no label attached to it is evidence for nobody. */}
      <div className="image-viewer__caption">
        {photo.group && <span className="image-viewer__group">{photo.group}</span>}
        <span>{photo.label}</span>
      </div>
    </div>
  )
}

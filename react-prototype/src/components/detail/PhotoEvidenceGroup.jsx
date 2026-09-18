import Section from '../common/Section.jsx'
import './PhotoEvidenceGroup.css'

/**
 * Evidence-photo groups (Your photos / QC photos / Catalog photo). Photos are
 * dummy product shots in the prototype — the same catalogue the L0 loss list
 * draws its row thumbnails from — so a case opens on the item the Pilot just
 * tapped. Swap the sources for the real ones at handover; nothing else here
 * changes. Where a source is missing the striped placeholder still stands in.
 *
 * Every tile is a square, whatever the photo behind it: a mismatch is read by
 * comparing two pictures, and that comparison only works when the frames are
 * identical and the eye is left with just the contents to differ on.
 *
 * Each group is its own section, so "Your photos" and "QC photos" separate
 * the way "Base pay" and "Incentives" do in the reference, rather than by a
 * hairline inside one shared box.
 *
 * Thumbnails, always. Tapping enlarges — `ImageViewer`, mounted by App.jsx —
 * so the grid's job on the page is to say how many photos there are and let
 * the Pilot reach them, not to be the largest object on the screen. At full
 * height two groups ran to 448px on a closed case nobody needs to re-inspect.
 * That trade is only honest because the viewer exists: the claim on a
 * junk-photo case is that the Pilot's own photograph was not clear enough,
 * and a 100px square is not enough to agree or disagree with it.
 *
 * A tile with a photo is a `<button>`; a tile standing in for a missing image
 * (KRD F8) stays a plain div. Nothing to enlarge is not the same as something
 * you may tap and get nothing.
 *
 * THREE TILE STATES, not two. The third is `placeholder` — an empty white box
 * reading "Placeholder", used on a dataset that is not allowed to invent an
 * image (Live; see state/productImages.js). It is deliberately not the striped
 * frame: the stripes mean an image that should have arrived did not, and this
 * means the prototype has nothing true to put here. On the Live surface, where
 * every other pixel is traceable to the sheet, that difference is the whole
 * point — a reviewer has to be able to tell "we lost this photo" from "this
 * tile is scaffolding".
 *
 * No byline under a group head. "Taken by you at pickup · tap to enlarge" was
 * a second line of grey type on every group, and neither half earned it: the
 * heading already says whose photos these are, and "tap to enlarge" described
 * the only thing a photo tile has ever done.
 *
 * A group with `scroll` (the catalog row, behind the `losses-list.catalogImages`
 * layer) keeps that same tile but lets the row run past the right edge instead
 * of dividing itself between however many tiles it holds.
 */
/**
 * A caption exists to tell one tile from another, so a group holding a single
 * tile with the generic label has nothing for one to say: "Catalog photo" as
 * the heading and "Photo" underneath is the same word twice, once in grey.
 * A one-tile group that names what its photo IS (`itemLabel`) keeps its
 * caption — that is a caption doing work.
 *
 * Only reachable since the wrong-pickup reason started declaring its real
 * image set off the extract (three pickup photographs against one listing
 * cover); every group before that held two or more.
 */
const soleGenericTile = (group) => group.items.length === 1 && group.items[0].label === 'Photo'

export default function PhotoEvidenceGroup({ groups, onOpen }) {
  const [first, ...rest] = groups
  // A group either DIVIDES its row between its tiles or OVERFLOWS it: the
  // evidence groups are a fixed, comparable set, the catalog row is a listing
  // you scroll through. Same tile, same square — only the row differs.
  const row = (pr) => (
    <div className={`photo-group__row${pr.scroll ? ' photo-group__row--scroll fe-scroll' : ''}`}>
      {pr.items.map((ph, j) => (
        <div key={j} className="photo-group__item">
          {ph.src ? (
            <button
              type="button"
              className="photo-group__frame"
              // The group title travels with the photo: full screen, "my
              // photo" and "the QC photo" are the whole argument on a
              // mismatch, and the grid was the only thing saying which is
              // which.
              onClick={() => onOpen?.({ src: ph.src, label: ph.label, group: pr.title })}
              aria-label={`View ${pr.title} — ${ph.label}`}
            >
              <img className="photo-group__img" src={ph.src} alt={ph.label} loading="lazy" />
            </button>
          ) : ph.placeholder ? (
            <div className="photo-group__frame photo-group__frame--placeholder">
              <span className="photo-group__placeholder">Placeholder</span>
            </div>
          ) : (
            <div className="photo-group__frame photo-group__frame--missing">
              <span className="photo-group__missing">{ph.label}</span>
            </div>
          )}
          {ph.src && !soleGenericTile(pr) && <div className="photo-group__caption">{ph.label}</div>}
        </div>
      ))}
    </div>
  )

  return (
    <Section title={first.title}>
      {row(first)}
      {rest.map((pr, i) => (
        <div className="sec__group" key={i}>
          <div className="sec__group-title"><span>{pr.title}</span></div>
          {row(pr)}
        </div>
      ))}
    </Section>
  )
}

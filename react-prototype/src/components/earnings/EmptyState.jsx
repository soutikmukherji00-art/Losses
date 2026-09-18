import { CheckCircleIcon } from '../common/icons.jsx'
import './EmptyState.css'

/**
 * The "nothing here" state for a losses surface.
 *
 * The copy is a prop with a default rather than a constant, because the two
 * surfaces that can be empty are empty about DIFFERENT things. The working
 * list being empty means nothing needs doing — the default below. The historic
 * ledger being empty means nothing has been decided yet, which is not the same
 * claim at all, and it was making the claim anyway: on the Live dataset, where
 * six losses are awaiting an answer and none has been settled, tapping Losses
 * said "No losses marked. Good work!" over the whole amount still at stake.
 */
export default function EmptyState({
  title = 'No losses marked. Good work!',
  body = 'Nothing needs your action right now. Keep taking clear pickup photos and matching parcels with the list.',
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon"><CheckCircleIcon /></div>
      <div className="empty-state__title">{title}</div>
      <div className="empty-state__body">{body}</div>
    </div>
  )
}

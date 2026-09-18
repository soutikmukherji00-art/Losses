import { ChevronRightIcon } from './icons.jsx'
import './PaymentListItem.css'

/** Payment row — date (+ optional caption) on the left, amount + incentive
 * sub-line + chevron on the right. Same shape backs both the Payments tab's
 * "Past Payments" list and the My Earnings tab's "Daily Earnings History"
 * list (Figma's "Past payment tile" component is reused as-is in both). */
export default function PaymentListItem({ date, caption, amount, incentive, onClick }) {
  return (
    <div className="payment-list-item" onClick={onClick}>
      <div>
        <div className="payment-list-item__date">{date}</div>
        {caption && <div className="payment-list-item__caption">{caption}</div>}
      </div>
      <div className="payment-list-item__end">
        <div className="payment-list-item__amounts">
          <div className="payment-list-item__amount">{amount}</div>
          <div className="payment-list-item__incentive">{incentive}</div>
        </div>
        <ChevronRightIcon />
      </div>
    </div>
  )
}

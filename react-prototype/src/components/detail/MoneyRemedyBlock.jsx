import Section, { SectionRow } from '../common/Section.jsx'
import './MoneyRemedyBlock.css'

/**
 * Slot 3 — where the money actually is. One shape left:
 *
 *  · creditPair — LiF returned: the debit row STAYS and a credit is added.
 *                 Bank-statement rule, nothing deleted (KRD F19). This is the
 *                 reference's breakup table exactly — label left, signed
 *                 amount right, dashed rule between.
 *
 * The recovery and pointer sections that used to live here were both saying
 * what the hero says — see `buildMoneyBlock` in resolveCaseView.js. The
 * component keeps its name because the slot is still "money"; on every state
 * but RETURNED_CREDITED the whole slot is now absent.
 */
export default function MoneyRemedyBlock({ money }) {
  return (
    <>
      {money.creditPair && (
        <Section title="Money movement">
          <SectionRow
            label={money.creditPair.debit.label}
            sub={money.creditPair.debit.date}
            value={money.creditPair.debit.amount}
          />
          <SectionRow
            label={money.creditPair.credit.label}
            sub={money.creditPair.credit.date}
            value={money.creditPair.credit.amount}
          />
        </Section>
      )}

    </>
  )
}

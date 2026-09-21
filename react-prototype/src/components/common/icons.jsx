/* Small inline-SVG icon set, extracted from the original prototype markup.
   Kept as plain components (not an icon-font/sprite system) so each one can
   be swapped for a real design-system icon component 1:1 at handover. */

const base = { viewBox: '0 0 20 20', fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const HelpIcon = ({ size = 18, stroke = 'var(--text-secondary)' }) => (
  <svg width={size} height={size} {...base} stroke={stroke}>
    <path d="M3.6 12.5V10a6.4 6.4 0 0 1 12.8 0v2.5" />
    <rect x="2.2" y="11.4" width="3" height="4.6" rx="1.5" />
    <rect x="14.8" y="11.4" width="3" height="4.6" rx="1.5" />
  </svg>
)

export const NotificationIcon = ({ size = 19, stroke = 'var(--text-secondary)', dot = true }) => (
  <div style={{ position: 'relative', width: 24, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width={size} height={size} {...base} stroke={stroke}>
      <path d="M10 3.2a4.6 4.6 0 0 1 4.6 4.6c0 3.4 1.2 4.6 1.2 4.6H4.2s1.2-1.2 1.2-4.6A4.6 4.6 0 0 1 10 3.2z" />
      <path d="M8.4 15.2a1.7 1.7 0 0 0 3.2 0" />
    </svg>
    {dot && <div style={{ position: 'absolute', top: 9, right: 1, width: 7, height: 7, borderRadius: 4, background: 'var(--valmo-red-main)' }} />}
  </div>
)

export const ChevronRightIcon = ({ size = 20, stroke = 'var(--text-secondary)' }) => (
  <svg width={size} height={size} {...base} stroke={stroke}><path d="M7 4l6 6-6 6" /></svg>
)

export const ChevronDownIcon = ({ size = 14, stroke = 'var(--valmo-navy)', deg = 0 }) => (
  <svg width={size} height={size} {...base} strokeWidth={2} stroke={stroke} style={{ transform: `rotate(${deg}deg)`, transition: 'transform 150ms ease' }}>
    <path d="M5 7.5 10 12.5 15 7.5" />
  </svg>
)

export const BackIcon = ({ size = 24, stroke = 'var(--text-primary)' }) => (
  <svg width={size} height={size} {...base} strokeWidth={1.8} stroke={stroke}><path d="M12.5 4.5 7 10l5.5 5.5" /></svg>
)

export const InfoBookIcon = ({ size = 20, stroke = 'var(--valmo-navy)' }) => (
  <svg width={size} height={size} {...base} stroke={stroke}><path d="M5 3h7l3 3v11H5z" /></svg>
)

export const RateCardIcon = ({ size = 16, stroke = 'var(--valmo-green-emerald)' }) => (
  <svg width={size} height={size} {...base} stroke={stroke}><rect x="3" y="3" width="14" height="14" rx="3" /></svg>
)

export const HowPaymentsIcon = ({ size = 16, stroke = 'var(--valmo-navy)' }) => (
  <svg width={size} height={size} {...base} stroke={stroke}>
    <path d="M4 8h2.4L10 5v10L6.4 12H4z" />
    <path d="M13.4 7.6a3.4 3.4 0 0 1 0 4.8" />
  </svg>
)

export const CheckCircleIcon = ({ size = 26, stroke = 'var(--good-ink)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" stroke={stroke}>
    <path d="M4.5 12.5 9.5 17.5 19.5 7" />
  </svg>
)

export const WarningIcon = ({ size = 20, stroke = 'var(--valmo-orange-main)' }) => (
  <svg width={size} height={size} {...base} strokeWidth={1.7} stroke={stroke}>
    <path d="M10 2.6 2.4 16.4h15.2z" />
    <path d="M10 7.6v4" />
    <path d="M10 14.1h.01" />
  </svg>
)

export const ClockIcon = ({ size = 16, stroke = 'var(--valmo-navy)' }) => (
  <svg width={size} height={size + 1} {...base} stroke={stroke}>
    <circle cx="10" cy="10" r="7.3" />
    <path d="M10 9.2v4M10 6.6v.6" />
  </svg>
)

/**
 * ALARM CLOCK — the loss banner's Actionable mark (LossesEntryPoint.jsx).
 *
 * Its own icon rather than `ClockIcon` above, which is a circle with two
 * short vertical strokes for hands: at 14px beside a date that reads as a
 * clock, but blown up to 20px and set alone in a tinted banner it reads as an
 * info or exclamation circle — which is what the first build of the banner
 * shipped looking like. So this one has hands at genuinely different lengths
 * and angles (a quarter past eleven), which is the thing the eye uses to tell
 * a clock face from a bulleted circle, plus two bells so the mark cannot be
 * mistaken for either. It is also what makes the shake read as a shake.
 */
export const AlarmClockIcon = ({ size = 20, stroke = 'var(--text-warning-ink)' }) => (
  <svg width={size} height={size} {...base} stroke={stroke} strokeWidth={1.7}>
    <circle cx="10" cy="11.2" r="6.5" />
    <path d="M10 11.2V7.4" />
    <path d="M10 11.2l2.9 1.7" />
    <path d="M5.2 4.3 3.4 6" />
    <path d="M14.8 4.3 16.6 6" />
  </svg>
)

/** Outline info circle — the quiet, tappable "there is more to say about this
 *  number" marker that sits beside a section total. Outline, not the filled
 *  dot below it: that one is an alert, this one is an invitation. */
export const InfoIcon = ({ size = 16, stroke = 'var(--text-tertiary)' }) => (
  <svg width={size} height={size} {...base} stroke={stroke}>
    <circle cx="10" cy="10" r="7.6" />
    <path d="M10 9.1v4.3" />
    <path d="M10 6.5v.2" />
  </svg>
)

/** Filled info dot — the orange marker on the reference's deadline alert
 *  (Figma WCghUzecsonToq8dCxpm3W · 1636:20763). */
export const InfoDotIcon = ({ size = 18, fill = 'var(--valmo-orange-main)' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" fill={fill} />
    <path d="M10 5.6v.9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 8.6v5.2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/**
 * Lucide `package-x` — a parcel with a cross. The losses banner used the
 * generic warning triangle, which says "caution" rather than "a parcel went
 * wrong"; in a delivery app every loss hangs off an AWB, so the parcel is the
 * thing that signifies it. Drawn here in the house style rather than pulled in
 * as a dependency, per this file's header.
 */
export const PackageXIcon = ({ size = 20, stroke = 'var(--valmo-navy)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0" />
    <path d="m7.5 4.27 9 5.15" />
    <path d="M3.29 7 12 12l8.71-5" />
    <path d="M12 22V12" />
    <path d="m17 13 5 5" />
    <path d="m22 13-5 5" />
  </svg>
)

/**
 * Lucide `lightbulb` — the insight banner's mark. Deliberately NOT the parcel
 * or the warning triangle the loss surfaces use: that block is the one thing
 * on the list that looks forward rather than reporting a debit, and a Pilot
 * who cannot read the headline should still be able to tell the two apart.
 * Drawn in the house style rather than pulled in as a dependency, per this
 * file's header.
 */
export const LightbulbIcon = ({ size = 20, stroke = 'var(--valmo-navy)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5A5.6 5.6 0 0 0 18 8a6 6 0 0 0-12 0c0 1.2.5 2.5 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
)

/**
 * Lucide `shield-check` — the grace banner's mark. A shield is cover, and
 * the tick says the cover is in force; neither the parcel (a loss) nor the
 * bulb (a lesson) says "you are protected for now". House style, per this
 * file's header.
 */
export const ShieldCheckIcon = ({ size = 24, stroke = 'var(--valmo-navy)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

/** Drawn close glyph — replaces the "×" character that was standing in for an
 *  icon at 20px in the sheet header. */
export const CloseIcon = ({ size = 20, stroke = 'var(--text-secondary)' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round">
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
)

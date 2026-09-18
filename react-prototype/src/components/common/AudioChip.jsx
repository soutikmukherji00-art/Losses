import './AudioChip.css'

/** The recurring "सुनें" (listen) pill next to banners/info blocks. In the
 * prototype it's a no-op (playAudio just stops propagation); wire it to a
 * real TTS/audio player at handover. */
export default function AudioChip({ borderColor = 'var(--border-default)', size = 'md', onClick }) {
  const dims = size === 'sm' ? 28 : 32
  return (
    <button
      type="button"
      className="audio-chip"
      style={{ height: dims, borderColor }}
      onClick={(e) => { e.stopPropagation(); onClick?.(e) }}
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="var(--valmo-navy)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h2.4L10 5v10L6.4 12H4z" />
        <path d="M13.4 7.6a3.4 3.4 0 0 1 0 4.8" />
        <path d="M15.6 5.4a6.4 6.4 0 0 1 0 9.2" />
      </svg>
      <span>सुनें</span>
    </button>
  )
}

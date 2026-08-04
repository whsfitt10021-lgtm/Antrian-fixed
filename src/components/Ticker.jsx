import { Icon } from './icons'

export default function Ticker({ text }) {
  if (!text) return null
  const len = text.length
  const secs = Math.max(14, Math.min(90, len * 0.22 + 10))

  return (
    <div className="flex items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-sm border border-[#1f4d80] border-l-4 border-l-gate-1 bg-surface-1 px-3.5 py-2.5 animate-fadeInUp">
      <span className="flex shrink-0 items-center gap-1.5 rounded-sm bg-gate-1 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-white">
        <Icon.Megaphone /> INFO
      </span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <span
          className="ticker-track inline-block whitespace-nowrap pl-full text-lg font-extrabold text-ink-primary"
          style={{ animationDuration: `${secs}s`, paddingLeft: '100%' }}
        >
          {text}
        </span>
      </div>
    </div>
  )
}

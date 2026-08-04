import { useEffect, useRef, useState } from 'react'
import { Icon } from './icons'
import { extractYouTubeId } from '../utils/time'

const LOAD_TIMEOUT_MS = 9000

export default function VideoPanel({ videoUrl, label, sourceLabel }) {
  const videoId = extractYouTubeId(videoUrl)
  const [status, setStatus] = useState('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const watchdogRef = useRef(null)

  useEffect(() => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current)
    if (!videoId) return
    setStatus('loading')
    watchdogRef.current = setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'failed' : s))
    }, LOAD_TIMEOUT_MS)
    return () => clearTimeout(watchdogRef.current)
  }, [videoId, reloadKey])

  const embedSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&playlist=${videoId}`
    : ''

  const badgeLabel = status === 'failed' ? 'OFFLINE' : label

  return (
    <div className="relative h-full overflow-hidden rounded-lg border border-[#1f4d80] bg-black shadow-panel animate-fadeInUp">
      <div className="absolute left-3 top-2.5 z-10 flex items-center gap-1.5 rounded-sm border border-white/15 bg-black/80 px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-ink-primary">
        <span className={`h-1.5 w-1.5 rounded-full ${status === 'ok' ? 'bg-red animate-pulseSoft' : 'bg-ink-muted'}`} />
        {badgeLabel}
      </div>

      {videoId && status !== 'failed' ? (
        <iframe
          key={reloadKey}
          title={label}
          src={embedSrc}
          allow="autoplay; encrypted-media"
          allowFullScreen
          frameBorder="0"
          className="absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 scale-[2.2] pointer-events-none"
          onLoad={() => { clearTimeout(watchdogRef.current); setStatus((s) => (s === 'loading' ? 'ok' : s)) }}
          onError={() => { clearTimeout(watchdogRef.current); setStatus('failed') }}
        />
      ) : !videoId ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 bg-surface-1 text-[12.5px] tracking-wide text-ink-muted">
          <Icon.VideoOff className="text-3xl opacity-50" />
          <span>{sourceLabel} kosong / tidak valid</span>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 bg-surface-1 px-8 text-center text-[12.5px] tracking-wide text-ink-muted">
          <Icon.VideoOff className="text-3xl text-red opacity-70" />
          <span className="max-w-[240px] leading-relaxed">Video gagal dimuat. Periksa koneksi internet perangkat TV.</span>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-1 rounded-sm border border-[#1f4d80] bg-surface-2 px-4 py-1.5 text-xs font-bold tracking-wide text-ink-secondary transition hover:bg-[#123a67] hover:border-ink-tertiary active:translate-y-px"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  )
}

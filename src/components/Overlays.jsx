import { Icon } from './icons'

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-3.5 bg-blue-deep px-5 text-center">
      <div className="h-13 w-13 animate-spin rounded-full border-4 border-[#1f4d80] border-t-ink-secondary" style={{ width: 52, height: 52 }} />
      <div className="text-sm tracking-wide text-[#c9c2b4]">MEMUAT DATA ANTREAN...</div>
    </div>
  )
}

export function AudioUnlockOverlay({ onUnlock }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onUnlock}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onUnlock() }}
      className="fixed inset-0 z-[1000] flex cursor-pointer flex-col items-center justify-center gap-3.5 bg-[#0a0f18]/95 px-5 text-center"
    >
      <Icon.Volume className="text-5xl text-ink-secondary" />
      <div className="text-[19px] font-bold text-ink-primary">Klik / Sentuh untuk Mengaktifkan Suara Panggilan</div>
      <div className="max-w-[420px] text-[12.5px] font-medium leading-relaxed text-ink-tertiary">
        Browser mewajibkan satu kali interaksi sebelum bisa memutar bel dan suara panggilan (suara diambil dari Web Speech API bawaan browser).
      </div>
    </div>
  )
}

export function StateOverlay({ variant, title, subtitle, footer }) {
  const iconColor = variant === 'holiday' ? 'text-cyan' : 'text-gold'
  return (
    <div className="fixed inset-0 z-[997] flex flex-col items-center justify-center gap-4.5 bg-blue-deep px-10 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#1f4d80] bg-surface-1">
        <span className={`text-5xl ${iconColor}`}>
          {variant === 'holiday' ? <Icon.CalendarOff /> : <Icon.AlertTriangle />}
        </span>
      </div>
      <div className="text-[26px] font-extrabold text-ink-primary">{title}</div>
      <div
        className={
          variant === 'error'
            ? 'max-w-[520px] rounded-md border border-[#1f4d80] border-l-4 border-l-gold bg-surface-1 px-4.5 py-3 text-left text-[14.5px] font-medium leading-relaxed text-[#e6c88a]'
            : 'max-w-[520px] text-[14.5px] font-medium leading-relaxed text-ink-secondary'
        }
      >
        {subtitle}
      </div>
      {footer && <div className="mt-1 font-mono text-[13px] tracking-wide text-ink-tertiary">{footer}</div>}
    </div>
  )
}

export function FatalOverlay({ detail }) {
  return (
    <div className="fixed inset-0 z-[1001] flex flex-col items-center justify-center gap-3.5 bg-[#0d1420] px-10 text-center text-ink-primary">
      <div className="text-[22px] font-extrabold text-[#e6c88a]">⚠️ Gagal Memuat Layar Antrean</div>
      <div className="max-w-[480px] text-sm leading-relaxed text-[#b7c0c9]">
        Kemungkinan koneksi internet perangkat TV ini gagal mengakses backend Apps Script, atau ada kesalahan lain. Periksa koneksi internet perangkat ini, lalu refresh halaman.
      </div>
      {detail && (
        <div className="max-w-[560px] break-words rounded-md border border-[#223257] bg-[#10192b] px-3.5 py-2.5 font-mono text-[11.5px] text-[#838f9b]">
          {detail}
        </div>
      )}
    </div>
  )
}

export function SimBanner() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-sm bg-[#7a1f1f] px-3 py-2 text-[13px] font-extrabold tracking-wide text-white">
      <Icon.AlertTriangle />
      MODE SIMULASI — KONEKSI KE SERVER ASLI TERPUTUS. DATA DI LAYAR INI BUKAN DATA REAL.
    </div>
  )
}

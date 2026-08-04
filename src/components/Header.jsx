import { useState } from 'react'
import { Icon } from './icons'

const DRIVE_FILE_ID = '13jvVlbS38UFe8VbxAILcX4--OOBqO1CW'
const LOGO_SOURCES = [
  `https://drive.google.com/thumbnail?id=${DRIVE_FILE_ID}&sz=w200`,
  `https://lh3.googleusercontent.com/d/${DRIVE_FILE_ID}=w200`,
  `https://drive.google.com/uc?export=view&id=${DRIVE_FILE_ID}`
]

export default function Header({ timeStr, dateStr, connected, speechSupported }) {
  const [logoIdx, setLogoIdx] = useState(0)
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <div className="flex items-center justify-between border-b-2 border-cyan pb-3.5 pt-1 px-0.5">
      <div className="flex items-center gap-4">
        <div className="relative w-13 h-13 shrink-0 overflow-hidden rounded border border-[#1f4d80] bg-gradient-to-br from-blue-glow to-cyan flex items-center justify-center text-white text-2xl"
             style={{ width: 52, height: 52 }}>
          {!logoFailed && (
            <img
              src={LOGO_SOURCES[logoIdx]}
              alt="Logo Perusahaan"
              className="absolute inset-0 w-full h-full object-contain bg-white p-1.5 rounded"
              onError={() => {
                if (logoIdx < LOGO_SOURCES.length - 1) setLogoIdx((i) => i + 1)
                else setLogoFailed(true)
              }}
            />
          )}
          <Icon.Box />
        </div>
        <div>
          <h1 className="font-sans text-[25px] font-extrabold leading-tight text-ink-primary">
            PT Wahana Duta Jaya Rucika
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[1.4px] text-ink-muted before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-cyan">
            Sistem Antrean Muat Kendaraan
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[1.6px] text-ink-tertiary">
            <Icon.Dot className={connected ? 'text-green text-[9px]' : 'text-red text-[9px]'} />
            <span>{connected ? 'Live' : 'Terputus...'}</span>
            {speechSupported ? <Icon.Volume className="text-ink-muted text-[9px]" /> : <Icon.VolumeOff className="text-gold text-[9px]" />}
            <span>{speechSupported ? 'Suara Aktif' : 'Suara Tidak Didukung'}</span>
          </p>
        </div>
      </div>

      <div className="rounded-md border border-[#1f4d80] bg-surface-2 px-4.5 py-2 text-right" style={{ padding: '8px 18px' }}>
        <div className="flex items-center justify-end gap-2 font-mono text-[30px] font-bold leading-none tabular-nums text-ink-primary">
          <Icon.Clock className="text-cyan text-[19px]" />
          <span>{timeStr}</span>
        </div>
        <div className="mt-1 text-xs font-medium text-ink-tertiary">{dateStr}</div>
      </div>
    </div>
  )
}

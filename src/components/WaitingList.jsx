import { Icon } from './icons'
import { computePersiapanInfo, formatEtaClock } from '../utils/time'
import { QS_LABEL } from '../config'

function positionInGate(list, idx) {
  const v = list[idx]
  if (!v || !v.gate) return null
  let pos = 0
  for (let i = 0; i <= idx; i++) if (list[i] && list[i].gate === v.gate) pos++
  return pos
}

export default function WaitingList({ list, waitEstimates, estimasiMuat, nowMs }) {
  const estFor = (v) => {
    const key = `${v.noUrut}:${v.noPol}`
    const val = waitEstimates ? waitEstimates[key] : undefined
    return val === undefined ? null : val
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#1f4d80] bg-surface-1 px-4 pb-3 pt-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between border-b border-[#1f4d80] pb-2.5 font-stencil text-[15px] font-extrabold uppercase tracking-[1.4px] text-ink-primary">
        <span className="flex items-center gap-2"><Icon.Hourglass className="text-ink-tertiary" /> ANTREAN MENUNGGU</span>
        <span className="rounded-sm border border-[#1f4d80] bg-surface-2 px-3 py-0.5 font-mono text-[12.5px] font-semibold text-ink-secondary">
          {list.length} kendaraan
        </span>
      </div>

      {!list.length ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-2.5 py-6 text-ink-muted">
          <Icon.Check className="text-4xl opacity-45" />
          <div>Tidak ada antrean menunggu</div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-[#1f4d80] bg-surface-3">
          <div className="grid shrink-0 bg-gold text-[#241a06]" style={{ gridTemplateColumns: '46px 128px 1fr 108px 168px' }}>
            {['No', 'No. Polisi', 'Customer', 'Gate', 'Status'].map((h) => (
              <div key={h} className="border-r border-black/15 px-3 py-2 font-stencil text-[11.5px] font-extrabold uppercase tracking-wider last:border-r-0">
                {h}
              </div>
            ))}
          </div>

          <div className="scroll-thin flex-1 overflow-y-auto">
            {list.map((v, idx) => {
              const persiapan = computePersiapanInfo(v, estimasiMuat, nowMs)
              const pos = positionInGate(list, idx)
              const isNextInGate = v.gate && pos === 1

              let pillClass, pillIcon, pillLabel
              if (!v.gate) {
                if (persiapan) {
                  pillClass = persiapan.isUrgent ? 'bg-red text-white' : 'bg-gradient-to-br from-steel to-steel-black2 text-amber border border-steel-light shadow-beacon'
                  pillIcon = persiapan.isUrgent ? <Icon.AlertTriangle /> : <span className="h-1.5 w-1.5 rounded-full bg-amber animate-beacon" />
                  pillLabel = persiapan.isUrgent ? persiapan.label : `SEDANG PERSIAPAN ${persiapan.label}`
                } else {
                  pillClass = 'bg-transparent text-ink-tertiary border border-white/15'
                  pillIcon = <Icon.Note />
                  pillLabel = 'BELUM ADA GATE'
                }
              } else if (pos === 1) {
                pillClass = 'bg-red text-white'
                pillIcon = <Icon.AlertTriangle />
                pillLabel = 'Segera Dipanggil'
              } else {
                pillClass = 'bg-cyan text-white'
                pillIcon = <Icon.Clock />
                pillLabel = 'Menunggu Giliran'
              }

              const qsLabel = v.queueStatus ? QS_LABEL[v.queueStatus] || v.queueStatus : null
              const est = estFor(v)

              return (
                <div
                  key={`${v.noUrut}-${v.noPol}`}
                  className={[
                    'grid border-b border-white/[.08] animate-fadeInUp',
                    idx % 2 === 1 ? 'bg-[#0d2745]' : 'bg-[#0a2140]',
                    isNextInGate ? '!bg-[#24160f]' : ''
                  ].join(' ')}
                  style={{ gridTemplateColumns: '46px 128px 1fr 108px 168px' }}
                >
                  <Cell className="items-center justify-center text-center font-mono font-extrabold text-ink-tertiary">{v.noUrut}</Cell>
                  <Cell className="items-center justify-center font-mono text-[16px] font-extrabold tracking-wide text-ink-primary">{v.noPol || '-'}</Cell>
                  <Cell>
                    <div className="truncate text-sm font-bold text-ink-primary">{v.nama || '-'}</div>
                    <div className="mt-0.5 truncate text-[10.5px] font-semibold uppercase tracking-wide text-ink-tertiary">
                      {v.jenisMobil || '-'}{qsLabel ? ` · ${qsLabel}` : ''}
                    </div>
                  </Cell>
                  <Cell className="items-center">
                    {v.gate ? (
                      <span className="inline-block min-w-[76px] rounded-[2px] bg-[#eef2f6] px-2.5 py-1 text-center font-mono text-[13px] font-extrabold text-[#0d1420]">{v.gate}</span>
                    ) : (
                      <span className="inline-block rounded-[2px] border border-dashed border-white/15 px-2.5 py-1 text-[11px] font-bold text-ink-muted">-</span>
                    )}
                  </Cell>
                  <Cell className="items-start gap-1">
                    <span className={`inline-flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 font-stencil text-xs font-extrabold uppercase tracking-wide ${pillClass}`}>
                      {pillIcon}{pillLabel}
                    </span>
                    {persiapan && (
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full bg-[length:200%_100%] animate-shimmer ${persiapan.isUrgent ? 'bg-gradient-to-r from-[#7a1f1f] via-red to-[#ff8f8f]' : 'bg-gradient-to-r from-[#8a5a06] via-amber to-[#ffe7ad]'}`}
                          style={{ width: `${persiapan.percent}%` }}
                        />
                      </div>
                    )}
                    {est !== null && (
                      <span className="mt-0.5 flex items-center gap-1 font-mono text-[11px] font-bold text-ink-tertiary">
                        <Icon.Flag className="text-ink-muted" /> Muat berikutnya ≈ {formatEtaClock(est, nowMs)}
                      </span>
                    )}
                  </Cell>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Cell({ children, className = '' }) {
  return (
    <div className={`flex min-w-0 flex-col justify-center border-r border-white/[.08] px-3 py-2.5 last:border-r-0 ${className}`}>
      {children}
    </div>
  )
}

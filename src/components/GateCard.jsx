import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './icons'
import {
  computeChipInfo, computeCountdown, computeProgressPercent, etaSelesaiClockFor,
  formatCheckInValue, formatEtaClock, vField
} from '../utils/time'

const RING_R = 40
const RING_CIRC = 2 * Math.PI * RING_R

const GATE_ACCENT = {
  'gate-1': '#3577a8', 'gate-2': '#3fae6f', 'gate-3': '#d99a35', 'gate-4': '#6c7f92', 'gate-5': '#c17a3f'
}

function computeGateScale(n) {
  if (n <= 1) return 1
  if (n === 2) return 0.94
  if (n === 3) return 0.88
  if (n === 4) return 0.82
  if (n === 5) return 0.76
  return 0.7
}

export default function GateCard({ gateName, accentKey, data, speakerActive, flashTrigger, gateCount, nextVehicle, nextWaitMinutes }) {
  const [nowMs, setNowMs] = useState(Date.now())
  const [flashing, setFlashing] = useState(false)
  const prevFlashRef = useRef(flashTrigger)

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (flashTrigger !== prevFlashRef.current) {
      prevFlashRef.current = flashTrigger
      setFlashing(true)
      const t = setTimeout(() => setFlashing(false), 1200)
      return () => clearTimeout(t)
    }
  }, [flashTrigger])

  const accent = GATE_ACCENT[accentKey] || '#0072ce'
  const waitingVehicle = !data ? nextVehicle : null
  const activeVehicle = data || waitingVehicle
  const chipInfo = computeChipInfo(data, nowMs, false)
  const countdown = useMemo(() => computeCountdown(data, nowMs), [data, nowMs])
  const progressPercent = waitingVehicle ? 0 : computeProgressPercent(data, nowMs)
  const isOvertime = !!countdown?.isOvertime
  const ringOffset = RING_CIRC * (1 - progressPercent / 100)
  const gateScale = computeGateScale(gateCount)

  const field = (keys, fallback) => vField(activeVehicle, keys, fallback)
  const dCheckIn = formatCheckInValue(field(
    ['noPolInputAt', 'checkIn', 'jamCheckIn', 'checkinTime', 'timestampNoPol', 'waktuInputNoPol',
      'inputNoPolAt', 'timestamp', 'waktuInput', 'tglJamInput', 'createdAt', 'jamInput'], null
  ))
  const dTruck = field(['jenisMobil'], '-')
  const dDock = field(['dockLokasi', 'lokasi', 'dock'], gateName)
  const dOperator = field(['operator', 'expedisi'], '-')
  const dMulaiMuat = data && data.calledAt ? data.calledAt : '-'
  const dEtaSelesai = data ? etaSelesaiClockFor(data) : '-'
  const dEtaPanggil = waitingVehicle ? formatEtaClock(nextWaitMinutes, nowMs) : '-'

  let footerLabel = 'Estimasi Muat'
  let footerValue = '-'
  let footerTone = 'normal'
  if (waitingVehicle) {
    footerLabel = 'Estimasi Panggil'
    footerValue = dEtaPanggil
    footerTone = 'waiting'
  } else if (countdown) {
    if (countdown.mode === 'countdown') {
      footerLabel = countdown.isOvertime ? 'Lewat Waktu Estimasi' : 'Sisa Waktu Estimasi'
      footerValue = countdown.isOvertime ? countdown.label : '-' + countdown.label
      footerTone = countdown.isOvertime ? 'overtime' : 'normal'
    } else {
      footerLabel = 'Target Estimasi Muat'
      footerValue = countdown.label
    }
  }

  const chipToneClass = waitingVehicle
    ? 'bg-gold text-[#241a06]'
    : isOvertime
    ? 'bg-red text-white'
    : chipInfo.state === 'empty'
    ? 'bg-transparent text-ink-tertiary border border-white/15'
    : chipInfo.state === 'loading'
    ? 'bg-gradient-to-b from-steel to-steel-black2 text-amber border border-steel-light shadow-beacon'
    : ''
  const chipStyle = !waitingVehicle && !isOvertime && chipInfo.state === 'calling' ? { backgroundColor: accent } : undefined

  return (
    <div
      className={[
        'relative flex overflow-hidden rounded-xl border border-[#1f4d80] bg-surface-1 shadow-panel transition-shadow',
        data || waitingVehicle ? 'shadow-panel-lg' : '',
        chipInfo.state === 'loading' ? 'ring-1 ring-amber/30' : '',
        flashing ? 'animate-cardFlash' : ''
      ].join(' ')}
    >
      <div
        className="relative flex w-[84px] shrink-0 flex-col items-center justify-center gap-1"
        style={{
          width: 84 * gateScale,
          background: `linear-gradient(165deg, ${accent} 0%, #04101f 130%)`
        }}
      >
        <span className="font-stencil text-[12.5px] font-extrabold uppercase tracking-[2.4px] text-white/85">Gate</span>
        <span className="font-stencil text-[46px] font-extrabold leading-none text-white" style={{ fontSize: 46 * gateScale }}>
          {gateName.replace(/[^0-9]/g, '') || gateName}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 px-5 py-3.5" style={{ padding: `${14 * gateScale}px ${20 * gateScale}px` }}>
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[1.2px] text-ink-tertiary">
            <Icon.Warehouse className="shrink-0 text-ink-muted" /> {gateName}
          </div>
          <div
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-3.5 py-1.5 font-stencil text-[12.5px] font-extrabold uppercase tracking-[1.1px] ${chipToneClass}`}
            style={chipStyle}
          >
            {chipInfo.state === 'loading' && !isOvertime && (
              <span className="h-2 w-2 rounded-full bg-amber shadow-beacon animate-beacon" />
            )}
            {isOvertime && <Icon.AlertTriangle />}
            {waitingVehicle ? (
              <><Icon.Hourglass /> MENUNGGU</>
            ) : (
              <>
                {chipInfo.state !== 'loading' && !isOvertime && (
                  <Icon.Megaphone className={chipInfo.state === 'calling' && speakerActive ? 'animate-pulseSoft' : chipInfo.state === 'empty' ? 'animate-spin' : ''} />
                )}
                {chipInfo.label}
              </>
            )}
          </div>
        </div>

        {!activeVehicle ? (
          <div className="flex items-center gap-3.5 py-1.5 text-ink-muted">
            <Icon.Loader className="animate-spin text-2xl opacity-50" />
            <span className="text-[13px] font-medium">Menunggu kendaraan...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div
                className="shrink-0 rounded-sm border-2 bg-white px-4 py-1.5 text-center font-mono text-[30px] font-bold text-[#0d1420] shadow-panel"
                style={{ borderColor: accent, minWidth: 140 * gateScale, fontSize: 30 * gateScale }}
              >
                {activeVehicle.noPol || '— — — —'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-ink-tertiary">
                  <Icon.Hash /> NO. ANTRIAN {activeVehicle.noUrut}
                </div>
                <div className="truncate text-[17px] font-bold text-ink-primary">{activeVehicle.nama || '-'}</div>
              </div>
            </div>

            <div className="flex items-center gap-4.5">
              <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-1.5">
                <DetailItem icon={<Icon.Truck />} label="Jenis Kendaraan" value={dTruck} />
                <DetailItem icon={<Icon.MapPin />} label="Dock / Lokasi" value={dDock} />
                <DetailItem icon={<Icon.Login />} label="Check In" value={dCheckIn} />
                {!waitingVehicle && <DetailItem icon={<Icon.Megaphone />} label="Mulai Muat" value={dMulaiMuat} />}
                {!waitingVehicle && <DetailItem icon={<Icon.Flag />} label="ETA Selesai" value={dEtaSelesai} />}
                <DetailItem icon={<Icon.UserGear />} label="Operator" value={dOperator} />
              </div>

              <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-1">
                <div className="relative" style={{ width: 88 * gateScale, height: 88 * gateScale }}>
                  <svg viewBox="0 0 88 88" className="-rotate-90" style={{ width: '100%', height: '100%' }}>
                    <circle cx="44" cy="44" r={RING_R} fill="none" stroke="#082038" strokeWidth="8" />
                    <circle
                      cx="44" cy="44" r={RING_R} fill="none"
                      stroke={waitingVehicle ? '#d99a35' : isOvertime ? '#ff3b3b' : accent}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={RING_CIRC} strokeDashoffset={ringOffset}
                      style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-[19px] font-extrabold tabular-nums text-ink-primary">
                    {waitingVehicle ? '0%' : `${progressPercent}%`}
                  </div>
                </div>
                <div className="text-center font-stencil text-[9.5px] font-bold uppercase tracking-wider text-ink-tertiary">
                  {waitingVehicle ? 'Menunggu' : 'Progres Muat'}
                </div>
              </div>
            </div>

            <div className={[
              'flex items-center justify-between gap-2.5 rounded-md border px-3.5 py-2',
              footerTone === 'overtime' ? 'border-red/30 bg-[#2a0f14]' : footerTone === 'waiting' ? 'border-gold/30 bg-surface-2' : 'border-white/10 bg-surface-2'
            ].join(' ')}>
              <span className="flex items-center gap-1.5 font-stencil text-[10.5px] font-bold uppercase tracking-wider text-ink-tertiary">
                <Icon.TimerSla /> {footerLabel}
              </span>
              <span className={`font-mono text-[15px] font-extrabold tabular-nums ${footerTone === 'overtime' ? 'text-red' : footerTone === 'waiting' ? 'text-gold' : 'text-cyan'}`}>
                {footerValue}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-ink-muted text-[13px]">{icon}</span>
      <span className="shrink-0 text-[10.5px] font-semibold tracking-wide text-ink-tertiary">{label}</span>
      <span className="ml-auto truncate text-right font-mono text-[12.5px] font-bold text-ink-primary">{value}</span>
    </div>
  )
}

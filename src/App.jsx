import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useClock from './hooks/useClock'
import useAudio from './hooks/useAudio'
import useQueueState from './hooks/useQueueState'
import Header from './components/Header'
import Ticker from './components/Ticker'
import StatsRow from './components/StatsRow'
import GateCard from './components/GateCard'
import VideoPanel from './components/VideoPanel'
import WaitingList from './components/WaitingList'
import ErrorBoundary from './components/ErrorBoundary'
import { LoadingOverlay, AudioUnlockOverlay, StateOverlay, SimBanner } from './components/Overlays'
import { computeWaitEstimates, isVehicleLoading } from './utils/time'
import { GATE_PALETTE, STATUS, MAX_CCTV_PANELS } from './config'

function AppInner() {
  const { timeStr, dateStr } = useClock()
  const [flashTriggers, setFlashTriggers] = useState({})
  const configRef = useRef({})
  const gateEverActiveRef = useRef({})
  const gateEverActiveDateKeyRef = useRef(null)

  const handleCallsDetected = useCallback((changedCalls) => {
    setFlashTriggers((prev) => {
      const next = { ...prev }
      changedCalls.forEach(({ gateName }) => { next[gateName] = (next[gateName] || 0) + 1 })
      return next
    })
    const calls = changedCalls.map(({ gateName, called }) => ({
      data: called,
      gateLabel: gateName,
      gateKey: gateName,
      isUlang: String(called.status || '').trim().toUpperCase() === STATUS.PANGGIL_LAGI
    }))
    if (calls.length) announceCallsRef.current(calls)
  }, [])

  const { audioUnlocked, speakerActive, speechSupported, announceCalls, unlock } = useAudio(configRef)
  const announceCallsRef = useRef(announceCalls)
  announceCallsRef.current = announceCalls

  const { state, loading, connected, simulationActive } = useQueueState(handleCallsDetected)
  configRef.current = state.config

  const [waitNowMs, setWaitNowMs] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setWaitNowMs(Date.now()), 5000)
    return () => clearInterval(id)
  }, [])
  const waitEstimates = useMemo(() => computeWaitEstimates(state, waitNowMs), [state, waitNowMs])

  const validGateNames = useMemo(
    () => (state.activeGateNames || []).filter((g) => typeof g === 'string' && g.trim().length > 0),
    [state.activeGateNames]
  )

  const calledFor = useCallback((gateName) => (state.gates[gateName] ? state.gates[gateName].called : null), [state.gates])
  const nextForGate = useCallback((gateName) => {
    const list = (state.waitingList || []).filter((v) => v.gate === gateName)
    if (!list.length) return null
    return list.slice().sort((a, b) => (Number(a.noUrut) || 0) - (Number(b.noUrut) || 0))[0]
  }, [state.waitingList])

  // Tandai gate yang "pernah aktif" hari ini, reset saat tanggal operasional berganti.
  useEffect(() => {
    if (gateEverActiveDateKeyRef.current !== state.tanggal) {
      gateEverActiveRef.current = {}
      gateEverActiveDateKeyRef.current = state.tanggal
    }
    validGateNames.forEach((gateName) => {
      if (calledFor(gateName) || nextForGate(gateName)) gateEverActiveRef.current[gateName] = true
    })
  }, [state.tanggal, validGateNames, state.gates, state.waitingList, calledFor, nextForGate])

  const noPrepFor = useCallback((gateName) => {
    if (calledFor(gateName) || nextForGate(gateName)) return false
    return !gateEverActiveRef.current[gateName]
  }, [calledFor, nextForGate])

  const allGatesNoPrep = validGateNames.length === 0 || validGateNames.every((g) => noPrepFor(g))
  const gatesToRender = allGatesNoPrep ? [] : validGateNames.filter((g) => !noPrepFor(g))

  const activeGateNamesForCctv = useMemo(
    () => validGateNames.filter((g) => !!calledFor(g)),
    [validGateNames, calledFor]
  )
  const sortedActiveGateNamesForCctv = useMemo(() => {
    return activeGateNamesForCctv.slice().sort((a, b) => {
      const aLoading = isVehicleLoading(calledFor(a), waitNowMs) ? 0 : 1
      const bLoading = isVehicleLoading(calledFor(b), waitNowMs) ? 0 : 1
      return aLoading - bLoading
    })
  }, [activeGateNamesForCctv, calledFor, waitNowMs])

  const isSystemIdle = (state.waitingList || []).length === 0 && activeGateNamesForCctv.length === 0
  const videoUrl = state.config?.VIDEO_URL || state.config?.YOUTUBE_ID_1 || ''

  const videoPanels = useMemo(() => {
    const defaultPanel = { key: 'default', url: videoUrl, label: 'LIVE INFO', sourceLabel: 'VIDEO_URL' }
    if (isSystemIdle) return [defaultPanel]
    const panels = sortedActiveGateNamesForCctv.slice(0, MAX_CCTV_PANELS).map((gateName) => ({
      key: gateName,
      url: resolveCctv(state.config, gateName),
      label: `CCTV ${gateName}`,
      sourceLabel: cctvKey(gateName)
    }))
    return panels.length ? panels : [defaultPanel]
  }, [isSystemIdle, sortedActiveGateNamesForCctv, state.config, videoUrl])

  const showHolidayOverlay = !!state.isSunday
  const showErrorOverlay = !state.isSunday && state.ok === false

  if (loading) return <LoadingOverlay />
  if (!audioUnlocked) return <AudioUnlockOverlay onUnlock={unlock} />
  if (showHolidayOverlay) {
    return (
      <StateOverlay
        variant="holiday"
        title="Hari Ini Libur"
        subtitle={state.message || 'Hari Minggu — tidak ada pengiriman/muat kendaraan.'}
        footer={`${dateStr} · ${timeStr}`}
      />
    )
  }
  if (showErrorOverlay) {
    return (
      <StateOverlay
        variant="error"
        title="Data Antrian Belum Siap"
        subtitle={state.message || 'Sheet untuk hari ini belum ditemukan / belum siap. Mohon periksa Google Sheets.'}
        footer={`${dateStr} · ${timeStr}`}
      />
    )
  }

  return (
    <div className="grid h-screen grid-rows-[auto_auto_1fr_auto] gap-3 px-7 pb-3 pt-5">
      <Header timeStr={timeStr} dateStr={dateStr} connected={connected} speechSupported={speechSupported} />

      {simulationActive && <SimBanner />}
      <Ticker text={state.config?.RUNNING_TEXT} />

      <div className="grid min-h-0 grid-cols-[1.15fr_1fr] gap-5">
        <div className="flex min-h-0 flex-col gap-4">
          {!allGatesNoPrep && (
            <div className="scroll-thin grid min-h-0 flex-none content-start gap-4 overflow-y-auto pr-1.5">
              {gatesToRender.map((gateName) => (
                <GateCard
                  key={gateName}
                  gateName={gateName}
                  accentKey={GATE_PALETTE[validGateNames.indexOf(gateName) % GATE_PALETTE.length]}
                  data={calledFor(gateName)}
                  speakerActive={!!speakerActive[gateName]}
                  flashTrigger={flashTriggers[gateName] || 0}
                  gateCount={gatesToRender.length}
                  nextVehicle={nextForGate(gateName)}
                  nextWaitMinutes={waitEstimates[`${nextForGate(gateName)?.noUrut}:${nextForGate(gateName)?.noPol}`] ?? null}
                />
              ))}
            </div>
          )}
          <div className="grid flex-1 gap-2" style={{ gridTemplateColumns: `repeat(${videoPanels.length}, 1fr)`, minHeight: 150 }}>
            {videoPanels.map((vp) => (
              <VideoPanel key={vp.key} videoUrl={vp.url} label={vp.label} sourceLabel={vp.sourceLabel} />
            ))}
          </div>
        </div>

        <div className="grid min-h-0 grid-rows-[auto_1fr] gap-4">
          <StatsRow stats={state.stats} />
          <WaitingList list={state.waitingList} waitEstimates={waitEstimates} estimasiMuat={state.estimasiMuat} nowMs={waitNowMs} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 border-t border-[#1f4d80] pt-2.5 text-center">
        <div className="flex items-center justify-center gap-2 text-[11.5px] font-medium tracking-wide text-ink-tertiary">
          Sistem Antrean Muat Kendaraan &nbsp;·&nbsp;
          <b className="font-mono font-semibold text-ink-secondary">{state.tanggal}</b>
          &nbsp;·&nbsp; Update otomatis tiap <b className="font-mono font-semibold text-ink-secondary">3 detik</b>
        </div>
        <div className="text-[10.5px] font-medium tracking-wide text-ink-muted">
          Copyright © 2026 PT Wahana Duta Jaya Rucika. All Rights Reserved.
        </div>
      </div>
    </div>
  )
}

function cctvKey(gateName) {
  return 'CCTV ' + String(gateName || '').replace(/-/g, ' ').trim()
}
function resolveCctv(config, gateName) {
  if (!config) return ''
  const exactKey = cctvKey(gateName)
  if (config[exactKey]) return config[exactKey]
  const norm = (s) => String(s || '').toLowerCase().replace(/[-_\s]+/g, ' ').trim()
  const target = norm(exactKey)
  const foundKey = Object.keys(config).find((k) => norm(k) === target)
  return foundKey ? config[foundKey] : ''
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  )
}

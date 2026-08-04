import { useCallback, useEffect, useRef, useState } from 'react'
import { APPS_SCRIPT_URL, POLL_INTERVAL_MS, STATUS } from '../config'

const emptyStats = { total: 0, waiting: 0, called: 0, closed: 0 }

const initialState = {
  ok: true,
  isSunday: false,
  message: '',
  config: {},
  estimasiMuat: {},
  gates: {},
  activeGateNames: [],
  waitingList: [],
  stats: emptyStats,
  tanggal: '-',
  fingerprint: null
}

// ── MODE SIMULASI (fallback) ─────────────────────────────────────
// Dipakai kalau polling ke backend gagal 3x berturut-turut, supaya
// layar tidak macet total kalau koneksi ke Apps Script terputus.
// Data di sini sepenuhnya acak/lokal, ditandai lewat simulationActive.
function buildSimulationEngine(onFrame) {
  let counter = 1
  const SIM_GATES = ['GATE-4', 'GATE-5', 'GATE-6']
  const SIM_ESTIMASI = { BOX: 38, FUSO: 98, CONTAINER: 158, 'WING BOX': 218, TRONTON: 278, 'CDD LONG': 338 }
  const simCalled = { 'GATE-4': null, 'GATE-5': null, 'GATE-6': null }
  const simWaiting = []
  const namaContoh = ['CV Sinar Jaya', 'PT Maju Bersama', 'UD Berkah Abadi', 'PT Cahaya Logistik', 'CV Tunas Karya']
  const expedisiContoh = ['KOPERASI', 'JAPUNG', 'AREMA', 'MTR', 'INDAH LOGISTIK']
  const jenisMobilContoh = Object.keys(SIM_ESTIMASI)
  let simClosedCount = 0
  const simGateClosedCount = { 'GATE-4': 0, 'GATE-5': 0, 'GATE-6': 0 }

  const estLabel = (menit) => {
    const h = Math.floor(menit / 60)
    const m = menit % 60
    return `${h}:${m < 10 ? '0' + m : m}`
  }

  function randomVehicle() {
    const n = counter++
    const jm = jenisMobilContoh[Math.floor(Math.random() * jenisMobilContoh.length)]
    const menit = SIM_ESTIMASI[jm]
    return {
      noUrut: n,
      noPol: 'B ' + (1000 + Math.floor(Math.random() * 8999)) + ' XY',
      nama: namaContoh[Math.floor(Math.random() * namaContoh.length)],
      expedisi: expedisiContoh[Math.floor(Math.random() * expedisiContoh.length)],
      jenisMobil: jm,
      jenisProduk: 'Fit. Lokal',
      keterangan: '',
      gate: SIM_GATES[Math.floor(Math.random() * SIM_GATES.length)],
      status: STATUS.MENUNGGU,
      calledAt: '',
      estimasiMenit: menit,
      estimasiLabel: estLabel(menit)
    }
  }
  for (let i = 0; i < 5; i++) simWaiting.push(randomVehicle())

  function tick() {
    SIM_GATES.forEach((gateName) => {
      if (!simCalled[gateName] && simWaiting.length) {
        const idx = simWaiting.findIndex((v) => v.gate === gateName)
        if (idx >= 0) {
          simCalled[gateName] = simWaiting.splice(idx, 1)[0]
          simCalled[gateName].status = STATUS.PANGGIL
          simCalled[gateName].calledAt = new Date().toLocaleTimeString('id-ID')
        }
      } else if (simCalled[gateName] && Math.random() < 0.12) {
        simCalled[gateName] = null
        simClosedCount += 1
        simGateClosedCount[gateName] = (simGateClosedCount[gateName] || 0) + 1
      }
    })
    if (Math.random() < 0.5) simWaiting.push(randomVehicle())

    const gates = {}
    SIM_GATES.forEach((gateName) => {
      const inGate = [simCalled[gateName], ...simWaiting].filter((v) => v && v.gate === gateName)
      gates[gateName] = {
        active: true,
        called: simCalled[gateName],
        stats: {
          total: inGate.length,
          waiting: inGate.filter((v) => v.status === STATUS.MENUNGGU).length,
          called: simCalled[gateName] ? 1 : 0,
          closed: simGateClosedCount[gateName] || 0
        }
      }
    })

    const activeCalledCount = Object.values(simCalled).filter(Boolean).length
    const fingerprint = [...Object.values(simCalled).filter(Boolean), ...simWaiting]
      .map((v) => `${v.noUrut}:${v.status}`).join('|')

    onFrame({
      ok: true,
      config: {
        RUNNING_TEXT: 'Mode SIMULASI aktif — hubungkan ke Apps Script Web App untuk data real.',
        VIDEO_URL: ''
      },
      gates,
      activeGateNames: SIM_GATES,
      waitingList: simWaiting.slice(0, 8),
      stats: {
        total: simWaiting.length + activeCalledCount + simClosedCount,
        waiting: simWaiting.length,
        called: activeCalledCount,
        closed: simClosedCount
      },
      tanggal: new Date().toLocaleDateString('id-ID'),
      fingerprint
    })
  }

  tick()
  const timer = setInterval(tick, 6000)
  return () => clearInterval(timer)
}

export default function useQueueState(onCallsDetected) {
  const [state, setState] = useState(initialState)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(true)
  const [simulationActive, setSimulationActive] = useState(false)

  const lastFingerprintRef = useRef(null)
  const gateSnapshotRef = useRef({})
  const usingSimulationRef = useRef(false)
  const pollFailCountRef = useRef(0)
  const pollInFlightRef = useRef(false)
  const realTimerRef = useRef(null)
  const simCleanupRef = useRef(null)
  const onCallsDetectedRef = useRef(onCallsDetected)
  onCallsDetectedRef.current = onCallsDetected

  const applyState = useCallback((s) => {
    if (!s) return
    const prevSnapshot = { ...gateSnapshotRef.current }

    const activeGateNames = s.activeGateNames || []
    const gates = s.gates || {}

    const effectiveFingerprint =
      s.fingerprint ||
      activeGateNames
        .map((g) => {
          const c = gates[g] ? gates[g].called : null
          return `${g}:${c ? `${c.noPol}:${c.status}:${c.calledAt || ''}` : 'EMPTY'}`
        })
        .join('|')

    const newSnapshot = {}
    activeGateNames.forEach((gateName) => {
      const called = gates[gateName] ? gates[gateName].called : null
      newSnapshot[gateName] = called ? `${called.noPol}:${called.status}:${called.calledAt || ''}` : 'EMPTY'
    })

    const changed = effectiveFingerprint && effectiveFingerprint !== lastFingerprintRef.current
    if (changed && lastFingerprintRef.current !== null) {
      const changedCalls = []
      activeGateNames.forEach((gateName) => {
        const prevKey = prevSnapshot[gateName]
        const newKey = newSnapshot[gateName]
        const called = gates[gateName] ? gates[gateName].called : null
        if (prevKey !== undefined && prevKey !== newKey && called) {
          changedCalls.push({ gateName, called })
        }
      })
      if (changedCalls.length && onCallsDetectedRef.current) onCallsDetectedRef.current(changedCalls)
    }

    gateSnapshotRef.current = newSnapshot
    lastFingerprintRef.current = effectiveFingerprint

    setState({
      ok: s.ok !== false,
      isSunday: !!s.isSunday,
      message: s.message || '',
      config: s.config || {},
      estimasiMuat: s.estimasiMuat || {},
      gates,
      activeGateNames,
      waitingList: s.waitingList || [],
      stats: s.stats || emptyStats,
      tanggal: s.tanggal || '-',
      fingerprint: effectiveFingerprint || null
    })
    setConnected(true)
    setLoading(false)
    pollFailCountRef.current = 0
  }, [])

  const startSimulation = useCallback(() => {
    if (simCleanupRef.current) return
    simCleanupRef.current = buildSimulationEngine(applyState)
  }, [applyState])

  const stopSimulation = useCallback(() => {
    if (simCleanupRef.current) { simCleanupRef.current(); simCleanupRef.current = null }
  }, [])

  const handleError = useCallback((err) => {
    setConnected(false)
    pollFailCountRef.current += 1
    console.warn(`Polling error (percobaan ke-${pollFailCountRef.current}):`, err)
    if (!usingSimulationRef.current && pollFailCountRef.current >= 3) {
      usingSimulationRef.current = true
      setSimulationActive(true)
      startSimulation()
    }
    if (pollFailCountRef.current >= 3) setLoading(false)
  }, [startSimulation])

  const pollOnce = useCallback(async () => {
    if (pollInFlightRef.current) return
    pollInFlightRef.current = true
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=state`, { cache: 'no-store' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      pollInFlightRef.current = false
      if (usingSimulationRef.current) {
        usingSimulationRef.current = false
        setSimulationActive(false)
        stopSimulation()
      }
      applyState(data)
    } catch (err) {
      pollInFlightRef.current = false
      handleError(err)
    }
  }, [applyState, handleError, stopSimulation])

  useEffect(() => {
    pollOnce()
    realTimerRef.current = setInterval(pollOnce, POLL_INTERVAL_MS)
    return () => {
      if (realTimerRef.current) clearInterval(realTimerRef.current)
      stopSimulation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { state, loading, connected, simulationActive }
}

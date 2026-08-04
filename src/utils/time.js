import { DEFAULT_ESTIMASI_MENIT, MUAT_THRESHOLD_SEC } from '../config'

const pad = (n) => String(n).padStart(2, '0')

// Rekonstruksi string jam "HH:MM[:SS]" dari backend menjadi objek Date
// pada hari ini. Menjaga proteksi lintas tengah malam: kalau hasilnya
// >12 jam di masa depan dibanding waktu referensi, dianggap timestamp
// itu dari "kemarin" dan dimundurkan 1 hari.
export function parseJamToDate(jamStr, nowMs) {
  if (!jamStr) return null
  const parts = String(jamStr).split(':').map((n) => parseInt(n, 10))
  if (parts.length < 2 || parts.some(Number.isNaN)) return null
  const ref = new Date(nowMs ?? Date.now())
  const d = new Date(ref.getTime())
  d.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0, 0)
  if (d.getTime() - ref.getTime() > 12 * 60 * 60 * 1000) {
    d.setDate(d.getDate() - 1)
  }
  return d
}

export function formatCheckInValue(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === '') return '-'
  const s = String(raw).trim()
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) return s
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }
  return s
}

export function formatCountdown(totalSeconds) {
  const overtime = totalSeconds < 0
  const abs = Math.max(0, Math.round(Math.abs(totalSeconds)))
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  const core = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
  return (overtime ? '+' : '') + core
}

export function computeCountdown(vehicle, nowMs) {
  if (!vehicle) return null
  const hasEstimasi = vehicle.estimasiMenit !== null && vehicle.estimasiMenit !== undefined

  if (vehicle.calledAt && hasEstimasi) {
    const calledDate = parseJamToDate(vehicle.calledAt, nowMs)
    if (calledDate) {
      let elapsedSec = (nowMs - calledDate.getTime()) / 1000
      if (elapsedSec < 0) elapsedSec = 0
      const remainingSec = vehicle.estimasiMenit * 60 - elapsedSec
      return { mode: 'countdown', isOvertime: remainingSec < 0, label: formatCountdown(remainingSec) }
    }
  }

  if (hasEstimasi && vehicle.estimasiLabel) {
    return { mode: 'static', isOvertime: false, label: '~' + vehicle.estimasiLabel }
  }
  return null
}

export function computeRemainingMinutes(vehicle, nowMs) {
  if (!vehicle) return 0
  const hasEstimasi = vehicle.estimasiMenit !== null && vehicle.estimasiMenit !== undefined
  if (!hasEstimasi) return DEFAULT_ESTIMASI_MENIT
  if (vehicle.calledAt) {
    const calledDate = parseJamToDate(vehicle.calledAt, nowMs)
    if (calledDate) {
      const elapsedSec = Math.max(0, (nowMs - calledDate.getTime()) / 1000)
      const remainingSec = vehicle.estimasiMenit * 60 - elapsedSec
      return Math.max(0, remainingSec / 60)
    }
  }
  return vehicle.estimasiMenit
}

export function computeWaitEstimates(state, nowMs) {
  const map = {}
  const byGate = {}
  ;(state.waitingList || []).forEach((v) => {
    if (!v.gate) return
    ;(byGate[v.gate] = byGate[v.gate] || []).push(v)
  })
  Object.keys(byGate).forEach((gateName) => {
    byGate[gateName].sort((a, b) => (Number(a.noUrut) || 0) - (Number(b.noUrut) || 0))
  })
  Object.keys(byGate).forEach((gateName) => {
    const g = state.gates ? state.gates[gateName] : null
    let cumulative = g && g.called ? computeRemainingMinutes(g.called, nowMs) : 0
    byGate[gateName].forEach((v) => {
      const key = `${v.noUrut}:${v.noPol}`
      map[key] = cumulative
      cumulative += v.estimasiMenit !== null && v.estimasiMenit !== undefined ? v.estimasiMenit : DEFAULT_ESTIMASI_MENIT
    })
  })
  return map
}

export function formatEtaClock(waitMinutes, nowMs) {
  if (waitMinutes === null || waitMinutes === undefined) return '-'
  const target = new Date(nowMs + waitMinutes * 60000)
  return `${pad(target.getHours())}:${pad(target.getMinutes())}`
}

export function computeChipInfo(vehicle, nowMs, noPrep) {
  if (!vehicle) {
    if (noPrep) return { label: 'BELUM ADA PERSIAPAN', state: 'noprep' }
    return { label: 'KOSONG', state: 'empty' }
  }
  const calledDate = vehicle.calledAt ? parseJamToDate(vehicle.calledAt, nowMs) : null
  if (calledDate) {
    const elapsedSec = (nowMs - calledDate.getTime()) / 1000
    if (elapsedSec >= MUAT_THRESHOLD_SEC) return { label: 'SEDANG MUAT', state: 'loading' }
  }
  return { label: 'SEDANG DIPANGGIL', state: 'calling' }
}

export function isVehicleLoading(vehicle, nowMs) {
  if (!vehicle) return false
  const calledDate = vehicle.calledAt ? parseJamToDate(vehicle.calledAt, nowMs) : null
  if (!calledDate) return false
  const elapsedSec = (nowMs - calledDate.getTime()) / 1000
  return elapsedSec >= MUAT_THRESHOLD_SEC
}

export function computeProgressPercent(vehicle, nowMs) {
  if (!vehicle || !vehicle.calledAt) return 0
  const hasEstimasi = vehicle.estimasiMenit !== null && vehicle.estimasiMenit !== undefined
  if (!hasEstimasi) return 0
  const calledDate = parseJamToDate(vehicle.calledAt, nowMs)
  if (!calledDate) return 0
  const elapsedSec = Math.max(0, (nowMs - calledDate.getTime()) / 1000)
  const pct = (elapsedSec / (vehicle.estimasiMenit * 60)) * 100
  return Math.max(0, Math.min(100, Math.round(pct)))
}

export function etaSelesaiClockFor(vehicle) {
  if (!vehicle) return '-'
  if (vehicle.etaSelesai) return vehicle.etaSelesai
  if (vehicle.calledAt && vehicle.estimasiMenit !== null && vehicle.estimasiMenit !== undefined) {
    const calledDate = parseJamToDate(vehicle.calledAt, Date.now())
    if (calledDate) {
      const target = new Date(calledDate.getTime() + vehicle.estimasiMenit * 60000)
      return `${pad(target.getHours())}:${pad(target.getMinutes())}`
    }
  }
  return '-'
}

export function vField(v, keys, fallback = '-') {
  if (!v) return fallback
  for (const k of keys) {
    if (v[k] !== undefined && v[k] !== null && String(v[k]).trim() !== '') return v[k]
  }
  return fallback
}

export function cctvConfigKeyForGate(gateName) {
  return 'CCTV ' + String(gateName || '').replace(/-/g, ' ').trim()
}

export function resolveCctvUrl(config, gateName) {
  if (!config) return ''
  const exactKey = cctvConfigKeyForGate(gateName)
  if (config[exactKey]) return config[exactKey]
  const norm = (s) => String(s || '').toLowerCase().replace(/[-_\s]+/g, ' ').trim()
  const target = norm(exactKey)
  const foundKey = Object.keys(config).find((k) => norm(k) === target)
  return foundKey ? config[foundKey] : ''
}

export function computePersiapanInfo(vehicle, estimasiMuatConfig, nowMs) {
  if (!vehicle || vehicle.gate) return null
  const estPersiapan = (estimasiMuatConfig && estimasiMuatConfig['EST.PERSIAPAN']) || null
  if (!estPersiapan || estPersiapan.menit === undefined || estPersiapan.menit === null) return null
  if (!vehicle.mulaiPersiapan) return null

  const startDate = parseJamToDate(vehicle.mulaiPersiapan, nowMs)
  if (!startDate) return null

  const elapsedMin = (nowMs - startDate.getTime()) / 60000
  const remainingMin = estPersiapan.menit - elapsedMin
  const isUrgent = remainingMin <= 10
  const percent = Math.max(0, Math.min(100, Math.round((elapsedMin / estPersiapan.menit) * 100)))
  const absMin = Math.round(Math.abs(remainingMin))
  const label = (remainingMin < 0 ? 'T + ' : 'T - ') + String(absMin).padStart(2, '0') + ' MIN'

  return { remainingMin, isUrgent, percent, label }
}

export function extractYouTubeId(url) {
  if (!url) return null
  const s = String(url).trim()
  const re = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/
  const m = s.match(re)
  if (m && m[1]) return m[1]
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  return null
}

export function useClockFormat(now) {
  const hariArr = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const bulanArr = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const dateStr = `${hariArr[now.getDay()]}, ${now.getDate()} ${bulanArr[now.getMonth()]} ${now.getFullYear()}`
  return { timeStr, dateStr }
}

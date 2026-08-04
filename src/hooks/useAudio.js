import { useCallback, useEffect, useRef, useState } from 'react'
import { BELL_SOURCES } from '../config'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const ANGKA_MAP = {
  0: 'nol', 1: 'satu', 2: 'dua', 3: 'tiga', 4: 'empat',
  5: 'lima', 6: 'enam', 7: 'tujuh', 8: 'delapan', 9: 'sembilan'
}
function angkaKeTeks(angka) {
  return String(angka).split('').map((d) => ANGKA_MAP[d] ?? d)
}

function playFallbackBeep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return Promise.resolve()
    const ctx = new Ctx()
    return new Promise((resolve) => {
      const dur = 0.9
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + dur)
      osc.onended = () => { ctx.close().catch(() => {}); resolve() }
      setTimeout(resolve, (dur + 0.2) * 1000)
    })
  } catch (_) {
    return Promise.resolve()
  }
}

// getConfigRef: ref pointing to the latest backend `config.raw` object,
// used to read VOICE_SPEED_MODE / VOICE_SPEED_* at call time without
// re-creating the whole hook on every poll.
export default function useAudio(getConfigRef) {
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [speakerActive, setSpeakerActive] = useState({})
  const [speechSupported] = useState(() => !!window.speechSynthesis)

  const bellAudioRef = useRef(null)
  const bellAllFailedRef = useRef(false)
  const bellSrcIndexRef = useRef(0)
  const idVoiceRef = useRef(null)
  const announceBusyRef = useRef(false)
  const announceQueueRef = useRef([])

  useEffect(() => {
    const audio = new Audio(BELL_SOURCES[0])
    audio.preload = 'auto'
    audio.volume = 1
    audio.addEventListener('error', () => {
      if (bellSrcIndexRef.current < BELL_SOURCES.length - 1) {
        bellSrcIndexRef.current += 1
        audio.src = BELL_SOURCES[bellSrcIndexRef.current]
      } else {
        bellAllFailedRef.current = true
      }
    })
    bellAudioRef.current = audio

    function loadVoices() {
      const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : []
      if (!voices.length) return
      idVoiceRef.current =
        voices.find((v) => v.lang === 'id-ID' && /google/i.test(v.name)) ||
        voices.find((v) => v.lang === 'id-ID') ||
        voices.find((v) => (v.lang || '').toLowerCase().startsWith('id')) ||
        null
    }
    loadVoices()
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  const ringBell = useCallback(async () => {
    if (bellAllFailedRef.current) { await playFallbackBeep(); return }
    try {
      const audio = bellAudioRef.current
      audio.currentTime = 0
      await audio.play()
      await Promise.race([new Promise((r) => { audio.onended = r }), sleep(4000)])
    } catch (e) {
      await playFallbackBeep()
    }
  }, [])

  const getVoiceSpeedMultiplier = useCallback(() => {
    const cfg = (getConfigRef && getConfigRef.current) || {}
    const mode = String(cfg.VOICE_SPEED_MODE || 'NORMAL').trim().toUpperCase()
    let key = 'VOICE_SPEED_NORMAL'
    if (mode === 'FAST') key = 'VOICE_SPEED_FAST'
    else if (mode === 'SLOW') key = 'VOICE_SPEED_SLOW'
    const val = parseFloat(cfg[key])
    let multiplier = !Number.isNaN(val) && val > 0 ? val : 1.0
    if (multiplier < 0.1) multiplier = 0.1
    if (multiplier > 10) multiplier = 10
    return multiplier
  }, [getConfigRef])

  const speak = useCallback((text, rate = 1) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return }
      const effectiveRate = rate * getVoiceSpeedMultiplier()
      const speech = new SpeechSynthesisUtterance(text)
      speech.lang = 'id-ID'
      if (idVoiceRef.current) speech.voice = idVoiceRef.current
      speech.rate = effectiveRate
      speech.pitch = 1.0
      speech.volume = 1

      let done = false
      const finish = () => { if (done) return; done = true; clearTimeout(guard); resolve() }
      speech.onend = finish
      speech.onerror = finish
      const estMs = Math.max(1200, String(text).length * 220) / effectiveRate + 800
      const guard = setTimeout(finish, estMs)
      window.speechSynthesis.speak(speech)
    })
  }, [getVoiceSpeedMultiplier])

  const speakNoPol = useCallback(async (noPol) => {
    const tokens = String(noPol || '-').trim().split(/\s+/).filter(Boolean)
    if (!tokens.length) { await speak('-', 0.85); return }
    for (const token of tokens) {
      if (/^\d+$/.test(token)) {
        for (const d of angkaKeTeks(token)) { await speak(d, 1); await sleep(100) }
      } else {
        for (const h of token.split('')) { await speak(h, 1); await sleep(100) }
      }
      await sleep(120)
    }
  }, [speak])

  const panggilKendaraan = useCallback(async (vehicle, gateLabel, isUlang = false) => {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    await sleep(150)
    const angkaBaca = angkaKeTeks(vehicle.noUrut)

    await ringBell()
    await sleep(250)

    if (isUlang) { await speak('Saya ulangi'); await sleep(250) }

    await speak('Nomor antrian')
    await sleep(150)
    for (const a of angkaBaca) { await speak(a, 1); await sleep(100) }
    await sleep(150)

    await speak('Ekspedisi')
    await sleep(120)
    await speak(vehicle.expedisi || '-', 0.95)
    await sleep(250)

    await speak('Kendaraan nomor polisi')
    await sleep(150)
    await speakNoPol(vehicle.noPol)
    await sleep(250)

    await speak('Silakan menuju ' + (gateLabel || '-'))
    await sleep(200)

    if (!bellAllFailedRef.current) {
      try {
        const audio = bellAudioRef.current
        audio.currentTime = 0
        audio.play().catch(() => {})
      } catch (_) {}
    }
  }, [ringBell, speak, speakNoPol])

  const announceCalls = useCallback(async (calls) => {
    calls.forEach((c) => announceQueueRef.current.push(c))
    if (announceBusyRef.current) return
    announceBusyRef.current = true
    while (announceQueueRef.current.length) {
      const call = announceQueueRef.current.shift()
      setSpeakerActive((s) => ({ ...s, [call.gateKey]: true }))
      await panggilKendaraan(call.data, call.gateLabel, call.isUlang || false).catch(() => {})
      setSpeakerActive((s) => ({ ...s, [call.gateKey]: false }))
      await sleep(400)
    }
    announceBusyRef.current = false
  }, [panggilKendaraan])

  const unlock = useCallback(() => {
    if (audioUnlocked) return
    setAudioUnlocked(true)
    try {
      const audio = bellAudioRef.current
      audio.volume = 0
      audio.play().then(() => {
        audio.pause()
        audio.currentTime = 0
        audio.volume = 1
      }).catch(() => { audio.volume = 1 })
    } catch (_) {}
    try {
      const primer = new SpeechSynthesisUtterance(' ')
      primer.volume = 0
      window.speechSynthesis.speak(primer)
    } catch (_) {}
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (Ctx) { const c = new Ctx(); c.resume().finally(() => c.close().catch(() => {})) }
    } catch (_) {}
  }, [audioUnlocked])

  return { audioUnlocked, speakerActive, speechSupported, announceCalls, unlock }
}

// ── KONFIGURASI SUMBER DATA ─────────────────────────────────────
// URL Web App Apps Script (deployment /exec). Bisa dioverride lewat
// environment variable VITE_APPS_SCRIPT_URL saat build (mis. file
// .env atau secret di GitHub Actions), tanpa perlu mengubah kode ini.
//
// PENTING SOAL CORS: Apps Script Web App yang di-deploy dengan
// "Execute as: Me" + "Who has access: Anyone" umumnya BISA diakses
// lintas origin lewat fetch() GET biasa (tanpa header custom, jadi
// tidak memicu CORS preflight). Kalau nanti muncul error CORS di
// console browser, redeploy Web App-nya (Deploy > New deployment)
// dan pastikan access-nya "Anyone" — deployment lama kadang perlu
// di-refresh URL-nya setelah perubahan akses.
export const APPS_SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbxiM8avf9y1Ej2q-Zzkhw00FjFXHqgqBO8Omq48rS_XPG0G21Jm87Z4nzE-4hEsOVuZTA/exec'

export const POLL_INTERVAL_MS = 3000
export const MUAT_THRESHOLD_SEC = 20
export const DEFAULT_ESTIMASI_MENIT = 60
export const PERSIAPAN_URGENT_THRESHOLD_MIN = 10
export const MAX_CCTV_PANELS = 4

export const STATUS = {
  MENUNGGU: 'MENUNGGU',
  PANGGIL: 'PANGGIL',
  PANGGIL_LAGI: 'PANGGIL LAGI',
  SELESAI: 'SELESAI'
}

export const QS_LABEL = {
  SCHEDULED: 'Terjadwal',
  'CHECK IN': 'Check In',
  WAITING: 'Menunggu Panggilan',
  CALLING: 'Sedang Dipanggil',
  LOADING: 'Sedang Muat',
  COMPLETED: 'Selesai (Verifikasi)',
  DEPARTED: 'Sudah Berangkat'
}

export const GATE_PALETTE = ['gate-1', 'gate-2', 'gate-3', 'gate-4', 'gate-5']

export const BELL_SOURCES = [
  'https://raw.githubusercontent.com/cloude6010-bit/aull.github.io/main/opening-announcement.mp3'
]

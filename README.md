# TV Antrean Muat — PT Wahana Duta Jaya Rucika (React)

Layar TV antrean muat kendaraan, ditulis ulang dari Vue ke **React + Vite +
Tailwind**. Backend **tidak berubah** — tetap Google Apps Script Web App yang
sama (`Code.gs`), diakses lewat `fetch('<url-exec>?action=state')` setiap 3
detik, persis seperti fallback fetch yang sudah ada di versi Vue.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Mengarahkan ke Apps Script kamu sendiri

URL default sudah di-hardcode di `src/config.js`, tapi lebih aman override
lewat environment variable supaya tidak perlu edit kode tiap ganti deployment:

```bash
cp .env.example .env
# edit .env, isi VITE_APPS_SCRIPT_URL dengan URL /exec deployment kamu
```

## Build & deploy ke GitHub Pages

Repo ini sudah punya workflow di `.github/workflows/deploy.yml` yang otomatis
build & publish ke GitHub Pages setiap push ke branch `main`.

1. Push repo ini ke GitHub.
2. Di **Settings → Pages**, set source ke **GitHub Actions**.
3. (Opsional) Di **Settings → Secrets and variables → Actions**, tambahkan
   secret `VITE_APPS_SCRIPT_URL` kalau mau override URL backend tanpa commit
   ke kode.
4. Push ke `main` → Actions akan build & deploy otomatis.

Kalau repo **bukan** bernama `<username>.github.io` (artinya situs akan ada
di path `/<nama-repo>/`), workflow sudah otomatis set `VITE_BASE_PATH` ke
`/<nama-repo>/`. Kalau pakai custom domain atau repo root (`user.github.io`),
hapus/ubah baris `VITE_BASE_PATH` di workflow.

Build manual (untuk hosting lain seperti Vercel/Netlify):

```bash
npm run build
# hasil ada di folder dist/
```

## ⚠️ Catatan penting soal CORS

React app ini berjalan di origin lain (GitHub Pages / Vercel / dst), beda
dari `index.html` versi Vue yang dulu di-serve LANGSUNG oleh Apps Script
(jadi same-origin, tidak pernah kena CORS).

Apps Script Web App yang di-deploy dengan **Execute as: Me** + **Who has
access: Anyone** pada umumnya bisa diakses lintas origin lewat `fetch()` GET
polos (tanpa header custom → tidak memicu CORS preflight). Kalau nanti
muncul error CORS di console browser:

1. Buka Apps Script project → **Deploy → Manage deployments**.
2. Pastikan deployment aktif punya akses **Anyone**.
3. Kalau baru mengubah pengaturan akses, buat **New deployment** (bukan edit
   deployment lama) — URL `/exec` lama kadang tidak ikut ter-refresh
   izinnya.
4. Test langsung: buka URL `<url-exec>?action=state` di tab browser baru —
   kalau JSON muncul normal di situ tapi fetch dari app tetap gagal, itu
   tanda CORS, bukan masalah data.

`Code.gs` di repo sumber (`/mnt/user-data/...`) sudah termasuk patch rollover
tengah malam untuk `parseJamKeDate_()` — pastikan kamu deploy versi terbaru
itu ke Apps Script project produksi, karena React app ini hanya mengganti
frontend, backend-nya harus tetap kamu deploy manual seperti biasa dari
Apps Script editor (Extensions → Apps Script di spreadsheet kamu).

## Apa yang berubah dari versi Vue

- **Framework**: Vue 3 (CDN, satu file HTML) → React 18 + Vite (project
  ter-modularisasi, siap di-develop & di-deploy lewat GitHub).
- **UI/UX**: tetap identitas industrial control-room (navy/steel/amber),
  tapi dirapikan — animasi masuk halus (`fadeInUp`) untuk kartu gate & baris
  antrean, ring progres dengan transisi lebih smooth, status chip
  "SEDANG MUAT" pakai beacon amber berkedip ala panel industrial, dan
  layout tetap responsif ke ukuran TV besar maupun tablet/mobile lewat
  Tailwind breakpoints.
- **Fitur backend** (queueStatus, slaStatus, estimasiCekIn, durasiPersiapan)
  tetap dikirim oleh `Code.gs` dan sudah tersedia di state — kolom
  "Check In" di kartu gate sekarang terisi benar (pakai `noPolInputAt` dari
  backend, bug lama di versi Vue sudah diperbaiki di sini juga).
- **Mode simulasi**: tetap ada — kalau polling ke backend gagal 3x
  berturut-turut, layar otomatis pindah ke data acak lokal + banner merah,
  supaya TV tidak macet total saat koneksi terputus.

## Struktur folder

```
src/
  config.js          konstanta: URL backend, threshold, status enum
  utils/time.js       semua logic waktu/estimasi (mirror dari Vue)
  hooks/
    useClock.js
    useAudio.js        bel MP3 + Web Speech API (panggilan suara)
    useQueueState.js   polling + fallback simulasi
  components/
    Header.jsx, Ticker.jsx, StatsRow.jsx, GateCard.jsx,
    VideoPanel.jsx, WaitingList.jsx, Overlays.jsx, ErrorBoundary.jsx
  App.jsx              orkestrasi utama
```

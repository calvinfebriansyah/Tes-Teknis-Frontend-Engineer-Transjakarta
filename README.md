<<<<<<< HEAD
# Tes-Teknis-Frontend-Engineer-Transjakarta
=======
# Sistem Manajemen Armada — Transjakarta (Frontend)

Aplikasi frontend untuk sistem manajemen armada yang mengambil data kendaraan dari **MBTA V3 API**, menampilkan data dalam bentuk card dengan pagination, filter berdasarkan Rute dan Trip, serta detail kendaraan dalam popup (termasuk peta).

## Teknologi

- **React 18** dengan **TypeScript**
- **Vite** — build tool
- **Tailwind CSS v3** — styling
- **Leaflet** & **react-leaflet** — peta di detail kendaraan
- Functional components dan React Hooks

## Cara Menjalankan

### Prasyarat

- Node.js 18+ dan npm

### Instalasi dan menjalankan

```bash
# Clone atau masuk ke folder proyek
cd tes-teknis-frontend-engineer-transjakarta

# Pasang dependensi
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser.

### Build production

```bash
npm run build
npm run preview   # optional: preview build
```

Jika perintah `tsc` tidak dikenali saat build, pastikan Anda menjalankan **`npm run build`** (bukan `tsc` langsung) agar Vite memakai binary dari `node_modules/.bin`. Untuk pengecekan tipe TypeScript secara terpisah: `npm run typecheck` (memerlukan TypeScript terpasang lengkap).

### (Opsional) API Key MBTA

Tanpa API key, MBTA membatasi **20 request/menit**. Untuk batas lebih tinggi (1.000 request/menit):

1. Daftar API key di [https://api-v3.mbta.com](https://api-v3.mbta.com)
2. Buat file `.env` di root proyek:
   ```
   VITE_MBTA_API_KEY=your_api_key_here
   ```

## Arsitektur Singkat

### Struktur folder

```
src/
├── components/       # Komponen UI
│   ├── ErrorMessage.tsx
│   ├── FilterDropdown.tsx   # Dropdown filter Rute/Trip (infinite scroll)
│   ├── LoadingSpinner.tsx
│   ├── Pagination.tsx
│   ├── VehicleCard.tsx
│   └── VehicleDetailModal.tsx   # Popup detail + peta Leaflet
├── hooks/            # Custom hooks untuk data
│   ├── useInfiniteRoutes.ts
│   ├── useInfiniteTrips.ts
│   ├── useVehicleDetail.ts
│   └── useVehicles.ts
├── services/
│   └── api.ts        # Client MBTA V3 API (vehicles, routes, trips)
├── types/
│   └── api.ts        # Tipe TypeScript untuk JSON:API MBTA
├── App.tsx
├── index.css
└── main.tsx
```

### Alur data

1. **Get data**
   - **Vehicles**: `GET https://api-v3.mbta.com/vehicles` dengan query `page[limit]`, `page[offset]`, `filter[route]`, `filter[trip]`, dan `include=route,trip`.
   - **Routes**: `GET https://api-v3.mbta.com/routes` dengan pagination (`page[limit]`, `page[offset]`).
   - **Trips**: `GET https://api-v3.mbta.com/trips` dengan pagination dan opsional `filter[route]`.
   - **Detail kendaraan**: `GET https://api-v3.mbta.com/vehicles/{id}?include=route,trip`.

2. **UI**
   - **Tailwind CSS** untuk layout, grid card, filter, pagination, dan modal.
   - **Leaflet** (OpenStreetMap) di dalam `VehicleDetailModal` untuk menampilkan posisi kendaraan (lat/long).

3. **Pagination**
   - Pagination **client-side** terhadap hasil API: kita mengontrol `page[limit]` dan `page[offset]` di request vehicles.
   - Komponen `Pagination` menampilkan: rentang data (contoh: "Menampilkan 1–10 dari 50 Data"), pilihan jumlah per halaman (5, 10, 20, 50), nomor halaman saat ini dan total halaman, serta tombol pertama / sebelumnya / berikutnya / terakhir.

### Fitur utama

- **Card kendaraan**: Label, status (IN_TRANSIT_TO, STOPPED_AT, dll), latitude, longitude, waktu update terakhir.
- **Pagination**: Rentang data, ubah jumlah per halaman, navigasi halaman.
- **Filter**: Dropdown Rute dan Trip (multiple selection), data Rute/Trip di-load secara infinite scroll / lazy (scroll atau tombol "Muat lebih banyak").
- **Detail kendaraan**: Popup dengan label, status, lat/long, waktu update, data rute, data trip, dan peta Leaflet untuk posisi kendaraan.
- **Loading**: Indicator loading saat fetch (list vehicles dan detail).
- **Error**: Pesan error yang mudah dipahami dan tombol "Coba lagi" di mana relevan.

## Catatan API

- **URL dengan `%5B` dan `%5D`**: Itu adalah **URL encoding** standar. `page%5Blimit%5D` = `page[limit]`, `page%5Boffset%5D` = `page[offset]`. Browser/fetch meng-encode karakter khusus (seperti `[` dan `]`) saat mengirim request; server MBTA menerima dan memprosesnya dengan benar. Bukan bug.
- **Filter Trip**: Endpoint `/trips` MBTA **wajib** memakai setidaknya satu filter (mis. `filter[route]`). Karena itu, daftar Trip baru dimuat setelah pengguna memilih satu atau lebih Rute.

## API yang Digunakan

- **MBTA V3 API** (format JSON:API):
  - [Dokumentasi Swagger](https://api-v3.mbta.com/docs/swagger/index.html)
  - Vehicle: [GET /vehicles](https://api-v3.mbta.com/docs/swagger/index.html#/Vehicle/ApiWeb_VehicleController_index), [GET /vehicles/{id}](https://api-v3.mbta.com/docs/swagger/index.html#/Vehicle/ApiWeb_VehicleController_show)
  - Route: GET /routes
  - Trip: GET /trips

## Lisensi

Proyek tes teknis; sesuaikan dengan kebijakan perusahaan.
>>>>>>> a07ad81 (first commit)

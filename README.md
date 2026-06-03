# SiRuang FEB — Sistem Manajemen Ruang Kelas
## Panduan Setup & Maintenance

---

## 📁 Struktur File

```
feb-classroom/
├── index.html     ← Halaman utama (struktur HTML)
├── style.css      ← Seluruh tampilan (tema, warna, layout)
├── data.js        ← Data master (ruangan, slot waktu, konfigurasi)
├── app.js         ← Logika utama aplikasi
└── README.md      ← Panduan ini
```

---

## 🚀 Cara Menjalankan

**Opsi 1 — VS Code Live Server (Recommended):**
1. Install ekstensi **Live Server** di VS Code
2. Klik kanan `index.html` → **Open with Live Server**
3. Otomatis terbuka di browser

**Opsi 2 — Buka langsung:**
1. Double-click `index.html`
2. Langsung berjalan di browser (tanpa server)

---

## 📊 Data Mahasiswa (Referensi)

| Keterangan         | Jumlah |
|--------------------|--------|
| Total Mahasiswa    | 1.742  |
| Jumlah Angkatan    | 4      |
| Manajemen/angkatan | 6 kelas (A–F) |
| Akuntansi/angkatan | 6 kelas (A–F) |
| Per Kelas          | 40 orang |
| Semester Aktif     | 1, 3, 5, 7 |

---

## 🏫 Ruangan

| Lantai | Nomor Ruangan       | Total |
|--------|---------------------|-------|
| 1      | C1.001 – C1.012    | 12    |
| 2      | C2.013 – C2.022    | 10    |
| **Total** |                  | **22** |

---

## ⏰ Slot Waktu

| Slot | Waktu          | Sesi  |
|------|----------------|-------|
| 1    | 07:00 – 09:00  | Pagi  |
| 2    | 09:00 – 11:00  | Pagi  |
| 3    | 11:00 – 13:00  | Pagi  |
| 4    | 13:00 – 15:00  | Siang |
| 5    | 15:00 – 17:00  | Siang |

> **Aturan:** Setiap kelas maksimal **3 sesi per hari**

---

## ✅ Fitur Utama

1. **Dashboard Real-time**
   - Tampilan semua 22 ruangan dengan status warna
   - Filter per lantai & per slot waktu
   - Statistik ruang tersedia/terpakai

2. **Booking Ruang**
   - Untuk kegiatan akademik, ujian, ekstra, atau organisasi
   - Validasi: cek slot bentrok otomatis
   - Validasi: batas 3 sesi/kelas/hari
   - Quick-book dari klik kartu ruangan

3. **Pembatalan & Rebooking**
   - Batalkan booking dari detail ruangan
   - Slot langsung terbuka untuk orang lain

4. **Timeline Jadwal**
   - Tabel visual semua ruangan vs semua slot waktu

5. **Log Aktivitas**
   - Semua booking & pembatalan tercatat

---

## 🎨 Kustomisasi

### Ganti Warna Tema
Edit variabel di `style.css` bagian `:root`:
```css
:root {
  --gold: #e8a020;   /* Warna aksen utama */
  --navy: #0d1b2e;   /* Warna latar */
  --green: #2ec97e;  /* Warna "tersedia" */
  --red: #e84040;    /* Warna "digunakan" */
  --cyan: #38b6d4;   /* Warna "organisasi" */
}
```

### Tambah Ruangan Baru
Edit array `ROOMS` di `data.js`:
```js
const ROOMS = [
  { id: 'C1.001', floor: 1, capacity: 40 },
  // tambahkan di sini...
  { id: 'C3.023', floor: 3, capacity: 60 }, // contoh ruangan baru
];
```

### Tambah Organisasi
Edit array `ORGANIZATIONS` di `data.js`:
```js
const ORGANIZATIONS = ['BEM', 'BLM', 'HIMMAS', 'HIMAKASI', 'UKM_BARU'];
```
> Jangan lupa tambahkan `<option>` di `index.html` bagian `f-org`.

### Ubah Batas Sesi Per Hari
Edit konstanta di `data.js`:
```js
const MAX_SESSIONS_PER_CLASS_PER_DAY = 3; // ubah angka ini
```

---

## 💾 Penyimpanan Data

- Semua data tersimpan di **localStorage** browser
- Data tidak hilang saat browser ditutup
- Data **per perangkat/browser** (belum sinkronisasi antar perangkat)

### Untuk Deployment Multi-User (Pengembangan Lanjutan)
Ganti fungsi `loadBookings()` / `saveBookings()` di `app.js` dengan API call ke backend:
```js
// Contoh dengan fetch ke API
async function loadBookings() {
  const res = await fetch('/api/bookings');
  return await res.json();
}
```

---

## 🔧 Maintenance Rutin

| Frekuensi | Aksi |
|-----------|------|
| Harian    | Cek riwayat di tab "Riwayat" |
| Mingguan  | Export data (klik kanan console → copy `localStorage`) |
| Bulanan   | Hapus data lama via tombol "Hapus Semua Data" |

---

## 📱 Responsive
Tampilan sudah responsif untuk mobile (tablet/HP).

---

*Dikembangkan untuk Fakultas Ekonomi dan Bisnis*

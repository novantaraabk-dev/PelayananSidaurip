# Fitur Tata Kelola Desa - Dokumentasi Implementasi

## Ringkasan Fitur
Fitur "Tata Kelola Desa" adalah sistem manajemen transparansi anggaran dan produk hukum desa dengan dua layer:
1. **Public Interface** - Untuk warga desa melihat informasi APBDes, Realisasi, dan Produk Hukum
2. **Admin Interface** - Untuk administrator memasukkan dan mengelola data

## File yang Dibuat/Diubah

### 1. Tipe Data (src/lib/types.ts)
Ditambahkan 3 tipe data baru:
- `ApbdesItem` - Item individual dalam APBDes
- `ApbdesData` - Dokumen koleksi APBDes dengan tahun, totalAnggaran, dan items
- `RealisasiApbdesItem` - Item individual dalam Realisasi
- `RealisasiApbdesData` - Dokumen koleksi Realisasi dengan tahun, totalRealisasi, dan items
- `ProdukHukumDesa` - Dokumen koleksi untuk Produk Hukum (Perdes, Perkades, RPJMDes, dll)

### 2. Halaman Public (src/app/tata-kelola-desa/page.tsx)
Fitur:
- **Header** dengan navigasi kembali ke beranda
- **3 Tab utama**: APBDes, Realisasi APBDes, Produk Hukum Desa
- **Year Selector** untuk memilih tahun data (otomatis menampilkan tahun yang tersedia)
- **APBDes Tab**:
  - Bar chart visualisasi anggaran per bidang
  - Tabel detail dengan kolom: Bidang, Kegiatan, Nominal, Sumber Anggaran
  - Menampilkan total anggaran
- **Realisasi Tab**:
  - Line chart visualisasi realisasi per bidang
  - Tabel detail sama seperti APBDes
  - Menampilkan total realisasi
- **Produk Hukum Tab**:
  - Grid card display untuk setiap produk hukum
  - Badge untuk jenis produk (Perdes, Perkades, dll)
  - Link langsung ke PDF atau Google Drive
  - Filter otomatis berdasarkan tahun
- **Loading States** dengan Skeleton components
- **Empty States** dengan messaging yang informatif

Dependencies:
- recharts (untuk Bar & Line charts)
- Tailwind CSS + Shadcn/ui components
- Firebase Firestore untuk real-time data

### 3. Halaman Admin (src/app/admin/tata-kelola-desa/page.tsx)
Fitur:
- **Tabs untuk 3 area manajemen**: APBDes, Realisasi APBDes, Produk Hukum Desa
- **APBDes Tab**:
  - Year selector dropdown
  - Tombol "Impor Excel" untuk bulk upload data
  - Delete button untuk hapus data tahun tertentu
  - Tabel preview dengan kolom: Bidang, Kode Rekening, Kegiatan, Volume, Nominal, Sumber
  - Menampilkan total anggaran per row
- **Realisasi APBDes Tab**:
  - Sama seperti APBDes (import, delete, preview table)
  - Format kolom identik
- **Produk Hukum Desa Tab**:
  - Form untuk tambah produk hukum baru dengan fields:
    - Jenis Produk (dropdown: Perdes, Perkades, RPJMDes, RKPDes, SK Desa, LPPD, LKPD)
    - Tahun
    - Nama Produk
    - Nomor
    - Link Google Drive (optional)
  - List view semua produk hukum dengan preview card
  - Setiap card menampilkan: jenis, tahun, nama, nomor, link ke Drive
- **Excel Import Logic**:
  - Parse file Excel dengan kolom: Bidang, Kode Rekening, Kegiatan, Volume, Nominal, Sumber Anggaran
  - Validasi dan transform data ke format Firestore
  - Otomatis hapus data lama jika ada untuk tahun yang sama (replace mode)
  - Toast notification untuk success/error
- **Real-time Data Binding** dari Firestore

Dependencies:
- xlsx library untuk Excel parsing
- Shadcn/ui components (Tabs, Card, Button, Input, Select, Label)
- Firebase Firestore

### 4. Firestore Rules (firestore.rules)
Ditambahkan 3 rule sets baru:
```
match /apbdes/{id} {
  allow read: if true;
  allow write: if isAdmin();
}

match /realisasiApbdes/{id} {
  allow read: if true;
  allow write: if isAdmin();
}

match /produkHukumDesa/{id} {
  allow read: if true;
  allow write: if isAdmin();
}
```
- Public read access untuk semua warga
- Write hanya untuk admin (email == 'sidaurip@gmail.id')

### 5. Navigation Updates
- **Header Component** (src/components/landing/Header.tsx):
  - Ditambahkan link navigasi: "Tata Kelola Desa" di antara "Profil Desa" dan "Statistik"
- **Admin Layout** (src/app/admin/layout.tsx):
  - Import icon BarChart3 dari lucide-react
  - Ditambahkan ke adminNavItems: `{ href: '/admin/tata-kelola-desa', icon: BarChart3, label: 'Tata Kelola Desa' }`
  - Muncul di sidebar admin dengan menu utama

## Firestore Collections Schema

### Collection: `apbdes`
```typescript
{
  id: string (auto-generated)
  tahun: number (2025, 2026, etc)
  totalAnggaran: number (sum of all nominal)
  items: ApbdesItem[]
  {
    bidang: string
    kodeRekening: string
    kegiatan: string
    volume: number
    nominal: number
    sumberAnggaran: string
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Collection: `realisasiApbdes`
Struktur identik dengan `apbdes`, hanya `totalAnggaran` diganti `totalRealisasi`

### Collection: `produkHukumDesa`
```typescript
{
  id: string (auto-generated)
  jenis: enum ('perdes' | 'perkades' | 'rpjmdes' | 'rkpdes' | 'sk_desa' | 'lppd' | 'lkpd')
  tahun: number
  nama: string (nama produk hukum lengkap)
  nomor: string (nomor peraturan, e.g., "1/2026")
  filePdfUrl?: string (Cloudinary atau Drive PDF URL)
  filePdfId?: string (Google Drive file ID)
  driveLink?: string (Google Drive share link)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## Cara Menggunakan

### Untuk Admin: Import APBDes/Realisasi
1. Buka halaman http://localhost:3000/admin/tata-kelola-desa
2. Pilih tab "APBDes" atau "Realisasi APBDes"
3. Pilih tahun dari dropdown
4. Klik tombol "Impor Excel"
5. Pilih file Excel dengan format:
   - Kolom: Bidang, Kode Rekening, Kegiatan, Volume, Nominal, Sumber Anggaran
   - Lihat contoh di: `src/lib/excel-format-helper.ts`
6. File otomatis diparse dan tersimpan di Firestore
7. Untuk update tahun yang sama, cukup upload file baru (otomatis replace)

### Untuk Admin: Tambah Produk Hukum
1. Buka halaman http://localhost:3000/admin/tata-kelola-desa
2. Pilih tab "Produk Hukum Desa"
3. Isi form di sisi kiri:
   - Jenis Produk: pilih dari dropdown (Perdes, Perkades, dll)
   - Tahun: pilih tahun
   - Nama Produk: input nama lengkap
   - Nomor: input nomor peraturan (e.g., "1/2026")
   - Link Google Drive: paste URL share Google Drive (opsional)
4. Klik "Tambahkan"
5. Data muncul di list kanan setelah refresh

### Untuk Warga: Lihat Transparansi
1. Buka halaman http://localhost:3000/tata-kelola-desa
2. Pilih tab yang ingin dilihat
3. Pilih tahun dari year selector
4. Lihat visualisasi chart dan tabel detail
5. Untuk Produk Hukum: klik "Lihat PDF" atau "Buka di Drive" untuk akses dokumen

## Fitur Lanjutan yang Bisa Ditambahkan

### Phase 2:
1. **Analisis Komparatif**:
   - Perbandingan APBDes vs Realisasi dengan chart comparison
   - Persentase pencapaian realisasi per bidang
   
2. **Export Functionality**:
   - Export data APBDes ke PDF report
   - Export grafik chart sebagai image

3. **Dashboard Admin**:
   - Ringkasan total APBDes semua tahun
   - Grafik trending anggaran per tahun
   - Statistik produk hukum per jenis

4. **Google Drive Integration**:
   - Direct upload dari form ke Google Drive
   - Folder structure otomatis per jenis produk hukum

5. **Search & Filter**:
   - Filter APBDes per sumber anggaran
   - Search produk hukum berdasarkan nomor/nama

6. **Approval Workflow**:
   - Draft mode untuk produk hukum sebelum publish
   - Admin approval untuk perubahan APBDes

## Testing Checklist

- [ ] Halaman public `/tata-kelola-desa` dapat diakses
- [ ] Tab APBDes menampilkan data dengan chart bar
- [ ] Tab Realisasi menampilkan data dengan chart line
- [ ] Tab Produk Hukum menampilkan card grid
- [ ] Year selector berfungsi dan filter data
- [ ] Admin page `/admin/tata-kelola-desa` dapat diakses
- [ ] Excel import APBDes berhasil dan data tersimpan
- [ ] Excel import Realisasi berhasil dan data tersimpan
- [ ] Form Produk Hukum berfungsi
- [ ] Delete button menghapus data dengan benar
- [ ] Empty states menampilkan message yang tepat
- [ ] Loading states menampilkan skeleton
- [ ] Firestore rules mengijinkan read publik dan write admin
- [ ] Link navigasi di header dan admin sidebar berfungsi

## Troubleshooting

### Data tidak muncul di halaman publik
1. Pastikan data sudah tersimpan di Firestore (cek di Firebase Console)
2. Pastikan tahun di year selector sesuai dengan tahun di database
3. Reload halaman atau clear browser cache

### Excel import gagal
1. Pastikan nama kolom TEPAT: "Bidang", "Kode Rekening", "Kegiatan", "Volume", "Nominal", "Sumber Anggaran"
2. Pastikan format file .xlsx atau .xls
3. Pastikan kolom Nominal dan Volume berformat angka di Excel
4. Check browser console untuk error message

### Admin tidak bisa upload
1. Pastikan login dengan email: sidaurip@gmail.id
2. Pastikan sudah set isAdmin=true di localStorage
3. Check Firestore rules di Firebase Console

## File Import Path untuk Reference

- Types: `src/lib/types.ts`
- Public Page: `src/app/tata-kelola-desa/page.tsx`
- Admin Page: `src/app/admin/tata-kelola-desa/page.tsx`
- Rules: `firestore.rules`
- Navigation: `src/components/landing/Header.tsx`, `src/app/admin/layout.tsx`
- Format Helper: `src/lib/excel-format-helper.ts`

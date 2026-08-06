# Setup Cloudinary untuk Upload Logo Footer

Fitur upload logo footer menggunakan Cloudinary untuk storage dan serve image. Berikut adalah panduan setupnya:

## 1. Setup Cloudinary Account

1. Daftar atau login ke https://cloudinary.com/
2. Buka Dashboard
3. Catat informasi berikut:
   - **Cloud Name**: Lihat di bagian atas dashboard
   - **API Key**: Lihat di Settings → API Keys

## 2. Create Upload Preset (Unsigned)

**Penting**: Untuk client-side upload dari aplikasi, gunakan unsigned preset.

1. Buka **Settings** → **Upload** tab
2. Scroll ke bagian **Upload presets**
3. Klik **Add upload preset**
4. Isi form:
   - **Name**: `desa_Sidaurip` (HARUS sama dengan yang di code)
   - **Unsigned**: Pilih **ON** (sangat penting untuk client-side)
   - **Resource type**: Images
   - **Folder**: `desa-sidaurip/footer-logos` (optional, untuk organisir)
5. Klik **Save**

## 3. Verifikasi Setup

Upload preset harus memiliki setting:
- ✅ Unsigned = ON
- ✅ Name = `desa_Sidaurip`
- ✅ Resource type = Image

## 4. Update Code jika Berbeda

File: `src/app/admin/settings/_components/footer-logos-settings-form.tsx`

Jika Cloud Name Anda berbeda, ubah baris ini:
```typescript
const response = await fetch('https://api.cloudinary.com/v1_1/desa-sidaurip/image/upload', {
```

Ganti `desa-sidaurip` dengan Cloud Name Anda.

## 5. Test Upload

1. Buka http://localhost:3000/admin/settings
2. Scroll ke "Logo Footer Landing Page"
3. Klik tombol Upload di salah satu logo slot
4. Pilih gambar (PNG, JPG, WebP)
5. Tunggu upload complete
6. Lihat preview muncul
7. Klik "Simpan Perubahan"

## 6. Verifikasi di Footer

1. Buka http://localhost:3000/
2. Scroll ke footer
3. Di sebelah kanan bawah (di bawah media sosial), seharusnya terlihat section "Mitra" dengan logo yang sudah diupload

## Tips

- **Max File Size**: Cloudinary gratis support hingga 10MB per file, tapi rekomendasikan max 2MB untuk logo
- **Optimal Size**: 200x200px atau 300x300px untuk logo yang terlihat jelas
- **Compression**: Cloudinary otomatis compress, jadi tidak perlu khawatir ukuran file
- **CDN**: Semua logo akan serve dari CDN Cloudinary yang cepat dan tersebar global

## Troubleshooting

### Upload gagal dengan error "Caller does not have required permissions"
- Pastikan upload preset sudah dibuat
- Pastikan upload preset **Unsigned = ON**
- Clear browser cache dan refresh

### Gambar tidak muncul di footer
- Pastikan sudah klik "Simpan Perubahan"
- Pastikan Firestore collection `footerLogos` sudah ada data
- Check browser console untuk error message
- Cek Cloudinary URL valid dengan buka di tab baru

### Upload preset tidak ditemukan
- Pastikan nama preset tepat: `desa_Sidaurip` (case sensitive)
- Verify di Settings → Upload → Upload presets

## Security Note

Unsigned upload preset hanya bisa upload gambar, tidak bisa delete atau modify. Cocok untuk production karena aman dari abuse.

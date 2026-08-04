
'use client';

import { PageHeader } from '@/components/page-header';
import { SettingsForm } from './_components/settings-form';
import { LogoSettingsForm } from './_components/logo-settings-form';
import { HeroSettingsForm } from './_components/hero-settings-form';
import { DriveSettingsForm } from './_components/drive-settings-form';
import { VideoProfileSettingsForm } from './_components/video-profile-settings-form';
import { FooterLogosSettingsForm } from './_components/footer-logos-settings-form';
import { AccompanyingImageSettingsForm, KadesPhotoSettingsForm, PengaduanImageSettingsForm } from './_components/cloudinary-images-form';
import { DesaAntiKorupsiDriveForm } from './_components/desa-anti-korupsi-drive-form';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Pengaturan Sistem"
        description="Kelola identitas visual desa, templat dokumen, dan konfigurasi penyimpanan sistem."
      />

      <div className="grid gap-8">
        <HeroSettingsForm />
        <VideoProfileSettingsForm />

        {/* Baris 1: Upload Gambar Pendamping + Upload Foto Kades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <AccompanyingImageSettingsForm />
          <KadesPhotoSettingsForm />
        </div>

        {/* Baris 2: Upload Pengaduan Masyarakat + Logo Desa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <PengaduanImageSettingsForm />
          <LogoSettingsForm />
        </div>

        {/* Baris 3: Templat Kop Surat + Konfigurasi Google Drive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <SettingsForm />
          <DriveSettingsForm />
        </div>

        <DesaAntiKorupsiDriveForm />
        <FooterLogosSettingsForm />
      </div>
    </div>
  );
}

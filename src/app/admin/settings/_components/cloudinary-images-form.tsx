'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Upload, User, Image as ImageIcon } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { VillageProfileInfo } from '@/lib/types';

export function AccompanyingImageSettingsForm() {
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const firestore = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData, isLoading: isDataLoading } = useDoc<VillageProfileInfo>(profileRef);

  useEffect(() => {
    if (profileData?.imageUrl) {
      setImageUrl(profileData.imageUrl);
      setImagePreview(profileData.imageUrl);
    }
  }, [profileData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: 'Ukuran File Terlalu Besar',
        description: 'Ukuran gambar pendamping tidak boleh melebihi 3MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal mengunggah gambar.');
      }

      const data = await res.json();
      setImageUrl(data.url);
      setImagePreview(data.url);

      toast({
        title: 'Gambar Terunggah ke Cloudinary',
        description: 'Pratinjau telah diperbarui. Klik "Simpan Gambar Pendamping" untuk menerapkan.',
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Gagal Mengunggah',
        description: error.message || 'Terjadi kesalahan saat mengunggah gambar ke Cloudinary.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !profileRef) return;
    setIsSaving(true);

    try {
      await setDoc(profileRef, { imageUrl }, { merge: true });
      toast({
        title: 'Gambar Pendamping Berhasil Disimpan',
        description: 'Gambar pendamping desa telah berhasil diperbarui.',
      });
    } catch (error) {
      console.error('Error saving accompanying image:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan pengaturan ke Firestore.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isDataLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-11 w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-emerald-600" />
          Upload Gambar Pendamping
        </CardTitle>
        <CardDescription>
          Unggah gambar pendamping untuk bagian "Tentang Desa" di halaman utama. Disimpan secara aman di Sistem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <Label>Pratinjau Gambar Pendamping</Label>
            <div className="relative aspect-video w-full max-w-md border-2 border-dashed rounded-xl overflow-hidden flex items-center justify-center bg-muted/30">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Pratinjau Gambar Pendamping"
                  fill
                  className="object-cover"
                />
              ) : (
                <p className="text-xs text-muted-foreground text-center">Belum ada gambar pendamping</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accompanying-upload">Pilih Gambar Baru</Label>
            <div className="flex items-center gap-3">
              <Input
                id="accompanying-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                disabled={isSaving || isUploading}
                className="pt-2 flex-grow max-w-sm cursor-pointer"
              />
              {isUploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground">
              Ukuran maks: 3MB. Format: PNG, JPG, atau WEBP.
            </p>
          </div>

          <Button type="submit" disabled={isSaving || isUploading || !imageUrl}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Gambar Pendamping
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function PengaduanImageSettingsForm() {
  const [pengaduanImageUrl, setPengaduanImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const firestore = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData, isLoading: isDataLoading } = useDoc<VillageProfileInfo>(profileRef);

  useEffect(() => {
    if (profileData?.pengaduanImageUrl) {
      setPengaduanImageUrl(profileData.pengaduanImageUrl);
      setImagePreview(profileData.pengaduanImageUrl);
    }
  }, [profileData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: 'Ukuran File Terlalu Besar',
        description: 'Ukuran gambar pengaduan tidak boleh melebihi 3MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal mengunggah gambar.');
      }

      const data = await res.json();
      setPengaduanImageUrl(data.url);
      setImagePreview(data.url);

      toast({
        title: 'Gambar Terunggah ke Cloudinary',
        description: 'Pratinjau telah diperbarui. Klik "Simpan Gambar Pengaduan" untuk menerapkan.',
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Gagal Mengunggah',
        description: error.message || 'Terjadi kesalahan saat mengunggah gambar ke Cloudinary.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !profileRef) return;
    setIsSaving(true);

    try {
      await setDoc(profileRef, { pengaduanImageUrl }, { merge: true });
      toast({
        title: 'Gambar Pengaduan Berhasil Disimpan',
        description: 'Gambar Pengaduan Masyarakat telah berhasil diperbarui.',
      });
    } catch (error) {
      console.error('Error saving pengaduan image:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan pengaturan ke Firestore.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isDataLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <Skeleton className="h-64 w-48" />
            <Skeleton className="h-11 w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-red-500" />
          Upload Pengaduan Masyarakat
        </CardTitle>
        <CardDescription>
          Unggah gambar untuk kartu "Layanan Pengaduan" di Landing Page. Rasio gambar: Lebar 3 : Tinggi 4. Disimpan di Sistem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <Label>Pratinjau Gambar Pengaduan Masyarakat</Label>
            <div className="relative aspect-[3/4] w-48 border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center bg-muted/30">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Pratinjau Gambar Pengaduan Masyarakat"
                  fill
                  className="object-cover"
                />
              ) : (
                <p className="text-xs text-muted-foreground text-center px-4">Belum ada gambar pengaduan masyarakat</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Rasio ideal: 3:4 (contoh: 600px × 800px)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pengaduan-upload">Pilih Gambar Baru</Label>
            <div className="flex items-center gap-3">
              <Input
                id="pengaduan-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                disabled={isSaving || isUploading}
                className="pt-2 flex-grow max-w-sm cursor-pointer"
              />
              {isUploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground">
              Ukuran maks: 3MB. Format: PNG, JPG, atau WEBP.
            </p>
          </div>

          <Button type="submit" disabled={isSaving || isUploading || !pengaduanImageUrl}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Gambar Pengaduan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function KadesPhotoSettingsForm() {
  const [kadesPhotoUrl, setKadesPhotoUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const firestore = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData, isLoading: isDataLoading } = useDoc<VillageProfileInfo>(profileRef);

  useEffect(() => {
    if (profileData?.kadesPhotoUrl) {
      setKadesPhotoUrl(profileData.kadesPhotoUrl);
      setImagePreview(profileData.kadesPhotoUrl);
    }
  }, [profileData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: 'Ukuran File Terlalu Besar',
        description: 'Ukuran foto Kepala Desa tidak boleh melebihi 3MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal mengunggah foto.');
      }

      const data = await res.json();
      setKadesPhotoUrl(data.url);
      setImagePreview(data.url);

      toast({
        title: 'Foto Terunggah ke Cloudinary',
        description: 'Pratinjau telah diperbarui. Klik "Simpan Foto Kades" untuk menerapkan.',
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Gagal Mengunggah',
        description: error.message || 'Terjadi kesalahan saat mengunggah foto ke Cloudinary.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !profileRef) return;
    setIsSaving(true);

    try {
      await setDoc(profileRef, { kadesPhotoUrl }, { merge: true });
      toast({
        title: 'Foto Kades Berhasil Disimpan',
        description: 'Foto Kepala Desa telah berhasil diperbarui.',
      });
    } catch (error) {
      console.error('Error saving kades photo:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan pengaturan ke Firestore.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isDataLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <Skeleton className="h-48 w-40" />
            <Skeleton className="h-11 w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-amber-500" />
          Upload Foto Kades
        </CardTitle>
        <CardDescription>
          Unggah foto resmi Kepala Desa untuk ditampilkan di bagian "Profil & Sambutan" halaman Profil Desa. Disimpan di Sistem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <Label>Pratinjau Foto Kades</Label>
            <div className="relative aspect-[3/4] w-48 border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center bg-muted/30">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Pratinjau Foto Kades"
                  fill
                  className="object-cover"
                />
              ) : (
                <p className="text-xs text-muted-foreground text-center px-4">Belum ada foto Kepala Desa</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kades-upload">Pilih Foto Baru</Label>
            <div className="flex items-center gap-3">
              <Input
                id="kades-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                disabled={isSaving || isUploading}
                className="pt-2 flex-grow max-w-sm cursor-pointer"
              />
              {isUploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground">
              Ukuran maks: 3MB. Format: PNG, JPG, atau WEBP.
            </p>
          </div>

          <Button type="submit" disabled={isSaving || isUploading || !kadesPhotoUrl}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Foto Kades
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Trash2, Upload } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { FooterLogosInfo } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const CLOUD_NAME = 'dgsxujjb1';
const UPLOAD_PRESET = 'webdesa';

const defaultFooterLogos: FooterLogosInfo = {
  logo1Url: "",
  logo2Url: "",
  logo3Url: "",
  logo4Url: "",
  logo1Link: "",
  logo2Link: "",
  logo3Link: "",
  logo4Link: "",
};

const LogoSlot = ({ slot, onUpload, onRemove, isUploading, preview, link, onLinkChange }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUpload(file, slot);
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <Label className="font-bold text-sm">Logo {slot}</Label>
        {preview && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemove(slot)}
            className="h-8 gap-2 text-xs"
          >
            <Trash2 className="h-3 w-3" />
            Hapus
          </Button>
        )}
      </div>

      <div className="w-full h-24 p-3 border-2 border-dashed rounded-md flex items-center justify-center bg-muted/50">
        {preview ? (
          <Image src={preview} alt={`Logo ${slot}`} width={80} height={80} className="object-contain max-w-full h-auto" />
        ) : (
          <p className="text-xs text-muted-foreground text-center">Belum ada logo</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`link-${slot}`} className="text-xs">Link (Optional)</Label>
        <Input
          id={`link-${slot}`}
          placeholder="https://..."
          value={link}
          onChange={(e) => onLinkChange(slot, e.target.value)}
          type="url"
          className="text-sm"
        />
      </div>
    </div>
  );
};

export function FooterLogosSettingsForm() {
  const [formState, setFormState] = useState<FooterLogosInfo>(defaultFooterLogos);
  const [previews, setPreviews] = useState<Record<string, string>>({
    logo1: '',
    logo2: '',
    logo3: '',
    logo4: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const { toast } = useToast();

  const firestore = useFirestore();

  const footerLogosRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'footerLogos', 'default');
  }, [firestore]);

  const { data: footerLogosData, isLoading: isDataLoading } = useDoc<FooterLogosInfo>(footerLogosRef);

  useEffect(() => {
    if (footerLogosData) {
      setFormState(footerLogosData);
      setPreviews({
        logo1: footerLogosData.logo1Url || '',
        logo2: footerLogosData.logo2Url || '',
        logo3: footerLogosData.logo3Url || '',
        logo4: footerLogosData.logo4Url || '',
      });
    }
  }, [footerLogosData]);

  const handleUploadToCloudinary = async (file: File, slot: string) => {
    if (!file) return;

    setUploadingSlot(slot);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Gagal upload ke Cloudinary');
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      // Update form state dengan URL baru
      const updatedState = {
        ...formState,
        [`logo${slot}Url`]: imageUrl,
      };

      setFormState(updatedState);
      setPreviews((prev) => ({
        ...prev,
        [`logo${slot}`]: imageUrl,
      }));

      toast({
        title: 'Upload Berhasil',
        description: `Logo ${slot} berhasil diupload ke Cloudinary.`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Gagal Upload',
        description: error.message || 'Terjadi kesalahan saat upload gambar.',
        variant: 'destructive',
      });
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleRemoveLogo = (slot: string) => {
    const updatedState = {
      ...formState,
      [`logo${slot}Url`]: '',
      [`logo${slot}Link`]: '',
    };
    setFormState(updatedState);
    setPreviews((prev) => ({
      ...prev,
      [`logo${slot}`]: '',
    }));
    toast({ title: `Logo ${slot} Dihapus` });
  };

  const handleLinkChange = (slot: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [`logo${slot}Link`]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !footerLogosRef) return;

    setIsSaving(true);

    try {
      await setDoc(footerLogosRef, formState, { merge: true });
      toast({
        title: 'Logo Footer Berhasil Disimpan',
        description: 'Konfigurasi logo footer telah diperbarui.',
      });
    } catch (error) {
      console.error('Error saving footer logos:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan ke Firestore.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isDataLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Logo Footer Landing Page</CardTitle>
        <CardDescription>
          Kelola 4 logo yang ditampilkan di footer landing page. Logo akan muncul di sebelah kanan bawah di bawah media sosial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((slot) => (
              <LogoSlot
                key={slot}
                slot={slot}
                onUpload={handleUploadToCloudinary}
                onRemove={handleRemoveLogo}
                isUploading={uploadingSlot === slot.toString()}
                preview={previews[`logo${slot}`]}
                link={formState[`logo${slot}Link` as keyof FooterLogosInfo] || ''}
                onLinkChange={handleLinkChange}
              />
            ))}
          </div>

          <div className="flex gap-2 pt-6 border-t">
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2 bg-primary hover:bg-slate-800"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
            <p className="font-semibold mb-2">💡 Petunjuk Upload:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Format gambar: PNG, JPG, WebP</li>
              <li>Ukuran rekomendasi: 200x200px atau 300x300px</li>
              <li>Semua logo akan diupload ke Sistem secara otomatis</li>
              <li>Isi link (optional) jika logo ingin dihubungkan ke URL tertentu</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

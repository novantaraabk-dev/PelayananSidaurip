
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Image as ImageIcon } from 'lucide-react';

type Official = {
  id: string;
  name: string;
  position: string;
  imageUrl?: string;
  category: 'perangkat' | 'bpd' | 'rtrw';
};

interface OfficialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  official?: Official | null;
}

const CLOUD_NAME = 'dgsxujjb1';
const UPLOAD_PRESET = 'webdesa';

export function OfficialForm({ open, onOpenChange, official }: OfficialFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    imageUrl: '',
    category: 'perangkat' as 'perangkat' | 'bpd' | 'rtrw',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (official) {
      setFormData({
        name: official.name,
        position: official.position,
        imageUrl: official.imageUrl || '',
        category: official.category,
      });
    } else if (open) {
      setFormData({ name: '', position: '', imageUrl: '', category: 'perangkat' });
    }
  }, [official, open]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast({
        title: "File Terlalu Besar",
        description: "Maksimal ukuran foto adalah 1MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message || 'Gagal mengunggah ke Cloudinary');
      }

      setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
      toast({ title: 'Foto Terunggah' });

    } catch (error: any) {
      toast({
        title: 'Gagal Mengunggah',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    try {
      if (official) {
        await setDoc(doc(firestore, 'officials', official.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        toast({ title: "Data Berhasil Diperbarui" });
      } else {
        await addDoc(collection(firestore, 'officials'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Data Berhasil Ditambahkan" });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Gagal Menyimpan", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{official ? 'Edit Pengurus' : 'Tambah Pengurus Baru'}</DialogTitle>
          <DialogDescription>Isi detail pengurus pemerintahan desa di bawah ini.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Foto Profil</Label>
            <div className="flex flex-col gap-4">
              {formData.imageUrl && (
                <div className="relative aspect-[3/4] w-32 overflow-hidden rounded-2xl border-2 border-primary/10 bg-muted">
                  <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-4">
                <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading || isSubmitting} className="max-w-xs" />
                {isUploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Maks 1MB. Rekomendasi rasio 3:4.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori Jabatan</Label>
            <Select
              value={formData.category}
              onValueChange={(v: any) => setFormData(p => ({ ...p, category: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perangkat">Perangkat Desa</SelectItem>
                <SelectItem value="bpd">BPD Desa</SelectItem>
                <SelectItem value="rtrw">RT / RW</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value.toUpperCase() }))}
              placeholder="Contool: BUDI SANTOSO"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Jabatan</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={e => setFormData(p => ({ ...p, position: e.target.value }))}
              placeholder="Contoh: Kepala Dusun / Ketua RT 01"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

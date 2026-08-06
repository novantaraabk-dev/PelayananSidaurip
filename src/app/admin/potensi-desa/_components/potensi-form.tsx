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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Image as ImageIcon, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { PotensiDesa } from '@/lib/types';

interface PotensiFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  potensi?: PotensiDesa | null;
}

const CLOUD_NAME = 'dgsxujjb1';
const UPLOAD_PRESET = 'webdesa';

export const POTENSI_CATEGORIES = [
  { id: 'pariwisata-kebudayaan', label: 'Pariwisata & Kebudayaan' },
  { id: 'umkm-industri', label: 'UMKM & Industri Kreatif' },
  { id: 'bumdes', label: 'BUMDes Sidaurip' },
  { id: 'pertanian-perkebunan', label: 'Pertanian & Perkebunan' },
  { id: 'sda-lingkungan', label: 'Sumber Daya Alam & Lingkungan' }
] as const;

export function PotensiForm({ open, onOpenChange, potensi }: PotensiFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: 'pariwisata-kebudayaan' as PotensiDesa['category'],
    narrative: '',
    imageUrls: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (potensi) {
      setFormData({
        title: potensi.title || '',
        subtitle: potensi.subtitle || '',
        category: potensi.category || 'pariwisata-kebudayaan',
        narrative: potensi.narrative || '',
        imageUrls: potensi.imageUrls || [],
      });
    } else if (open) {
      setFormData({
        title: '',
        subtitle: '',
        category: 'pariwisata-kebudayaan',
        narrative: '',
        imageUrls: [],
      });
    }
  }, [potensi, open]);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl !== 'string') {
          reject(new Error('Gagal membaca file gambar.'));
          return;
        }

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDimension = 1600;
          let { width, height } = img;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Tidak dapat memproses gambar.'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          const tryCompress = (quality: number, attempt: number) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Gagal mengompresi gambar.'));
                  return;
                }

                const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });

                if (compressedFile.size > 700 * 1024 && attempt < 4) {
                  tryCompress(Math.max(0.55, quality - 0.15), attempt + 1);
                } else {
                  resolve(compressedFile);
                }
              },
              'image/jpeg',
              quality
            );
          };

          tryCompress(0.9, 1);
        };
        img.onerror = () => reject(new Error('Gambar tidak valid.'));
        img.src = dataUrl;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.readAsDataURL(file);
    });
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const urls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        toast({
          title: `Mengunggah Foto ${i + 1} dari ${files.length}...`,
          description: file.name,
        });

        const processingFile = await compressImage(file);

        const uploadFormData = new FormData();
        uploadFormData.append('file', processingFile);
        uploadFormData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: uploadFormData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error.message || 'Gagal mengunggah ke Cloudinary');
        }

        urls.push(data.secure_url);
      }

      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...urls],
      }));

      toast({
        title: 'Berhasil',
        description: `Berhasil mengunggah ${urls.length} foto.`,
      });

    } catch (error: any) {
      toast({
        title: 'Gagal Mengunggah',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove),
    }));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...formData.imageUrls];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newImages.length) {
      const temp = newImages[index];
      newImages[index] = newImages[targetIndex];
      newImages[targetIndex] = temp;

      setFormData(prev => ({
        ...prev,
        imageUrls: newImages
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    if (!formData.title.trim()) {
      toast({ title: 'Input Tidak Valid', description: 'Judul tidak boleh kosong.', variant: 'destructive' });
      return;
    }
    if (!formData.narrative.trim()) {
      toast({ title: 'Input Tidak Valid', description: 'Narasi tidak boleh kosong.', variant: 'destructive' });
      return;
    }
    if (formData.imageUrls.length === 0) {
      toast({ title: 'Input Tidak Valid', description: 'Silakan unggah minimal 1 foto.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (potensi) {
        await setDoc(doc(firestore, 'potensiDesa', potensi.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        toast({ title: 'Sukses', description: 'Data Potensi Desa berhasil diperbarui.' });
      } else {
        await addDoc(collection(firestore, 'potensiDesa'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Sukses', description: 'Data Potensi Desa berhasil ditambahkan.' });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Gagal Menyimpan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase italic tracking-tight font-display text-slate-800">
            {potensi ? 'Edit Potensi Desa' : 'Tambah Potensi Desa Baru'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Lengkapi formulir di bawah ini untuk menampilkan potensi desa pada portal publik.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-slate-600">Sub-Kategori Potensi</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as PotensiDesa['category'] }))}
            >
              <SelectTrigger id="category" className="rounded-xl border-slate-200 h-12 font-bold text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition-all">
                <SelectValue placeholder="Pilih Sub-Kategori" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg border-slate-100">
                {POTENSI_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="font-semibold text-slate-600 rounded-lg py-2.5">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-slate-600">Judul Utama</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Contoh: Desa Wisata Curug Sidaurip"
              className="rounded-xl border-slate-200 h-12 font-semibold text-slate-700 placeholder-slate-400 bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle" className="text-xs font-black uppercase tracking-widest text-slate-600">Sub Judul / Keterangan Singkat</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Contoh: Pesona air terjun alami ditengah hutan pinus"
              className="rounded-xl border-slate-200 h-12 font-semibold text-slate-700 placeholder-slate-400 bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="narrative" className="text-xs font-black uppercase tracking-widest text-slate-600">Narasi / Ulasan Lengkap</Label>
            <Textarea
              id="narrative"
              value={formData.narrative}
              onChange={(e) => setFormData(prev => ({ ...prev, narrative: e.target.value }))}
              placeholder="Tulis narasi lengkap mengenai potensi desa di sini..."
              className="rounded-xl border-slate-200 min-h-[140px] font-semibold text-slate-700 placeholder-slate-400 bg-slate-50/50 focus:bg-white transition-all p-4 resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-600">Unggah Foto Potensi (Mendukung Lebih Dari 1 Foto)</Label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="group relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-sm transition-all duration-300 hover:shadow-md">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    {index > 0 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        onClick={() => moveImage(index, 'up')}
                        className="h-8 w-8 rounded-full bg-white/90 text-slate-700 hover:bg-white"
                        title="Geser Kiri"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}
                    {index < formData.imageUrls.length - 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        onClick={() => moveImage(index, 'down')}
                        className="h-8 w-8 rounded-full bg-white/90 text-slate-700 hover:bg-white"
                        title="Geser Kanan"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => removeImage(index)}
                      className="h-8 w-8 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                      title="Hapus Foto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                    Foto {index + 1}
                  </div>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer group">
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-slate-400 group-hover:scale-110 group-hover:text-sky-600 transition-all duration-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2 text-center px-2">Unggah Foto</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFilesChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-[10px] text-slate-400 font-semibold italic mt-1">
              * Mendukung unggah banyak foto sekaligus. Rekomendasi rasio foto 4:3 dengan ukuran di bawah 1MB per file. Geser foto untuk mengurutkan urutan tampil.
            </p>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-50 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-12 font-bold px-6 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="rounded-xl h-12 font-black px-8 bg-sky-700 hover:bg-sky-800 text-white shadow-md shadow-sky-700/10 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>SIMPAN</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

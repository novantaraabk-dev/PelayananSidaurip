'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Image as ImageIcon, Sparkles, Star, Trash2, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { doc, setDoc, addDoc, collection, serverTimestamp, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { News } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { generateVillageNewsDraft } from '@/ai/flows/generate-village-news-flow';
import { getVideoEmbedUrl } from '@/lib/video-utils';
import { NewsImageGrid } from '@/components/news-image-grid';

interface NewsFormProps {
  initialData?: News | null;
}

const CLOUD_NAME = 'dgsxujjb1';
const UPLOAD_PRESET = 'webdesa';

export function NewsForm({ initialData }: NewsFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    date: '',
    content: '',
    author: '',
    imageUrl: '', // Cloudinary URL for primary photo
    imageUrls: [] as string[], // Cloudinary URLs array
    videoUrl: '',
    mediaType: 'photo' as 'photo' | 'video',
    isHeadline: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (initialData) {
      const urls = initialData.imageUrls && initialData.imageUrls.length > 0
        ? initialData.imageUrls
        : (initialData.imageUrl ? [initialData.imageUrl] : []);

      setFormData({
        title: initialData.title ?? '',
        subtitle: initialData.subtitle ?? '',
        date: initialData.date ?? '',
        content: initialData.content ?? '',
        author: initialData.author ?? '',
        imageUrl: urls[0] || initialData.imageUrl || '',
        imageUrls: urls,
        videoUrl: initialData.videoUrl ?? '',
        mediaType: initialData.mediaType ?? (initialData.videoUrl ? 'video' : 'photo'),
        isHeadline: initialData.isHeadline ?? false,
      });
    }
  }, [initialData]);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of files) {
        const uploadFormData = new FormData();
        const processingFile = await compressImage(file);
        uploadFormData.append('file', processingFile);
        uploadFormData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: uploadFormData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Gagal mengunggah ke Cloudinary');
        }
        newUrls.push(data.secure_url);
      }

      setFormData(prev => {
        const updatedUrls = [...prev.imageUrls, ...newUrls];
        return {
          ...prev,
          imageUrls: updatedUrls,
          imageUrl: updatedUrls[0] || prev.imageUrl,
        };
      });

      toast({
        title: 'Unggah Berhasil',
        description: `${newUrls.length} gambar berhasil dikompresi dan diunggah ke Cloudinary.`,
      });
    } catch (error: any) {
      let description = error.message;
      if (error instanceof SyntaxError) {
        description = 'Respons dari server tidak valid. Periksa konfigurasi Cloudinary Anda.';
      }

      toast({
        title: 'Gagal Mengunggah',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => {
      const updated = prev.imageUrls.filter((_, i) => i !== index);
      return {
        ...prev,
        imageUrls: updated,
        imageUrl: updated[0] || '',
      };
    });
  };

  const handleMovePhoto = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      if (toIndex < 0 || toIndex >= prev.imageUrls.length) return prev;
      const updated = [...prev.imageUrls];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      return {
        ...prev,
        imageUrls: updated,
        imageUrl: updated[0] || '',
      };
    });
  };

  const handleGenerateWithAI = async () => {
    if (!formData.title.trim() && !formData.subtitle.trim()) {
      toast({
        title: 'Data belum lengkap',
        description: 'Isi judul kegiatan atau sub judul terlebih dahulu agar AI bisa membuat draft berita.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const draft = await generateVillageNewsDraft({
        title: formData.title || 'Kegiatan Desa',
        subtitle: formData.subtitle || 'Kegiatan masyarakat desa',
        date: formData.date || 'Tanggal berita',
        author: formData.author || 'Tim Media Desa',
      });

      setFormData(prev => ({ ...prev, content: formatNewsContent(draft.content) }));
      toast({
        title: 'Draft berita berhasil dibuat',
        description: 'Isi berita telah diisi otomatis oleh Gemini sesuai judul dan tanggal yang Anda masukkan.',
      });
    } catch (error: any) {
      toast({
        title: 'Gagal membuat berita AI',
        description: error.message || 'Pastikan API Gemini sudah tersedia di lingkungan ini.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    if (formData.imageUrls.some(url => !url.includes('res.cloudinary.com'))) {
      toast({
        title: 'URL Gambar tidak valid',
        description: 'Harap unggah ulang gambar untuk mendapatkan URL Cloudinary yang benar.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.mediaType === 'video' && !getVideoEmbedUrl(formData.videoUrl)) {
      toast({
        title: 'URL Video tidak valid',
        description: 'Harap masukkan tautan TikTok, Instagram, atau YouTube yang benar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const primaryUrl = formData.imageUrls[0] || formData.imageUrl || '';
      const dataToSave = {
        title: formData.title,
        subtitle: formData.subtitle,
        date: formData.date,
        author: formData.author,
        isHeadline: formData.isHeadline,
        mediaType: formData.mediaType,
        imageUrl: primaryUrl,
        imageUrls: formData.imageUrls,
        videoUrl: formData.mediaType === 'video' ? formData.videoUrl : '',
        content: formData.content ? formatNewsContent(formData.content) : '',
      };

      if (initialData) {
        const batch = writeBatch(firestore);
        if (dataToSave.isHeadline) {
          const headlineQuery = query(collection(firestore, 'news'), where('isHeadline', '==', true));
          const headlineSnapshot = await getDocs(headlineQuery);
          headlineSnapshot.docs.forEach((docSnapshot) => {
            if (docSnapshot.id !== initialData.id) {
              batch.update(doc(firestore, 'news', docSnapshot.id), { isHeadline: false, updatedAt: serverTimestamp() });
            }
          });
        }
        batch.set(doc(firestore, 'news', initialData.id), {
          ...dataToSave,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        await batch.commit();
        toast({ title: 'Berhasil Diperbarui' });
      } else {
        if (dataToSave.isHeadline) {
          const batch = writeBatch(firestore);
          const headlineQuery = query(collection(firestore, 'news'), where('isHeadline', '==', true));
          const headlineSnapshot = await getDocs(headlineQuery);
          headlineSnapshot.docs.forEach((docSnapshot) => {
            batch.update(doc(firestore, 'news', docSnapshot.id), { isHeadline: false, updatedAt: serverTimestamp() });
          });
          const newDocRef = doc(collection(firestore, 'news'));
          batch.set(newDocRef, {
            ...dataToSave,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          await batch.commit();
        } else {
          await addDoc(collection(firestore, 'news'), {
            ...dataToSave,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        toast({ title: 'Berita Berhasil Dibuat' });
      }
      router.push('/admin/berita');
    } catch (error: any) {
      toast({ title: 'Gagal Menyimpan', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNewsContent = (rawContent: string) => {
    return rawContent
      .split(/\n\s*\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .join('\n\n');
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Berita' : 'Buat Berita Baru'}</CardTitle>
        <CardDescription>Lengkapi informasi berita kegiatan desa di bawah ini. Anda dapat mengunggah beberapa foto sekaligus.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
            <div className="space-y-4">
              <Label>Jenis Berita</Label>
              <Tabs
                value={formData.mediaType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, mediaType: value as 'photo' | 'video' }))}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 gap-2 rounded-3xl border p-1">
                  <TabsTrigger value="photo">Berita Foto</TabsTrigger>
                  <TabsTrigger value="video">Berita Video</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {formData.mediaType === 'photo'
                    ? 'Pilih tab Foto untuk unggah satu atau beberapa gambar berita.'
                    : 'Pilih tab Video untuk masukkan tautan video berita.'}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {formData.mediaType === 'photo'
                    ? 'Foto akan ditampilkan dalam layout grid modern (1, 2, 3, atau 4+ foto).'
                    : 'Video akan diputar langsung di halaman berita.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Label>
                {formData.mediaType === 'photo'
                  ? `Foto Kegiatan (${formData.imageUrls.length} foto diunggah)`
                  : 'Preview & Video Link'}
              </Label>

              {formData.mediaType === 'photo' ? (
                <div className="space-y-4">
                  {/* UPLOAD BUTTON */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Label
                      htmlFor="multi-photo-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-medium text-sm transition-colors"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span>{formData.imageUrls.length > 0 ? 'Tambah Foto Lain' : 'Unggah Foto'}</span>
                    </Label>
                    <Input
                      id="multi-photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      disabled={isUploading || isSubmitting}
                      className="hidden"
                    />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      Format JPG/PNG. Anda dapat memilih lebih dari satu foto.
                    </span>
                  </div>

                  {/* THUMBNAILS LIST & REORDER */}
                  {formData.imageUrls.length > 0 && (
                    <div className="space-y-3 rounded-2xl border p-4 bg-slate-50">
                      <p className="text-xs font-semibold text-slate-700">Daftar Foto (Foto 1 = Utama / Cover):</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {formData.imageUrls.map((url, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border bg-white shadow-sm">
                            <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <span className="absolute top-1.5 left-1.5 bg-sky-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow">
                                Utama
                              </span>
                            )}
                            {/* ACTION OVERLAY */}
                            <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                              {idx > 0 && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  className="h-7 w-7 rounded-full text-slate-800"
                                  onClick={() => handleMovePhoto(idx, idx - 1)}
                                  title="Geser ke kiri"
                                >
                                  <ArrowLeft className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {idx < formData.imageUrls.length - 1 && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  className="h-7 w-7 rounded-full text-slate-800"
                                  onClick={() => handleMovePhoto(idx, idx + 1)}
                                  title="Geser ke kanan"
                                >
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => handleRemovePhoto(idx)}
                                title="Hapus foto"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* LIVE PREVIEW OF GRID LAYOUT */}
                      <div className="mt-4 pt-4 border-t space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Pratinjau Layout Tampilan ({formData.imageUrls.length} Foto):
                        </p>
                        <div className="max-w-md rounded-2xl border bg-white p-3 shadow-inner">
                          <NewsImageGrid imageUrls={formData.imageUrls} title={formData.title || 'Pratinjau'} interactive={false} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    type="url"
                    value={formData.videoUrl ?? ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    disabled={isSubmitting}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Dapat menggunakan link YouTube, TikTok, atau Instagram.
                  </p>
                  {formData.imageUrls.length > 0 && (
                    <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-muted">
                      <img src={formData.imageUrls[0]} alt="Preview Video" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading || isSubmitting} className="max-w-xs" />
                    {isUploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Upload gambar preview untuk ditampilkan di kartu berita video.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-amber-50 p-4 rounded-xl border border-amber-100">
            <Checkbox
              id="isHeadline"
              checked={formData.isHeadline}
              onCheckedChange={(checked) => setFormData(p => ({ ...p, isHeadline: !!checked }))}
            />
            <Label htmlFor="isHeadline" className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              Tandai sebagai Berita Headline (Utama)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul Kegiatan (Maskot)</Label>
            <Input
              id="title"
              value={formData.title ?? ''}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="Contoh: Musyawarah Desa Sidaurip 2026"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Sub Judul</Label>
            <Input
              id="subtitle"
              value={formData.subtitle ?? ''}
              onChange={e => setFormData(p => ({ ...p, subtitle: e.target.value }))}
              placeholder="Ringkasan singkat berita..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Tanggal Berita</Label>
            <Input
              id="date"
              value={formData.date ?? ''}
              onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
              placeholder="Contoh: Jumat, 24 Apr 2026"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="content">Isi Berita</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateWithAI}
                disabled={isGenerating || isSubmitting || isUploading}
                className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
              >
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Buat dengan AI
              </Button>
            </div>
            <Textarea
              id="content"
              value={formData.content ?? ''}
              onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
              placeholder="Tulis narasi lengkap berita di sini..."
              rows={15}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Pembuat Berita</Label>
            <Input
              id="author"
              value={formData.author ?? ''}
              onChange={e => setFormData(p => ({ ...p, author: e.target.value }))}
              placeholder="Nama Penulis / Tim Media Desa"
              required
            />
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting || isUploading} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Berita
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

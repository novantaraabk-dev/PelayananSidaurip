
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Image as ImageIcon } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const CLOUD_NAME = 'dgsxujjb1';
const UPLOAD_PRESET = 'webdesa';

export function AnnouncementForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast({
        title: "File Terlalu Besar",
        description: "Maksimal ukuran gambar adalah 1MB.",
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

      setImageUrl(data.secure_url);
      toast({ title: 'Gambar Terunggah' });

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
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Formulir tidak lengkap",
        description: "Judul dan isi pengumuman tidak boleh kosong.",
        variant: "destructive",
      });
      return;
    }

    if (!firestore) {
      toast({
        title: "Gagal Menerbitkan",
        description: "Koneksi ke database gagal. Silakan coba lagi.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const announcementsCollection = collection(firestore, 'announcements');
      await addDoc(announcementsCollection, {
        title,
        content,
        imageUrl,
        authorName: "Admin Desa",
        publishDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Pengumuman Diterbitkan",
        description: "Pengumuman baru telah berhasil ditambahkan dan akan tampil di halaman publik.",
      });
      setTitle('');
      setContent('');
      setImageUrl('');
    } catch (error) {
      console.error("Gagal menerbitkan pengumuman:", error);
      toast({
        title: "Gagal Menerbitkan",
        description: "Terjadi kesalahan saat menyimpan pengumuman. Coba lagi nanti.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Pengumuman Baru</CardTitle>
        <CardDescription>Isi formulir di bawah ini untuk menerbitkan pengumuman baru untuk warga.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Gambar Lampiran (Opsional)</Label>
            <div className="flex flex-col gap-4">
              {imageUrl && (
                <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-xl border-2 border-primary/10 bg-muted">
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-4">
                <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading || isLoading} className="max-w-xs" />
                {isUploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Format JPG/PNG. Maks 1MB.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul Pengumuman</Label>
            <Input
              id="title"
              placeholder="Contoh: Kerja Bakti Lingkungan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Isi Pengumuman</Label>
            <Textarea
              id="content"
              placeholder="Tulis isi lengkap pengumuman di sini..."
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading || isUploading} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Terbitkan Pengumuman
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

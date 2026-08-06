'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, deleteDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { News } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Star, Circle, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function NewsList() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const newsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return firestore ? query(collection(firestore, 'news'), orderBy('updatedAt', 'desc')) : null;
  }, [firestore]);

  const { data: news, isLoading } = useCollection<News>(newsQuery);

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'news', id));
      toast({ title: "Berita Dihapus" });
    } catch (e: any) {
      toast({ title: "Gagal Menghapus", variant: "destructive" });
    }
  };

  const handleSetHeadline = async (id: string) => {
    if (!firestore || !news) return;
    try {
      const batch = writeBatch(firestore);
      news.forEach((item) => {
        const itemRef = doc(firestore, 'news', item.id);
        const shouldBeHeadline = item.id === id;
        if (item.isHeadline !== shouldBeHeadline) {
          batch.update(itemRef, { isHeadline: shouldBeHeadline, updatedAt: serverTimestamp() });
        }
      });
      await batch.commit();
      toast({ title: 'Headline berhasil diperbarui' });
    } catch (e: any) {
      toast({ title: 'Gagal memperbarui headline', description: e?.message, variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>;

  return (
    <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
      <Table className="table-fixed">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[100px]">Gambar</TableHead>
            <TableHead>Judul Berita</TableHead>
            <TableHead>Media</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Headline</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {news?.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Belum ada berita.</TableCell></TableRow>
          ) : (
            (news || []).map((item) => {
              const photoCount = item.imageUrls?.length || (item.imageUrl ? 1 : 0);
              const thumbUrl = item.imageUrls?.[0] || item.imageUrl;
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="relative inline-block">
                      <img
                        src={thumbUrl?.replace('/image/upload/','/image/upload/w_300,q_auto,f_auto/') || '/placeholder.jpg'}
                        className="h-10 w-16 object-cover rounded border"
                        loading="lazy"
                        alt={item.title}
                      />
                      {photoCount > 1 && (
                        <Badge className="absolute -top-2 -right-2 bg-sky-600 text-white text-[8px] font-bold px-1 py-0 h-4 min-w-4 flex items-center justify-center rounded-full shadow">
                          {photoCount}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-sm line-clamp-1">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.author}</p>
                  </TableCell>
                  <TableCell className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">
                    {item.mediaType === 'video' || item.videoUrl ? 'Video' : `Foto (${photoCount})`}
                  </TableCell>
                  <TableCell className="text-[10px] whitespace-nowrap">{item.date}</TableCell>
                  <TableCell className="space-y-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-sky-600"
                      onClick={() => handleSetHeadline(item.id)}
                      aria-label={item.isHeadline ? 'Headline saat ini' : 'Jadikan headline'}
                    >
                      {item.isHeadline ? <CheckCircle2 className="h-5 w-5 text-amber-500" /> : <Circle className="h-5 w-5" />}
                    </Button>
                    {item.isHeadline && (
                      <Badge variant="default" className="bg-amber-100 text-amber-700 border-amber-200 text-[9px] gap-1 px-2 py-0">
                        <Star className="h-2.5 w-2.5 fill-amber-500" /> HEADLINE
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/BeritaDesa/${item.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/admin/berita/edit/${item.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
                            <AlertDialogDescription>Tindakan ini permanen. Berita tidak dapat dikembalikan.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600">Ya, Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

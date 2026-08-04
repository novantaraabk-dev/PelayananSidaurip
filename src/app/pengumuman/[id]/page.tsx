'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Announcement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, User, Megaphone, Milestone, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const firestore = useFirestore();

  const announcementRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'announcements', id);
  }, [firestore, id]);

  const { data: announcement, isLoading } = useDoc<Announcement>(announcementRef);

  const formatDate = (date: any) => {
    if (!date) return '-';
    return date.toDate().toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
             <Link href="/">
                <Button variant="ghost" className="font-bold gap-2 text-primary hover:bg-slate-100 rounded-xl">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Beranda</span>
                </Button>
            </Link>
            <Link href="/pengumuman/">
                <Button className="bg-secondary hover:bg-yellow-600 text-primary-foreground font-black px-6 rounded-xl shadow-lg shadow-secondary/20 h-10">Daftar Pengumuman</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {isLoading ? (
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-[400px] w-full rounded-[3rem]" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        ) : !announcement ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Megaphone className="h-16 w-16 text-slate-200 mb-4" />
            <h2 className="text-2xl font-black text-slate-900 uppercase">Pengumuman Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-8">Maaf, informasi yang Anda cari mungkin telah dihapus atau dipindahkan.</p>
            <div className="flex gap-3">
              <Button onClick={() => router.push('/pengumuman')} variant="outline" className="rounded-xl font-bold">
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar
              </Button>
              <Link href="/">
                <Button className="rounded-xl font-bold bg-primary text-white">
                  <Home className="mr-2 h-4 w-4" /> Beranda
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/pengumuman')}
              className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-400 hover:text-primary transition-all p-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> KEMBALI KE DAFTAR
            </Button>

            <article className="bg-white rounded-[3rem] border shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
              {/* IMAGE AREA */}
              <div className="relative w-full bg-slate-50 overflow-hidden border-b">
                {announcement.imageUrl ? (
                  <img 
                    src={announcement.imageUrl} 
                    alt={announcement.title} 
                    className="w-full h-auto block max-h-[800px] object-contain mx-auto" 
                  />
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center bg-primary/10">
                    <Megaphone className="h-24 w-24 text-primary/20" />
                  </div>
                )}
              </div>

              {/* CONTENT AREA */}
              <div className="p-8 md:p-12 space-y-10">
                <div className="space-y-6">
                   <Badge className="bg-secondary text-primary-foreground font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
                      Informasi Resmi
                   </Badge>
                   <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight uppercase tracking-tight font-display italic">
                     {announcement.title}
                   </h1>
                </div>

                <div className="flex flex-wrap items-center gap-8 border-b pb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Calendar className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Tanggal Terbit</p>
                      <p className="text-xs font-bold text-slate-600">{formatDate(announcement.publishDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/5 rounded-lg">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Diterbitkan Oleh</p>
                      <p className="text-xs font-bold text-slate-600">{announcement.authorName || 'Pemerintah Desa'}</p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <p className="text-lg md:text-xl leading-relaxed text-slate-700 font-medium whitespace-pre-wrap font-sans">
                    {announcement.content}
                  </p>
                </div>

                <div className="pt-12 mt-12 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                      <Milestone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Sekretariat Desa</p>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-tight italic">Pangawaren Digital Portal</p>
                    </div>
                  </div>
                  
                  <Link href="/">
                    <Button className="bg-primary text-white font-black px-8 h-14 rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                      Kembali ke Beranda
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}

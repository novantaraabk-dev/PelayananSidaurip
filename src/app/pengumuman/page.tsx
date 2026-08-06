'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar, Megaphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Announcement } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function PengumumanPage() {
  const firestore = useFirestore();
  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'announcements'), orderBy('publishDate', 'desc'), limit(50));
  }, [firestore]);

  const { data: announcements, isLoading } = useCollection<Announcement>(announcementsQuery);

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
            <Link href="/layanan-surat/">
              <Button className="bg-secondary hover:bg-yellow-600 text-primary-foreground font-black px-6 rounded-xl shadow-lg shadow-secondary/20 h-10">Portal Layanan</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* PAGE HEADER */}
        <div className="mb-12 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <Megaphone className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 font-display">
                Pengumuman Desa
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Informasi dan pengumuman penting dari administrasi Desa Sidaurip.
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && (
            <>
              <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
              <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
              <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
            </>
          )}

          {!isLoading && announcements && announcements.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <Megaphone className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">Belum ada pengumuman baru.</p>
            </div>
          )}

          {announcements?.map((announcement) => (
            <Link key={announcement.id} href={`/pengumuman/${announcement.id}`}>
              <Card className="group cursor-pointer overflow-hidden rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white flex flex-col h-full">
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  {announcement.imageUrl ? (
                    <img
                      src={announcement.imageUrl}
                      alt={announcement.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Megaphone className="h-12 w-12 text-primary/10" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-secondary text-primary-foreground font-black uppercase text-[9px] tracking-widest px-3 py-1 border-none shadow-lg">
                      Info Terbaru
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-8 pb-4 space-y-3">
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <Calendar className="h-3 w-3 text-primary/40" />
                    {formatDate(announcement.publishDate)}
                  </div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-800 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {announcement.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
                  <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-3 italic mb-6">
                    &quot;{announcement.content}&quot;
                  </p>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-primary font-black uppercase text-[10px] tracking-widest">
                    <span>Baca Selengkapnya</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

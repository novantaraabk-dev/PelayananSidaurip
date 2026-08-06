'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, ChevronRight, Share2, Tag, Search, TrendingUp, PlayCircle } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { News } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { NewsImageGrid } from '@/components/news-image-grid';

export default function PublicBeritaListPage() {
  const firestore = useFirestore();

  const newsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'news'), orderBy('updatedAt', 'desc'));
  }, [firestore]);

  const { data: allNews, isLoading } = useCollection<News>(newsQuery);

  const { headline, trending, feed } = useMemo(() => {
    if (!allNews) return { headline: null, trending: [], feed: [] };

    const sorted = [...allNews];
    const headlines = sorted.filter(n => n.isHeadline);
    const mainHeadline = headlines.length > 0 ? headlines[0] : sorted[0];

    const others = sorted.filter(n => n.id !== mainHeadline.id);
    const topPicks = others.slice(0, 5);
    const remainingFeed = others.slice(5);

    return { headline: mainHeadline, trending: topPicks, feed: remainingFeed };
  }, [allNews]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm shadow-sm font-sans">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Cari berita desa..." className="pl-10 h-10 bg-slate-100 border-none rounded-full" />
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" className="font-bold gap-2 text-primary hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">

        {/* TOP PICKS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : trending.map((item) => (
            <Link key={item.id} href={`/BeritaDesa/${item.id}`} className="group">
              <div className="flex flex-col gap-2">
                <div className="aspect-video rounded-xl overflow-hidden shadow-sm bg-slate-100 relative flex items-center justify-center">
                  {item.imageUrl || (item.imageUrls && item.imageUrls.length > 0) ? (
                    <img
                      src={item.imageUrls?.[0] || item.imageUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      alt={item.title}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white">
                      <div className="flex flex-col items-center gap-3">
                        <PlayCircle className="h-12 w-12 text-sky-400" />
                        <p className="text-sm uppercase tracking-[0.2em]">Video</p>
                      </div>
                    </div>
                  )}
                </div>
                <h4 className="text-[10px] font-black leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-primary transition-colors font-sans">
                  {item.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>

        {/* MAIN ROW */}
        <div className="grid lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8">
            {isLoading ? (
              <Skeleton className="h-[500px] rounded-3xl" />
            ) : headline && (
              <Link href={`/BeritaDesa/${headline.id}`} className="group relative block rounded-[2.5rem] overflow-hidden shadow-2xl h-[500px] border-4 border-white">
                <img
                  src={headline.imageUrls?.[0] || headline.imageUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200'}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={headline.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 md:p-12 space-y-6 w-full">
                  <Badge className="bg-secondary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-none">
                    Berita Utama
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-semibold text-white leading-[1.1] tracking-tighter uppercase font-display">
                    {headline.title}
                  </h2>
                  <div className="flex items-center gap-6 text-[10px] font-bold text-white/70 uppercase tracking-widest font-sans">
                    <span className="flex items-center gap-2"><Calendar className="h-3 w-3 text-secondary" /> {headline.date}</span>
                    <span className="flex items-center gap-2"><User className="h-3 w-3 text-secondary" /> {headline.author}</span>
                  </div>
                </div>
              </Link>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-[2rem] border-none bg-primary text-white overflow-hidden shadow-xl">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-lg font-semibold uppercase font-display italic">Info <span className="text-secondary">Penting</span></h3>
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div className="space-y-4">
                  {trending.slice(2, 5).map((item, i) => (
                    <Link key={item.id} href={`/BeritaDesa/${item.id}`} className="flex gap-4 group">
                      <span className="text-2xl font-black text-white/20 italic group-hover:text-secondary">0{i + 1}</span>
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-bold uppercase leading-tight line-clamp-2 font-sans group-hover:text-secondary">
                          {item.title}
                        </h4>
                        <p className="text-[9px] font-bold text-white/40 uppercase font-sans">{item.date}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 font-sans">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 border-l-4 border-secondary">Topik Populer</h3>
              <div className="flex flex-wrap gap-2">
                {['Pertanian', 'Pembangunan', 'Cilacap', 'Desa Digital', 'Gotong Royong'].map(tag => (
                  <Badge key={tag} variant="outline" className="rounded-xl bg-white text-[9px] font-black py-1.5 px-4 text-slate-600 border-slate-200 uppercase">
                    # {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FEED / BERITA TERBARU WITH MULTI-PHOTO GRID LAYOUTS */}
        <div className="space-y-8 pt-10 border-t border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900 uppercase tracking-tighter font-display">
            Berita <span className="text-primary italic">Terbaru</span>
          </h2>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)
              ) : feed.map((item) => {
                const hasPhotos = (item.imageUrls && item.imageUrls.length > 0) || Boolean(item.imageUrl);
                return (
                  <div key={item.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-200/80 hover:shadow-xl transition-all duration-300 space-y-4 font-sans">
                    {/* PHOTO GRID LAYOUT (1, 2, 3, or 4+ PHOTOS) */}
                    {hasPhotos ? (
                      <NewsImageGrid
                        imageUrls={item.imageUrls}
                        imageUrl={item.imageUrl}
                        title={item.title}
                        interactive={true}
                      />
                    ) : (
                      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 text-white flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-center px-4">
                          <PlayCircle className="h-12 w-12 text-sky-400" />
                          <span className="text-[10px] uppercase tracking-[0.25em]">Video Berita</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span className="text-primary font-black">{item.date}</span>
                        <span>Penulis: {item.author}</span>
                      </div>
                      <Link href={`/BeritaDesa/${item.id}`}>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight uppercase group-hover:text-primary transition-colors line-clamp-2 font-display">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed font-medium">
                        {item.subtitle}
                      </p>
                      <div className="pt-2 flex items-center justify-between">
                        <Link href={`/BeritaDesa/${item.id}`}>
                          <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                            Baca Selengkapnya <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        {(item.imageUrls?.length || (item.imageUrl ? 1 : 0)) > 1 && (
                          <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                            📷 {item.imageUrls?.length} Foto
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-4">
              <Card className="rounded-[2rem] border-none overflow-hidden bg-accent text-white shadow-xl p-8 space-y-6 text-center sticky top-28">
                <Tag className="h-10 w-10 mx-auto text-white/30" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold font-display uppercase leading-tight">Ikuti Akun Resmi <span className="italic">Sidaurip</span></h3>
                  <p className="text-xs text-white/70 font-sans">Update pembangunan desa real-time.</p>
                </div>
                <Button className="bg-secondary text-primary font-black uppercase tracking-widest rounded-xl hover:bg-white w-full h-12">
                  Hubungi Admin
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-primary text-white/50 py-16 mt-auto border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <Logo />
          <p className="mt-8 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Pemerintah Desa Sidaurip • Website Resmi Pemerintahan Desa
          </p>
        </div>
      </footer>
    </div>
  );
}

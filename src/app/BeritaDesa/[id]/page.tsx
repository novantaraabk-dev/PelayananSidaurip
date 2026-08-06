'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Play } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { News } from '@/lib/types';
import { getVideoEmbedUrl, getVideoPlatform } from '@/lib/video-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsImageGrid } from '@/components/news-image-grid';

export default function PublicBeritaDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const firestore = useFirestore();

  const newsRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'news', id);
  }, [firestore, id]);

  const { data: news, isLoading } = useDoc<News>(newsRef);

  const isVideoNews = news?.mediaType === 'video' || Boolean(news?.videoUrl);
  const videoEmbedUrl = getVideoEmbedUrl(news?.videoUrl || undefined);
  const videoPlatform = getVideoPlatform(news?.videoUrl || undefined);

  if (isLoading) return <div className="container mx-auto p-8"><Skeleton className="h-screen w-full rounded-3xl" /></div>;
  if (!news) return <div className="p-24 text-center">Berita tidak ditemukan.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <Button variant="ghost" onClick={() => router.back()} className="font-bold gap-2 text-primary hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <article className="container mx-auto px-4 max-w-4xl py-12 md:py-20">

          {/* HEADER BERITA */}
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-3xl md:text-5xl font-semibold text-primary leading-tight tracking-tight uppercase font-display">
              {news.title}
            </h1>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                <span className="text-slate-900">{news.author}</span>
                <span className="text-slate-300">-</span>
                <span className="text-secondary">Tim Media Desa</span>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                {news.date}
              </p>
            </div>

            {news.subtitle && (
              <p className="text-xl text-slate-500 italic border-y border-slate-200 py-6 max-w-2xl mx-auto font-display">
                "{news.subtitle}"
              </p>
            )}
          </div>

          {/* MEDIA BERITA */}
          {isVideoNews ? (
            <div className="mb-12 space-y-6">
              <div className="overflow-hidden rounded-[2.5rem] shadow-2xl border-8 border-white bg-slate-950">
                {videoEmbedUrl ? (
                  <div className="relative overflow-hidden rounded-[2.5rem] bg-black shadow-2xl">
                    <iframe
                      src={videoEmbedUrl}
                      title={news.title}
                      className="aspect-[16/9] w-full min-h-[320px] border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="flex h-full min-h-[360px] items-center justify-center bg-slate-900 text-white">
                    <div className="text-center">
                      <Play className="mx-auto h-10 w-10 text-sky-400" />
                      <p className="mt-4 text-base font-semibold">Tautan video belum valid atau tidak dikenali.</p>
                    </div>
                  </div>
                )}
              </div>
              {videoPlatform && (
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-600" />
                  Platform: {videoPlatform === 'youtube' ? 'YouTube' : videoPlatform === 'tiktok' ? 'TikTok' : videoPlatform === 'instagram' ? 'Instagram' : 'Video'}
                </div>
              )}
            </div>
          ) : (
            <figure className="mb-12 space-y-3">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-white p-2">
                <NewsImageGrid
                  imageUrls={news.imageUrls}
                  imageUrl={news.imageUrl}
                  title={news.title}
                  interactive={true}
                />
              </div>
              <figcaption className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] px-4">
                Dokumentasi Kegiatan Pemerintah Desa Sidaurip.
              </figcaption>
            </figure>
          )}

          {!isVideoNews && (
            <div className="prose prose-slate max-w-none">
              <div className="space-y-6 text-slate-800">
                {news.content
                  ?.split(/\n\s*\n+/)
                  .map((paragraph, index) => (
                    <p
                      key={`${news.id}-${index}`}
                      className="text-lg leading-8 text-justify whitespace-pre-wrap font-sans"
                    >
                      {index === 0 && (
                        <span className="font-black text-primary uppercase mr-2">Sidaurip —</span>
                      )}
                      {paragraph.trim()}
                    </p>
                  ))}
              </div>
            </div>
          )}

          {/* FOOTER ARTIKEL */}
          <footer className="mt-16 pt-8 border-t border-slate-200 flex items-center justify-between">
            <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold border-primary text-primary">
              <Share2 className="h-4 w-4" />
              Bagikan
            </Button>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Redaksi Sidaurip Digital
            </p>
          </footer>

        </article>
      </main>

      {/* FOOTER LAYOUT */}
      <footer className="bg-primary text-white/50 py-16 border-t border-white/5">
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

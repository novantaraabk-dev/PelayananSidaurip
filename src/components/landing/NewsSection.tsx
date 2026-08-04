'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemoFirebase, useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { ArrowRight, Video, Newspaper } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { News } from '@/lib/types';
import { formatDisplayDate } from './landing-utils';

export function NewsSection() {
  const firestore = useFirestore();
  const newsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'news'), orderBy('updatedAt', 'desc'), limit(8));
  }, [firestore]);

  const { data: news, isLoading, error } = useCollection<News>(newsQuery);

  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData } = useDoc<{ youtubeVideoUrl?: string }>(profileRef);

  const getYoutubeEmbedUrl = (url: string | undefined) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
    const videoId = match ? match[1] : url;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const youtubeEmbedUrl = getYoutubeEmbedUrl(profileData?.youtubeVideoUrl);

  const duplicatedNews = useMemo(() => {
    if (!news || news.length === 0) return [];
    let items = [...news];
    // Fill the carousel list to have enough cards for smooth continuous flow
    while (items.length < 8) {
      items = [...items, ...news];
    }
    // Duplicate the final set once for seamless CSS marquee restart
    return [...items, ...items];
  }, [news]);


  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Berita Terbaru</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Berita Desa
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Informasi dan kegiatan terbaru dari Pemerintah Desa Pangawaren.
          </p>
        </div>
        <Link href="/BeritaDesa/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
          Lihat semua berita
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-[1.75rem] border border-emerald-600/20 bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.04)]">
              <Skeleton className="h-48 w-full rounded-[1.25rem]" />
              <Skeleton className="mt-4 h-4 w-24" />
              <Skeleton className="mt-3 h-7 w-full" />
              <Skeleton className="mt-3 h-4 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-12 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
          Berita sedang tidak dapat dimuat saat ini. Silakan kunjungi bagian berita desa secara langsung.
        </div>
      ) : !news || news.length === 0 ? (
        <div className="mt-12 rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
          Belum ada berita terbaru yang dipublikasikan.
        </div>
      ) : (
        <div className="mt-12 relative w-full overflow-hidden marquee-gradient-mask">
          <div className="animate-marquee-slow flex gap-6 py-4">
            {duplicatedNews.map((item, idx) => (
              <motion.article
                key={`${item.id}-${idx}`}
                className="w-[340px] sm:w-[380px] shrink-0 group overflow-hidden rounded-[1.75rem] border border-emerald-600/20 hover:border-emerald-500/40 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.04)] transition-all duration-300"
                whileHover={{ y: -6 }}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200'}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Newspaper className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="truncate max-w-[120px]">{item.author || 'Pemerintah Desa'}</span>
                    <span className="text-slate-300">•</span>
                    <span>{formatDisplayDate(item.updatedAt || item.createdAt || item.date)}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900 line-clamp-2 h-14 leading-6 group-hover:text-emerald-800 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3 h-18">
                    {item.subtitle}
                  </p>
                  <Link
                    href={`/BeritaDesa/${item.id}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
                  >
                    Baca berita
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-16 rounded-[2rem] border border-emerald-600/20 bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.04)] lg:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Video Profil Desa</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Video Profil Resmi Desa Pangawaren
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Tonton video profil desa untuk melihat layanan, potensi wilayah, dan visi pembangunan Desa Pangawaren.
            </p>
          </div>
        </div>
        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-900/10 aspect-video">
          {youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title="Video Profil Desa Pangawaren"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center bg-slate-950 text-center text-slate-200">
              <div className="space-y-3 px-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Video className="h-6 w-6" />
                </div>
                <p className="text-lg font-semibold">Video profil desa belum dikonfigurasi.</p>
                <p className="text-sm text-slate-300">Silakan atur tautan YouTube di halaman Pengaturan Admin.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

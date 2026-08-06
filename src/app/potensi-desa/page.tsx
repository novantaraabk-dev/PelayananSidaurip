'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { BackgroundPattern } from '@/components/landing/BackgroundPattern';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Landmark,
  MapPin,
  Store,
  Compass,
  Leaf,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Loader2
} from 'lucide-react';
import { PotensiDesa } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const POTENSI_CATEGORIES = [
  { id: 'pariwisata-kebudayaan', label: 'Pariwisata & Kebudayaan', icon: Compass, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
  { id: 'umkm-industri', label: 'UMKM & Industri Kreatif', icon: Store, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  { id: 'bumdes', label: 'BUMDes Sidaurip', icon: Landmark, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
  { id: 'pertanian-perkebunan', label: 'Pertanian & Perkebunan', icon: Leaf, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { id: 'sda-lingkungan', label: 'Sumber Daya Alam & Lingkungan', icon: MapPin, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' }
] as const;

type CategoryId = typeof POTENSI_CATEGORIES[number]['id'];

function PotensiDesaContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as CategoryId | null;

  const [activeTab, setActiveTab] = useState<CategoryId>('pariwisata-kebudayaan');
  const firestore = useFirestore();

  // Sync state with query parameter
  useEffect(() => {
    if (tabParam && POTENSI_CATEGORIES.some(cat => cat.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Load all potentials
  const potentialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'potensiDesa'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: allPotentials, isLoading } = useCollection<PotensiDesa>(potentialsQuery);

  // Filter items in memory by category
  const filteredPotentials = useMemo(() => {
    if (!allPotentials) return [];
    return allPotentials.filter(item => item.category === activeTab);
  }, [allPotentials, activeTab]);

  const activeCategoryDetails = useMemo(() => {
    return POTENSI_CATEGORIES.find(cat => cat.id === activeTab)!;
  }, [activeTab]);

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 overflow-x-hidden pt-24 font-sans">
      <BackgroundPattern />
      <Header />

      <main className="relative flex-1 container mx-auto px-4 py-12 md:py-16 max-w-7xl">
        {/* Banner Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12 md:mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
          <Badge className="bg-sky-50 text-sky-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm mb-2">
            Potensi & Keunggulan Desa
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight uppercase font-display italic tracking-tighter">
            Kekayaan <span className="text-primary not-italic">Desa</span> Sidaurip
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Menelusuri keanekaragaman pariwisata, produk kreatif lokal, pertanian subur, serta tata kelola lingkungan hidup di Desa Sidaurip.
          </p>
        </div>

        {/* Categories Tab Navigation */}
        <div className="bg-white rounded-[2.5rem] p-3 border shadow-sm flex flex-wrap lg:flex-nowrap justify-center gap-2 mb-16 max-w-5xl mx-auto">
          {POTENSI_CATEGORIES.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  // Update URL parameter without full refresh
                  const url = new URL(window.location.href);
                  url.searchParams.set('tab', tab.id);
                  window.history.pushState({}, '', url.toString());
                }}
                className={cn(
                  "flex items-center justify-center gap-3 px-6 py-4 rounded-[2rem] transition-all duration-300 whitespace-nowrap group flex-1 md:flex-initial",
                  isActive
                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <TabIcon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-secondary" : "text-slate-400")} />
                <span className="font-black uppercase text-[10px] tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {isLoading ? (
            // Skeleton Loader
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm items-center">
                <div className="lg:col-span-5 aspect-[4/3] rounded-3xl overflow-hidden bg-slate-50">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="lg:col-span-7 space-y-4">
                  <Skeleton className="h-6 w-32 rounded-full" />
                  <Skeleton className="h-10 w-3/4 rounded-xl" />
                  <Skeleton className="h-5 w-1/2 rounded-lg" />
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredPotentials.length === 0 ? (
            // Empty State
            <Card className="border border-dashed border-slate-300 rounded-[3rem] bg-white p-16 text-center max-w-xl mx-auto">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className={cn("h-16 w-16 rounded-[2rem] flex items-center justify-center border", activeCategoryDetails.bg, activeCategoryDetails.color, activeCategoryDetails.border)}>
                  <activeCategoryDetails.icon className="h-8 w-8" />
                </div>
                <h3 className="text-slate-800 font-black text-lg uppercase tracking-wider italic font-display">Belum Ada Informasi</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Informasi untuk kategori <strong>{activeCategoryDetails.label}</strong> sedang dalam proses penyusunan oleh Pemerintah Desa. Silakan periksa kembali beberapa waktu mendatang.
                </p>
              </div>
            </Card>
          ) : (
            // Potentials Cards List
            filteredPotentials.map((item, index) => {
              const hasMultipleImages = item.imageUrls && item.imageUrls.length > 1;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
                >
                  {/* Left Side: Images Carousel/Single */}
                  <div className={cn("lg:col-span-5 w-full", index % 2 === 1 ? "lg:order-2" : "lg:order-1")}>
                    {hasMultipleImages ? (
                      <Carousel className="w-full relative group">
                        <CarouselContent>
                          {item.imageUrls.map((url, imgIndex) => (
                            <CarouselItem key={imgIndex}>
                              <div className="aspect-[4/3] relative w-full overflow-hidden rounded-[2rem] bg-slate-50 border shadow-inner">
                                <img
                                  src={url}
                                  alt={`${item.title} - Foto ${imgIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 right-4 bg-slate-900/70 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                  {imgIndex + 1} / {item.imageUrls.length}
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>

                        {/* Carousel controls with absolute positioning */}
                        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <CarouselPrevious className="relative left-0 translate-y-0 h-9 w-9 pointer-events-auto bg-white/90 hover:bg-white text-slate-800 shadow-md border-slate-200" />
                          <CarouselNext className="relative right-0 translate-y-0 h-9 w-9 pointer-events-auto bg-white/90 hover:bg-white text-slate-800 shadow-md border-slate-200" />
                        </div>
                      </Carousel>
                    ) : item.imageUrls && item.imageUrls.length === 1 ? (
                      <div className="aspect-[4/3] relative w-full overflow-hidden rounded-[2rem] bg-slate-50 border shadow-inner">
                        <img
                          src={item.imageUrls[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] relative w-full overflow-hidden rounded-[2rem] bg-slate-100 border flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-slate-350" />
                      </div>
                    )}
                  </div>

                  {/* Right Side: Narrative */}
                  <div className={cn("lg:col-span-7 space-y-5", index % 2 === 1 ? "lg:order-1" : "lg:order-2")}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg shrink-0", activeCategoryDetails.bg, activeCategoryDetails.color)}>
                          <activeCategoryDetails.icon className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                          {activeCategoryDetails.label}
                        </span>
                      </div>

                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase font-display italic tracking-tight leading-tight">
                        {item.title}
                      </h2>

                      {item.subtitle && (
                        <p className="text-base font-bold text-primary uppercase tracking-wider border-l-4 border-secondary pl-4 py-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-600 leading-relaxed font-medium text-base whitespace-pre-line">
                        {item.narrative}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PotensiDesaPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">Menyiapkan Konten Potensi...</p>
        </div>
      </div>
    }>
      <PotensiDesaContent />
    </Suspense>
  );
}

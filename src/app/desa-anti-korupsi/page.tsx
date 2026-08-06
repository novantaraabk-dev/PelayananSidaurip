'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { BackgroundPattern } from '@/components/landing/BackgroundPattern';
import { antiKorupsiData, AntiKorupsiMainMenu, AntiKorupsiSubMenu, AntiKorupsiItem } from '@/lib/desa-anti-korupsi-data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShieldCheck, FileText, Image as ImageIcon, ExternalLink, Download, AlertCircle } from 'lucide-react';

interface DBItemData {
  id: string; // matches item.id, e.g. "1.1.1"
  itemId: string;
  pdfUrl?: string;
  pdfName?: string;
  imageUrl?: string;
  imageName?: string;
  pdfs?: Array<{ url: string; name: string }>;
  images?: Array<{ url: string; name: string }>;
  tahunData?: {
    [tahun: string]: {
      pdfs?: Array<{ url: string; name: string }>;
      images?: Array<{ url: string; name: string }>;
    };
  };
  updatedAt?: any;
}

const extractFileIdFromUrl = (url: string): string => {
  if (!url) return '';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
  return idMatch ? idMatch[1] : url;
};

const getEmbedImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const fileId = extractFileIdFromUrl(url);
    return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : url;
  }
  return url;
};

const getPdfsForYear = (files: DBItemData | undefined, year: string): Array<{ url: string; name: string }> => {
  if (!files) return [];

  if (files.tahunData?.[year]?.pdfs && files.tahunData[year].pdfs.length > 0) {
    return files.tahunData[year].pdfs;
  }

  const topPdfs = files.pdfs || (files.pdfUrl ? [{ url: files.pdfUrl, name: files.pdfName || 'Dokumen PDF' }] : []);

  return topPdfs.filter(pdf => {
    if (pdf.name?.includes('2024')) return year === '2024';
    if (pdf.name?.includes('2025')) return year === '2025';
    if (pdf.name?.includes('2026')) return year === '2026';
    return year === '2026';
  });
};

const getImagesForYear = (files: DBItemData | undefined, year: string): Array<{ url: string; name: string }> => {
  if (!files) return [];

  if (files.tahunData?.[year]?.images && files.tahunData[year].images.length > 0) {
    return files.tahunData[year].images;
  }

  const topImages = files.images || (files.imageUrl ? [{ url: files.imageUrl, name: files.imageName || 'Foto Dukung' }] : []);

  return topImages.filter(img => {
    if (img.name?.includes('2024')) return year === '2024';
    if (img.name?.includes('2025')) return year === '2025';
    if (img.name?.includes('2026')) return year === '2026';
    return year === '2026';
  });
};

export default function DesaAntiKorupsi() {
  const [activeTab, setActiveTab] = useState<string>("1");
  const [selectedYear, setSelectedYear] = useState<string>("semua");
  const [selectedImages, setSelectedImages] = useState<Array<{ url: string; name: string; tahun?: string }> | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeItemTitle, setActiveItemTitle] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const firestore = useFirestore();

  // Load uploaded documents from firestore
  const antiKorupsiQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'desaAntiKorupsi'));
  }, [firestore]);

  const { data: dbItems, isLoading, error } = useCollection<DBItemData>(antiKorupsiQuery);

  // Map database items by their ID for fast lookup
  const uploadedFilesMap = useMemo(() => {
    const map = new Map<string, DBItemData>();
    if (dbItems) {
      dbItems.forEach(item => {
        map.set(item.itemId || item.id, item);
      });
    }
    return map;
  }, [dbItems]);

  const activePilar = useMemo(() => {
    return antiKorupsiData.find(p => p.id === activeTab);
  }, [activeTab]);

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
      <BackgroundPattern />
      <Header />

      <main className="relative flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-sky-600" />
              <span>Program Desa Anti Korupsi</span>
            </div>

            <h1 className="text-3xl font-extrabold sm:text-4xl text-slate-900 uppercase tracking-tight">
              Desa <span className="bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text text-transparent">Anti Korupsi</span>
            </h1>

            <p className="text-sm leading-relaxed text-slate-500">
              Wujud nyata transparansi, akuntabilitas, dan integritas Pemerintah Desa Sidaurip. Kami berkomitmen menyediakan akses terbuka bagi seluruh warga terhadap dokumen perencanaan, pengawasan, pelayanan publik, partisipasi masyarakat, dan kearifan lokal.
            </p>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Navigation Pilar Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 p-1.5 bg-slate-100/80 backdrop-blur rounded-2xl border border-slate-200 mb-8">
            {antiKorupsiData.map((pilar) => {
              const isActive = activeTab === pilar.id;
              return (
                <button
                  key={pilar.id}
                  onClick={() => setActiveTab(pilar.id)}
                  className={`col-span-1 py-3 px-3 rounded-xl text-center text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 ${isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/10'
                      : 'text-slate-600 hover:text-sky-700 hover:bg-slate-50'
                    }`}
                >
                  <span className="block text-[8px] opacity-60 mb-0.5">PILAR {pilar.id.replace('pilar-', '')}</span>
                  <span className="line-clamp-1">{pilar.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Pilar Detail */}
          {activePilar && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-l-4 border-sky-600 pl-4 py-1">
                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">
                  Pilar {activePilar.id.replace('pilar-', '')}: {activePilar.title}
                </h2>
                <p className="text-xs text-slate-400">
                  Berikut adalah daftar regulasi, dokumen pendukung, dan bukti implementasi pilar anti-korupsi.
                </p>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <Skeleton key={n} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm">Gagal memuat dokumen. Silakan coba beberapa saat lagi.</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-3 w-full">
                  {activePilar.subMenus.map((subMenu) => (
                    <AccordionItem
                      key={subMenu.id}
                      value={subMenu.id}
                      className="border border-slate-200 bg-white rounded-2xl overflow-hidden px-4 md:px-6 transition-all duration-300 hover:shadow-md hover:border-slate-300"
                    >
                      <AccordionTrigger className="hover:no-underline py-4 text-left">
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded text-xs shrink-0 mt-0.5">
                            {subMenu.id}
                          </span>
                          <span className="text-xs md:text-sm font-bold text-slate-700 leading-relaxed hover:text-sky-700">
                            {subMenu.title}
                          </span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                        <div className="space-y-3 mt-4">
                          {subMenu.items.map((item) => {
                            const files = uploadedFilesMap.get(item.id);
                            const yearsToDisplay = selectedYear === 'semua' ? ['2024', '2025', '2026'] : [selectedYear];

                            const hasAnyFile = yearsToDisplay.some(yr => {
                              const p = getPdfsForYear(files, yr);
                              const img = getImagesForYear(files, yr);
                              return p.length > 0 || img.length > 0;
                            });

                            return (
                              <div
                                key={item.id}
                                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-3"
                              >
                                <div className="flex items-start gap-2.5">
                                  <span className="font-mono text-[11px] text-sky-700 font-black bg-sky-100/90 px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                                    {item.id}
                                  </span>
                                  <h4 className="text-xs md:text-sm font-bold text-slate-800 leading-snug">
                                    {item.title}
                                  </h4>
                                </div>

                                {hasAnyFile ? (
                                  <div className="space-y-2 pt-1">
                                    {yearsToDisplay.map((yr) => {
                                      const yearPdfs = getPdfsForYear(files, yr);
                                      const yearImages = getImagesForYear(files, yr);

                                      if (yearPdfs.length === 0 && yearImages.length === 0) return null;

                                      return (
                                        <div
                                          key={yr}
                                          className="bg-white border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                                        >
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-950 text-[10px] font-black uppercase font-mono tracking-wide border border-amber-300/60">
                                              Tahun {yr}
                                            </span>
                                          </div>

                                          <div className="flex flex-wrap items-center gap-2 flex-1 sm:justify-end">
                                            {yearPdfs.map((pdf, idx) => (
                                              <a
                                                key={`pdf-${yr}-${idx}`}
                                                href={pdf.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={pdf.name}
                                              >
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-8 rounded-lg border-red-200 bg-red-50/70 text-red-700 hover:bg-red-100 hover:text-red-900 text-[10px] font-bold uppercase tracking-wider max-w-full gap-1.5"
                                                >
                                                  <FileText className="h-3.5 w-3.5 text-red-600 shrink-0" />
                                                  <span className="max-w-[140px] sm:max-w-[200px] truncate">
                                                    {pdf.name}
                                                  </span>
                                                  <ExternalLink className="h-2.5 w-2.5 text-red-400 shrink-0" />
                                                </Button>
                                              </a>
                                            ))}

                                            {yearImages.map((img, idx) => (
                                              <Button
                                                key={`img-${yr}-${idx}`}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  setSelectedImages(yearImages);
                                                  setActiveImageIndex(idx);
                                                  setActiveItemTitle(`${item.title} (Tahun ${yr})`);
                                                  setIsDialogOpen(true);
                                                }}
                                                title={img.name}
                                                className="h-8 rounded-lg border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100 hover:text-blue-900 text-[10px] font-bold uppercase tracking-wider max-w-full gap-1.5"
                                              >
                                                <ImageIcon className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                                <span className="max-w-[140px] sm:max-w-[200px] truncate">
                                                  {img.name}
                                                </span>
                                              </Button>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-[11px] font-medium text-slate-400 italic pt-1 pl-1">
                                    Belum ada dokumen terunggah untuk item ini.
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Dialog for Image documentation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-sky-600" />
              <span>Dokumentasi: {activeItemTitle}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedImages && selectedImages.length > 0 && (
            <div className="space-y-4 mt-4">
              {/* Main image preview */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                <img
                  src={getEmbedImageUrl(selectedImages[activeImageIndex]?.url || '')}
                  alt={selectedImages[activeImageIndex]?.name || ''}
                  className="h-full w-full object-contain"
                />

                {/* Left / Right navigation buttons */}
                {selectedImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : selectedImages.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors shadow-md text-xs font-bold"
                    >
                      &#10094;
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev < selectedImages.length - 1 ? prev + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors shadow-md text-xs font-bold"
                    >
                      &#10095;
                    </button>
                  </>
                )}
              </div>

              {/* Caption */}
              <p className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {selectedImages[activeImageIndex]?.name || `Foto ${activeImageIndex + 1}`}
              </p>

              {/* Thumbnail Row */}
              {selectedImages.length > 1 && (
                <div className="flex gap-2 justify-center overflow-x-auto py-1.5 border-t border-slate-100 max-w-full">
                  {selectedImages.map((img, idx) => {
                    const isActive = idx === activeImageIndex;
                    const fileId = extractFileIdFromUrl(img.url);
                    const thumbUrl = fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : img.url;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative h-10 w-14 overflow-hidden rounded-lg border-2 transition-all shrink-0 ${isActive ? 'border-sky-600 ring-2 ring-sky-500/20 scale-105' : 'border-slate-200 hover:border-slate-400'
                          }`}
                      >
                        <img
                          src={thumbUrl}
                          alt={`Thumb ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-4 border-t border-slate-100 pt-3">
            {selectedImages && selectedImages.length > 1 && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Foto {activeImageIndex + 1} dari {selectedImages.length}
              </span>
            )}
            <div className="flex justify-end gap-2 ml-auto">
              {selectedImages && selectedImages[activeImageIndex] && (
                <a
                  href={selectedImages[activeImageIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" className="h-9 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Buka Asli
                  </Button>
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

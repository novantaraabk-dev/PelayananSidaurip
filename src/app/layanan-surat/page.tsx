'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { LetterService } from '@/app/(main)/layanan-surat/_components/letter-service';
import { TrackTicket } from '@/app/(main)/layanan-surat/_components/track-ticket';

export default function LayananSuratPage() {
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
            <Link href="/pengaduan/">
                <Button className="bg-secondary hover:bg-yellow-600 text-primary-foreground font-black px-6 rounded-xl shadow-lg shadow-secondary/20 h-10">Pengaduan Warga</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* PAGE HEADER */}
        <div className="mb-12 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 font-display">
                Layanan Surat
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Ajukan berbagai jenis surat resmi desa melalui formulir online.
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <TrackTicket />
        <LetterService />
      </div>
    </div>
  );
}

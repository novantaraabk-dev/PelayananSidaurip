'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquareWarning } from 'lucide-react';
import { ComplaintSystem } from '@/app/(main)/pengaduan/_components/complaint-system';

export default function PengaduanPage() {
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
              <MessageSquareWarning className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 font-display">
                Pengaduan Warga
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Sampaikan keluhan dan masukan Anda untuk kemajuan Desa Pangawaren.
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <ComplaintSystem />
      </div>
    </div>
  );
}

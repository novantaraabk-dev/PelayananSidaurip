
'use client';

import React from 'react';
import { StatisticsDashboard } from './_components/statistics-dashboard';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function StatistikPublikPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      {/* HEADER NAV */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" className="font-bold gap-2 text-primary hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4" />
                Beranda
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-secondary hover:bg-yellow-600 text-primary-foreground font-black px-6 rounded-xl shadow-lg shadow-secondary/20">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Portal Layanan
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <StatisticsDashboard />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-primary text-white/50 py-16 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <Logo />
          <p className="mt-8 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Pemerintah Desa Sidaurip • Data Terbuka & Transparansi Publik
          </p>
        </div>
      </footer>
    </div>
  );
}

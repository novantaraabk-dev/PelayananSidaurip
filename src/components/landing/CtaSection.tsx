'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles, MessageSquareWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemoFirebase, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { VillageProfileInfo } from '@/lib/types';

export function CtaSection() {
  const firestore = useFirestore();
  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData } = useDoc<VillageProfileInfo>(profileRef);
  const pengaduanImageUrl = profileData?.pengaduanImageUrl || 'https://picsum.photos/seed/pengaduan/600/800';

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-[2.25rem] border border-emerald-200 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 shadow-[0_30px_80px_rgba(6,95,70,0.25)]"
      >
        <div className="grid gap-0 lg:grid-cols-[auto_1fr_auto] lg:items-stretch">

          {/* LEFT: Layanan Pengaduan Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative hidden lg:flex flex-col overflow-hidden"
            style={{ width: '220px', minWidth: '220px' }}
          >
            {/* Image 3:4 aspect ratio */}
            <div className="relative flex-1" style={{ aspectRatio: '3/4', minHeight: '320px' }}>
              <Image
                src={pengaduanImageUrl}
                alt="Layanan Pengaduan Masyarakat"
                fill
                sizes="220px"
                className="object-cover"
                priority
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Card label */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-red-500/90 text-white">
                    <MessageSquareWarning className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-red-300">Layanan Aktif</span>
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-tight leading-tight">
                  Layanan<br />Pengaduan
                </h3>
                <p className="mt-1.5 text-[10px] text-slate-300 leading-relaxed font-medium">
                  Sampaikan aspirasi & laporan langsung ke desa.
                </p>

              </div>
            </div>
          </motion.div>

          {/* CENTER: Main CTA Content */}
          <div className="p-8 text-white sm:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-100 w-fit">
              <Sparkles className="h-4 w-4" />
              Layanan Desa Modern
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Butuh pelayanan desa?
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-emerald-50/90">
              Ajukan seluruh pelayanan administrasi desa secara online melalui Portal Desa Pangawaren, cepat, aman, dan bisa diakses dari mana saja.
            </p>
            {/* Mobile: Pengaduan button */}
            <div className="mt-6 flex lg:hidden">
              <Link href="/pengaduan" aria-label="Buat pengaduan warga">
                <Button className="h-11 rounded-full bg-red-500 px-6 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-400">
                  Layanan Pengaduan
                  <MessageSquareWarning className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT: Service Card */}
          <div className="p-8 sm:p-12 flex items-center">
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur-md w-full lg:min-w-[260px]">
              <div className="flex items-center gap-3 text-emerald-50">
                <ShieldCheck className="h-6 w-6 text-amber-300" />
                <p className="text-lg font-semibold">Layanan resmi, transparan, dan terpercaya</p>
              </div>
              <Link href="/layanan-surat" aria-label="Ajukan layanan desa">
                <Button className="mt-8 h-12 rounded-full bg-amber-400 px-7 text-base font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-1 hover:bg-amber-300 w-full">
                  Ajukan Layanan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}

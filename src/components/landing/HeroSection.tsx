'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemoFirebase, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ArrowRight, BarChart3, Building2, CheckCircle2, ChevronDown, FileText, Newspaper, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const floatingItems = [
  { icon: FileText, label: 'Ajukan Surat', href: '/layanan-surat/' },
  { icon: BarChart3, label: 'Cek Status Permohonan', href: '/layanan-surat/' },
  { icon: Users, label: 'Statistik Desa', href: '/statistik/' },
  { icon: Newspaper, label: 'Berita Desa', href: '/BeritaDesa/' },
  { icon: Building2, label: 'Pengumuman', href: '/pengumuman/' },
  { icon: Sparkles, label: 'Layanan Online', href: '/pelayanan-desa/' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
} as const;

export function HeroSection() {
  const firestore = useFirestore();
  const heroRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'heroImage', 'default');
  }, [firestore]);

  const { data: heroData } = useDoc<{ imageUrl?: string }>(heroRef);
  const heroImageUrl = heroData?.imageUrl || 'https://images.unsplash.com/photo-1602989106211-81de671c23a9?q=80&w=2000';

  return (
    <section className="relative isolate overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <Image
          src={heroImageUrl}
          alt="Pemandangan desa Sidaurip"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_40%),linear-gradient(100deg,rgba(2,6,23,0.82)_0%,rgba(2,6,23,0.63)_45%,rgba(6,78,59,0.55)_100%)]" />
      <div className="relative mx-auto flex min-h-[84vh] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-100 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Selamat Datang di Portal Desa Digital
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl font-bold uppercase tracking-[0.08em] text-amber-300 sm:text-5xl lg:text-7xl">
              DESA SIDAURIP
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-2 text-sm font-semibold uppercase tracking-[0.35em] text-sky-100 sm:text-base">
              KECAMATAN GANDRUNGMANGU
            </motion.p>
            <motion.h1 variants={itemVariants} className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.05]">
              Melayani masyarakat dengan cepat, mudah, dan transparan.
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              Portal resmi Pemerintah Desa Sidaurip yang menghubungkan masyarakat dengan layanan administrasi, informasi desa, statistik, berita, pengumuman, dan layanan digital dalam satu platform yang modern.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-6 inline-flex items-center gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-300 backdrop-blur-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Seluruh pelayanan administrasi di Desa Sidaurip adalah <strong className="font-semibold text-amber-200">GRATIS</strong>.</span>
            </motion.div>
            <motion.div variants={itemVariants} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/layanan-surat/" aria-label="Ajukan layanan desa">
                <Button className="h-12 rounded-full bg-amber-400 px-7 text-base font-semibold text-slate-950 shadow-[0_20px_45px_rgba(250,204,21,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-amber-300">
                  Ajukan Layanan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/profil-desa/" aria-label="Lihat profil desa">
                <Button variant="outline" className="h-12 rounded-full border-white/25 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/15">
                  Profil Desa
                </Button>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants} className="mt-10 flex items-center gap-3 text-sm font-medium text-slate-300">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-400" />
              Akses cepat, aman, dan responsif untuk semua kebutuhan administrasi masyarakat.
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto w-full max-w-xl"
          >
            <div className="rounded-[2rem] border border-white/15 bg-white/12 p-5 shadow-[0_20px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Fokus Layanan</p>
                    <p className="text-lg font-semibold text-white">Portal pelayanan masyarakat</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {floatingItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.label} href={item.href} className="block">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.04, duration: 0.35 }}
                          whileHover={{ scale: 1.03, y: -3, backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.2)' }}
                          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm text-slate-200 cursor-pointer transition-colors duration-200 h-full"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/12 text-sky-300">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 z-20">
        <div className="flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em]">
          <span>Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </div>

      {/* Smooth Curved Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 w-full pointer-events-none overflow-hidden z-10">
        <svg
          className="absolute bottom-0 w-full h-16 text-slate-50 fill-current"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,50 C480,100 960,100 1440,50 L1440,100 L0,100 Z" />
        </svg>
      </div>
    </section>
  );
}

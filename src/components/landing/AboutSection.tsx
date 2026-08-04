'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemoFirebase, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ArrowRight, BadgeCheck, Landmark, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AboutSection() {
  const firestore = useFirestore();
  const aboutRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: aboutData } = useDoc<{ description?: string; imageUrl?: string }>(aboutRef);
  const description = aboutData?.description || 'Desa Pangawaren merupakan wilayah yang berkembang dengan semangat gotong royong, pelayanan publik yang responsif, dan komitmen menjaga kesejahteraan masyarakat melalui tata kelola pemerintahan yang modern dan terbuka.';
  const imageUrl = aboutData?.imageUrl || 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200';

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 -translate-y-4 rotate-2 rounded-[2rem] bg-emerald-100/70" />
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
            <Image
              src={imageUrl}
              alt="Kantor Desa Pangawaren"
              width={900}
              height={700}
              className="h-[420px] w-full rounded-[1.5rem] object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
            <Landmark className="h-4 w-4" />
            Tentang Desa
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Tentang Desa Pangawaren
          </h2>
          <div className="space-y-4 text-lg leading-8 text-slate-600">
            <p>{description}</p>
            <p>
              Melalui portal yang modern, masyarakat dapat mengakses pelayanan, memahami informasi publik, dan berpartisipasi dalam pembangunan desa secara lebih mudah.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              Layanan resmi desa
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Digital dan modern
            </div>
          </div>
          <Link href="/profil-desa/" aria-label="Lihat profil desa lengkap">
            <Button className="h-11 rounded-full bg-emerald-700 px-6 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-800">
              Selengkapnya
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

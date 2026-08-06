'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquareWarning, ArrowRight, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ComplaintSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_25px_60px_rgba(15,23,42,0.06)]"
      >
        {/* Decorative pattern */}
        <div className="absolute top-0 right-0 h-64 w-64 translate-x-16 -translate-y-16 rounded-full bg-sky-50 opacity-60" />
        <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-12 translate-y-12 rounded-full bg-amber-50 opacity-50" />

        <div className="relative grid items-center gap-8 p-8 lg:grid-cols-[1fr_auto] lg:gap-12 lg:p-12">
          {/* Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-sky-700">
              <MessageSquareWarning className="h-3.5 w-3.5" />
              Pengaduan Warga
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Sampaikan Aspirasi Anda
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Punya keluhan, saran, atau masukan untuk kemajuan Desa Sidaurip?
                Sampaikan langsung secara online dan kami akan menindaklanjuti setiap laporan yang masuk.
              </p>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
                Aman & Terjamin
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600">
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                Ditindaklanjuti Cepat
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Analisis AI Otomatis
              </div>
            </div>
          </div>

          {/* CTA */}
          <motion.div 
            whileHover={{ scale: 1.04 }}
            className="flex flex-col items-start gap-4 lg:items-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sky-700 text-white shadow-xl shadow-sky-700/25 transition-transform group-hover:rotate-6">
              <MessageSquareWarning className="h-9 w-9" />
            </div>
            <Link href="/pengaduan/" aria-label="Buat pengaduan warga">
              <Button className="h-12 rounded-full bg-sky-700 px-7 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-sky-800 shadow-[0_14px_35px_rgba(2,132,199,0.3)]">
                Buat Pengaduan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

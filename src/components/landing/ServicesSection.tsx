'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, BookOpenText, FileText, Landmark, Megaphone, Newspaper, Users2, Info } from 'lucide-react';

const services = [
  { href: '/pelayanan-desa/', title: 'Pelayanan Desa', description: 'Akses layanan administrasi dan dokumen resmi dengan langkah yang sederhana.', icon: FileText },
  { href: '/profil-desa/', title: 'Profil Desa', description: 'Kenali sejarah, struktur, dan identitas pemerintahan desa secara lengkap.', icon: Landmark },
  { href: '/statistik/', title: 'Statistik', description: 'Lihat data kependudukan dan informasi desa secara realtime dan transparan.', icon: BarChart3 },
  { href: '/BeritaDesa/', title: 'Berita Desa', description: 'Ikuti informasi dan kegiatan terbaru dari Pemerintah Desa Pangawaren.', icon: Newspaper },
  { href: '/layanan-surat/', title: 'Layanan', description: 'Ajukan berbagai surat keterangan dan kebutuhan administrasi secara online.', icon: Users2 },
  { href: '/pengumuman/', title: 'Pengumuman', description: 'Temukan pengumuman penting serta agenda desa yang harus diketahui.', icon: Megaphone },
];

export function ServicesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Layanan Utama</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Layanan digital desa yang mudah dipahami dan diakses.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Seluruh pelayanan desa dapat dijangkau secara cepat melalui portal digital yang dirancang untuk masyarakat.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full lg:max-w-md shrink-0"
        >
          <div className="p-5 bg-amber-50 border border-dashed border-amber-300 rounded-[2rem] flex items-center gap-4 shadow-[0_15px_35px_rgba(245,158,11,0.03)]">
             <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600 shrink-0">
                <Info className="h-6 w-6" />
             </div>
             <div className="space-y-0.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">Transparansi Biaya</h3>
                <p className="text-xs leading-relaxed font-semibold text-amber-800">
                   Seluruh pelayanan administrasi di Desa Pangawaren adalah <strong className="text-amber-950 font-bold">GRATIS</strong> (Rp. 0,-) tanpa biaya apapun.
                </p>
             </div>
          </div>
        </motion.div>
      </div>


      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <motion.article
              key={service.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="group relative overflow-hidden rounded-[1.75rem] border border-emerald-600/15 bg-white/90 backdrop-blur-sm p-7 shadow-[0_20px_45px_rgba(15,23,42,0.03)] transition-all duration-300 hover:border-emerald-500/35 hover:shadow-[0_30px_60px_rgba(16,185,129,0.06)]"
            >
              {/* Glowing Corner Accent */}
              <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/5 blur-xl transition-all duration-500 group-hover:bg-emerald-500/10 group-hover:scale-125" />
              
              {/* Subtle Dot Grid pattern */}
              <div className="absolute right-5 top-5 text-slate-200 transition-colors duration-300 group-hover:text-emerald-200/50 pointer-events-none">
                <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
                  <pattern id={`card-dots-${index}`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="currentColor" />
                  </pattern>
                  <rect width="40" height="40" fill={`url(#card-dots-${index})`} />
                </svg>
              </div>

              <Link href={service.href} className="relative z-10 flex h-full flex-col">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900 transition-colors group-hover:text-emerald-800">{service.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{service.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  Buka halaman
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                </span>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

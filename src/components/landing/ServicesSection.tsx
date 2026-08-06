'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, FileText, Landmark, Megaphone, Newspaper, Users2, Info, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const services = [
  {
    href: '/pelayanan-desa/',
    title: 'Pelayanan Desa',
    description: 'Akses layanan administrasi dan dokumen resmi dengan langkah yang sederhana.',
    icon: FileText,
    badge: 'Dokumen',
    gradient: 'from-sky-500 to-blue-600',
    shadowColor: 'shadow-sky-500/25',
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-700',
    accentBorder: 'border-sky-200/60',
    highlights: [
      'Surat Keterangan & Dokumen Resmi',
      'Proses Cepat & Terintegrasi',
      '100% Gratis Tanpa Biaya Pungutan'
    ]
  },
  {
    href: '/profil-desa/',
    title: 'Profil Desa',
    description: 'Kenali sejarah, struktur, dan identitas pemerintahan desa secara lengkap.',
    icon: Landmark,
    badge: 'Pemerintahan',
    gradient: 'from-blue-600 to-indigo-600',
    shadowColor: 'shadow-blue-500/25',
    accentBg: 'bg-blue-50',
    accentText: 'text-blue-700',
    accentBorder: 'border-blue-200/60',
    highlights: [
      'Sejarah & Visi Misi Desa',
      'Struktur Organisasi Pemdes',
      'Peta Wilayah & Potensi Utama'
    ]
  },
  {
    href: '/statistik/',
    title: 'Statistik Desa',
    description: 'Lihat data kependudukan dan informasi desa secara realtime dan transparan.',
    icon: BarChart3,
    badge: 'Realtime',
    gradient: 'from-teal-500 to-cyan-600',
    shadowColor: 'shadow-teal-500/25',
    accentBg: 'bg-teal-50',
    accentText: 'text-teal-700',
    accentBorder: 'border-teal-200/60',
    highlights: [
      'Data Kependudukan Realtime',
      'Statistik Demografi & Pekerjaan',
      'Transparansi Informasi Publik'
    ]
  },
  {
    href: '/BeritaDesa/',
    title: 'Berita Desa',
    description: 'Ikuti informasi dan kegiatan terbaru dari Pemerintah Desa Sidaurip.',
    icon: Newspaper,
    badge: 'Warta Desa',
    gradient: 'from-amber-500 to-orange-600',
    shadowColor: 'shadow-amber-500/25',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-700',
    accentBorder: 'border-amber-200/60',
    highlights: [
      'Kabar Utama & Warta Desa',
      'Dokumentasi Kegiatan Warga',
      'Liputan Pembangunan Desa'
    ]
  },
  {
    href: '/layanan-surat/',
    title: 'Layanan Surat',
    description: 'Ajukan berbagai surat keterangan dan kebutuhan administrasi secara online.',
    icon: Users2,
    badge: 'Online 24/7',
    gradient: 'from-cyan-500 to-sky-600',
    shadowColor: 'shadow-cyan-500/25',
    accentBg: 'bg-cyan-50',
    accentText: 'text-cyan-700',
    accentBorder: 'border-cyan-200/60',
    highlights: [
      'Pengajuan Mandiri Online 24/7',
      'Lacak Status Permohonan Surat',
      'Unduh Berkas Resmi Digital'
    ]
  },
  {
    href: '/pengumuman/',
    title: 'Pengumuman',
    description: 'Temukan pengumuman penting serta agenda desa yang harus diketahui.',
    icon: Megaphone,
    badge: 'Informasi',
    gradient: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/25',
    accentBg: 'bg-violet-50',
    accentText: 'text-violet-700',
    accentBorder: 'border-violet-200/60',
    highlights: [
      'Informasi Resmi Pemdes',
      'Jadwal Agenda Kemasyarakatan',
      'Pemberitahuan Penting Desa'
    ]
  },
];

export function ServicesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      {/* SECTION HEADER */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl"
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-sky-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-600" />
            Layanan Utama Desa
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl font-display">
            Layanan digital desa yang mudah dipahami dan diakses.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600 font-medium">
            Seluruh pelayanan desa dapat dijangkau secara cepat melalui portal digital yang dirancang khusus untuk kemudahan masyarakat.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full lg:max-w-md shrink-0"
        >
          <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border border-amber-300/60 rounded-[2.25rem] flex items-center gap-4 shadow-[0_15px_35px_rgba(245,158,11,0.06)] backdrop-blur-sm">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">Transparansi Biaya</h3>
              <p className="text-xs leading-relaxed font-bold text-amber-800">
                Seluruh pelayanan administrasi di Desa Sidaurip adalah <strong className="text-amber-950 font-black underline decoration-amber-400">GRATIS</strong> (Rp. 0,-) tanpa biaya apapun.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SERVICES CARDS GRID */}
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <motion.article
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 backdrop-blur-xl p-8 shadow-[0_20px_50px_rgba(15,23,42,0.04)] transition-all duration-500 hover:border-sky-400/60 hover:shadow-[0_35px_75px_rgba(14,165,233,0.12)] flex flex-col justify-between"
            >
              {/* Glowing Corner Ambient Light */}
              <div className={`absolute -right-14 -top-14 h-36 w-36 rounded-full bg-gradient-to-br ${service.gradient} opacity-10 blur-2xl transition-all duration-700 group-hover:opacity-25 group-hover:scale-150 pointer-events-none`} />

              {/* Card Header & Content */}
              <Link href={service.href} className="relative z-10 flex h-full flex-col justify-between space-y-6">
                <div>
                  {/* Top Bar: Icon + Category Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${service.gradient} text-white shadow-lg ${service.shadowColor} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <Badge className={`px-3 py-1.5 rounded-full ${service.accentBg} ${service.accentText} border ${service.accentBorder} text-[10px] font-black uppercase tracking-widest shadow-xs`}>
                      {service.badge}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-6 space-y-2">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-sky-800 font-display">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 font-medium">
                      {service.description}
                    </p>
                  </div>

                  {/* Highlights List as Sleek Micro-Pills */}
                  <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
                    {service.highlights.map((highlight, hIdx) => (
                      <div
                        key={hIdx}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 transition-colors duration-300 group-hover:bg-sky-50/50 group-hover:border-sky-200/50"
                      >
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${service.accentBg} ${service.accentText}`}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 leading-tight">
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Pill */}
                <div className="pt-2">
                  <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-sky-700 font-bold text-xs uppercase tracking-wider transition-all duration-300 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600 group-hover:shadow-md">
                    <span>Akses Layanan</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </div>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

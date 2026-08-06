'use client';

import { motion } from 'framer-motion';
import { useMemoFirebase, useCollection, useDoc, useFirestore, useUser } from '@/firebase';
import { collection, query, limit, where, doc } from 'firebase/firestore';
import { ArrowUpRight, Home, Users, FileText, BarChart3, BadgeCheck, MapPin, Sparkles } from 'lucide-react';
import { StatisticsCharts } from './StatisticsCharts';

export function StatisticsSection() {
  const firestore = useFirestore();

  const statsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'statistics');
  }, [firestore]);

  const { data: statsDoc, isLoading: statsLoading } = useDoc<any>(statsRef);
  const { user } = useUser();

  const submissionsQuery = useMemoFirebase(() => {
    if (!firestore || !user || user.isAnonymous) return null;
    return query(
      collection(firestore, 'letterRequests'),
      where('requestorAuthUid', '==', user.uid),
      limit(5000)
    );
  }, [firestore, user]);

  const { data: submissions } = useCollection(submissionsQuery);

  const metricsList = [
    {
      label: 'Jumlah Penduduk',
      value: statsDoc?.total ? statsDoc.total.toLocaleString('id-ID') : '—',
      unit: 'Jiwa',
      icon: Users,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-100',
      gradient: 'from-sky-500/10 to-sky-500/0'
    },
    {
      label: 'Jumlah Kepala Keluarga',
      value: statsDoc?.totalKK ? statsDoc.totalKK.toLocaleString('id-ID') : (statsDoc?.total ? Math.round(statsDoc.total / 4).toLocaleString('id-ID') : '—'),
      unit: 'KK',
      icon: Home,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      gradient: 'from-amber-500/10 to-amber-500/0'
    },
    {
      label: 'Rukun Tetangga (RT)',
      value: '45',
      unit: 'Wilayah RT',
      icon: BadgeCheck,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-100',
      gradient: 'from-cyan-500/10 to-cyan-500/0'
    },
    {
      label: 'Rukun Warga (RW)',
      value: '8',
      unit: 'Wilayah RW',
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      gradient: 'from-indigo-500/10 to-indigo-500/0'
    },
    {
      label: 'Jumlah Dusun',
      value: '4',
      unit: 'Dusun Main',
      icon: MapPin,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      gradient: 'from-rose-500/10 to-rose-500/0'
    },
    {
      label: 'Pelayanan Administrasi',
      value: '100%',
      unit: 'Gratis & Terbuka',
      icon: FileText,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
      gradient: 'from-teal-500/10 to-teal-500/0'
    },
  ];

  return (
    <section className="py-24 sm:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-600" />
              Statistik Desa Sidaurip
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Data terbaru mengenai kondisi Desa Sidaurip.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Informasi terbuka yang membantu masyarakat memahami kondisi wilayah dan perkembangan pelayanan desa.
            </p>
          </div>
          <a
            href="/statistik"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800 transition-colors"
          >
            Lihat dashboard lengkap
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>

        {/* Live Metric Cards Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 md:gap-6">
          {metricsList.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="group relative overflow-hidden rounded-[1.75rem] border border-sky-600/15 bg-white/90 backdrop-blur-sm p-5 shadow-[0_15px_35px_rgba(15,23,42,0.03)] transition-all duration-300 hover:border-sky-500/40 hover:shadow-[0_25px_50px_rgba(14,165,233,0.08)] flex flex-col justify-between"
              >
                <div className={`absolute top-0 right-0 h-20 w-20 rounded-full bg-gradient-to-bl ${item.gradient} blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />
                
                <div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.bgColor} ${item.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-tight">
                    {item.label}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100/80">
                  <p className="text-2xl font-black tracking-tight text-slate-900 font-mono font-display">
                    {item.value}
                  </p>
                  <p className="text-[10px] font-bold text-sky-700 uppercase tracking-widest mt-0.5">
                    {item.unit}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Container */}
        <div className="mt-8">
          <StatisticsCharts statsDoc={statsDoc} isLoading={statsLoading} />
        </div>
      </div>
    </section>
  );
}

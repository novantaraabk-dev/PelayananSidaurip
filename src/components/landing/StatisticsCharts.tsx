'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Home, MapPin, Layers, Sparkles } from 'lucide-react';

const COLORS = ['#0284c7', '#38bdf8', '#818cf8', '#34d399', '#f59e0b'];

interface StatisticsChartsProps {
  statsDoc?: any;
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/20 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md text-white text-xs space-y-1">
        <p className="font-bold uppercase tracking-wider text-slate-400">{label || payload[0].name}</p>
        <p className="text-lg font-black font-mono text-sky-400">
          {payload[0].value.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-300">jiwa / data</span>
        </p>
      </div>
    );
  }
  return null;
};

export function StatisticsCharts({ statsDoc, isLoading }: StatisticsChartsProps) {
  const firestore = useFirestore();
  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profile } = useDoc<Record<string, any>>(profileRef);

  const population = statsDoc?.total ?? 0;
  const areaKm = profile?.areaKm || profile?.area || profile?.luas || null;

  const genderData = useMemo(() => {
    const male = statsDoc?.maleCount ?? 0;
    const female = statsDoc?.femaleCount ?? 0;
    const other = statsDoc?.otherCount ?? 0;
    return [
      { name: 'Laki-laki', value: male },
      { name: 'Perempuan', value: female },
      ...(other > 0 ? [{ name: 'Lainnya', value: other }] : []),
    ];
  }, [statsDoc]);

  const rtDistribution = useMemo(() => {
    if (!statsDoc?.rtData) return [];
    return statsDoc.rtData.slice(0, 12);
  }, [statsDoc]);

  if (isLoading) {
    return (
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[280px] rounded-[2rem]" />
        <Skeleton className="h-[280px] rounded-[2rem]" />
        <Skeleton className="h-[280px] rounded-[2rem]" />
      </div>
    );
  }

  if (!statsDoc) {
    return (
      <div className="mt-8 p-8 text-center bg-white rounded-[2rem] border border-sky-600/20 shadow-sm max-w-lg mx-auto">
        <p className="text-sm font-semibold text-slate-700">Data Grafik Statistik Sedang Dimuat / Belum Diupdate</p>
        <p className="text-xs text-slate-500 mt-2">
          Administrator dapat memperbarui rangkuman grafik kependudukan melalui menu Data Penduduk Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      {/* CARD 1: KILAS DATA WILAYAH */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45 }}
        whileHover={{ y: -6, scale: 1.01 }}
        className="relative overflow-hidden rounded-[2rem] border border-sky-600/15 bg-white/90 backdrop-blur-md p-7 shadow-[0_20px_45px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-sky-500/40 hover:shadow-[0_30px_60px_rgba(14,165,233,0.08)] flex flex-col justify-between"
      >
        <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-sky-500/5 blur-xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-sky-50 text-sky-700 rounded-2xl">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-700">Demografi</p>
              <h4 className="text-base font-bold text-slate-900">Kilas Data Wilayah</h4>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100/80">
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-sky-600" />
                <span className="text-xs font-semibold text-slate-600">Jumlah Penduduk</span>
              </div>
              <span className="text-base font-black text-slate-900 font-mono">{population.toLocaleString('id-ID')}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100/80">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-600">Luas Wilayah</span>
              </div>
              <span className="text-base font-black text-slate-900 font-mono">{areaKm ? `${areaKm} km²` : '17,04 km²'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100/80">
              <div className="flex items-center gap-2.5">
                <Home className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold text-slate-600">Estimasi Jumlah KK</span>
              </div>
              <span className="text-base font-black text-slate-900 font-mono">{Math.max(1, Math.round(population / 4)).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5 text-sky-700 font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Data Resmi Desa
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400">Sidaurip 2026</span>
        </div>
      </motion.div>

      {/* CARD 2: KOMPOSISI JENIS KELAMIN */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        whileHover={{ y: -6, scale: 1.01 }}
        className="relative overflow-hidden rounded-[2rem] border border-sky-600/15 bg-white/90 backdrop-blur-md p-7 shadow-[0_20px_45px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-sky-500/40 hover:shadow-[0_30px_60px_rgba(14,165,233,0.08)] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-700">Persentase</p>
            <h4 className="text-base font-bold text-slate-900">Komposisi Jenis Kelamin</h4>
          </div>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-[10px] font-bold text-sky-700 border border-sky-100">
            Realtime
          </span>
        </div>

        <div style={{ width: '100%', height: 210 }} className="my-auto">
          <ResponsiveContainer>
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                outerRadius={75}
                innerRadius={45}
                paddingAngle={4}
                startAngle={90}
                endAngle={-270}
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* CARD 3: SEBARAN PENDUDUK PER RT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, delay: 0.16 }}
        whileHover={{ y: -6, scale: 1.01 }}
        className="relative overflow-hidden rounded-[2rem] border border-sky-600/15 bg-white/90 backdrop-blur-md p-7 shadow-[0_20px_45px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-sky-500/40 hover:shadow-[0_30px_60px_rgba(14,165,233,0.08)] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-700">Distribusi</p>
            <h4 className="text-base font-bold text-slate-900">Sebaran Penduduk per RT</h4>
          </div>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-[10px] font-bold text-sky-700 border border-sky-100">
            Top RT
          </span>
        </div>

        <div style={{ width: '100%', height: 210 }} className="my-auto">
          <ResponsiveContainer>
            <BarChart data={rtDistribution} margin={{ top: 12, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity={1} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="rt" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

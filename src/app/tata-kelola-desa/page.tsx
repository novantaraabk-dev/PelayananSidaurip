'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ApbdesData, RealisasiApbdesData, ProdukHukumDesa } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function TataKelolaDesa() {
  const [activeTab, setActiveTab] = useState('apbdes');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const firestore = useFirestore();

  // Queries untuk data
  const apbdesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'apbdes'), orderBy('tahun', 'desc'));
  }, [firestore]);

  const realisasiQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'realisasiApbdes'), orderBy('tahun', 'desc'));
  }, [firestore]);

  const produkHukumQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'produkHukumDesa'), orderBy('tahun', 'desc'));
  }, [firestore]);

  const { data: allApbdes, isLoading: isLoadingApbdes } = useCollection<ApbdesData>(apbdesQuery);
  const { data: allRealisasi, isLoading: isLoadingRealisasi } = useCollection<RealisasiApbdesData>(realisasiQuery);
  const { data: allProdukHukum, isLoading: isLoadingProduk } = useCollection<ProdukHukumDesa>(produkHukumQuery);

  // Get data untuk tahun yang dipilih
  const currentApbdes = useMemo(() => {
    return allApbdes?.find(d => d.tahun === selectedYear);
  }, [allApbdes, selectedYear]);

  const currentRealisasi = useMemo(() => {
    return allRealisasi?.find(d => d.tahun === selectedYear);
  }, [allRealisasi, selectedYear]);

  const currentProdukHukum = useMemo(() => {
    return allProdukHukum?.filter(p => p.tahun === selectedYear) || [];
  }, [allProdukHukum, selectedYear]);

  // Get available years
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    allApbdes?.forEach(d => years.add(d.tahun));
    allRealisasi?.forEach(d => years.add(d.tahun));
    allProdukHukum?.forEach(d => years.add(d.tahun));
    return Array.from(years).sort((a, b) => b - a);
  }, [allApbdes, allRealisasi, allProdukHukum]);

  // Process chart data untuk APBDes (per Bidang)
  const apbdesChartData = useMemo(() => {
    if (!currentApbdes?.items) return [];
    const bidangData: Record<string, any> = {};
    currentApbdes.items.forEach(item => {
      if (!bidangData[item.bidang]) {
        bidangData[item.bidang] = { name: item.bidang, nominal: 0 };
      }
      bidangData[item.bidang].nominal += item.nominal;
    });
    return Object.values(bidangData);
  }, [currentApbdes]);

  // Process chart data untuk APBDes (per Sumber Anggaran)
  const apbdesSumberChartData = useMemo(() => {
    if (!currentApbdes?.items) return [];
    const sumberData: Record<string, any> = {};
    currentApbdes.items.forEach(item => {
      const src = item.sumberAnggaran || 'Lainnya';
      if (!sumberData[src]) {
        sumberData[src] = { name: src, nominal: 0 };
      }
      sumberData[src].nominal += item.nominal;
    });
    return Object.values(sumberData);
  }, [currentApbdes]);

  // Process chart data untuk Realisasi (per Bidang)
  const realisasiChartData = useMemo(() => {
    if (!currentRealisasi?.items) return [];
    const bidangData: Record<string, any> = {};
    currentRealisasi.items.forEach(item => {
      if (!bidangData[item.bidang]) {
        bidangData[item.bidang] = { name: item.bidang, nominal: 0 };
      }
      bidangData[item.bidang].nominal += item.nominal;
    });
    return Object.values(bidangData);
  }, [currentRealisasi]);

  // Process chart data untuk Realisasi (per Sumber Anggaran)
  const realisasiSumberChartData = useMemo(() => {
    if (!currentRealisasi?.items) return [];
    const sumberData: Record<string, any> = {};
    currentRealisasi.items.forEach(item => {
      const src = item.sumberAnggaran || 'Lainnya';
      if (!sumberData[src]) {
        sumberData[src] = { name: src, nominal: 0 };
      }
      sumberData[src].nominal += item.nominal;
    });
    return Object.values(sumberData);
  }, [currentRealisasi]);

  // Persentase Penyerapan Anggaran (Realisasi vs APBDes Budget)
  const absorptionStats = useMemo(() => {
    if (!currentApbdes || !currentRealisasi || currentApbdes.totalAnggaran === 0) {
      return { percentage: 0, formatted: '0.0%' };
    }
    const pct = (currentRealisasi.totalRealisasi / currentApbdes.totalAnggaran) * 100;
    return {
      percentage: pct,
      formatted: pct.toFixed(1) + '%'
    };
  }, [currentApbdes, currentRealisasi]);

  // Persentase Capaian Output (Rata-rata % realisasi per item kegiatan yang direncanakan)
  const outputAchievementStats = useMemo(() => {
    if (!currentApbdes?.items || !currentRealisasi?.items) {
      return { percentage: 0, formatted: '0.0%' };
    }

    let totalItems = 0;
    let totalAchievementSum = 0;

    currentRealisasi.items.forEach(realisasiItem => {
      // Cocokkan berdasarkan nama kegiatan terlebih dahulu agar lebih spesifik (karena kodeRekening bisa duplikat untuk sub-kegiatan berbeda)
      const apbdesItem = currentApbdes.items.find(
        a => a.kegiatan.trim().toLowerCase() === realisasiItem.kegiatan.trim().toLowerCase()
      ) || currentApbdes.items.find(
        a => a.kodeRekening.trim() === realisasiItem.kodeRekening.trim() &&
          a.bidang.trim().toLowerCase() === realisasiItem.bidang.trim().toLowerCase()
      );

      if (apbdesItem && apbdesItem.nominal > 0) {
        const achievement = Math.min(100, (realisasiItem.nominal / apbdesItem.nominal) * 100);
        totalAchievementSum += achievement;
        totalItems++;
      } else if (realisasiItem.nominal > 0) {
        totalAchievementSum += 100;
        totalItems++;
      }
    });

    const pct = totalItems > 0 ? totalAchievementSum / totalItems : 0;
    return {
      percentage: pct,
      formatted: pct.toFixed(1) + '%'
    };
  }, [currentApbdes, currentRealisasi]);

  const tabs = [
    { id: 'apbdes', label: 'APBDes', icon: BarChart3 },
    { id: 'realisasi', label: 'Realisasi APBDes', icon: TrendingUp },
    { id: 'produk', label: 'Produk Hukum Desa', icon: FileText },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <Link href="/">
            <Button variant="ghost" className="font-bold gap-2 text-primary hover:bg-slate-100 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Beranda</span>
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* JUDUL */}
        <div className="mb-12 space-y-4">
          <h1 className="text-5xl font-black text-slate-900 uppercase font-display italic">Tata Kelola <span className="text-primary not-italic">Desa</span></h1>
          <p className="text-slate-500 font-bold max-w-2xl">Transparansi anggaran dan produk hukum desa Sidaurip untuk akuntabilitas publik.</p>
        </div>

        {/* TABS */}
        <div className="mb-12">
          <div className="flex gap-2 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all flex items-center gap-2",
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* YEAR SELECTOR */}
        <div className="mb-8">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-48 rounded-xl border-slate-300">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  Tahun {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* APBDES TAB */}
        {activeTab === 'apbdes' && (
          <div className="space-y-8">
            {isLoadingApbdes ? (
              <Skeleton className="h-96 rounded-3xl" />
            ) : currentApbdes ? (
              <>
                {/* APBDes Overview Card */}
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50/50">
                  <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <span className="text-xs font-black bg-blue-100 text-blue-800 px-3 py-1 rounded-full uppercase tracking-wider">Anggaran Pendapatan & Belanja Desa</span>
                      <h3 className="text-3xl font-black text-slate-900">APBDes Tahun {selectedYear}</h3>
                      <p className="text-slate-500 font-medium">Rekapitulasi rencana anggaran belanja desa Sidaurip.</p>
                    </div>
                    <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100/80 min-w-[280px]">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Rencana Anggaran</span>
                      <div className="text-3xl font-black text-blue-600 mt-1 font-display">
                        Rp {currentApbdes.totalAnggaran.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Chart 1: Per Bidang */}
                  <Card className="rounded-[2.5rem] border-none shadow-xl">
                    <CardContent className="p-8 space-y-6">
                      <div>
                        <h4 className="text-xl font-black text-slate-900 font-display">Perbandingan Total per Bidang</h4>
                        <p className="text-sm text-slate-500 font-medium">Rincian alokasi anggaran belanja untuk setiap bidang pembangunan.</p>
                      </div>

                      {apbdesChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart data={apbdesChartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                            <defs>
                              <linearGradient id="apbdesColorBidang" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                                <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.4} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                              dataKey="name"
                              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                              axisLine={false}
                              tickLine={false}
                              interval={0}
                              tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                            />
                            <YAxis
                              tick={{ fill: '#64748b', fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(val) => `Rp ${(val / 1e6)}jt`}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
                              formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Rencana Anggaran']}
                            />
                            <Bar dataKey="nominal" fill="url(#apbdesColorBidang)" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-12 text-slate-400 font-bold">Data Bidang Kosong</div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Chart 2: Per Sumber Anggaran */}
                  <Card className="rounded-[2.5rem] border-none shadow-xl">
                    <CardContent className="p-8 space-y-6">
                      <div>
                        <h4 className="text-xl font-black text-slate-900 font-display">Perbandingan Total per Sumber Anggaran</h4>
                        <p className="text-sm text-slate-500 font-medium">Asal/sumber dana anggaran pendapatan dan belanja desa.</p>
                      </div>

                      {apbdesSumberChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart data={apbdesSumberChartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                            <defs>
                              <linearGradient id="apbdesColorSumber" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                                <stop offset="95%" stopColor="#6d28d9" stopOpacity={0.4} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                              dataKey="name"
                              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fill: '#64748b', fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(val) => `Rp ${(val / 1e6)}jt`}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
                              formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Rencana Anggaran']}
                            />
                            <Bar dataKey="nominal" fill="url(#apbdesColorSumber)" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-12 text-slate-400 font-bold">Data Sumber Anggaran Kosong</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-6">
                <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-semibold">Data APBDes tahun {selectedYear} belum tersedia.</p>
              </div>
            )}
          </div>
        )}

        {/* REALISASI TAB */}
        {activeTab === 'realisasi' && (
          <div className="space-y-8">
            {isLoadingRealisasi ? (
              <Skeleton className="h-96 rounded-3xl" />
            ) : currentRealisasi ? (
              <>
                {/* Realisasi Overview and Big Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Total Card */}
                  <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-sky-50 to-teal-50/50 flex flex-col justify-between p-8 min-h-[220px]">
                    <div className="space-y-2">
                      <span className="text-xs font-black bg-sky-100 text-sky-800 px-3 py-1 rounded-full uppercase tracking-wider">Realisasi Anggaran Belanja</span>
                      <h3 className="text-2xl font-black text-slate-900 font-display">Realisasi {selectedYear}</h3>
                    </div>
                    <div className="space-y-3 mt-4">
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Realisasi Belanja</span>
                        <div className="text-3xl font-black text-sky-600 mt-1 font-display">
                          Rp {currentRealisasi.totalRealisasi.toLocaleString('id-ID')}
                        </div>
                      </div>
                      {currentApbdes && (
                        <div className="text-xs text-slate-500 font-bold">
                          Dari Rencana Anggaran: Rp {currentApbdes.totalAnggaran.toLocaleString('id-ID')}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Metric 1: Penyerapan Anggaran */}
                  <Card className="rounded-[2.5rem] border-none shadow-xl p-8 flex flex-col justify-between min-h-[220px]">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-slate-900 font-display">Penyerapan Anggaran</h4>
                      <p className="text-xs text-slate-500 font-medium">Persentase rencana anggaran yang telah direalisasikan.</p>
                    </div>
                    <div className="my-4">
                      <div className="text-5xl md:text-6xl font-black text-sky-600 font-display italic">
                        {absorptionStats.formatted}
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 mt-3 overflow-hidden">
                        <div className="bg-sky-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, absorptionStats.percentage)}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Anggaran Terserap</span>
                  </Card>

                  {/* Metric 2: Capaian Output */}
                  <Card className="rounded-[2.5rem] border-none shadow-xl p-8 flex flex-col justify-between min-h-[220px]">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-slate-900 font-display">Capaian Output</h4>
                      <p className="text-xs text-slate-500 font-medium">Rata-rata persentase realisasi kegiatan pembangunan desa.</p>
                    </div>
                    <div className="my-4">
                      <div className="text-5xl md:text-6xl font-black text-blue-600 font-display italic">
                        {outputAchievementStats.formatted}
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 mt-3 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, outputAchievementStats.percentage)}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kegiatan Terealisasi</span>
                  </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Chart 1: Per Bidang */}
                  <Card className="rounded-[2.5rem] border-none shadow-xl">
                    <CardContent className="p-8 space-y-6">
                      <div>
                        <h4 className="text-xl font-black text-slate-900 font-display">Perbandingan Total per Bidang</h4>
                        <p className="text-sm text-slate-500 font-medium">Jumlah realisasi belanja untuk masing-masing bidang pembangunan.</p>
                      </div>

                      {realisasiChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart data={realisasiChartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                            <defs>
                              <linearGradient id="realisasiColorBidang" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                                <stop offset="95%" stopColor="#047857" stopOpacity={0.4} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                              dataKey="name"
                              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                              axisLine={false}
                              tickLine={false}
                              interval={0}
                              tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                            />
                            <YAxis
                              tick={{ fill: '#64748b', fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(val) => `Rp ${(val / 1e6)}jt`}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
                              formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Realisasi Anggaran']}
                            />
                            <Bar dataKey="nominal" fill="url(#realisasiColorBidang)" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-12 text-slate-400 font-bold">Data Bidang Kosong</div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Chart 2: Per Sumber Anggaran */}
                  <Card className="rounded-[2.5rem] border-none shadow-xl">
                    <CardContent className="p-8 space-y-6">
                      <div>
                        <h4 className="text-xl font-black text-slate-900 font-display">Perbandingan Total per Sumber Anggaran</h4>
                        <p className="text-sm text-slate-500 font-medium">Realisasi belanja dikelompokkan berdasarkan asal/sumber anggaran.</p>
                      </div>

                      {realisasiSumberChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart data={realisasiSumberChartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                            <defs>
                              <linearGradient id="realisasiColorSumber" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9} />
                                <stop offset="95%" stopColor="#0891b2" stopOpacity={0.4} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                              dataKey="name"
                              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fill: '#64748b', fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(val) => `Rp ${(val / 1e6)}jt`}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
                              formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Realisasi Anggaran']}
                            />
                            <Bar dataKey="nominal" fill="url(#realisasiColorSumber)" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-12 text-slate-400 font-bold">Data Sumber Anggaran Kosong</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-6">
                <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-semibold">Data Realisasi APBDes tahun {selectedYear} belum tersedia.</p>
              </div>
            )}
          </div>
        )}

        {/* PRODUK HUKUM TAB */}
        {activeTab === 'produk' && (
          <div className="space-y-8">
            {isLoadingProduk ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-3xl" />
                ))}
              </div>
            ) : currentProdukHukum.length === 0 ? (
              <div className="text-center py-16 px-6">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-semibold">Belum ada produk hukum tahun {selectedYear}.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProdukHukum.map(produk => (
                  <Card key={produk.id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Badge className="bg-primary/10 text-primary font-black uppercase text-[9px]">
                          {produk.jenis.toUpperCase()}
                        </Badge>
                        <h3 className="text-lg font-black text-slate-900 line-clamp-2">{produk.nama}</h3>
                        <p className="text-sm text-slate-600">Nomor: {produk.nomor}</p>
                      </div>

                      {produk.filePdfUrl && (
                        <a href={produk.filePdfUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full rounded-xl gap-2 text-xs font-bold">
                            <FileText className="h-4 w-4" />
                            Lihat PDF
                          </Button>
                        </a>
                      )}

                      {produk.driveLink && (
                        <a href={produk.driveLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" className="w-full rounded-xl gap-2 text-xs font-bold text-primary hover:bg-primary/10">
                            <ChevronRight className="h-4 w-4" />
                            Buka di Drive
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-slate-400">
          © 2026 Pemerintah Desa Sidaurip Digital Portal - Tata Kelola Desa
        </div>
      </footer>
    </div>
  );
}

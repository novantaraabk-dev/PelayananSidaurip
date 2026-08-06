'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { getLetterRequestsCollection } from '@/lib/submissions';
import { LetterSubmission } from '@/lib/types';
import { isToday, isThisMonth } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CheckCircle, XCircle, Clock, FileText, Users, Map, Home, TrendingUp, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { query, orderBy, limit, where } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Stats {
  today: { approved: number; rejected: number };
  thisMonth: { approved: number; rejected: number };
  total: number;
}

export function DashboardStats() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const isAdmin = !!user;

  const statsQuery = useMemoFirebase(() => {
    if (!firestore || !user || user.isAnonymous) return null;
    const baseQuery = getLetterRequestsCollection(firestore);
    
    if (!isAdmin) {
      return query(
        baseQuery, 
        where('requestorAuthUid', '==', (user as any).uid),
        limit(100)
      );
    }

    return query(baseQuery, orderBy('createdAt', 'desc'), limit(500));
  }, [firestore, user, isAdmin]);

  const { data: submissionsData, isLoading } = useCollection<LetterSubmission>(statsQuery, { realtime: true });

  const stats: Stats = useMemo(() => {
    const initialStats: Stats = {
      today: { approved: 0, rejected: 0 },
      thisMonth: { approved: 0, rejected: 0 },
      total: 0,
    };

    if (!submissionsData) return initialStats;

    return submissionsData.reduce((acc, sub) => {
      acc.total++;
      if (!sub.createdAt?.toDate) return acc;
      
      const submissionDate = sub.createdAt.toDate();

      if (isToday(submissionDate)) {
        if (sub.status === 'approved') acc.today.approved++;
        if (sub.status === 'rejected') acc.today.rejected++;
      }

      if (isThisMonth(submissionDate)) {
        if (sub.status === 'approved') acc.thisMonth.approved++;
        if (sub.status === 'rejected') acc.thisMonth.rejected++;
      }

      return acc;
    }, initialStats);
  }, [submissionsData]);

  const chartData = [
    { name: 'Disetujui', value: stats.thisMonth.approved, fill: 'hsl(var(--accent))' },
    { name: 'Ditolak', value: stats.thisMonth.rejected, fill: 'hsl(var(--destructive))' },
  ];

  const chartConfig = {
    value: {
      label: "Jumlah",
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* SECTION: VILLAGE INFO */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Populasi</p>
              <p className="text-2xl font-black text-slate-900">10.800+</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Map className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Luas Wilayah</p>
              <p className="text-2xl font-black text-slate-900">5,76 km²</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keluarga (KK)</p>
              <p className="text-2xl font-black text-slate-900">2.097+</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
              <p className="text-2xl font-black text-sky-600 italic">Desa Maju</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION: SUBMISSION STATS (ONLY FOR LOGGED IN USERS) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 bg-accent rounded-full" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
            {isAdmin ? 'Statistik Layanan Desa' : 'Ringkasan Pengajuan Saya'}
          </h3>
        </div>

        {user ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-[2rem] border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-sky-100 text-sky-700 rounded-2xl group-hover:scale-110 transition-transform">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Hari Ini</span>
                  </div>
                  <div>
                    <div className="text-3xl font-black">{stats.today.approved}</div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Surat Disetujui</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-100 text-red-700 rounded-2xl group-hover:scale-110 transition-transform">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Hari Ini</span>
                  </div>
                  <div>
                    <div className="text-3xl font-black">{stats.today.rejected}</div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Surat Ditolak</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl group-hover:scale-110 transition-transform">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bulan Ini</span>
                  </div>
                  <div>
                    <div className="text-3xl font-black">{stats.thisMonth.approved}</div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Total Disetujui</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl group-hover:scale-110 transition-transform">
                      <Clock className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sistem</span>
                  </div>
                  <div>
                    <div className="text-3xl font-black">{stats.total}</div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Total Pengajuan</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
              <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Performa Layanan</h3>
                  <p className="text-xs text-muted-foreground font-medium">Data real-time perbandingan status surat.</p>
                </div>
              </div>
              <CardContent className="p-8">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                      <YAxis hide />
                      <ChartTooltip cursor={{ fill: 'transparent' }} content={<ChartTooltipContent indicator="dot" />} />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white overflow-hidden text-center py-16">
            <CardContent className="space-y-6">
              <div className="p-4 bg-slate-50 text-slate-400 rounded-3xl inline-block">
                <Lock className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <p className="text-slate-900 font-black uppercase tracking-tight italic text-xl">Masuk Untuk Melihat Riwayat</p>
                <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">Data riwayat pengajuan surat hanya dapat dilihat oleh warga yang telah masuk ke portal mandiri.</p>
              </div>
              <Button asChild className="rounded-xl font-black uppercase tracking-widest bg-primary px-8 h-12 shadow-lg shadow-primary/20">
                <Link href="/portal">Masuk Portal Sekarang</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

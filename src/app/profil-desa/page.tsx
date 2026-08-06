'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  User,
  Users,
  History,
  Map as MapIcon,
  Milestone,
  Zap,
  Image as ImageIcon,
  PlayCircle,
  MapPin,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Landmark,
  UserCircle2,
  Calendar,
  Compass,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Activity,
  Heart,
  GraduationCap,
  Stethoscope,
  Fish,
  Sprout,
  Store,
  Beef,
  Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { VillageMap } from '@/components/village-map';

type Official = {
  id: string;
  name: string;
  position: string;
  imageUrl?: string;
  category: 'perangkat' | 'bpd' | 'rtrw';
};

export default function ProfilDesaPage() {
  const [activeTab, setActiveTab] = useState('sambutan');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const firestore = useFirestore();

  // Data for Kenali Kami (Tab 2)
  const officialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'officials'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: officials, isLoading: isLoadingOfficials } = useCollection<Official>(officialsQuery);

  // Get news data for Dokumentasi Kegiatan (Tab 7 - Galeri)
  const newsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'news'), orderBy('updatedAt', 'desc'));
  }, [firestore]);

  const { data: newsData, isLoading: isLoadingNews } = useCollection<any>(newsQuery);

  // Get village profile data for video URL
  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData } = useDoc<{ youtubeVideoUrl?: string; kadesPhotoUrl?: string; description?: string }>(profileRef);

  const getYoutubeEmbedUrl = (url: string | undefined) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
    const videoId = match ? match[1] : url;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const youtubeEmbedUrl = getYoutubeEmbedUrl(profileData?.youtubeVideoUrl);

  const processedOfficials = useMemo(() => {
    if (!officials) return { perangkat: [], bpd: [], rtrwGroups: [] };

    const getPerangkatRank = (pos: string) => {
      const p = pos.toLowerCase();
      if (p.includes('staf') || p.includes('staff')) return 5;
      if (p.includes('kepala desa') || p.includes('kades')) return 1;
      if (p.includes('sekretaris') || p.includes('sekdes')) return 2;
      if (p.includes('kasi') || p.includes('kaur')) return 3;
      if (p.includes('kadus') || p.includes('kepala dusun')) return 4;
      return 6;
    };

    const perangkat = officials
      .filter(o => o.category === 'perangkat')
      .sort((a, b) => getPerangkatRank(a.position) - getPerangkatRank(b.position));

    const bpd = officials
      .filter(o => o.category === 'bpd')
      .sort((a, b) => {
        if (a.position.toLowerCase().includes('ketua') && !b.position.toLowerCase().includes('ketua')) return -1;
        if (!a.position.toLowerCase().includes('ketua') && b.position.toLowerCase().includes('ketua')) return 1;
        return a.name.localeCompare(b.name);
      });

    const rtrwRaw = officials.filter(o => o.category === 'rtrw');
    const rwGroups: Record<string, Official[]> = {};

    rtrwRaw.forEach(item => {
      const rwMatch = item.position.match(/RW\s?(\d+)/i);
      const rwNum = rwMatch ? rwMatch[1].padStart(2, '0') : '99';
      if (!rwGroups[rwNum]) rwGroups[rwNum] = [];
      rwGroups[rwNum].push(item);
    });

    const sortedRwKeys = Object.keys(rwGroups).sort();
    const rtrwGroups = sortedRwKeys.map(key => {
      return {
        rwLabel: `Wilayah RW ${key}`,
        members: rwGroups[key].sort((a, b) => {
          if (a.position.toLowerCase().includes('ketua rw') && !b.position.toLowerCase().includes('ketua rw')) return -1;
          if (!a.position.toLowerCase().includes('ketua rw') && b.position.toLowerCase().includes('ketua rw')) return 1;
          const rtA = a.position.match(/RT\s?(\d+)/i)?.[1] || '0';
          const rtB = b.position.match(/RT\s?(\d+)/i)?.[1] || '0';
          return parseInt(rtA) - parseInt(rtB);
        })
      };
    });

    return { perangkat, bpd, rtrwGroups };
  }, [officials]);

  const tabs = [
    { id: 'sambutan', label: 'Profil & Sambutan', icon: User },
    { id: 'kenali', label: 'Kenali Kami', icon: Users },
    { id: 'sejarah', label: 'Sejarah Desa', icon: History },
    { id: 'peta', label: 'Peta & Batas', icon: MapIcon },
    { id: 'wilayah', label: 'Data Wilayah', icon: Milestone },
    { id: 'potensi', label: 'Potensi Unggulan', icon: Zap },
    { id: 'galeri', label: 'Galeri Media', icon: ImageIcon },
  ];

  const activeTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* TOP HEADER */}
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
        <div className="grid lg:grid-cols-12 gap-10 items-start">

          {/* SIDEBAR NAVIGATION (Desktop) / TOP SCROLL (Mobile) */}
          <aside className="lg:col-span-3 lg:sticky lg:top-28 z-40">
            {/* Desktop Navigation List */}
            <div className="hidden lg:flex bg-white rounded-[2.5rem] p-4 border shadow-sm flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 whitespace-nowrap w-full group text-left",
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                  )}
                >
                  <tab.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-secondary" : "text-slate-400")} />
                  <span className="font-black uppercase text-[10px] tracking-widest">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Dropdown Selector */}
            <div className="block lg:hidden w-full relative mb-6">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full flex items-center justify-between bg-primary text-white px-5 py-4 rounded-xl shadow-md font-black uppercase text-[10px] tracking-wider"
              >
                <div className="flex items-center gap-3">
                  {React.createElement(activeTabObj.icon, { className: "h-5 w-5 text-secondary" })}
                  <span>{activeTabObj.label}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isMenuOpen && "rotate-180")} />
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute left-0 right-0 mt-2 z-50 bg-white border rounded-xl shadow-xl overflow-hidden py-1 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    {tabs.map((tab) => {
                      const isCurrent = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMenuOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={cn(
                            "w-full flex items-center gap-4 px-5 py-3.5 text-left text-xs font-bold transition-colors",
                            isCurrent ? "bg-slate-50 text-primary" : "text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          <tab.icon className={cn("h-4 w-4 shrink-0", isCurrent ? "text-primary" : "text-slate-400")} />
                          <span className="uppercase tracking-wider">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="hidden lg:block mt-8 p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck className="w-24 h-24" /></div>
              <div className="relative z-10 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Akses Cepat</p>
                <h4 className="text-xl font-display font-semibold italic">Butuh bantuan administrasi?</h4>
                <Link href="/layanan-surat/">
                  <Button className="bg-secondary text-primary font-black uppercase text-[10px] tracking-widest w-full h-12 rounded-xl mt-4">
                    Buka Layanan Surat
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-9 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'sambutan' && <SambutanTab kadesPhotoUrl={profileData?.kadesPhotoUrl} customDesc={profileData?.description} />}
            {activeTab === 'kenali' && <KenaliTab data={processedOfficials} isLoading={isLoadingOfficials} />}
            {activeTab === 'sejarah' && <SejarahTab />}
            {activeTab === 'peta' && <PetaTab />}
            {activeTab === 'wilayah' && <WilayahTab />}
            {activeTab === 'potensi' && <PotensiTab />}
            {activeTab === 'galeri' && <GaleriTab youtubeEmbedUrl={youtubeEmbedUrl} newsData={newsData} isLoadingNews={isLoadingNews} />}
          </main>
        </div>
      </div>

      <footer className="bg-primary text-white/40 py-12 border-t border-white/5 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <Logo />
          <p className="mt-8 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Pemerintah Desa Sidaurip • Kecamatan Gandrungmangu, Kabupaten Cilacap
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- TAB COMPONENTS ---

function SambutanTab({ kadesPhotoUrl, customDesc }: { kadesPhotoUrl?: string; customDesc?: string }) {
  const imageUrl = kadesPhotoUrl || "https://picsum.photos/seed/kades/600/800";
  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-12 gap-8 items-stretch">
        <div className="md:col-span-4 lg:col-span-4">
          <Card className="rounded-3xl md:rounded-[3rem] overflow-hidden border-none shadow-xl bg-white sticky top-28">
            <div className="aspect-[3/4] relative bg-slate-100">
              <img
                src={imageUrl}
                alt="Kepala Desa Sidaurip"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
            </div>
            <div className="p-6 md:p-8 text-center bg-primary text-white">
              <h3 className="text-xl font-black uppercase tracking-tight font-display italic">SUHUD</h3>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mt-1">Kepala Desa Sidaurip</p>
            </div>
          </Card>
        </div>
        <div className="md:col-span-8 lg:col-span-8 bg-white p-6 md:p-14 rounded-3xl md:rounded-[4rem] border shadow-sm space-y-8">
          <div className="space-y-4">
            <Badge className="bg-sky-50 text-sky-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
              Profil Resmi Desa Sidaurip
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight uppercase font-display italic tracking-tighter">
              Selamat Datang di <span className="text-primary not-italic">Desa Sidaurip</span>
            </h2>
            <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">
              Kecamatan Gandrungmangu, Kabupaten Cilacap, Provinsi Jawa Tengah
            </p>
          </div>
          <div className="prose prose-slate max-w-none space-y-4 text-slate-700 text-sm md:text-base leading-relaxed">
            <p className="text-sm md:text-base leading-relaxed text-slate-600 font-medium italic border-l-4 md:border-l-8 border-secondary pl-4 md:pl-6 py-2">
              "Desa Sidaurip merupakan salah satu desa di wilayah Kecamatan Gandrungmangu, Kabupaten Cilacap, Provinsi Jawa Tengah yang terus berkembang dengan mengedepankan semangat gotong royong, pelayanan publik yang profesional, tata kelola pemerintahan yang transparan, serta pembangunan berkelanjutan berbasis potensi lokal."
            </p>
            <p>
              Sebagai desa yang memiliki wilayah cukup luas di Kecamatan Gandrungmangu (luas ± 17,04 km² atau 14,29% dari total luas kecamatan), Desa Sidaurip memiliki sumber daya alam, sumber daya manusia, serta potensi pertanian yang menjadi kekuatan utama dalam meningkatkan kesejahteraan masyarakat.
            </p>
            <p>
              Pemerintah Desa Sidaurip berkomitmen mewujudkan pelayanan publik yang cepat, mudah, transparan, akuntabel serta mendorong transformasi digital desa sebagai bagian dari upaya meningkatkan kualitas pelayanan kepada masyarakat.
            </p>
          </div>
          <div className="pt-4 flex flex-wrap gap-2 sm:gap-4">
            {["Profesional", "Transparan", "Akuntabel", "Gotong Royong", "Desa Digital"].map(tag => (
              <div key={tag} className="flex items-center gap-2 px-5 py-2 bg-slate-50 border rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
                <CheckCircle2 className="h-3 w-3 text-secondary" /> {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VISI & MISI DESA */}
      <div className="bg-white p-8 md:p-14 rounded-3xl md:rounded-[4rem] border shadow-sm space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-sky-50 text-sky-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
            Visi & Misi Pembangunan
          </Badge>
          <h3 className="text-3xl font-black text-slate-900 uppercase font-display italic">Arah Pembangunan Desa</h3>
        </div>

        {/* VISI CARD */}
        <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-r from-primary to-sky-900 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-3 text-secondary">
            <Target className="h-6 w-6" />
            <h4 className="text-xs font-black uppercase tracking-[0.3em]">Visi Pembangunan Desa</h4>
          </div>
          <p className="text-lg md:text-2xl font-black font-display italic leading-relaxed text-slate-100">
            "Mewujudkan Desa Sidaurip yang Maju, Mandiri, Sejahtera, Religius, Berbudaya, Transparan, Berdaya saing, dan Berbasis pelayanan publik yang prima."
          </p>
        </div>

        {/* MISI LIST */}
        <div className="space-y-6">
          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary" /> Misi Desa Sidaurip
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Meningkatkan kualitas pelayanan kepada masyarakat.',
              'Mengembangkan infrastruktur desa.',
              'Mendorong pertumbuhan ekonomi berbasis potensi lokal.',
              'Meningkatkan kualitas sumber daya manusia.',
              'Memperkuat tata kelola pemerintahan yang bersih.',
              'Mengembangkan digitalisasi pelayanan desa.',
              'Meningkatkan partisipasi masyarakat dalam pembangunan.',
              'Pengelolaan lingkungan hidup dan ketahanan pangan.'
            ].map((misi, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4 hover:bg-sky-50/50 transition-colors">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-black text-xs">
                  {i + 1}
                </span>
                <p className="text-sm font-bold text-slate-800 leading-snug">{misi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KenaliTab({ data, isLoading }: { data: any, isLoading: boolean }) {
  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-slate-900 uppercase font-display italic">Struktur <span className="text-primary not-italic">Pemerintahan</span></h2>
        <p className="text-slate-500 font-medium text-lg border-l-4 border-secondary pl-4 uppercase tracking-tight">Mengenal Pelayan Masyarakat Desa Sidaurip</p>
      </div>

      <div className="space-y-20">
        {/* PERANGKAT DESA */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary text-white rounded-2xl shadow-lg"><UserCircle2 className="h-6 w-6" /></div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Perangkat Desa</h3>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-3xl md:rounded-[2.5rem]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-8">
              {data.perangkat.map((o: Official) => <OfficialCard key={o.id} official={o} />)}
            </div>
          )}
        </section>

        {/* BPD */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary text-primary rounded-2xl shadow-lg"><ShieldCheck className="h-6 w-6" /></div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">BPD Desa</h3>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-3xl md:rounded-[2.5rem]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-8">
              {data.bpd.map((o: Official) => <OfficialCard key={o.id} official={o} />)}
            </div>
          )}
        </section>

        {/* RT/RW GROUPS */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg"><Landmark className="h-6 w-6" /></div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Lembaga Kemasyarakatan (RT/RW)</h3>
          </div>
          <div className="space-y-10 md:space-y-16">
            {data.rtrwGroups.map((group: any, i: number) => (
              <div key={i} className="space-y-8 p-6 md:p-10 bg-white rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-100" />
                  <Badge className="bg-slate-100 text-slate-400 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.4em] px-4 md:px-8 py-1.5 md:py-2 rounded-full border">
                    {group.rwLabel}
                  </Badge>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                  {group.members.map((o: Official) => <OfficialCard key={o.id} official={o} isSmall />)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SejarahTab() {
  const historyEvents = [
    {
      year: 'Cikal Bakal',
      title: 'Penggabungan Dua Wilayah',
      desc: 'Nama "Sidaurip" berasal dari penggabungan dua wilayah cikal bakal yaitu Dusun Sidasari dan Dusun Kuripan. Kedua dusun sepakat bersatu membentuk landasan kehidupan desa.',
      icon: Landmark
    },
    {
      year: '1984',
      title: 'Pemekaran Desa Cisumur & Berdiri Definitif',
      desc: 'Desa Sidaurip merupakan hasil pemekaran dari Desa Cisumur dan resmi berdiri sebagai desa definitif pada tahun 1984 atas aspirasi warga yang menghendaki pelayanan pemerintahan lebih dekat dan cepat.',
      icon: Calendar
    },
    {
      year: 'Makna Filosofi',
      title: 'Harapan Kehidupan Sejahtera',
      desc: 'Filosofi nama: "Sida" berarti menjadi, terwujud, atau berhasil; dan "Urip" berarti hidup, kehidupan, atau kesejahteraan. Sidaurip bermakna harapan agar masyarakat selalu memperoleh kehidupan yang lebih baik, sejahtera, tenteram, dan maju.',
      icon: Heart
    },
    {
      year: 'Masa Kini',
      title: 'Pertumbuhan & Pembangunan Berkelanjutan',
      desc: 'Seiring berjalannya waktu, Desa Sidaurip terus berkembang pesat dalam pelayanan pemerintahan, infrastruktur, kependudukan, pendidikan, dan perekonomian masyarakat secara mandiri.',
      icon: TrendingUp
    },
  ];

  return (
    <div className="space-y-16 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-900 uppercase font-display italic">Sejarah <span className="text-primary not-italic">Desa Sidaurip</span></h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Menelusuri Jejak Berdirinya Desa Definitif Tahun 1984</p>
      </div>

      {/* Rincian Sejarah Narrative Card */}
      <Card className="rounded-3xl md:rounded-[3rem] border-none shadow-sm bg-white p-8 md:p-12 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-700">
          <History className="h-4 w-4" /> Asal-Usul & Filosofi Nama
        </div>
        <div className="prose prose-slate max-w-none text-slate-700 space-y-4 text-base leading-relaxed">
          <p>
            Desa Sidaurip merupakan desa hasil pemekaran dari <strong>Desa Cisumur</strong>. Berdasarkan berbagai referensi lokal, Desa Sidaurip resmi berdiri sebagai desa definitif pada <strong>tahun 1984</strong>. Pembentukan desa ini berawal dari aspirasi masyarakat yang menghendaki pelayanan pemerintahan lebih dekat, efektif, dan mampu mempercepat pembangunan wilayah.
          </p>
          <p>
            Nama <strong>"Sidaurip"</strong> berasal dari gabungan dua wilayah yang menjadi cikal bakal berdirinya desa, yaitu:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-semibold text-slate-800">
            <li><strong>Dusun Sidasari</strong></li>
            <li><strong>Dusun Kuripan</strong></li>
          </ul>
          <p>
            Kedua nama tersebut digabung menjadi Sidaurip, yang memiliki makna filosofis mendalam:
          </p>
          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-2">
              <span className="text-xs font-black uppercase text-primary tracking-widest">Sida</span>
              <p className="text-sm font-bold text-slate-800">Berarti menjadi, terwujud, atau berhasil.</p>
            </div>
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
              <span className="text-xs font-black uppercase text-amber-800 tracking-widest">Urip</span>
              <p className="text-sm font-bold text-slate-800">Berarti hidup, kehidupan, atau kesejahteraan.</p>
            </div>
          </div>
          <p className="pt-2 italic font-medium text-slate-600">
            Secara filosofi, nama Desa Sidaurip dapat dimaknai sebagai harapan agar masyarakat selalu memperoleh kehidupan yang lebih baik, sejahtera, tenteram, dan maju.
          </p>
        </div>
      </Card>

      <div className="relative space-y-12">
        {/* Vertical Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-primary/10 -translate-x-1/2" />

        {historyEvents.map((event, i) => (
          <div key={i} className={cn(
            "relative flex items-center gap-10",
            i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
          )}>
            {/* Timeline Dot */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-2xl bg-primary border-4 border-white shadow-xl flex items-center justify-center z-10">
              <event.icon className="h-4 w-4 text-secondary" />
            </div>

            {/* Content Side */}
            <div className="flex-1 pl-12 md:pl-0">
              <Card className={cn(
                "rounded-3xl md:rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white group overflow-hidden",
                i % 2 === 0 ? "md:mr-12" : "md:ml-12"
              )}>
                <div className={cn("h-2 w-full", i % 2 === 0 ? "bg-primary" : "bg-secondary")} />
                <CardContent className="p-6 md:p-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{event.year}</span>
                    <Calendar className="h-4 w-4 text-slate-200" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-black uppercase text-slate-900 italic tracking-tight">{event.title}</h4>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    {event.desc}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Empty Side (For desktop symmetry) */}
            <div className="hidden md:flex flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PetaTab() {
  return (
    <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
      <div className="lg:col-span-8 space-y-6">
        <Card className="rounded-3xl md:rounded-[3rem] overflow-hidden border-none shadow-xl h-[350px] sm:h-[500px] md:h-[550px] relative group">
          <VillageMap />
          <div className="absolute top-4 md:top-8 left-4 md:left-8 pointer-events-none z-10">
            <Badge className="bg-primary text-white font-black uppercase text-[8px] md:text-[10px] tracking-widest px-4 md:px-6 py-1.5 md:py-2 rounded-full border-none shadow-2xl">
              Peta Interaktif Desa Sidaurip
            </Badge>
          </div>
        </Card>

        {/* Ringkasan Jarak */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jarak ke Ibukota Kecamatan</p>
            <p className="text-2xl font-black text-primary font-display">± 5 KM</p>
            <p className="text-xs text-slate-500 font-medium">Kecamatan Gandrungmangu</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jarak ke Ibukota Kabupaten</p>
            <p className="text-2xl font-black text-primary font-display">± 50 KM</p>
            <p className="text-xs text-slate-500 font-medium">Kabupaten Cilacap</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-8">
        <Card className="rounded-3xl md:rounded-[3rem] border-none bg-primary text-white overflow-hidden shadow-2xl">
          <CardContent className="p-6 md:p-10 space-y-8 md:space-y-10">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">Geografis & Batas</p>
              <h3 className="text-3xl font-display font-semibold italic">Batas Wilayah</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Desa Sidaurip berada di bagian selatan Kecamatan Gandrungmangu dengan luas wilayah ± 17,04 km² (14,29% luas kecamatan).
              </p>
            </div>

            <div className="space-y-5">
              {[
                { dir: 'UTARA', label: 'Desa Bulusari' },
                { dir: 'SELATAN', label: 'Desa Ujung Gagak, Kec. Kampung Laut' },
                { dir: 'TIMUR', label: 'Desa Layansari & Desa Gandrungmanis' },
                { dir: 'BARAT', label: 'Desa Cisumur' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-[10px] text-secondary border border-white/5 group-hover:bg-secondary group-hover:text-primary transition-all shrink-0">
                    {item.dir[0]}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{item.dir}</p>
                    <p className="font-bold text-sm text-slate-100">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <Compass className="h-5 w-5 text-secondary" />
                <p className="text-[10px] font-black uppercase tracking-widest">Luas Wilayah Total</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 font-mono text-xs text-secondary flex justify-between">
                <span>Luas: 17,04 km²</span>
                <span>Porsi: 14,29% Kec.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WilayahTab() {
  const dusuns = [
    { name: 'DUSUN KURIPAN', desc: 'Wilayah pemukiman dan pusat aktivitas kemasyarakatan.', color: 'bg-primary' },
    { name: 'DUSUN SIDAURIP', desc: 'Pusat pemerintahan desa dan sentra pelayanan publik.', color: 'bg-secondary' },
    { name: 'DUSUN SIDASARI', desc: 'Kawasan lahan pertanian produktif dan perkebunan.', color: 'bg-accent' },
    { name: 'DUSUN GEBANGSARI', desc: 'Kawasan pertanian serta potensi perikanan air tawar.', color: 'bg-slate-900' },
  ];

  return (
    <div className="space-y-12">
      <div className="max-w-3xl space-y-4">
        <Badge className="bg-sky-50 text-sky-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
          Pembagian Wilayah Administrasi
        </Badge>
        <h2 className="text-4xl font-black text-slate-900 uppercase font-display italic">Wilayah & <span className="text-primary not-italic">Demografi</span></h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          Desa Sidaurip terbagi menjadi <strong>4 Dusun</strong> utama dengan total <strong>8 RW</strong> dan <strong>45 RT</strong> (Data BPS 2024). Kepadatan penduduk mencapai ~464 jiwa/km², memberikan peluang luas bagi pengembangan permukiman dan pertanian.
        </p>
      </div>

      {/* Ringkasan Demografi Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah Dusun</p>
          <p className="text-3xl font-black text-primary font-display">4 Dusun</p>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah RW</p>
          <p className="text-3xl font-black text-primary font-display">8 RW</p>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah RT</p>
          <p className="text-3xl font-black text-primary font-display">45 RT</p>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kepadatan Penduduk</p>
          <p className="text-3xl font-black text-primary font-display">464 <span className="text-xs font-normal">jiwa/km²</span></p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 md:grid-cols-2 md:gap-8">
        {dusuns.map((dusun, i) => (
          <Card key={i} className="rounded-3xl md:rounded-[3rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden group">
            <div className={cn("h-3 w-full", dusun.color)} />
            <CardContent className="p-6 md:p-10 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{dusun.name}</h3>
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                  <Milestone className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">{dusun.desc}</p>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-primary font-black uppercase text-[10px] tracking-widest group-hover:translate-x-2 transition-transform">
                <span>Wilayah Administrasi Desa Sidaurip</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PotensiTab() {
  const potentials = [
    {
      title: '1. Sektor Pertanian Utama',
      desc: 'Komoditas unggulan meliputi Padi, Jagung, Kelapa, Singkong, Hortikultura, dan tanaman pekarangan. Pertanian merupakan mata pencaharian utama warga Desa Sidaurip.',
      icon: Sprout,
      color: 'text-sky-600',
      bg: 'bg-sky-50'
    },
    {
      title: '2. Sektor Peternakan',
      desc: 'Usaha peternakan sapi, kambing, ayam, dan itik menjadi penopang ekonomi keluarga dan penyedia pangan hewani lokal.',
      icon: Beef,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: '3. Perikanan Air Tawar & Pesisir',
      desc: 'Wilayah bagian selatan yang berdekatan dengan kawasan rawa/pesisir memberikan potensi besar bagi pengembangan perikanan air tawar dan budidaya.',
      icon: Fish,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: '4. UMKM & Kerajinan',
      desc: 'Pengembangan perdagangan, warung sembako, kuliner lokal, industri rumah tangga, dan kerajinan sebagai penggerak ekonomi warga.',
      icon: Store,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    },
  ];

  return (
    <div className="space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge className="bg-sky-50 text-sky-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
          Potensi Ekonomi & Kemasyarakatan
        </Badge>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase font-display italic">Potensi <span className="text-primary not-italic">Unggulan</span></h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Sektor Pertanian, Peternakan, Perikanan, & UMKM Desa Sidaurip</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
        {potentials.map((item, i) => (
          <Card key={i} className="rounded-3xl md:rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white group flex flex-col h-full">
            <CardContent className="p-8 md:p-10 flex flex-col h-full space-y-6">
              <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110", item.bg, item.color)}>
                <item.icon className="h-8 w-8" />
              </div>
              <div className="space-y-3 flex-1">
                <h4 className="text-xl font-black uppercase tracking-tight text-slate-800 leading-tight">{item.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
              <div className="w-8 h-1 bg-secondary rounded-full group-hover:w-full transition-all duration-500" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PENDIDIKAN & KESEHATAN & SOSIAL BUDAYA */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="p-3 bg-sky-50 text-sky-700 w-fit rounded-2xl"><GraduationCap className="h-6 w-6" /></div>
          <h4 className="text-lg font-black text-slate-900 uppercase">Pendidikan</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Fasilitas pendidikan dasar dan program literasi masyarakat terus dikembangkan untuk peningkatan SDM generasi muda Desa Sidaurip.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="p-3 bg-rose-50 text-rose-600 w-fit rounded-2xl"><Stethoscope className="h-6 w-6" /></div>
          <h4 className="text-lg font-black text-slate-900 uppercase">Kesehatan</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Didukung Posyandu, Posbindu, kader kesehatan, pencegahan stunting, serta koordinasi dengan Puskesmas Gandrungmangu.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="p-3 bg-amber-50 text-amber-600 w-fit rounded-2xl"><Users className="h-6 w-6" /></div>
          <h4 className="text-lg font-black text-slate-900 uppercase">Sosial Budaya</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Tradisi gotong royong, kerja bakti, pengajian, Karang Taruna, PKK, LPMD, dan Linmas sebagai modal sosial pembangunan desa.
          </p>
        </div>
      </div>
    </div>
  );
}

function GaleriTab({ youtubeEmbedUrl, newsData, isLoadingNews }: { youtubeEmbedUrl: string | null, newsData?: any[] | null, isLoadingNews?: boolean }) {
  const documentationPhotos = useMemo(() => {
    if (!newsData) return [];
    return newsData
      .filter(news => news.imageUrl && news.mediaType !== 'video')
      .map(news => ({
        url: news.imageUrl,
        title: news.title,
        date: news.date,
      }));
  }, [newsData]);

  return (
    <div className="space-y-16">
      {/* Video Profile Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><PlayCircle className="h-6 w-6" /></div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800">Video Profil Resmi Desa Sidaurip</h3>
        </div>
        <Card className="rounded-3xl md:rounded-[3rem] overflow-hidden border-none shadow-2xl aspect-video bg-slate-900 group">
          {youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title="Profil Desa Sidaurip"
              className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full min-h-[240px] md:min-h-[320px] items-center justify-center bg-slate-950 text-center text-slate-200">
              <div className="space-y-3 px-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <p className="text-base md:text-lg font-semibold">Video profil desa belum dikonfigurasi.</p>
                <p className="text-xs md:text-sm text-slate-300">Silakan atur tautan YouTube di halaman Pengaturan Admin.</p>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* Photo Gallery Grid */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary text-white rounded-2xl"><ImageIcon className="h-6 w-6" /></div>
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Dokumentasi Kegiatan</h3>
        </div>

        {isLoadingNews ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl md:rounded-[2rem]" />
            ))}
          </div>
        ) : documentationPhotos.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
              <ImageIcon className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold">Belum ada dokumentasi kegiatan.</p>
            <p className="text-slate-400 text-sm">Foto dokumentasi akan muncul ketika berita dengan foto ditambahkan.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
            {documentationPhotos.map((photo, i) => (
              <div key={i} className="rounded-2xl md:rounded-[2rem] overflow-hidden border-4 border-white shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group relative">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <p className="text-white text-sm font-semibold line-clamp-2">{photo.title}</p>
                  {photo.date && (
                    <p className="text-white/70 text-xs mt-1">{photo.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center py-10">
          <Link href="/BeritaDesa/">
            <Button variant="outline" className="rounded-xl font-bold gap-2 border-primary text-primary h-12 px-10">
              Lihat Seluruh Berita
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function OfficialCard({ official, isSmall = false }: { official: Official, isSmall?: boolean }) {
  return (
    <div className={`group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden`}>
      <div className="relative aspect-[4/5] w-full bg-slate-100 overflow-hidden">
        {official.imageUrl ? (
          <img src={official.imageUrl} alt={official.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <UserCircle2 className="h-16 w-16 text-primary/10" />
          </div>
        )}
      </div>
      <div className={`${isSmall ? 'p-4' : 'p-6'} space-y-2`}>
        <div className="w-10 h-1 bg-secondary rounded-full group-hover:w-full transition-all duration-500" />
        <h3 className={`${isSmall ? 'text-[11px]' : 'text-sm'} font-black text-slate-900 uppercase leading-tight line-clamp-2`}>
          {official.name}
        </h3>
        <p className={`${isSmall ? 'text-[8px]' : 'text-[10px]'} font-bold text-primary uppercase tracking-widest italic`}>
          {official.position}
        </p>
      </div>
    </div>
  );
}

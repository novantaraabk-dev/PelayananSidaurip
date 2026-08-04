'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Eye, 
  Star, 
  ShieldCheck, 
  CheckCircle2,
  ClipboardCheck, 
  BarChart, 
  BookOpen, 
  LayoutGrid, 
  LibraryBig, 
  ScrollText, 
  BookMarked,
  Info, 
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  Activity,
  TrendingUp,
  Landmark,
  MapPin,
  Calendar,
  UserCheck
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { PelayananDoc } from '@/lib/types';
import { getCategoryLabel } from '@/lib/pelayanan-categories';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function PelayananDesaPage() {
  const [activeTab, setActiveTab] = useState('visi-misi');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const firestore = useFirestore();

  const tabs = [
    { id: 'visi-misi', label: 'Visi & Misi', icon: Star, color: 'text-secondary', description: 'Visi, misi, dan komitmen mutu pelayanan.' },
    { id: 'maklumat', label: 'Maklumat', icon: ShieldCheck, color: 'text-blue-500', description: 'Janji penyelenggaraan pelayanan resmi.' },
    { id: 'standar', label: 'Standar Pelayanan', icon: ClipboardCheck, color: 'text-emerald-500', description: 'Syarat, biaya, dan waktu pengurusan.' },
    { id: 'ikm', label: 'Laporan IKM', icon: BarChart, color: 'text-amber-500', description: 'Hasil indeks kepuasan masyarakat.' },
    { id: 'survey', label: 'Survey Warga', icon: BookOpen, color: 'text-purple-500', description: 'Kuesioner dan penilaian layanan.' },
    { id: 'jenis', label: 'Jenis Layanan', icon: ScrollText, color: 'text-rose-500', description: 'Daftar seluruh surat yang dilayani.' },
    { id: 'sop', label: 'Alur & SOP', icon: LayoutGrid, color: 'text-sky-500', description: 'Standar operasional prosedur teknis.' },
    { id: 'pojok-baca', label: 'Pojok Baca', icon: LibraryBig, color: 'text-slate-500', description: 'Transparansi regulasi dan perdes.' },
  ];

  const docsQuery = useMemoFirebase(() => {
    if (!firestore || !activeTab) return null;
    return query(
      collection(firestore, 'pelayananDocs'),
      where('category', '==', activeTab),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, activeTab]);

  const { data: docs, isLoading } = useCollection<PelayananDoc>(docsQuery);

  const handlePreview = (fileId: string) => {
    window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
  };

  const handleDownload = (fileId: string) => {
    window.open(`https://drive.google.com/uc?export=download&id=${fileId}`, '_blank');
  };
  
  const activeTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
             <Link href="/">
                <Button variant="ghost" className="font-bold gap-2 text-primary hover:bg-slate-100 rounded-xl">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Beranda</span>
                </Button>
            </Link>
            <Link href="/dashboard">
                <Button className="bg-secondary hover:bg-yellow-600 text-primary-foreground font-black px-6 rounded-xl shadow-lg shadow-secondary/20 h-10">Portal Layanan</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-6 md:py-12">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* SIDEBAR NAVIGATION (KONSEP PROFIL DESA) */}
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
                  <tab.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-secondary" : tab.color)} />
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
                          <tab.icon className={cn("h-4 w-4 shrink-0", isCurrent ? "text-primary" : tab.color)} />
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
                  <h4 className="text-xl font-display font-semibold italic">Punya Keluhan Pelayanan?</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">Sampaikan aduan Anda jika mendapatkan pelayanan yang kurang memuaskan.</p>
                  <Button className="bg-secondary text-primary font-black uppercase text-[10px] tracking-widest w-full h-12 rounded-xl mt-4" asChild>
                    <Link href="/pengaduan/">Lapor Pengaduan</Link>
                  </Button>
               </div>
            </div>
          </aside>

          {/* CONTENT AREA */}
          <main className="lg:col-span-9 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-[0.3em]">
                <BookMarked className="h-3 w-3" />
                Portal Transparansi Layanan
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter italic font-display">
                Pelayanan <span className="text-primary not-italic">Desa</span>
                </h1>
                <p className="text-sm text-slate-500 font-medium max-w-2xl">
                Pusat informasi persyaratan, standar, dan dokumen administrasi Desa Pangawaren.
                </p>
            </div>

            <CategoryContent categoryId={activeTab} docs={docs} isLoading={isLoading} />

            {/* DOCUMENT TABLE SECTION */}
            {!(activeTab === 'visi-misi' || activeTab === 'maklumat' || activeTab === 'pojok-baca') && (
              <Card className="rounded-3xl md:rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                  <CardHeader className="p-6 md:p-8 border-b bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                      <CardTitle className="text-base md:text-lg font-black uppercase text-slate-800 flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      Daftar Lampiran {getCategoryLabel(activeTab)}
                      </CardTitle>
                      <CardDescription className="font-medium text-xs md:text-sm text-slate-500">Klik pratinjau atau unduh dokumen di bawah.</CardDescription>
                  </div>
                  </CardHeader>
                  <CardContent className="p-0">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                      <Table>
                      <TableHeader className="bg-slate-100/50">
                          <TableRow>
                          <TableHead className="pl-8 h-12 font-black uppercase text-[10px] tracking-widest text-slate-400">Judul Dokumen</TableHead>
                          <TableHead className="h-12 font-black uppercase text-[10px] tracking-widest text-slate-400">Tipe</TableHead>
                          <TableHead className="text-right pr-8 h-12 font-black uppercase text-[10px] tracking-widest text-slate-400">Aksi</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {isLoading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                              <TableRow key={i}>
                              <TableCell colSpan={3} className="px-8 py-4"><Skeleton className="h-10 w-full rounded-xl" /></TableCell>
                              </TableRow>
                          ))
                          ) : docs?.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={3} className="h-32 text-center text-slate-400 font-medium italic">Belum ada dokumen lampiran untuk kategori ini.</TableCell>
                          </TableRow>
                          ) : (
                          docs?.map((doc) => (
                              <TableRow key={doc.id} className="hover:bg-slate-50 transition-colors group">
                              <TableCell className="pl-8 py-5">
                                  <div className="flex items-center gap-3">
                                  <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-all">
                                      <FileText className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold text-slate-700 uppercase text-sm">{doc.title}</span>
                                  </div>
                              </TableCell>
                              <TableCell>
                                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200">PDF File</Badge>
                              </TableCell>
                              <TableCell className="text-right pr-8">
                                  <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all" onClick={() => handlePreview(doc.fileId)}>
                                      <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary hover:text-primary transition-all" onClick={() => handleDownload(doc.fileId)}>
                                      <Download className="h-4 w-4" />
                                  </Button>
                                  </div>
                              </TableCell>
                              </TableRow>
                          ))
                          )}
                      </TableBody>
                      </Table>
                  </div>

                  {/* Mobile Card List View */}
                  <div className="block md:hidden divide-y divide-slate-100">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-6">
                          <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                      ))
                    ) : docs?.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-medium italic text-sm">
                        Belum ada dokumen lampiran untuk kategori ini.
                      </div>
                    ) : (
                      docs?.map((doc) => (
                        <div key={doc.id} className="p-5 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0 mt-0.5">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                              <span className="font-bold text-slate-700 uppercase text-xs block leading-relaxed">{doc.title}</span>
                              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-200 py-0 h-4">PDF File</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 h-9 rounded-xl font-bold text-xs gap-2 justify-center" onClick={() => handlePreview(doc.fileId)}>
                              <Eye className="h-3.5 w-3.5" />
                              Pratinjau
                            </Button>
                            <Button variant="outline" className="flex-1 h-9 rounded-xl font-bold text-xs gap-2 hover:bg-secondary hover:text-primary justify-center" onClick={() => handleDownload(doc.fileId)}>
                              <Download className="h-3.5 w-3.5" />
                              Unduh
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      <footer className="bg-primary text-white/40 py-12 border-t border-white/5 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <Logo />
          <p className="mt-8 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Pemerintah Desa Pangawaren Digital Portal
          </p>
        </div>
      </footer>
    </div>
  );
}
function CategoryContent({ categoryId, docs, isLoading }: { categoryId: string; docs: PelayananDoc[] | null | undefined; isLoading: boolean }) {
  const hasDocs = docs && docs.length > 0;

  switch (categoryId) {
    case 'visi-misi':
      if (hasDocs) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {docs.map((docItem) => (
              <Card key={docItem.id} className="rounded-3xl md:rounded-[2.5rem] overflow-hidden border shadow-sm bg-white p-4 md:p-6 flex flex-col justify-between">
                <div className="relative aspect-video w-full bg-slate-50 rounded-2xl md:rounded-[2rem] overflow-hidden mb-4 border">
                  <img src={docItem.fileId} alt={docItem.title} className="w-full h-full object-contain" />
                </div>
                <div className="text-center">
                  <h3 className="text-xs md:text-sm font-black uppercase text-slate-800 tracking-tight leading-tight">{docItem.title}</h3>
                </div>
              </Card>
            ))}
          </div>
        );
      }
      return (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-3xl md:rounded-[2.5rem] border-none shadow-sm bg-primary text-white overflow-hidden">
              <CardHeader className="p-6 md:p-8 pb-4">
                <Star className="h-8 w-8 text-secondary mb-4" />
                <CardTitle className="text-xl md:text-2xl font-black uppercase italic">Visi Pelayanan</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 pt-0">
                <p className="text-lg md:text-xl font-medium leading-relaxed italic">
                  "Terwujudnya pelayanan desa yang cepat, transparan, dan akuntabel demi kesejahteraan masyarakat Desa Pangawaren."
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl md:rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden border border-slate-100">
              <CardHeader className="p-6 md:p-8 pb-4">
                <ShieldCheck className="h-8 w-8 text-primary mb-4" />
                <CardTitle className="text-xl md:text-2xl font-black uppercase text-slate-900">Moto Pelayanan</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 pt-0">
                <p className="text-lg md:text-xl font-black text-primary uppercase tracking-tight italic">
                  "MELAYANI DENGAN PRIMA DAN SEPENUH HATI"
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="rounded-3xl md:rounded-[3rem] border-none shadow-sm bg-white p-6 md:p-10 space-y-6">
            <h3 className="text-lg md:text-xl font-black uppercase text-slate-800 border-l-4 border-secondary pl-4">6 Misi Utama Kami</h3>
            <ul className="grid md:grid-cols-2 gap-4">
              {[
                "Memberikan pelayanan publik yang ramah dan sopan.",
                "Menyelesaikan administrasi tepat waktu sesuai standar.",
                "Menerapkan transparansi dalam setiap proses layanan.",
                "Memanfaatkan teknologi informasi untuk efisiensi.",
                "Menyediakan sarana prasarana pendukung yang nyaman.",
                "Merespon setiap keluhan warga secara proaktif."
              ].map((misi, i) => (
                <li key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl text-sm font-medium text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div>
                  {misi}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      );
    case 'maklumat':
      if (hasDocs) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
            {docs.map((docItem) => (
              <Card key={docItem.id} className="rounded-3xl md:rounded-[2.5rem] overflow-hidden border shadow-sm bg-white p-4 md:p-6 max-w-xl mx-auto flex flex-col justify-between">
                <div className="relative aspect-video w-full bg-slate-50 rounded-2xl md:rounded-[2rem] overflow-hidden mb-4 border">
                  <img src={docItem.fileId} alt={docItem.title} className="w-full h-full object-contain" />
                </div>
                <div className="text-center">
                  <h3 className="text-xs md:text-sm font-black uppercase text-slate-800 tracking-tight leading-tight">{docItem.title}</h3>
                </div>
              </Card>
            ))}
          </div>
        );
      }
      return (
        <Card className="rounded-3xl md:rounded-[3rem] border-none shadow-sm bg-white overflow-hidden border-t-8 border-primary">
          <CardContent className="p-6 md:p-12 space-y-8 text-center max-w-3xl mx-auto">
            <ShieldCheck className="h-16 w-16 text-primary mx-auto opacity-20" />
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 font-display italic">Maklumat Pelayanan</h2>
            <div className="space-y-6 text-base md:text-lg font-medium text-slate-700 leading-relaxed italic">
              <p>"Dengan ini, kami menyatakan sanggup menyelenggarakan pelayanan sesuai standar pelayanan yang telah ditetapkan."</p>
              <p>"Apabila tidak menepati janji ini, kami siap menerima sanksi sesuai peraturan perundang-undangan yang berlaku."</p>
            </div>
            <div className="pt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Pemerintah Desa Pangawaren</p>
            </div>
          </CardContent>
        </Card>
      );
    case 'standar':
        return (
          <div className="space-y-8">
            <div className="p-6 md:p-8 bg-amber-50 border-2 border-dashed border-amber-200 rounded-3xl md:rounded-[2.5rem] flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
               <div className="p-4 bg-white rounded-2xl shadow-sm text-amber-600 shrink-0"><Info className="h-8 w-8" /></div>
               <div className="space-y-1">
                  <h3 className="text-lg md:text-xl font-black uppercase text-amber-900">Transparansi Biaya</h3>
                  <p className="text-xs md:text-sm font-medium text-amber-700">Seluruh pelayanan administrasi di Desa Pangawaren adalah <strong>GRATIS (Rp. 0,-)</strong>.</p>
               </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
               {[
                 { title: "KTP Elektronik", time: "1-2 Hari Kerja", req: "KK, KTP Lama (jika ada)" },
                 { title: "Kartu Keluarga", time: "3-5 Hari Kerja", req: "Surat Pengantar, Data Anggota" },
                 { title: "SKTM", time: "Langsung Jadi", req: "KTP, KK, Surat Pengantar RT" },
                 { title: "Pengantar Nikah", time: "1-2 Hari Kerja", req: "KTP, KK, Ijazah, Akta Kelahiran" }
               ].map((item, i) => (
                 <Card key={i} className="rounded-3xl border-none shadow-sm bg-white p-6 md:p-8 space-y-4 group hover:shadow-lg transition-all">
                    <h4 className="text-base md:text-lg font-black uppercase text-primary border-b pb-2 group-hover:text-secondary transition-colors">{item.title}</h4>
                    <div className="flex justify-between items-center text-xs md:text-sm">
                       <span className="text-slate-400 font-bold uppercase text-[9px]">Waktu Layanan</span>
                       <span className="font-black text-slate-700">{item.time}</span>
                    </div>
                    <div className="space-y-1">
                       <span className="text-slate-400 font-bold uppercase text-[9px]">Persyaratan Utama</span>
                       <p className="text-xs font-medium text-slate-500 leading-relaxed">{item.req}</p>
                    </div>
                 </Card>
               ))}
            </div>
          </div>
        );
    case 'ikm':
      return (
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 rounded-3xl md:rounded-[2.5rem] bg-slate-900 text-white p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-4">
             <BarChart className="h-10 w-10 text-secondary" />
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Nilai Akhir IKM</p>
                <h3 className="text-5xl md:text-6xl font-black text-secondary tracking-tighter">85.5</h3>
             </div>
             <Badge className="bg-emerald-500 text-white border-none font-bold px-4 py-1">SANGAT BAIK (A)</Badge>
          </Card>
          <Card className="md:col-span-2 rounded-3xl md:rounded-[2.5rem] bg-white border p-6 md:p-8 flex flex-col justify-center">
             <h4 className="font-black uppercase text-xs md:text-sm mb-4 flex items-center gap-2">
               <Info className="h-4 w-4 text-blue-500" />
               Analisis Kepuasan
             </h4>
             <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
               Berdasarkan hasil survei periode terakhir, tingkat kepuasan masyarakat Desa Pangawaren menunjukkan tren positif terutama pada aspek kesopanan petugas dan kecepatan waktu penyelesaian dokumen.
             </p>
          </Card>
        </div>
      );
    case 'survey':
      return (
        <Card className="rounded-3xl md:rounded-[3rem] border-none shadow-sm bg-emerald-50 p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 border-2 border-emerald-100">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-black uppercase text-emerald-900 font-display italic">Bantu Kami Meningkatkan Layanan</h3>
            <p className="text-xs md:text-sm text-emerald-700/80 font-medium leading-relaxed">Partisipasi Anda dalam mengisi survey kepuasan sangat berarti bagi perbaikan kualitas pelayanan kami di masa depan. Klik tombol di samping untuk mengisi survey melalui Google Form.</p>
          </div>
          <Button size="lg" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase px-8 h-14 shadow-lg shadow-emerald-200 justify-center" asChild>
            <a href="https://sisukma.cilacapkab.go.id/Home/pelayanan/4012310" target="_blank" rel="noopener noreferrer">
              Isi Survey Online <ChevronRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </Card>
      );
    case 'sop':
        return (
          <div className="space-y-8">
             <Card className="rounded-3xl md:rounded-[2.5rem] bg-white border-none shadow-sm p-6 md:p-10 space-y-6 md:space-y-10">
                <div className="text-center space-y-2">
                   <h3 className="text-xl md:text-2xl font-black uppercase text-slate-900 italic font-display">Alur Pengurusan Surat</h3>
                   <p className="text-xs md:text-sm text-slate-500 font-medium">Prosedur standar pengajuan dokumen dari warga hingga tuntas.</p>
                 </div>
                <div className="grid md:grid-cols-4 gap-8 md:gap-4 relative">
                   {[
                     { label: "Pengajuan", desc: "Warga mengajukan lewat portal/datang.", icon: BookOpen },
                     { label: "Verifikasi", desc: "Operator mengecek kelengkapan data.", icon: ShieldCheck },
                     { label: "Tanda Tangan", desc: "Dokumen ditandatangani Kades.", icon: FileText },
                     { label: "Selesai", desc: "Surat siap diambil warga.", icon: CheckCircle2 }
                   ].map((step, i) => (
                     <div key={i} className="flex flex-col items-center text-center space-y-4 relative z-10">
                        <div className="w-16 h-16 rounded-3xl bg-primary text-secondary flex items-center justify-center shadow-lg"><step.icon className="h-8 w-8" /></div>
                        <div className="space-y-1">
                           <h4 className="font-black text-sm uppercase text-slate-800">{i+1}. {step.label}</h4>
                           <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                        </div>
                     </div>
                   ))}
                   <div className="hidden md:block absolute top-8 left-16 right-16 h-0.5 bg-slate-100 -z-0" />
                </div>
             </Card>
          </div>
        );
    case 'pojok-baca':
      if (hasDocs) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {docs.map((docItem) => {
              const cardContent = (
                <Card className="rounded-3xl md:rounded-[2.5rem] overflow-hidden border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white p-4 cursor-pointer group h-full flex flex-col justify-between">
                  <div className="relative aspect-[3/4] w-full bg-slate-50 rounded-2xl md:rounded-[2rem] overflow-hidden mb-4 border">
                    <img src={docItem.fileId} alt={docItem.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-2 md:p-4 text-center">
                    <h3 className="text-sm md:text-base font-black uppercase text-slate-800 tracking-tight leading-tight line-clamp-2">{docItem.title}</h3>
                    {docItem.link && (
                      <p className="text-xs text-primary font-bold mt-2 flex items-center justify-center gap-1">
                        Buka Tautan <ChevronRight className="h-3 w-3" />
                      </p>
                    )}
                  </div>
                </Card>
              );
              
              if (docItem.link) {
                return (
                  <a key={docItem.id} href={docItem.link} target="_blank" rel="noopener noreferrer" className="block h-full">
                    {cardContent}
                  </a>
                );
              }
              return <div key={docItem.id}>{cardContent}</div>;
            })}
          </div>
        );
      }
      return (
        <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-dashed text-center space-y-4">
           <LibraryBig className="h-12 w-12 text-slate-200 mx-auto" />
           <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Belum ada konten Pojok Baca yang tersedia.</p>
        </div>
      );
    default:
      return (
        <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-dashed text-center space-y-4">
           <Info className="h-12 w-12 text-slate-200 mx-auto" />
           <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Pilih kategori di samping untuk melihat detail informasi.</p>
        </div>
      );
  }
}
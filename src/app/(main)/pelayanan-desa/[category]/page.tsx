
'use client';

import { useParams } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { PelayananDoc } from '@/lib/types';
import { PELAYANAN_CATEGORIES, getCategoryLabel } from '@/lib/pelayanan-categories';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Loader2, Info, Star, ShieldCheck, ClipboardCheck, BarChart, BookOpen, Settings, ChevronRight, LibraryBig } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function PelayananCategoryPage() {
  const params = useParams();
  const categoryId = params?.category as string;
  const firestore = useFirestore();

  const docsQuery = useMemoFirebase(() => {
    if (!firestore || !categoryId) return null;
    return query(
      collection(firestore, 'pelayananDocs'),
      where('category', '==', categoryId),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, categoryId]);

  const { data: docs, isLoading } = useCollection<PelayananDoc>(docsQuery);

  const categoryLabel = getCategoryLabel(categoryId);

  const handlePreview = (fileId: string) => {
    window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
  };

  const handleDownload = (fileId: string) => {
    window.open(`https://drive.google.com/uc?export=download&id=${fileId}`, '_blank');
  };

  const renderHeaderContent = () => {
    const hasDocs = docs && docs.length > 0;
    switch (categoryId) {
      case 'visi-misi':
        if (hasDocs) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {docs.map((docItem) => (
                <Card key={docItem.id} className="rounded-[2.5rem] overflow-hidden border shadow-sm bg-white p-6 flex flex-col justify-between">
                  <div className="relative aspect-video w-full bg-slate-55 rounded-[2rem] overflow-hidden mb-4 border">
                    <img src={docItem.fileId} alt={docItem.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-black uppercase text-slate-800 tracking-tight leading-tight">{docItem.title}</h3>
                  </div>
                </Card>
              ))}
            </div>
          );
        }
        return (
          <div className="space-y-8 mb-10">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="rounded-[2rem] border-none shadow-sm bg-primary text-white overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <Star className="h-8 w-8 text-secondary mb-4" />
                  <CardTitle className="text-2xl font-black uppercase italic">Visi Pelayanan</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-xl font-medium leading-relaxed italic">
                    "Terwujudnya pelayanan desa yang cepat, transparan, dan akuntabel demi kesejahteraan masyarakat Desa Sidaurip."
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden border border-slate-100">
                <CardHeader className="p-8 pb-4">
                  <ShieldCheck className="h-8 w-8 text-primary mb-4" />
                  <CardTitle className="text-2xl font-black uppercase text-slate-900">Moto Pelayanan</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-xl font-black text-primary uppercase tracking-tight italic">
                    "MELAYANI DENGAN PRIMA DAN SEPENUH HATI"
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10 space-y-6">
              <h3 className="text-xl font-black uppercase text-slate-800 border-l-4 border-secondary pl-4">6 Misi Pelayanan Kami</h3>
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
                    <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center mb-10">
              {docs.map((docItem) => (
                <Card key={docItem.id} className="rounded-[2.5rem] overflow-hidden border shadow-sm bg-white p-6 max-w-xl mx-auto flex flex-col justify-between">
                  <div className="relative aspect-video w-full bg-slate-55 rounded-[2rem] overflow-hidden mb-4 border">
                    <img src={docItem.fileId} alt={docItem.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-black uppercase text-slate-800 tracking-tight leading-tight">{docItem.title}</h3>
                  </div>
                </Card>
              ))}
            </div>
          );
        }
        return (
          <Card className="rounded-[3rem] border-none shadow-sm bg-white overflow-hidden mb-10 border-t-8 border-primary">
            <CardContent className="p-12 space-y-8 text-center max-w-3xl mx-auto">
              <ClipboardCheck className="h-16 w-16 text-primary mx-auto opacity-20" />
              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 font-display italic">Maklumat Pelayanan</h2>
              <div className="space-y-6 text-lg font-medium text-slate-700 leading-relaxed italic">
                <p>"Dengan ini, kami menyatakan sanggup menyelenggarakan pelayanan sesuai standar pelayanan yang telah ditetapkan."</p>
                <p>"Apabila tidak menepati janji ini, kami siap menerima sanksi sesuai peraturan perundang-undangan yang berlaku."</p>
              </div>
              <div className="pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Pemerintah Desa Sidaurip</p>
              </div>
            </CardContent>
          </Card>
        );
      case 'ikm':
        return (
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <Card className="md:col-span-1 rounded-[2.5rem] bg-slate-900 text-white p-8 flex flex-col items-center justify-center text-center space-y-4">
              <BarChart className="h-10 w-10 text-secondary" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Nilai Akhir IKM</p>
                <h3 className="text-6xl font-black text-secondary tracking-tighter">85.5</h3>
              </div>
              <Badge className="bg-sky-500 text-white border-none font-bold px-4 py-1">SANGAT BAIK (A)</Badge>
            </Card>
            <Card className="md:col-span-2 rounded-[2.5rem] bg-white border p-8 flex flex-col justify-center">
              <h4 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Analisis Kepuasan
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Berdasarkan hasil survei periode terakhir, tingkat kepuasan masyarakat Desa Sidaurip menunjukkan tren positif terutama pada aspek kesopanan petugas and kecepatan waktu penyelesaian dokumen.
              </p>
            </Card>
          </div>
        );
      case 'survey':
        return (
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-sky-50 p-10 mb-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-black uppercase text-sky-900 font-display italic">Bantu Kami Meningkatkan Layanan</h3>
              <p className="text-sky-700/80 font-medium">Partisipasi Anda dalam mengisi survey kepuasan sangat berarti bagi perbaikan kualitas pelayanan kami di masa depan.</p>
            </div>
            <Button size="lg" className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black uppercase px-8 h-14" asChild>
              <a href="https://sisukma.cilacapkab.go.id/Home/pelayanan/4012310" target="_blank" rel="noopener noreferrer">
                Isi Survey Online <ChevronRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </Card>
        );
      case 'pojok-baca':
        if (hasDocs) {
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">
              {docs.map((docItem) => {
                const cardContent = (
                  <Card className="rounded-[2.5rem] overflow-hidden border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white p-4 cursor-pointer group h-full flex flex-col justify-between">
                    <div className="relative aspect-[3/4] w-full bg-slate-50 rounded-[2rem] overflow-hidden mb-4 border">
                      <img src={docItem.fileId} alt={docItem.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-base font-black uppercase text-slate-800 tracking-tight leading-tight line-clamp-2">{docItem.title}</h3>
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
          <div className="bg-white p-10 rounded-[3rem] border border-dashed text-center space-y-4 mb-10">
            <LibraryBig className="h-12 w-12 text-slate-200 mx-auto" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Belum ada konten Pojok Baca yang tersedia.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-[0.3em]">
            <BookOpen className="h-3 w-3" />
            Transparansi Layanan Publik
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter italic font-display">
            {categoryLabel}
          </h1>
        </div>
      </div>

      {renderHeaderContent()}

      {!(categoryId === 'visi-misi' || categoryId === 'maklumat' || categoryId === 'pojok-baca') && (
        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-8 border-b bg-slate-50/50">
            <CardTitle className="text-lg font-black uppercase text-slate-800 flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              Daftar Dokumen Lampiran
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">Klik ikon mata untuk melihat atau tombol unduh untuk menyimpan file.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-100/50">
                  <TableRow>
                    <TableHead className="pl-8 h-12 font-black uppercase text-[10px] tracking-widest text-slate-400">Nama Dokumen</TableHead>
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
                      <TableCell colSpan={3} className="h-32 text-center text-slate-400 font-medium italic">Belum ada dokumen yang tersedia untuk kategori ini.</TableCell>
                    </TableRow>
                  ) : (
                    docs?.map((docItem) => (
                      <TableRow key={docItem.id} className="hover:bg-slate-50 transition-colors group">
                        <TableCell className="pl-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-all">
                              <FileText className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-slate-700 uppercase text-sm">{docItem.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200">PDF Document</Badge>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all" onClick={() => handlePreview(docItem.fileId)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary hover:text-primary transition-all" onClick={() => handleDownload(docItem.fileId)}>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

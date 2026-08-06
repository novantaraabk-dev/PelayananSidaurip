'use client';

import React, { useState, useRef } from 'react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Plus, Trash2, Eye, Download } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as XLSX from 'xlsx';
import { ApbdesData, RealisasiApbdesData, ApbdesItem, ProdukHukumDesa } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const PRODUK_HUKUM_TYPES = [
  { value: 'perdes', label: 'Peraturan Desa (Perdes)' },
  { value: 'perkades', label: 'Peraturan Kepala Desa (Perkades)' },
  { value: 'rpjmdes', label: 'Rencana Pembangunan Jangka Menengah Desa (RPJMDes)' },
  { value: 'rkpdes', label: 'Rencana Kerja Pembangunan Desa (RKPDes)' },
  { value: 'sk_desa', label: 'Surat Keputusan Desa (SK Desa)' },
  { value: 'lppd', label: 'Laporan Pertanggungjawaban Kepala Desa (LPPD)' },
  { value: 'lkpd', label: 'Laporan Keuangan Pemerintah Desa (LKPD)' },
];

// Helper to robustly parse nominal values from Excel rows (numeric or string)
const parseNominal = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  
  let str = String(val).trim();
  str = str.replace(/Rp\s*/i, '');
  
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');
  
  if (hasComma && hasDot) {
    if (str.indexOf(',') < str.indexOf('.')) {
      // US style: 1,500,000.50
      str = str.replace(/,/g, '');
    } else {
      // ID style: 1.500.000,50
      str = str.replace(/\./g, '').replace(',', '.');
    }
  } else if (hasComma) {
    // Only comma. Could be 1,500,000 (US thousand) or 12,5 (ID decimal).
    const parts = str.split(',');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      str = str.replace(/,/g, '');
    } else {
      str = str.replace(',', '.');
    }
  } else if (hasDot) {
    // Only dot. Could be 1.500.000 (ID thousand) or 12.5 (US decimal).
    const parts = str.split('.');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      str = str.replace(/\./g, '');
    }
  }
  
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
};

export default function AdminTataKelolaDesa() {
  const [activeTab, setActiveTab] = useState('apbdes');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
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

  const currentApbdes = allApbdes?.find(d => d.tahun === selectedYear);
  const currentRealisasi = allRealisasi?.find(d => d.tahun === selectedYear);
  const currentProdukHukum = allProdukHukum?.filter(p => p.tahun === selectedYear) || [];

  // Handle Excel Import untuk APBDes
  const handleApbdesImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firestore) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet) as any[];

      const items: ApbdesItem[] = rows.map(row => ({
        bidang: row['Bidang'] || row['bidang'] || '',
        kodeRekening: row['Kode Rekening'] || row['kode rekening'] || row['KodeRekening'] || row['koderekening'] || '',
        kegiatan: row['Kegiatan'] || row['kegiatan'] || '',
        volume: row['Volume'] !== undefined ? row['Volume'] : (row['volume'] !== undefined ? row['volume'] : 0),
        nominal: parseNominal(row['Nominal'] !== undefined ? row['Nominal'] : row['nominal']),
        sumberAnggaran: row['Sumber'] || row['Sumber Anggaran'] || row['sumber'] || row['sumber anggaran'] || '',
      }));

      const totalAnggaran = items.reduce((sum, item) => sum + item.nominal, 0);

      // Hapus data lama jika ada
      if (currentApbdes) {
        await deleteDoc(doc(firestore, 'apbdes', currentApbdes.id));
      }

      // Simpan data baru
      await addDoc(collection(firestore, 'apbdes'), {
        tahun: selectedYear,
        totalAnggaran,
        items,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: 'APBDes berhasil diimpor', description: `${items.length} item diimpor untuk tahun ${selectedYear}` });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast({ title: 'Gagal mengimpor APBDes', description: error.message, variant: 'destructive' });
    }
  };

  // Handle Excel Import untuk Realisasi
  const handleRealisasiImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firestore) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet) as any[];

      const items: ApbdesItem[] = rows.map(row => ({
        bidang: row['Bidang'] || row['bidang'] || '',
        kodeRekening: row['Kode Rekening'] || row['kode rekening'] || row['KodeRekening'] || row['koderekening'] || '',
        kegiatan: row['Kegiatan'] || row['kegiatan'] || '',
        volume: row['Volume'] !== undefined ? row['Volume'] : (row['volume'] !== undefined ? row['volume'] : 0),
        nominal: parseNominal(row['Nominal'] !== undefined ? row['Nominal'] : row['nominal']),
        sumberAnggaran: row['Sumber'] || row['Sumber Anggaran'] || row['sumber'] || row['sumber anggaran'] || '',
      }));

      const totalRealisasi = items.reduce((sum, item) => sum + item.nominal, 0);

      // Hapus data lama jika ada
      if (currentRealisasi) {
        await deleteDoc(doc(firestore, 'realisasiApbdes', currentRealisasi.id));
      }

      // Simpan data baru
      await addDoc(collection(firestore, 'realisasiApbdes'), {
        tahun: selectedYear,
        totalRealisasi,
        items,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: 'Realisasi APBDes berhasil diimpor', description: `${items.length} item diimpor untuk tahun ${selectedYear}` });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast({ title: 'Gagal mengimpor Realisasi', description: error.message, variant: 'destructive' });
    }
  };

  // Handle Delete APBDes
  const handleDeleteApbdes = async () => {
    if (!currentApbdes || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'apbdes', currentApbdes.id));
      toast({ title: 'APBDes dihapus' });
    } catch (error: any) {
      toast({ title: 'Gagal menghapus', description: error.message, variant: 'destructive' });
    }
  };

  // Handle Delete Realisasi
  const handleDeleteRealisasi = async () => {
    if (!currentRealisasi || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'realisasiApbdes', currentRealisasi.id));
      toast({ title: 'Realisasi dihapus' });
    } catch (error: any) {
      toast({ title: 'Gagal menghapus', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <Link href="/admin">
            <Button variant="ghost" className="font-bold gap-2 text-primary">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* JUDUL */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 uppercase">Manajemen Tata Kelola Desa</h1>
          <p className="text-slate-600 mt-2">Kelola APBDes, Realisasi, dan Produk Hukum Desa</p>
        </div>

        {/* TABS */}
        <Tabs defaultValue="apbdes" className="space-y-8" onValueChange={setActiveTab}>
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="apbdes" className="rounded-lg font-bold">APBDes</TabsTrigger>
            <TabsTrigger value="realisasi" className="rounded-lg font-bold">Realisasi APBDes</TabsTrigger>
            <TabsTrigger value="produk" className="rounded-lg font-bold">Produk Hukum Desa</TabsTrigger>
          </TabsList>

          {/* APBDES TAB */}
          <TabsContent value="apbdes" className="space-y-6">
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <Label className="font-bold">Pilih Tahun</Label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-48 rounded-lg border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        Tahun {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg gap-2 font-bold bg-primary hover:bg-slate-800"
              >
                <Upload className="h-4 w-4" />
                Impor Excel
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleApbdesImport}
                className="hidden"
              />

              {currentApbdes && (
                <Button 
                  onClick={handleDeleteApbdes}
                  variant="destructive"
                  className="rounded-lg gap-2 font-bold"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus Data
                </Button>
              )}
            </div>

            {currentApbdes ? (
              <Card className="rounded-2xl border-none shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-xl font-black mb-6 text-slate-900">Data APBDes Tahun {selectedYear}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">Bidang</th>
                          <th className="px-4 py-3 text-left font-bold">Kode Rekening</th>
                          <th className="px-4 py-3 text-left font-bold">Kegiatan</th>
                          <th className="px-4 py-3 text-right font-bold">Volume</th>
                          <th className="px-4 py-3 text-right font-bold">Nominal</th>
                          <th className="px-4 py-3 text-left font-bold">Sumber</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentApbdes.items?.map((item, i) => (
                          <tr key={i} className="border-b hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold">{item.bidang}</td>
                            <td className="px-4 py-3 text-slate-600">{item.kodeRekening}</td>
                            <td className="px-4 py-3 text-slate-600">{item.kegiatan}</td>
                            <td className="px-4 py-3 text-right">{item.volume}</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">Rp {item.nominal.toLocaleString('id-ID')}</td>
                            <td className="px-4 py-3 text-slate-600">{item.sumberAnggaran}</td>
                          </tr>
                        ))}
                        <tr className="bg-primary/5 font-bold">
                          <td colSpan={4} className="px-4 py-3 text-right">Total:</td>
                          <td className="px-4 py-3 text-right text-primary">Rp {currentApbdes.totalAnggaran.toLocaleString('id-ID')}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl border-2 border-dashed border-slate-300 shadow-none">
                <CardContent className="p-12 text-center">
                  <p className="text-slate-600 font-semibold">Belum ada data APBDes untuk tahun {selectedYear}</p>
                  <p className="text-slate-500 text-sm">Klik tombol "Impor Excel" untuk menambahkan data</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* REALISASI TAB */}
          <TabsContent value="realisasi" className="space-y-6">
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <Label className="font-bold">Pilih Tahun</Label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-48 rounded-lg border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        Tahun {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg gap-2 font-bold bg-primary hover:bg-slate-800"
              >
                <Upload className="h-4 w-4" />
                Impor Excel
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleRealisasiImport}
                className="hidden"
              />

              {currentRealisasi && (
                <Button 
                  onClick={handleDeleteRealisasi}
                  variant="destructive"
                  className="rounded-lg gap-2 font-bold"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus Data
                </Button>
              )}
            </div>

            {currentRealisasi ? (
              <Card className="rounded-2xl border-none shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-xl font-black mb-6 text-slate-900">Data Realisasi APBDes Tahun {selectedYear}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">Bidang</th>
                          <th className="px-4 py-3 text-left font-bold">Kode Rekening</th>
                          <th className="px-4 py-3 text-left font-bold">Kegiatan</th>
                          <th className="px-4 py-3 text-right font-bold">Volume</th>
                          <th className="px-4 py-3 text-right font-bold">Realisasi</th>
                          <th className="px-4 py-3 text-left font-bold">Sumber</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRealisasi.items?.map((item, i) => (
                          <tr key={i} className="border-b hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold">{item.bidang}</td>
                            <td className="px-4 py-3 text-slate-600">{item.kodeRekening}</td>
                            <td className="px-4 py-3 text-slate-600">{item.kegiatan}</td>
                            <td className="px-4 py-3 text-right">{item.volume}</td>
                            <td className="px-4 py-3 text-right text-sky-600 font-bold">Rp {item.nominal.toLocaleString('id-ID')}</td>
                            <td className="px-4 py-3 text-slate-600">{item.sumberAnggaran}</td>
                          </tr>
                        ))}
                        <tr className="bg-sky-50 font-bold">
                          <td colSpan={4} className="px-4 py-3 text-right">Total Realisasi:</td>
                          <td className="px-4 py-3 text-right text-sky-600">Rp {currentRealisasi.totalRealisasi.toLocaleString('id-ID')}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl border-2 border-dashed border-slate-300 shadow-none">
                <CardContent className="p-12 text-center">
                  <p className="text-slate-600 font-semibold">Belum ada data Realisasi untuk tahun {selectedYear}</p>
                  <p className="text-slate-500 text-sm">Klik tombol "Impor Excel" untuk menambahkan data</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* PRODUK HUKUM TAB */}
          <TabsContent value="produk" className="space-y-6">
            <AdminProdukHukumTab produkHukumList={allProdukHukum} isLoading={isLoadingProduk} firestore={firestore} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Component untuk Produk Hukum Tab
function AdminProdukHukumTab({ produkHukumList, isLoading, firestore }: any) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    jenis: 'perdes',
    tahun: new Date().getFullYear(),
    nama: '',
    nomor: '',
    driveLink: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    if (!formData.nama || !formData.nomor) {
      toast({ title: 'Gagal', description: 'Nama dan Nomor harus diisi', variant: 'destructive' });
      return;
    }

    try {
      await addDoc(collection(firestore, 'produkHukumDesa'), {
        ...formData,
        jenis: formData.jenis as any,
        tahun: parseInt(formData.tahun.toString()),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: 'Produk Hukum ditambahkan' });
      setFormData({ jenis: 'perdes', tahun: new Date().getFullYear(), nama: '', nomor: '', driveLink: '' });
    } catch (error: any) {
      toast({ title: 'Gagal menambahkan', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form */}
      <Card className="lg:col-span-1 rounded-2xl border-none shadow-lg">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-lg font-black text-slate-900">Tambah Produk Hukum</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="font-bold text-xs">Jenis Produk</Label>
              <Select value={formData.jenis} onValueChange={(v) => setFormData({...formData, jenis: v})}>
                <SelectTrigger className="rounded-lg border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUK_HUKUM_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-bold text-xs">Tahun</Label>
              <Select value={formData.tahun.toString()} onValueChange={(v) => setFormData({...formData, tahun: parseInt(v)})}>
                <SelectTrigger className="rounded-lg border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-bold text-xs">Nama Produk</Label>
              <Input
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                placeholder="Nama lengkap produk hukum"
                className="rounded-lg border-slate-300"
                required
              />
            </div>

            <div>
              <Label className="font-bold text-xs">Nomor</Label>
              <Input
                value={formData.nomor}
                onChange={(e) => setFormData({...formData, nomor: e.target.value})}
                placeholder="e.g. 1/2026"
                className="rounded-lg border-slate-300"
                required
              />
            </div>

            <div>
              <Label className="font-bold text-xs">Link Google Drive (Optional)</Label>
              <Input
                value={formData.driveLink}
                onChange={(e) => setFormData({...formData, driveLink: e.target.value})}
                placeholder="https://drive.google.com/..."
                className="rounded-lg border-slate-300"
                type="url"
              />
            </div>

            <Button type="submit" className="w-full rounded-lg font-bold bg-primary hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-2" />
              Tambahkan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-lg font-black text-slate-900">Daftar Produk Hukum</h3>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : produkHukumList?.length === 0 ? (
          <Card className="rounded-2xl border-2 border-dashed border-slate-300 shadow-none">
            <CardContent className="p-12 text-center">
              <p className="text-slate-600 font-semibold">Belum ada produk hukum</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {produkHukumList?.map((produk: any) => (
              <Card key={produk.id} className="rounded-xl border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-black bg-primary/10 text-primary px-2 py-1 rounded">{produk.jenis.toUpperCase()}</span>
                        <span className="text-xs text-slate-500 font-bold">{produk.tahun}</span>
                      </div>
                      <p className="font-bold text-slate-900 line-clamp-1">{produk.nama}</p>
                      <p className="text-sm text-slate-600">Nomor: {produk.nomor}</p>
                    </div>
                    {produk.driveLink && (
                      <a href={produk.driveLink} target="_blank" rel="noopener noreferrer" className="ml-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

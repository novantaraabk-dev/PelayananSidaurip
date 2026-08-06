'use client';

import React, { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Landmark,
  PlusCircle,
  Trash2,
  Edit,
  Loader2,
  ImageIcon,
  Compass,
  FileText
} from 'lucide-react';
import { PotensiDesa } from '@/lib/types';
import { PotensiForm, POTENSI_CATEGORIES } from './_components/potensi-form';

export default function AdminPotensiDesa() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPotensi, setEditingPotensi] = useState<PotensiDesa | null>(null);

  // Fetch potentials ordered by newest
  const potentialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'potensiDesa'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: potentials, isLoading } = useCollection<PotensiDesa>(potentialsQuery);

  const handleEdit = (item: PotensiDesa) => {
    setEditingPotensi(item);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingPotensi(null);
    setFormOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!firestore) return;
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data Potensi Desa "${title}"?`)) return;

    try {
      await deleteDoc(doc(firestore, 'potensiDesa', id));
      toast({
        title: 'Berhasil Dihapus',
        description: `Potensi Desa "${title}" berhasil dihapus dari sistem.`,
      });
    } catch (error: any) {
      toast({
        title: 'Gagal Menghapus',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getCategoryLabel = (catId: string) => {
    const found = POTENSI_CATEGORIES.find(c => c.id === catId);
    return found ? found.label : catId;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
            <Landmark className="h-6 w-6 text-sky-600 animate-pulse" />
            <span>Kelola Potensi Desa</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Manajemen informasi potensi unggulan, industri kreatif, pariwisata, dan BUMDes Sidaurip
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="rounded-full h-11 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs uppercase tracking-wider px-6 shrink-0 shadow-lg shadow-sky-700/10 flex items-center gap-2"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Tambah Potensi</span>
        </Button>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-sky-600 mb-3" />
          <p className="text-xs text-slate-450 uppercase font-black tracking-widest">Memuat data potensi desa...</p>
        </div>
      ) : !potentials || potentials.length === 0 ? (
        <Card className="border border-dashed border-slate-300 rounded-[3rem] bg-slate-50/50 p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-14 w-14 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <Compass className="h-7 w-7" />
            </div>
            <h3 className="text-slate-700 font-extrabold text-sm uppercase tracking-wider">Belum Ada Data Potensi</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Data potensi desa belum ditambahkan. Klik tombol "Tambah Potensi" di atas untuk menambahkan potensi unggulan Desa Sidaurip.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {potentials.map((item) => (
            <Card key={item.id} className="border border-slate-100 rounded-[2.5rem] bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col">
              {/* Thumbnail Slider Preview */}
              <div className="relative aspect-[16/9] w-full bg-slate-50 border-b overflow-hidden">
                {item.imageUrls && item.imageUrls.length > 0 ? (
                  <img
                    src={item.imageUrls[0]}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <ImageIcon className="h-10 w-10 text-slate-300" />
                  </div>
                )}

                {/* Count badge for photos */}
                {item.imageUrls && item.imageUrls.length > 1 && (
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                    +{item.imageUrls.length - 1} Foto
                  </div>
                )}

                {/* Sub category badge */}
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-sky-700/90 text-white border-none rounded-full font-bold text-[9px] uppercase tracking-wider px-3 py-1 shadow-md">
                    {getCategoryLabel(item.category)}
                  </Badge>
                </div>
              </div>

              {/* Card Content */}
              <CardContent className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tight font-display line-clamp-1 leading-tight group-hover:text-sky-750 transition-colors">
                      {item.title}
                    </h2>
                    {item.subtitle && (
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide line-clamp-1">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  <p className="text-slate-500 font-medium text-xs leading-relaxed line-clamp-3">
                    {item.narrative}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50 mt-6 shrink-0">
                  <Button
                    onClick={() => handleEdit(item)}
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id, item.title)}
                    variant="destructive"
                    size="sm"
                    className="h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-rose-600/5 hover:bg-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <PotensiForm
        open={formOpen}
        onOpenChange={setFormOpen}
        potensi={editingPotensi}
      />
    </div>
  );
}

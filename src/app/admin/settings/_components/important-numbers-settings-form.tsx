'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Phone, Plus, Trash2, Shield, Heart, Landmark, Users } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { ImportantNumberContact, ImportantNumbersData } from '@/lib/types';

const defaultContacts: ImportantNumberContact[] = [
  { id: '1', label: 'Kepala Desa', number: '082324502378', category: 'pemerintah' },
  { id: '2', label: 'Babinsa', number: '081282148178', category: 'keamanan' },
  { id: '3', label: 'Bhabinkamtibmas', number: '085229658988', category: 'keamanan' },
  { id: '4', label: 'Bidan Desa', number: '081226370112', category: 'kesehatan' },
  { id: '5', label: 'Camat Gandrungmangu', number: '08122727683', category: 'pemerintah' },
  { id: '6', label: 'Koramil Gandrungmangu', number: '085229658988', category: 'keamanan' },
  { id: '7', label: 'Polsek Gandrungmangu', number: '083867770110', category: 'keamanan' },
  { id: '8', label: 'Puskesmas Karangpucung', number: '082234577980', category: 'kesehatan' },
  { id: '9', label: 'Kadus 1', number: '082138337494', category: 'wilayah' },
  { id: '10', label: 'Kadus 2', number: '085282256678', category: 'wilayah' },
  { id: '11', label: 'Kadus 3', number: '083113339132', category: 'wilayah' },
];

export function ImportantNumbersSettingsForm() {
  const [contacts, setContacts] = useState<ImportantNumberContact[]>([]);
  const [servicePhoneNumber, setServicePhoneNumber] = useState('085111318412');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const numbersRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'importantNumbers');
  }, [firestore]);

  const { data: numbersData, isLoading: isDataLoading } = useDoc<ImportantNumbersData>(numbersRef);

  useEffect(() => {
    if (numbersData) {
      if (numbersData.contacts && numbersData.contacts.length > 0) {
        setContacts(numbersData.contacts);
      } else {
        setContacts(defaultContacts);
      }
      if (numbersData.servicePhoneNumber) {
        setServicePhoneNumber(numbersData.servicePhoneNumber);
      }
    } else if (!isDataLoading) {
      setContacts(defaultContacts);
    }
  }, [numbersData, isDataLoading]);

  const handleContactChange = (index: number, field: keyof ImportantNumberContact, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const handleAddContact = () => {
    const newId = Date.now().toString();
    setContacts([
      ...contacts,
      { id: newId, label: 'Jabatan / Nama Kontak Baru', number: '08...', category: 'pemerintah' }
    ]);
  };

  const handleDeleteContact = (index: number) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !numbersRef) return;
    setIsSaving(true);

    try {
      await setDoc(
        numbersRef,
        {
          contacts,
          servicePhoneNumber,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      toast({
        title: 'Nomor Penting Disimpan',
        description: 'Seluruh nomor penting dan nomor pelayanan desa berhasil diperbarui.'
      });
    } catch (error) {
      console.error('Error saving important numbers:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan nomor penting.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isDataLoading) {
    return <Skeleton className="h-[400px] w-full rounded-2xl" />;
  }

  return (
    <Card className="shadow-lg border border-slate-200 rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Phone className="h-5 w-5 text-primary" />
          Pengaturan Nomor Penting & Pelayanan
        </CardTitle>
        <CardDescription>
          Kelola daftar nomor telepon darurat, perangkat desa, instansi, serta nomor pelayanan utama publik.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Service Phone Number */}
          <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-3">
            <Label htmlFor="service-phone" className="font-bold text-slate-800 flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Nomor Utama Pelayanan Desa Sidaurip
            </Label>
            <Input
              id="service-phone"
              type="text"
              placeholder="Contoh: 0851 1131 8412"
              value={servicePhoneNumber}
              onChange={(e) => setServicePhoneNumber(e.target.value)}
              disabled={isSaving}
              className="bg-white font-mono font-bold"
            />
            <p className="text-xs text-slate-500 font-medium">
              Nomor ini akan ditampilkan di kartu banner panggilan utama halaman publik /nomor-penting.
            </p>
          </div>

          {/* List of Contact Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Daftar Kontak Nomor Penting ({contacts.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Ubah nama instansi/jabatan, nomor HP/telepon, dan kategori kelompok kontak.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddContact}
                disabled={isSaving}
                className="rounded-xl gap-2 font-bold text-xs border-primary text-primary hover:bg-primary/5"
              >
                <Plus className="h-4 w-4" />
                Tambah Nomor
              </Button>
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {contacts.map((contact, index) => (
                <div
                  key={contact.id || index}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3 transition-all hover:border-sky-300"
                >
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Label Kontak</Label>
                    <Input
                      type="text"
                      placeholder="Nama Jabatan / Kontak"
                      value={contact.label}
                      onChange={(e) => handleContactChange(index, 'label', e.target.value)}
                      disabled={isSaving}
                      className="h-10 text-sm font-bold"
                    />
                  </div>

                  <div className="w-full md:w-48 space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Nomor Telepon/WA</Label>
                    <Input
                      type="text"
                      placeholder="08..."
                      value={contact.number}
                      onChange={(e) => handleContactChange(index, 'number', e.target.value)}
                      disabled={isSaving}
                      className="h-10 text-sm font-mono font-bold"
                    />
                  </div>

                  <div className="w-full md:w-48 space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Kategori</Label>
                    <Select
                      value={contact.category}
                      onValueChange={(val: any) => handleContactChange(index, 'category', val)}
                      disabled={isSaving}
                    >
                      <SelectTrigger className="h-10 text-xs font-bold">
                        <SelectValue placeholder="Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pemerintah">Pemerintahan</SelectItem>
                        <SelectItem value="keamanan">Keamanan & Ketertiban</SelectItem>
                        <SelectItem value="kesehatan">Kesehatan</SelectItem>
                        <SelectItem value="wilayah">Kepala Dusun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end justify-end md:self-end pb-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteContact(index)}
                      disabled={isSaving}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl h-10 w-10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="w-full md:w-auto h-12 px-8 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-sky-800"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Nomor Penting
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, FolderGit, ShieldAlert } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { antiKorupsiData } from '@/lib/desa-anti-korupsi-data';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Helper to extract Google Drive folder ID
function extractFolderId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  const id = match ? match[1] : trimmed;
  return id.split('?')[0].split('#')[0];
}

export function DesaAntiKorupsiDriveForm() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSaving, setIsSaving] = useState(false);

  // Key-value store: { [subMenuId]: folderId }
  const [folderMappings, setFolderMappings] = useState<Record<string, string>>({});

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'driveSettings', 'desaAntiKorupsi');
  }, [firestore]);

  const { data: currentSettings, isLoading } = useDoc<any>(settingsRef);

  useEffect(() => {
    if (currentSettings) {
      setFolderMappings(currentSettings.mappings || {});
    }
  }, [currentSettings]);

  const handleInputChange = (subMenuId: string, value: string) => {
    setFolderMappings((prev) => ({
      ...prev,
      [subMenuId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !settingsRef) return;
    setIsSaving(true);

    try {
      // Clean all inputs to store only the Google Drive folder IDs
      const cleanedMappings: Record<string, string> = {};
      Object.entries(folderMappings).forEach(([key, val]) => {
        if (val) {
          cleanedMappings[key] = extractFolderId(val);
        }
      });

      await setDoc(settingsRef, {
        mappings: cleanedMappings,
        updatedAt: new Date(),
      }, { merge: true });

      // Update the local state with cleaned IDs
      setFolderMappings(cleanedMappings);

      toast({
        title: "Pengaturan Tersimpan",
        description: "Folder Google Drive untuk masing-masing sub-menu telah diperbarui.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Gagal Menyimpan",
        description: error.message || "Terjadi kesalahan saat menyimpan pengaturan.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  return (
    <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white col-span-2">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <FolderGit className="h-5 w-5 text-sky-600" />
          Folder Google Drive per Sub-Menu Desa Anti Korupsi
        </CardTitle>
        <CardDescription className="text-xs">
          Petakan sub-menu anti korupsi ke folder Google Drive spesifik agar berkas yang diunggah otomatis masuk ke folder tersebut. Jika dikosongkan, unggahan akan masuk ke Folder Utama (Root) default.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Accordion type="single" collapsible className="space-y-3 w-full">
            {antiKorupsiData.map((pilar) => (
              <AccordionItem
                key={pilar.id}
                value={`pilar-${pilar.id}`}
                className="border border-slate-200 rounded-2xl overflow-hidden px-4 md:px-6 bg-slate-50/50 transition-all duration-300 hover:border-slate-350"
              >
                <AccordionTrigger className="hover:no-underline py-4 text-left font-bold text-slate-800 text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="bg-sky-100 text-sky-800 rounded px-2 py-0.5 text-[10px] font-bold">
                      PILAR {pilar.id}
                    </span>
                    <span>{pilar.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2 border-t border-slate-200/60 bg-white -mx-6 px-6 space-y-5">
                  {pilar.subMenus.map((subMenu) => (
                    <div key={subMenu.id} className="space-y-3 p-4 rounded-2xl border border-slate-200/50 bg-slate-50/50">
                      <div className="flex items-start gap-2 border-b border-slate-200/80 pb-2">
                        <span className="font-mono text-sky-600 font-bold bg-sky-100/80 px-1.5 py-0.5 rounded text-[10px] shrink-0 mt-0.5">
                          {subMenu.id}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 leading-relaxed">
                          {subMenu.title}
                        </h4>
                      </div>
                      <div className="space-y-3.5 pl-1.5 pt-1">
                        {subMenu.items.map((item) => (
                          <div key={item.id} className="space-y-1.5">
                            <Label htmlFor={`folder-${item.id}`} className="text-[11px] font-bold text-slate-700 leading-relaxed block">
                              <span className="font-mono text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded text-[9px] mr-1.5">
                                {item.id}
                              </span>
                              {item.title}
                            </Label>
                            <Input
                              id={`folder-${item.id}`}
                              placeholder="Tempelkan link folder Google Drive untuk rincian ini..."
                              value={folderMappings[item.id] || ''}
                              onChange={(e) => handleInputChange(item.id, e.target.value)}
                              disabled={isSaving}
                              className="rounded-xl border-slate-200 bg-white focus-visible:ring-sky-500 text-xs h-9"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <Button 
              type="submit" 
              disabled={isSaving}
              className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold uppercase tracking-wider text-xs px-6 h-10 shadow-lg shadow-sky-600/10"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan Folder Sub-Menu
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Cloud, FolderKey } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { DriveSettingsInfo } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Extracts a Google Drive folder ID from a full URL or returns the raw ID.
 * Supports formats like:
 * - https://drive.google.com/drive/folders/1abc123xyz
 * - https://drive.google.com/drive/folders/1abc123xyz?usp=sharing
 * - https://drive.google.com/drive/u/0/folders/1abc123xyz?hl=ID
 * - 1abc123xyz (raw ID)
 * - 1abc123xyz?hl=ID (raw ID with query params)
 */
function extractFolderId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  // Match folder ID from various Google Drive URL patterns
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  const id = match ? match[1] : trimmed;
  // Strip query parameters like ?hl=ID or ?usp=sharing
  return id.split('?')[0].split('#')[0];
}

export function DriveSettingsForm() {
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [rootFolderId, setRootFolderId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const driveRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'driveSettings', 'default');
  }, [firestore]);

  const { data: driveData, isLoading } = useDoc<DriveSettingsInfo>(driveRef);

  useEffect(() => {
    if (driveData) {
      setGoogleDriveLink(driveData.googleDriveLink || '');
      setAppsScriptUrl(driveData.appsScriptUrl || '');
      setRootFolderId(driveData.rootFolderId || '');
    }
  }, [driveData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !driveRef) return;
    setIsSaving(true);

    try {
      const cleanRootFolderId = extractFolderId(rootFolderId);
      await setDoc(driveRef, { 
        googleDriveLink, 
        appsScriptUrl: appsScriptUrl.trim(),
        rootFolderId: cleanRootFolderId
      }, { merge: true });
      // Update local state with the cleaned ID
      setRootFolderId(cleanRootFolderId);
      
      toast({
        title: "Pengaturan Tersimpan",
        description: "Konfigurasi Google Drive telah diperbarui.",
      });
    } catch (error: any) {
      toast({
        title: "Gagal Menyimpan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          Konfigurasi Google Drive
        </CardTitle>
        <CardDescription>
          Atur lokasi penyimpanan berkas lampiran pengajuan surat secara dinamis.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="drive-link" className="text-sm font-semibold">
              Link Folder Google Drive (Arsip)
            </Label>
            <Input
              id="drive-link"
              placeholder="https://drive.google.com/drive/folders/..."
              value={googleDriveLink}
              onChange={(e) => setGoogleDriveLink(e.target.value)}
              disabled={isSaving}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Pintasan folder Drive dari panel admin.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="root-id" className="flex items-center gap-1.5 text-sm font-semibold">
              <FolderKey className="h-4 w-4 text-muted-foreground shrink-0" />
              ID Folder Utama (ROOT_FOLDER_ID)
            </Label>
            <Input
              id="root-id"
              placeholder="Contoh: 1h7bN7GMASbXOgOhxjMHXEkxR-yg5p0iq"
              value={rootFolderId}
              onChange={(e) => setRootFolderId(e.target.value)}
              disabled={isSaving}
              className="font-mono text-xs w-full"
            />
            <p className="text-xs text-muted-foreground">
              ID folder tempat sistem membuat folder per-pengajuan.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="script-url" className="text-sm font-semibold">
              Apps Script Web App URL
            </Label>
            <Input
              id="script-url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={appsScriptUrl}
              onChange={(e) => setAppsScriptUrl(e.target.value)}
              disabled={isSaving}
              className="w-full text-xs"
            />
            <p className="text-xs text-muted-foreground">
              URL endpoint Web App dari Google Apps Script.
            </p>
          </div>

          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto mt-2">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Konfigurasi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

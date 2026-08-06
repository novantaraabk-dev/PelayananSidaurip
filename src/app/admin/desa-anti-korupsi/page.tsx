'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { antiKorupsiData, AntiKorupsiItem } from '@/lib/desa-anti-korupsi-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  Loader2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface DriveSettingsInfo {
  appsScriptUrl?: string;
  rootFolderId?: string;
}

interface DBItemData {
  itemId: string;
  pdfUrl?: string;
  pdfName?: string;
  imageUrl?: string;
  imageName?: string;
  pdfs?: Array<{ url: string; name: string }>;
  images?: Array<{ url: string; name: string }>;
  tahunData?: {
    [tahun: string]: {
      pdfs?: Array<{ url: string; name: string }>;
      images?: Array<{ url: string; name: string }>;
    };
  };
  updatedAt?: any;
}

// Clean folder ID helper
function extractFolderId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  const id = match ? match[1] : trimmed;
  return id.split('?')[0].split('#')[0];
}

// Extract Google Drive File ID helper
const extractFileIdFromUrl = (url: string): string => {
  if (!url) return '';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
  return idMatch ? idMatch[1] : url;
};

// File base64 helper
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function AdminDesaAntiKorupsi() {
  const { toast } = useToast();
  const firestore = useFirestore();

  // Selection States
  const [selectedPilarId, setSelectedPilarId] = useState<string>('');
  const [selectedSubMenuId, setSelectedSubMenuId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedSubTahun, setSelectedSubTahun] = useState<string>('semua');

  // Selected Item Details
  const [currentItem, setCurrentItem] = useState<AntiKorupsiItem | null>(null);

  // Firestore DB status for selected item
  const [dbData, setDbData] = useState<DBItemData | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Upload States
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Manual Link States
  const [manualPdfUrl, setManualPdfUrl] = useState('');
  const [manualPdfName, setManualPdfName] = useState('');
  const [isManualPdfSaving, setIsManualPdfSaving] = useState(false);

  const [manualImageUrl, setManualImageUrl] = useState('');
  const [manualImageName, setManualImageName] = useState('');
  const [isManualImageSaving, setIsManualImageSaving] = useState(false);

  // Input Mode Toggle States
  const [pdfInputMode, setPdfInputMode] = useState<'upload' | 'link'>('upload');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'link'>('upload');

  // Drive configurations
  const [driveConfig, setDriveConfig] = useState<DriveSettingsInfo | null>(null);
  const [subFolderMappings, setSubFolderMappings] = useState<Record<string, string>>({});

  // Get matching sub menus for selected pilar
  const currentPilar = useMemo(() => {
    return antiKorupsiData.find(p => p.id === selectedPilarId) || null;
  }, [selectedPilarId]);

  // Get matching items for selected sub menu
  const currentSubMenu = useMemo(() => {
    if (!currentPilar) return null;
    return currentPilar.subMenus.find(s => s.id === selectedSubMenuId) || null;
  }, [currentPilar, selectedSubMenuId]);

  // Reset dropdowns when parent resets
  useEffect(() => {
    setSelectedSubMenuId('');
    setSelectedItemId('');
    setCurrentItem(null);
    setDbData(null);
  }, [selectedPilarId]);

  useEffect(() => {
    setSelectedItemId('');
    setCurrentItem(null);
    setDbData(null);
  }, [selectedSubMenuId]);

  // Load current item data & details when selected item changes
  useEffect(() => {
    if (!selectedItemId || !currentSubMenu) {
      setCurrentItem(null);
      setDbData(null);
      return;
    }
    const item = currentSubMenu.items.find(i => i.id === selectedItemId) || null;
    setCurrentItem(item);

    if (item && firestore) {
      fetchItemData(item.id);
    }
  }, [selectedItemId, currentSubMenu, firestore]);

  // Pre-fill manual link document names when currentItem changes
  useEffect(() => {
    if (currentItem) {
      setManualPdfName(currentItem.title);
      setManualImageName(currentItem.title);
    } else {
      setManualPdfName('');
      setManualImageName('');
    }
  }, [currentItem]);

  // Fetch Drive settings from firestore
  useEffect(() => {
    async function loadDriveConfig() {
      if (!firestore) return;
      try {
        const driveRef = doc(firestore, 'driveSettings', 'default');
        const driveSnap = await getDoc(driveRef);
        if (driveSnap.exists()) {
          setDriveConfig(driveSnap.data() as DriveSettingsInfo);
        }

        const subRef = doc(firestore, 'driveSettings', 'desaAntiKorupsi');
        const subSnap = await getDoc(subRef);
        if (subSnap.exists()) {
          setSubFolderMappings(subSnap.data().mappings || {});
        }
      } catch (error) {
        console.error('Gagal mengambil pengaturan Drive:', error);
      }
    }
    loadDriveConfig();
  }, [firestore]);

  // Fetch item data from firestore
  const fetchItemData = async (itemId: string) => {
    if (!firestore) return;
    setIsDataLoading(true);
    try {
      const docRef = doc(firestore, 'desaAntiKorupsi', itemId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDbData(docSnap.data() as DBItemData);
      } else {
        setDbData(null);
      }
    } catch (error) {
      console.error('Error fetching document data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Image compression utility
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl !== 'string') {
          reject(new Error('Gagal membaca file gambar.'));
          return;
        }

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDimension = 1600;
          let { width, height } = img;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Tidak dapat memproses gambar.'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          const tryCompress = (quality: number, attempt: number) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Gagal mengompresi gambar.'));
                  return;
                }

                const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });

                if (compressedFile.size > 700 * 1024 && attempt < 4) {
                  tryCompress(Math.max(0.55, quality - 0.15), attempt + 1);
                } else {
                  resolve(compressedFile);
                }
              },
              'image/jpeg',
              quality
            );
          };

          tryCompress(0.9, 1);
        };
        img.onerror = () => reject(new Error('Gambar tidak valid.'));
        img.src = dataUrl;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Generic Google Drive file uploader via Apps Script URL
  const uploadToDrive = async (file: File, suffix: string): Promise<{ url: string; name: string }> => {
    if (!currentItem || !firestore) throw new Error('Data item belum lengkap.');

    const appsScriptUrl = (driveConfig?.appsScriptUrl || '').trim();
    // Retrieve custom sub folder ID, fallback to root folder ID
    const targetFolderId = subFolderMappings[selectedItemId] || subFolderMappings[selectedSubMenuId] || extractFolderId(driveConfig?.rootFolderId || '');

    if (!appsScriptUrl || !targetFolderId) {
      throw new Error('URL Apps Script atau Folder ID Google Drive belum terkonfigurasi di Pengaturan.');
    }

    const base64Data = await convertFileToBase64(file);
    const payload = {
      rootFolderId: targetFolderId,
      folderName: "",
      letterType: "",
      requesterName: "",
      files: [{
        base64Data,
        mimeType: file.type,
        targetFileName: `${currentItem.id}_${currentItem.title.replace(/\s+/g, '_')}_${suffix}`.toUpperCase(),
      }]
    };

    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
    });

    const resultText = await response.text();
    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      throw new Error("Respons dari Apps Script tidak valid.");
    }

    if (result.status !== 'success') {
      throw new Error(result.message || 'Gagal mengunggah berkas ke Google Drive.');
    }

    const fileId = result.files[0].fileId;
    return {
      url: `https://drive.google.com/file/d/${fileId}/view`,
      name: file.name
    };
  };

  // Helper lists for multiple files view for selected sub-tahun
  const pdfList = useMemo(() => {
    if (!dbData) return [];

    const results: Array<{ url: string; name: string; tahun: string }> = [];

    if (dbData.tahunData) {
      ['2024', '2025', '2026'].forEach(yr => {
        const items = dbData.tahunData?.[yr]?.pdfs || [];
        items.forEach(p => {
          results.push({ ...p, tahun: yr });
        });
      });
    }

    if (results.length === 0) {
      const topPdfs = dbData.pdfs || (dbData.pdfUrl ? [{ url: dbData.pdfUrl, name: dbData.pdfName || 'Dokumen PDF' }] : []);
      topPdfs.forEach(p => {
        let yr = '2026';
        if (p.name?.includes('2024')) yr = '2024';
        else if (p.name?.includes('2025')) yr = '2025';
        else if (p.name?.includes('2026')) yr = '2026';
        results.push({ ...p, tahun: yr });
      });
    }

    if (selectedSubTahun !== 'semua') {
      return results.filter(item => item.tahun === selectedSubTahun);
    }

    return results;
  }, [dbData, selectedSubTahun]);

  const imageList = useMemo(() => {
    if (!dbData) return [];

    const results: Array<{ url: string; name: string; tahun: string }> = [];

    if (dbData.tahunData) {
      ['2024', '2025', '2026'].forEach(yr => {
        const items = dbData.tahunData?.[yr]?.images || [];
        items.forEach(img => {
          results.push({ ...img, tahun: yr });
        });
      });
    }

    if (results.length === 0) {
      const topImages = dbData.images || (dbData.imageUrl ? [{ url: dbData.imageUrl, name: dbData.imageName || 'Gambar Dukung' }] : []);
      topImages.forEach(img => {
        let yr = '2026';
        if (img.name?.includes('2024')) yr = '2024';
        else if (img.name?.includes('2025')) yr = '2025';
        else if (img.name?.includes('2026')) yr = '2026';
        results.push({ ...img, tahun: yr });
      });
    }

    if (selectedSubTahun !== 'semua') {
      return results.filter(item => item.tahun === selectedSubTahun);
    }

    return results;
  }, [dbData, selectedSubTahun]);

  // Update year for a specific PDF item
  const handleUpdatePdfYear = async (targetPdf: { url: string; name: string; tahun: string }, newYear: string) => {
    if (!currentItem || !firestore || !dbData) return;

    try {
      let allPdfs: Array<{ url: string; name: string; tahun: string }> = [];
      if (dbData.tahunData) {
        ['2024', '2025', '2026'].forEach(yr => {
          (dbData.tahunData?.[yr]?.pdfs || []).forEach(p => {
            allPdfs.push({ ...p, tahun: yr });
          });
        });
      }
      if (allPdfs.length === 0) {
        const topPdfs = dbData.pdfs || (dbData.pdfUrl ? [{ url: dbData.pdfUrl, name: dbData.pdfName || 'Dokumen PDF' }] : []);
        topPdfs.forEach(p => {
          let yr = '2026';
          if (p.name?.includes('2024')) yr = '2024';
          else if (p.name?.includes('2025')) yr = '2025';
          else if (p.name?.includes('2026')) yr = '2026';
          allPdfs.push({ ...p, tahun: yr });
        });
      }

      const updatedAllPdfs = allPdfs.map(p => {
        if (p.url === targetPdf.url && p.name === targetPdf.name) {
          return { ...p, tahun: newYear };
        }
        return p;
      });

      const newTahunData: any = {};
      ['2024', '2025', '2026'].forEach(yr => {
        const yearPdfs = updatedAllPdfs.filter(p => p.tahun === yr).map(({ url, name }) => ({ url, name }));
        const existingImages = dbData.tahunData?.[yr]?.images || (yr === '2026' ? (dbData.images || []) : []);
        newTahunData[yr] = {
          pdfs: yearPdfs,
          images: existingImages
        };
      });

      const docRef = doc(firestore, 'desaAntiKorupsi', currentItem.id);
      const updatePayload: any = {
        itemId: currentItem.id,
        tahunData: newTahunData,
        updatedAt: serverTimestamp()
      };

      const pdfs2026 = newTahunData['2026']?.pdfs || [];
      updatePayload.pdfs = pdfs2026;
      updatePayload.pdfUrl = pdfs2026.length > 0 ? pdfs2026[0].url : null;
      updatePayload.pdfName = pdfs2026.length > 0 ? pdfs2026[0].name : null;

      await setDoc(docRef, updatePayload, { merge: true });

      toast({
        title: 'Tahun PDF Berhasil Diubah',
        description: `Dokumen "${targetPdf.name}" dipindahkan ke Tahun ${newYear}.`,
      });

      fetchItemData(currentItem.id);
    } catch (error: any) {
      toast({ title: 'Gagal Mengubah Tahun', description: error.message, variant: 'destructive' });
    }
  };

  // Update year for a specific Image item
  const handleUpdateImageYear = async (targetImg: { url: string; name: string; tahun: string }, newYear: string) => {
    if (!currentItem || !firestore || !dbData) return;

    try {
      let allImages: Array<{ url: string; name: string; tahun: string }> = [];
      if (dbData.tahunData) {
        ['2024', '2025', '2026'].forEach(yr => {
          (dbData.tahunData?.[yr]?.images || []).forEach(img => {
            allImages.push({ ...img, tahun: yr });
          });
        });
      }
      if (allImages.length === 0) {
        const topImages = dbData.images || (dbData.imageUrl ? [{ url: dbData.imageUrl, name: dbData.imageName || 'Gambar Dukung' }] : []);
        topImages.forEach(img => {
          let yr = '2026';
          if (img.name?.includes('2024')) yr = '2024';
          else if (img.name?.includes('2025')) yr = '2025';
          else if (img.name?.includes('2026')) yr = '2026';
          allImages.push({ ...img, tahun: yr });
        });
      }

      const updatedAllImages = allImages.map(img => {
        if (img.url === targetImg.url && img.name === targetImg.name) {
          return { ...img, tahun: newYear };
        }
        return img;
      });

      const newTahunData: any = {};
      ['2024', '2025', '2026'].forEach(yr => {
        const yearImages = updatedAllImages.filter(img => img.tahun === yr).map(({ url, name }) => ({ url, name }));
        const existingPdfs = dbData.tahunData?.[yr]?.pdfs || (yr === '2026' ? (dbData.pdfs || []) : []);
        newTahunData[yr] = {
          pdfs: existingPdfs,
          images: yearImages
        };
      });

      const docRef = doc(firestore, 'desaAntiKorupsi', currentItem.id);
      const updatePayload: any = {
        itemId: currentItem.id,
        tahunData: newTahunData,
        updatedAt: serverTimestamp()
      };

      const images2026 = newTahunData['2026']?.images || [];
      updatePayload.images = images2026;
      updatePayload.imageUrl = images2026.length > 0 ? images2026[0].url : null;
      updatePayload.imageName = images2026.length > 0 ? images2026[0].name : null;

      await setDoc(docRef, updatePayload, { merge: true });

      toast({
        title: 'Tahun Foto Berhasil Diubah',
        description: `Foto "${targetImg.name}" dipindahkan ke Tahun ${newYear}.`,
      });

      fetchItemData(currentItem.id);
    } catch (error: any) {
      toast({ title: 'Gagal Mengubah Tahun', description: error.message, variant: 'destructive' });
    }
  };

  // Upload PDF to Google Drive
  const handlePdfUpload = async () => {
    if (!pdfFile || !currentItem || !firestore) return;
    setIsPdfUploading(true);

    try {
      const uploadResult = await uploadToDrive(pdfFile, 'PDF');
      const uploadYear = selectedSubTahun === 'semua' ? '2026' : selectedSubTahun;

      let allPdfs: Array<{ url: string; name: string; tahun: string }> = [];
      if (dbData?.tahunData) {
        ['2024', '2025', '2026'].forEach(yr => {
          (dbData.tahunData?.[yr]?.pdfs || []).forEach(p => {
            allPdfs.push({ ...p, tahun: yr });
          });
        });
      }
      if (allPdfs.length === 0 && dbData) {
        const topPdfs = dbData.pdfs || (dbData.pdfUrl ? [{ url: dbData.pdfUrl, name: dbData.pdfName || 'Dokumen PDF' }] : []);
        topPdfs.forEach(p => {
          let yr = '2026';
          if (p.name?.includes('2024')) yr = '2024';
          else if (p.name?.includes('2025')) yr = '2025';
          else if (p.name?.includes('2026')) yr = '2026';
          allPdfs.push({ ...p, tahun: yr });
        });
      }

      allPdfs.push({ url: uploadResult.url, name: uploadResult.name, tahun: uploadYear });

      const newTahunData: any = {};
      ['2024', '2025', '2026'].forEach(yr => {
        const yearPdfs = allPdfs.filter(p => p.tahun === yr).map(({ url, name }) => ({ url, name }));
        const existingImages = dbData?.tahunData?.[yr]?.images || (yr === '2026' ? (dbData?.images || []) : []);
        newTahunData[yr] = {
          pdfs: yearPdfs,
          images: existingImages
        };
      });

      const docRef = doc(firestore, 'desaAntiKorupsi', currentItem.id);
      const updatePayload: any = {
        itemId: currentItem.id,
        tahunData: newTahunData,
        updatedAt: serverTimestamp()
      };

      const pdfs2026 = newTahunData['2026']?.pdfs || [];
      updatePayload.pdfs = pdfs2026;
      updatePayload.pdfUrl = pdfs2026.length > 0 ? pdfs2026[0].url : null;
      updatePayload.pdfName = pdfs2026.length > 0 ? pdfs2026[0].name : null;

      await setDoc(docRef, updatePayload, { merge: true });

      toast({
        title: 'PDF Berhasil Unggah',
        description: `Dokumen ${pdfFile.name} (Tahun ${uploadYear}) disimpan ke Google Drive.`,
      });

      setPdfFile(null);
      fetchItemData(currentItem.id);
    } catch (error: any) {
      console.error('Gagal upload PDF:', error);
      toast({
        title: 'Gagal Mengunggah PDF',
        description: error.message || 'Terjadi kesalahan sistem.',
        variant: 'destructive',
      });
    } finally {
      setIsPdfUploading(false);
    }
  };

  // Upload Photo to Google Drive (with compression)
  const handleImageUpload = async () => {
    if (!imageFile || !currentItem || !firestore) return;
    setIsImageUploading(true);

    try {
      const compressedFile = await compressImage(imageFile);
      const uploadResult = await uploadToDrive(compressedFile, 'IMG');
      const uploadYear = selectedSubTahun === 'semua' ? '2026' : selectedSubTahun;

      let allImages: Array<{ url: string; name: string; tahun: string }> = [];
      if (dbData?.tahunData) {
        ['2024', '2025', '2026'].forEach(yr => {
          (dbData.tahunData?.[yr]?.images || []).forEach(img => {
            allImages.push({ ...img, tahun: yr });
          });
        });
      }
      if (allImages.length === 0 && dbData) {
        const topImages = dbData.images || (dbData.imageUrl ? [{ url: dbData.imageUrl, name: dbData.imageName || 'Gambar Dukung' }] : []);
        topImages.forEach(img => {
          let yr = '2026';
          if (img.name?.includes('2024')) yr = '2024';
          else if (img.name?.includes('2025')) yr = '2025';
          else if (img.name?.includes('2026')) yr = '2026';
          allImages.push({ ...img, tahun: yr });
        });
      }

      allImages.push({ url: uploadResult.url, name: uploadResult.name, tahun: uploadYear });

      const newTahunData: any = {};
      ['2024', '2025', '2026'].forEach(yr => {
        const yearImages = allImages.filter(img => img.tahun === yr).map(({ url, name }) => ({ url, name }));
        const existingPdfs = dbData?.tahunData?.[yr]?.pdfs || (yr === '2026' ? (dbData?.pdfs || []) : []);
        newTahunData[yr] = {
          pdfs: existingPdfs,
          images: yearImages
        };
      });

      const docRef = doc(firestore, 'desaAntiKorupsi', currentItem.id);
      const updatePayload: any = {
        itemId: currentItem.id,
        tahunData: newTahunData,
        updatedAt: serverTimestamp()
      };

      const images2026 = newTahunData['2026']?.images || [];
      updatePayload.images = images2026;
      updatePayload.imageUrl = images2026.length > 0 ? images2026[0].url : null;
      updatePayload.imageName = images2026.length > 0 ? images2026[0].name : null;

      await setDoc(docRef, updatePayload, { merge: true });

      toast({
        title: 'Foto Berhasil Unggah',
        description: `Gambar ${imageFile.name} (Tahun ${uploadYear}) berhasil dikompresi dan disimpan.`,
      });

      setImageFile(null);
      fetchItemData(currentItem.id);
    } catch (error: any) {
      console.error('Gagal upload gambar:', error);
      toast({
        title: 'Gagal Mengunggah Foto',
        description: error.message || 'Terjadi kesalahan saat mengunggah.',
        variant: 'destructive',
      });
    } finally {
      setIsImageUploading(false);
    }
  };

  // Delete a specific PDF from list
  const handleDeletePdfItem = async (targetPdf: { url: string; name: string; tahun: string }) => {
    if (!currentItem || !firestore || !dbData) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus PDF "${targetPdf.name}" (Tahun ${targetPdf.tahun})?`)) return;

    try {
      let allPdfs: Array<{ url: string; name: string; tahun: string }> = [];
      if (dbData.tahunData) {
        ['2024', '2025', '2026'].forEach(yr => {
          (dbData.tahunData?.[yr]?.pdfs || []).forEach(p => {
            allPdfs.push({ ...p, tahun: yr });
          });
        });
      }
      if (allPdfs.length === 0) {
        const topPdfs = dbData.pdfs || (dbData.pdfUrl ? [{ url: dbData.pdfUrl, name: dbData.pdfName || 'Dokumen PDF' }] : []);
        topPdfs.forEach(p => {
          let yr = '2026';
          if (p.name?.includes('2024')) yr = '2024';
          else if (p.name?.includes('2025')) yr = '2025';
          else if (p.name?.includes('2026')) yr = '2026';
          allPdfs.push({ ...p, tahun: yr });
        });
      }

      const updatedAllPdfs = allPdfs.filter(p => !(p.url === targetPdf.url && p.name === targetPdf.name));

      const newTahunData: any = {};
      ['2024', '2025', '2026'].forEach(yr => {
        const yearPdfs = updatedAllPdfs.filter(p => p.tahun === yr).map(({ url, name }) => ({ url, name }));
        const existingImages = dbData.tahunData?.[yr]?.images || (yr === '2026' ? (dbData.images || []) : []);
        newTahunData[yr] = {
          pdfs: yearPdfs,
          images: existingImages
        };
      });

      const docRef = doc(firestore, 'desaAntiKorupsi', currentItem.id);
      const updatePayload: any = {
        itemId: currentItem.id,
        tahunData: newTahunData,
        updatedAt: serverTimestamp()
      };

      const pdfs2026 = newTahunData['2026']?.pdfs || [];
      updatePayload.pdfs = pdfs2026;
      updatePayload.pdfUrl = pdfs2026.length > 0 ? pdfs2026[0].url : null;
      updatePayload.pdfName = pdfs2026.length > 0 ? pdfs2026[0].name : null;

      await setDoc(docRef, updatePayload, { merge: true });

      toast({ title: 'Berhasil Dihapus', description: `Dokumen PDF "${targetPdf.name}" telah dihapus.` });
      fetchItemData(currentItem.id);
    } catch (error: any) {
      toast({ title: 'Gagal Menghapus', description: error.message, variant: 'destructive' });
    }
  };

  // Delete a specific Image from list
  const handleDeleteImageItem = async (targetImg: { url: string; name: string; tahun: string }) => {
    if (!currentItem || !firestore || !dbData) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus foto "${targetImg.name}" (Tahun ${targetImg.tahun})?`)) return;

    try {
      let allImages: Array<{ url: string; name: string; tahun: string }> = [];
      if (dbData.tahunData) {
        ['2024', '2025', '2026'].forEach(yr => {
          (dbData.tahunData?.[yr]?.images || []).forEach(img => {
            allImages.push({ ...img, tahun: yr });
          });
        });
      }
      if (allImages.length === 0) {
        const topImages = dbData.images || (dbData.imageUrl ? [{ url: dbData.imageUrl, name: dbData.imageName || 'Gambar Dukung' }] : []);
        topImages.forEach(img => {
          let yr = '2026';
          if (img.name?.includes('2024')) yr = '2024';
          else if (img.name?.includes('2025')) yr = '2025';
          else if (img.name?.includes('2026')) yr = '2026';
          allImages.push({ ...img, tahun: yr });
        });
      }

      const updatedAllImages = allImages.filter(img => !(img.url === targetImg.url && img.name === targetImg.name));

      const newTahunData: any = {};
      ['2024', '2025', '2026'].forEach(yr => {
        const yearImages = updatedAllImages.filter(img => img.tahun === yr).map(({ url, name }) => ({ url, name }));
        const existingPdfs = dbData.tahunData?.[yr]?.pdfs || (yr === '2026' ? (dbData.pdfs || []) : []);
        newTahunData[yr] = {
          pdfs: existingPdfs,
          images: yearImages
        };
      });

      const docRef = doc(firestore, 'desaAntiKorupsi', currentItem.id);
      const updatePayload: any = {
        itemId: currentItem.id,
        tahunData: newTahunData,
        updatedAt: serverTimestamp()
      };

      const images2026 = newTahunData['2026']?.images || [];
      updatePayload.images = images2026;
      updatePayload.imageUrl = images2026.length > 0 ? images2026[0].url : null;
      updatePayload.imageName = images2026.length > 0 ? images2026[0].name : null;

      await setDoc(docRef, updatePayload, { merge: true });

      toast({ title: 'Berhasil Dihapus', description: `Foto dukung "${targetImg.name}" telah dihapus.` });
      fetchItemData(currentItem.id);
    } catch (error: any) {
      toast({ title: 'Gagal Menghapus', description: error.message, variant: 'destructive' });
    }
  };

  // Save manual PDF document link
  const handleAddManualPdf = async () => {
    if (!manualPdfUrl.trim() || !currentItem || !firestore) return;
    setIsManualPdfSaving(true);
    try {
      const url = manualPdfUrl.trim();
      const name = manualPdfName.trim() || currentItem.title;
      const uploadYear = selectedSubTahun === 'semua' ? '2026' : selectedSubTahun;

      let allPdfs: Array<{ url: string; name: string; tahun: string }> = [];
      if (dbData?.tahunData) {
        ['2024', '2025', '2026'].forEach(yr => {
          (dbData.tahunData?.[yr]?.pdfs || []).forEach(p => {
            allPdfs.push({ ...p, tahun: yr });
          });
        });
      }
      if (allPdfs.length === 0 && dbData) {
        const topPdfs = dbData.pdfs || (dbData.pdfUrl ? [{ url: dbData.pdfUrl, name: dbData.pdfName || 'Dokumen PDF' }] : []);
        topPdfs.forEach(p => {
          let yr = '2026';
          if (p.name?.includes('2024')) yr = '2024';
          else if (p.name?.includes('2025')) yr = '2025';
          else if (p.name?.includes('2026')) yr = '2026';
          allPdfs.push({ ...p, tahun: yr });
        });
      }

      allPdfs.push({ url, name, tahun: uploadYear });

      const newTahunData: any = {};
      ['2024', '2025', '2026'].forEach(yr => {
        const yearPdfs = allPdfs.filter(p => p.tahun === yr).map(({ url, name }) => ({ url, name }));
        const existingImages = dbData?.tahunData?.[yr]?.images || (yr === '2026' ? (dbData?.images || []) : []);
        newTahunData[yr] = {
          pdfs: yearPdfs,
          images: existingImages
        };
      });

      const docRef = doc(firestore, 'desaAntiKorupsi', currentItem.id);
      const updatePayload: any = {
        itemId: currentItem.id,
        tahunData: newTahunData,
        updatedAt: serverTimestamp()
      };

      const pdfs2026 = newTahunData['2026']?.pdfs || [];
      updatePayload.pdfs = pdfs2026;
      updatePayload.pdfUrl = pdfs2026.length > 0 ? pdfs2026[0].url : null;
      updatePayload.pdfName = pdfs2026.length > 0 ? pdfs2026[0].name : null;

      await setDoc(docRef, updatePayload, { merge: true });

      toast({
        title: 'Tautan PDF Berhasil Disimpan',
        description: `Tautan dokumen PDF manual (Tahun ${uploadYear}) telah ditambahkan.`,
      });

      setManualPdfUrl('');
      setManualPdfName(currentItem.title);
      fetchItemData(currentItem.id);
    } catch (error: any) {
      console.error('Gagal menyimpan tautan PDF manual:', error);
      toast({
        title: 'Gagal Menyimpan Tautan',
        description: error.message || 'Terjadi kesalahan sistem.',
        variant: 'destructive',
      });
    } finally {
      setIsManualPdfSaving(false);
    }
  };

  // Save manual Image document link
  const handleAddManualImage = async () => {
    if (!manualImageUrl.trim() || !currentItem || !firestore) return;
    setIsManualImageSaving(true);
    try {
      const url = manualImageUrl.trim();
      const name = manualImageName.trim() || currentItem.title;
      const uploadYear = selectedSubTahun === 'semua' ? '2026' : selectedSubTahun;

      let allImages: Array<{ url: string; name: string; tahun: string }> = [];
      if (dbData?.tahunData) {
        ['2024', '2025', '2026'].forEach(yr => {
          (dbData.tahunData?.[yr]?.images || []).forEach(img => {
            allImages.push({ ...img, tahun: yr });
          });
        });
      }
      if (allImages.length === 0 && dbData) {
        const topImages = dbData.images || (dbData.imageUrl ? [{ url: dbData.imageUrl, name: dbData.imageName || 'Gambar Dukung' }] : []);
        topImages.forEach(img => {
          let yr = '2026';
          if (img.name?.includes('2024')) yr = '2024';
          else if (img.name?.includes('2025')) yr = '2025';
          else if (img.name?.includes('2026')) yr = '2026';
          allImages.push({ ...img, tahun: yr });
        });
      }

      allImages.push({ url, name, tahun: uploadYear });

      const newTahunData: any = {};
      ['2024', '2025', '2026'].forEach(yr => {
        const yearImages = allImages.filter(img => img.tahun === yr).map(({ url, name }) => ({ url, name }));
        const existingPdfs = dbData?.tahunData?.[yr]?.pdfs || (yr === '2026' ? (dbData?.pdfs || []) : []);
        newTahunData[yr] = {
          pdfs: existingPdfs,
          images: yearImages
        };
      });

      const docRef = doc(firestore, 'desaAntiKorupsi', currentItem.id);
      const updatePayload: any = {
        itemId: currentItem.id,
        tahunData: newTahunData,
        updatedAt: serverTimestamp()
      };

      const images2026 = newTahunData['2026']?.images || [];
      updatePayload.images = images2026;
      updatePayload.imageUrl = images2026.length > 0 ? images2026[0].url : null;
      updatePayload.imageName = images2026.length > 0 ? images2026[0].name : null;

      await setDoc(docRef, updatePayload, { merge: true });

      toast({
        title: 'Tautan Gambar Berhasil Disimpan',
        description: `Tautan foto dukung manual (Tahun ${uploadYear}) telah ditambahkan.`,
      });

      setManualImageUrl('');
      setManualImageName(currentItem.title);
      fetchItemData(currentItem.id);
    } catch (error: any) {
      console.error('Gagal menyimpan tautan gambar manual:', error);
      toast({
        title: 'Gagal Menyimpan Tautan',
        description: error.message || 'Terjadi kesalahan sistem.',
        variant: 'destructive',
      });
    } finally {
      setIsManualImageSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-850 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-sky-600" />
            <span>Kelola Desa Anti Korupsi</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Sistem Unggah Dokumen Pilar Anti Korupsi Desa Sidaurip ke Google Drive
          </p>
        </div>
      </div>

      {/* Selectors Panel */}
      <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
          <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-sky-600" />
            <span>PILIH RINCIAN SUB MENU</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Gunakan filter bertingkat untuk memilih item dokumen yang akan diatur.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* Pilar Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori Pilar Utama</Label>
              <Select value={selectedPilarId} onValueChange={setSelectedPilarId}>
                <SelectTrigger className="rounded-xl h-11 border-slate-200 bg-slate-50/50 hover:bg-slate-50 font-semibold text-xs text-slate-700">
                  <SelectValue placeholder="Pilih Pilar Utama..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 bg-white">
                  {antiKorupsiData.map((pilar) => (
                    <SelectItem key={pilar.id} value={pilar.id} className="text-xs font-semibold py-2">
                      Pilar {pilar.id} - {pilar.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Menu Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sub Menu</Label>
              <Select
                value={selectedSubMenuId}
                onValueChange={setSelectedSubMenuId}
                disabled={!selectedPilarId}
              >
                <SelectTrigger className="rounded-xl h-11 border-slate-200 bg-slate-50/50 hover:bg-slate-50 font-semibold text-xs text-slate-700">
                  <SelectValue placeholder={selectedPilarId ? "Pilih Sub Menu..." : "Pilih Kategori Utama Dahulu"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 bg-white">
                  {currentPilar?.subMenus.map((subMenu) => (
                    <SelectItem key={subMenu.id} value={subMenu.id} className="text-xs font-semibold py-2">
                      {subMenu.id} - {subMenu.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Item Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rincian Dokumen</Label>
              <Select
                value={selectedItemId}
                onValueChange={setSelectedItemId}
                disabled={!selectedSubMenuId}
              >
                <SelectTrigger className="rounded-xl h-11 border-slate-200 bg-slate-50/50 hover:bg-slate-50 font-semibold text-xs text-slate-700">
                  <SelectValue placeholder={selectedSubMenuId ? "Pilih Rincian Dokumen..." : "Pilih Sub Menu Dahulu"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 bg-white">
                  {currentSubMenu?.items.map((item) => (
                    <SelectItem key={item.id} value={item.id} className="text-xs font-semibold py-2">
                      {item.id} - {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Tahun Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sub Tahun</Label>
              <Select value={selectedSubTahun} onValueChange={setSelectedSubTahun}>
                <SelectTrigger className="rounded-xl h-11 border-slate-200 bg-sky-50/50 border-sky-300 font-bold text-xs text-sky-900">
                  <SelectValue placeholder="Pilih Tahun..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 bg-white">
                  {['2024', '2025', '2026'].map((tahun) => (
                    <SelectItem key={tahun} value={tahun} className="text-xs font-semibold py-2">
                      Tahun {tahun}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Upload Actions Panel */}
      {currentItem && (
        <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white animate-fadeIn">
          <CardHeader className="bg-sky-50/40 border-b border-sky-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-sky-600 hover:bg-sky-600 rounded-full font-mono text-[10px] font-bold px-2 py-0.5">
                    ID: {currentItem.id}
                  </Badge>
                  <Badge className="bg-amber-500 hover:bg-amber-500 text-slate-950 rounded-full font-sans text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wider">
                    Sub Tahun {selectedSubTahun}
                  </Badge>
                </div>
                <CardTitle className="text-slate-800 text-sm md:text-base font-extrabold tracking-tight mt-1">
                  {currentItem.title}
                </CardTitle>
                {currentSubMenu && (
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">
                    Bagian dari: {currentSubMenu.title}
                  </p>
                )}
              </div>

              {/* Target Folder ID Info Badge */}
              <div className="shrink-0">
                {subFolderMappings[selectedItemId] ? (
                  <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100 border border-sky-200 rounded-full text-[9px] uppercase font-bold py-1 px-3">
                    Folder Drive Terpetakan (Rincian): {subFolderMappings[selectedItemId].substring(0, 8)}...
                  </Badge>
                ) : subFolderMappings[selectedSubMenuId] ? (
                  <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100 border border-sky-200 rounded-full text-[9px] uppercase font-bold py-1 px-3">
                    Folder Drive Terpetakan (Sub-Menu): {subFolderMappings[selectedSubMenuId].substring(0, 8)}...
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] text-slate-400 border-slate-200 uppercase font-bold py-1 px-3">
                    Folder Drive: Default Root
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isDataLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-3" />
                <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Memuat status berkas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. PDF Section (Google Drive) */}
                <div className="border border-slate-150 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-red-500" />
                      <span>Berkas PDF (Google Drive)</span>
                    </h3>
                    <Badge variant={pdfList.length > 0 ? "default" : "secondary"} className={`text-[9px] uppercase font-bold px-2 ${pdfList.length > 0 ? "bg-sky-100 text-sky-800 hover:bg-sky-100 border border-sky-200" : ""}`}>
                      {pdfList.length > 0 ? `${pdfList.length} Berkas` : "Belum Ada"}
                    </Badge>
                  </div>

                  {pdfList.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daftar Dokumen PDF Terunggah:</p>
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {pdfList.map((pdf, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="h-8 w-8 bg-red-100 text-red-600 flex items-center justify-center rounded-lg shrink-0">
                                <FileText className="h-4.5 w-4.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-750 truncate">
                                  {pdf.name || `Dokumen PDF ${idx + 1}`}
                                </p>
                                <a
                                  href={pdf.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-sky-600 font-bold hover:underline inline-flex items-center mt-0.5"
                                >
                                  <span>Buka di Google Drive</span>
                                  <ExternalLink className="h-2.5 w-2.5 ml-1" />
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Select
                                value={pdf.tahun || '2026'}
                                onValueChange={(newYear) => handleUpdatePdfYear(pdf, newYear)}
                              >
                                <SelectTrigger className="h-7 w-24 px-2 text-[9px] font-extrabold uppercase rounded-lg border-amber-300 bg-amber-50 text-amber-950">
                                  <SelectValue placeholder="Tahun" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 bg-white">
                                  {['2024', '2025', '2026'].map((yr) => (
                                    <SelectItem key={yr} value={yr} className="text-xs font-semibold py-1">
                                      Tahun {yr}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Button
                                onClick={() => handleDeletePdfItem(pdf)}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full text-red-500 hover:text-red-750 hover:bg-red-50 shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    {/* Toggle Selector */}
                    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
                      <button
                        type="button"
                        onClick={() => setPdfInputMode('upload')}
                        className={`h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${pdfInputMode === 'upload'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        Unggah Berkas
                      </button>
                      <button
                        type="button"
                        onClick={() => setPdfInputMode('link')}
                        className={`h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${pdfInputMode === 'link'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        Tautan Manual
                      </button>
                    </div>

                    {pdfInputMode === 'upload' ? (
                      <div className="space-y-4">
                        <div className="border border-dashed border-slate-200 hover:border-sky-300 rounded-xl p-6 transition-colors flex flex-col items-center justify-center bg-slate-50/50">
                          <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                          <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-wider">
                            Pilih File PDF Baru untuk Ditambahkan
                          </p>
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="pdf-file-selector"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('pdf-file-selector')?.click()}
                            className="h-8 rounded-full border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider mt-3"
                          >
                            Pilih File
                          </Button>
                          {pdfFile && (
                            <p className="text-[10px] text-sky-700 font-bold mt-3 text-center truncate max-w-full">
                              Terpilih: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={handlePdfUpload}
                          disabled={!pdfFile || isPdfUploading}
                          className="w-full h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-wider"
                        >
                          {isPdfUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Mengunggah ke Drive...
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-4 w-4 mr-2" />
                              Unggah PDF Baru
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                        <div className="space-y-1.5">
                          <Label htmlFor="manual-pdf-name" className="text-[10px] font-bold text-slate-550 uppercase block">Nama Dokumen PDF</Label>
                          <Input
                            id="manual-pdf-name"
                            placeholder="Contoh: Dokumen RPJM Desa 2026"
                            value={manualPdfName}
                            onChange={(e) => setManualPdfName(e.target.value)}
                            disabled={isManualPdfSaving}
                            className="h-9 rounded-xl border-slate-200 bg-white text-xs focus-visible:ring-sky-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="manual-pdf-url" className="text-[10px] font-bold text-slate-550 uppercase block">Tautan URL Dokumen</Label>
                          <Input
                            id="manual-pdf-url"
                            placeholder="Tempelkan link URL dokumen di sini..."
                            value={manualPdfUrl}
                            onChange={(e) => setManualPdfUrl(e.target.value)}
                            disabled={isManualPdfSaving}
                            className="h-9 rounded-xl border-slate-200 bg-white text-xs focus-visible:ring-sky-500"
                          />
                        </div>
                        <Button
                          onClick={handleAddManualPdf}
                          disabled={!manualPdfUrl.trim() || isManualPdfSaving}
                          className="w-full h-9 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider"
                        >
                          {isManualPdfSaving ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                              Menyimpan...
                            </>
                          ) : (
                            "Simpan Tautan PDF"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Photo Section (Google Drive) */}
                <div className="border border-slate-150 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-blue-500" />
                      <span>Dokumentasi Gambar (Google Drive)</span>
                    </h3>
                    <Badge variant={imageList.length > 0 ? "default" : "secondary"} className={`text-[9px] uppercase font-bold px-2 ${imageList.length > 0 ? "bg-sky-100 text-sky-800 hover:bg-sky-100 border border-sky-200" : ""}`}>
                      {imageList.length > 0 ? `${imageList.length} Foto` : "Belum Ada"}
                    </Badge>
                  </div>

                  {imageList.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daftar Foto Dukung Terunggah:</p>
                      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                        {imageList.map((img, idx) => {
                          const fileId = extractFileIdFromUrl(img.url);
                          const embedUrl = fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : img.url;
                          return (
                            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 relative overflow-hidden flex flex-col justify-between">
                              {embedUrl && (
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200/60 mb-2">
                                  <img
                                    src={embedUrl}
                                    alt={`Dokumentasi ${idx + 1}`}
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                              )}
                              <div className="min-w-0 space-y-2">
                                <span className="text-[9px] font-bold text-slate-700 truncate block">
                                  {img.name || `Foto ${idx + 1}`}
                                </span>

                                <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-200/60">
                                  <Select
                                    value={img.tahun || '2026'}
                                    onValueChange={(newYear) => handleUpdateImageYear(img, newYear)}
                                  >
                                    <SelectTrigger className="h-6 px-1.5 text-[8px] font-black uppercase rounded-md border-amber-300 bg-amber-50 text-amber-950 flex-1">
                                      <SelectValue placeholder="Tahun" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 bg-white">
                                      {['2024', '2025', '2026'].map((yr) => (
                                        <SelectItem key={yr} value={yr} className="text-xs font-semibold py-1">
                                          Tahun {yr}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <Button
                                    onClick={() => handleDeleteImageItem(img)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full text-red-500 hover:text-red-750 hover:bg-red-50 shrink-0"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    {/* Toggle Selector */}
                    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('upload')}
                        className={`h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${imageInputMode === 'upload'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        Unggah Berkas
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('link')}
                        className={`h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${imageInputMode === 'link'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        Tautan Manual
                      </button>
                    </div>

                    {imageInputMode === 'upload' ? (
                      <div className="space-y-4">
                        <div className="border border-dashed border-slate-200 hover:border-sky-300 rounded-xl p-6 transition-colors flex flex-col items-center justify-center bg-slate-50/50">
                          <ImageIcon className="h-8 w-8 text-slate-400 mb-2" />
                          <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-wider">
                            Pilih Gambar Baru (JPG, JPEG, PNG)
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="image-file-selector"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('image-file-selector')?.click()}
                            className="h-8 rounded-full border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider mt-3"
                          >
                            Pilih Gambar
                          </Button>
                          <p className="text-[9px] text-slate-400 mt-2 text-center">
                            Gambar otomatis dikompresi sebelum diunggah ke Google Drive
                          </p>
                          {imageFile && (
                            <p className="text-[10px] text-sky-700 font-bold mt-2 text-center truncate max-w-full">
                              Terpilih: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={handleImageUpload}
                          disabled={!imageFile || isImageUploading}
                          className="w-full h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-wider"
                        >
                          {isImageUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Mengompresi & Mengunggah...
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-4 w-4 mr-2" />
                              Unggah Foto Baru
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                        <div className="space-y-1.5">
                          <Label htmlFor="manual-image-name" className="text-[10px] font-bold text-slate-550 uppercase block">Nama Foto / Gambar</Label>
                          <Input
                            id="manual-image-name"
                            placeholder="Contoh: Foto Kegiatan Sosialisasi"
                            value={manualImageName}
                            onChange={(e) => setManualImageName(e.target.value)}
                            disabled={isManualImageSaving}
                            className="h-9 rounded-xl border-slate-200 bg-white text-xs focus-visible:ring-sky-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="manual-image-url" className="text-[10px] font-bold text-slate-550 uppercase block">Tautan URL Gambar</Label>
                          <Input
                            id="manual-image-url"
                            placeholder="Tempelkan link URL gambar di sini..."
                            value={manualImageUrl}
                            onChange={(e) => setManualImageUrl(e.target.value)}
                            disabled={isManualImageSaving}
                            className="h-9 rounded-xl border-slate-200 bg-white text-xs focus-visible:ring-sky-500"
                          />
                        </div>
                        <Button
                          onClick={handleAddManualImage}
                          disabled={!manualImageUrl.trim() || isManualImageSaving}
                          className="w-full h-9 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider"
                        >
                          {isManualImageSaving ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                              Menyimpan...
                            </>
                          ) : (
                            "Simpan Tautan Gambar"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Guide/Info Card */}
      {!currentItem && (
        <Card className="border border-dashed border-slate-300 rounded-3xl bg-slate-50/50 p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-slate-800 font-extrabold text-sm uppercase tracking-wider">Pilih Rincian Dokumen Terlebih Dahulu</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Silakan pilih Kategori Pilar, Sub Menu, dan Rincian Dokumen pada panel di atas untuk mengunggah dokumen PDF dan Dokumentasi Foto ke Google Drive.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

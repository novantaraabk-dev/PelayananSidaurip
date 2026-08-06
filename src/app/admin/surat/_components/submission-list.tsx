'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, XCircle, Printer, Trash2, Eye, Loader2, FileSignature, Download, Phone, Mail, FileDown, UserCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LetterSubmission, UploadedFile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import {
  getLetterRequestsQuery,
  updateSubmissionStatus,
  deleteSubmission,
  setSubmissionDocumentNumber,
} from '@/lib/submissions';
import { query as firestoreQuery, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { generateDocumentNumber } from '@/ai/flows/generate-document-number-flow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Helper to open Google Drive file download link
const openGoogleDriveDownloadLink = (fileId: string) => {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};


export function SubmissionList() {
  const [selectedSubmission, setSelectedSubmission] = useState<LetterSubmission | null>(null);
  const [manualNumberSubmission, setManualNumberSubmission] = useState<LetterSubmission | null>(null);
  const [manualNumberInput, setManualNumberInput] = useState<string>('');
  const [isSubmittingManualNumber, setIsSubmittingManualNumber] = useState<boolean>(false);

  // State for Signatory Choice
  const [signatorySubmission, setSignatorySubmission] = useState<LetterSubmission | null>(null);
  const [selectedSigner, setSelectedSigner] = useState<'kades' | 'sekdes'>('kades');

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const isAdmin = !!user;

  const query = useMemoFirebase(() => {
    if (!firestore || !user || user.isAnonymous) return null;

    if (!isAdmin) {
      return firestoreQuery(
        getLetterRequestsQuery(firestore),
        where('requestorAuthUid', '==', (user as any).uid)
      );
    }

    return getLetterRequestsQuery(firestore);
  }, [firestore, user, isAdmin]);

  const { data: submissionsData, isLoading } = useCollection<LetterSubmission>(query, { realtime: true });

  const submissions = useMemo(() => {
    if (!submissionsData) return [];
    return submissionsData.map(sub => {
      // Robust parsing for data that might be spread at top level or in submissionData string
      let formData = {};
      if (sub.submissionData && typeof sub.submissionData === 'string') {
        try {
          formData = JSON.parse(sub.submissionData);
        } catch (e) {
          console.warn("Failed to parse legacy submissionData", e);
        }
      } else {
        // New format: everything is already top level. We use the object itself as formData,
        // but we can clean it up for the "Detail" view later.
        formData = sub;
      }

      return {
        ...sub,
        formData,
        date: sub.createdAt?.toDate()?.toISOString() ?? new Date().toISOString(),
      };
    })
  }, [submissionsData]);

  const handleDownload = (file: UploadedFile) => {
    openGoogleDriveDownloadLink(file.fileId);
  };

  const handleManualNumberSubmit = async () => {
    if (!manualNumberSubmission || !manualNumberInput || !firestore) return;

    const manualNumber = parseInt(manualNumberInput, 10);
    if (isNaN(manualNumber) || manualNumber <= 0) {
      toast({
        title: "Nomor Tidak Valid",
        description: "Silakan masukkan nomor surat yang valid.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingManualNumber(true);
    try {
      const formattedNumber = await generateDocumentNumber({ manualNumber });
      await setSubmissionDocumentNumber(firestore, manualNumberSubmission.id, formattedNumber);

      toast({
        title: "Nomor Surat Dibuat",
        description: `Nomor baru ${formattedNumber} telah disimpan.`,
      });

    } catch (e: any) {
      toast({
        title: "Gagal Membuat Nomor",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingManualNumber(false);
      setManualNumberInput('');
      setManualNumberSubmission(null);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: 'approved' | 'rejected'
  ) => {
    if (!firestore) return;
    try {
      await updateSubmissionStatus(firestore, id, status);

      toast({
        title: `Status Diperbarui`,
        description: `Pengajuan telah ${status === 'approved' ? 'Disetujui' : 'Ditolak'
          }.`,
      });

    } catch (e) {
      console.error(e);
    }
  };

  const confirmPrint = () => {
    if (!signatorySubmission) return;
    const submissionId = signatorySubmission.id;
    setSignatorySubmission(null);
    const printUrl = `/print/${submissionId}?signer=${selectedSigner}`;
    window.open(printUrl, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteSubmission(firestore, id);
      toast({
        title: `Pengajuan Dihapus`,
        variant: 'destructive',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const formatLabel = (key: string) => {
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  const formatValue = (value: any) => {
    if (value instanceof Date) {
      return value.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    }
    if (typeof value === 'object' && value !== null && 'name' in value) return value.name;
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  const statusVariant = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
    processing: 'secondary',
  } as const;

  const statusText = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    processing: 'Memproses',
  };

  if (isLoading || !user) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="pl-8 h-14 font-black uppercase text-[10px] tracking-widest text-slate-400">Pemohon</TableHead>
              <TableHead className="hidden sm:table-cell h-14 font-black uppercase text-[10px] tracking-widest text-slate-400">Jenis Surat</TableHead>
              <TableHead className="h-14 font-black uppercase text-[10px] tracking-widest text-slate-400">Nomor Surat</TableHead>
              <TableHead className="hidden md:table-cell h-14 font-black uppercase text-[10px] tracking-widest text-slate-400">Tanggal</TableHead>
              <TableHead className="text-center h-14 font-black uppercase text-[10px] tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="text-right pr-8 h-14 font-black uppercase text-[10px] tracking-widest text-slate-400">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-48 text-center text-slate-400 font-medium italic">Belum ada pengajuan yang masuk.</TableCell></TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id} className="hover:bg-slate-50/80 transition-colors group">
                  <TableCell className="pl-8 py-5">
                    <div className="font-black text-sm uppercase text-slate-700">{submission.requesterName}</div>
                    <div className="text-[10px] text-slate-400 font-bold font-mono tracking-tighter">{submission.nik}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{submission.letterType}</span>
                  </TableCell>
                  <TableCell>
                    {submission.documentNumber ? (
                      <span className="font-mono text-[11px] font-black text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">{submission.documentNumber}</span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setManualNumberSubmission(submission)}
                        disabled={submission.status !== 'approved'}
                        className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200"
                      >
                        <FileSignature className="mr-2 h-3.5 w-3.5" />
                        Buat Nomor
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-[10px] font-bold text-slate-400 uppercase">
                    {new Date(submission.date).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusVariant[submission.status]} className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      {submission.status === 'processing' && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                      {statusText[submission.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-200"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl p-2 font-sans">
                        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Opsi Pengelolaan</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setTimeout(() => setSelectedSubmission(submission), 100);
                        }} className="rounded-xl font-bold cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Lihat Detail</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="opacity-50" />
                        <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'approved')} className="rounded-xl font-bold cursor-pointer text-sky-600 focus:text-sky-700 focus:bg-sky-50"><CheckCircle className="mr-2 h-4 w-4" /><span>Setujui</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'rejected')} className="rounded-xl font-bold cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"><XCircle className="mr-2 h-4 w-4" /><span>Tolak</span></DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setTimeout(() => setSignatorySubmission(submission), 100);
                          }}
                          disabled={submission.status !== 'approved' || !submission.documentNumber}
                          className="rounded-xl font-bold cursor-pointer"
                        >
                          <Printer className="mr-2 h-4 w-4" /><span>Cetak Dokumen</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setTimeout(() => setSignatorySubmission(submission), 100);
                          }}
                          disabled={submission.status !== 'approved' || !submission.documentNumber}
                          className="rounded-xl font-bold cursor-pointer"
                        >
                          <FileDown className="mr-2 h-4 w-4" /><span>Unduh PDF</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="opacity-50" />
                        <DropdownMenuItem onClick={() => handleDelete(submission.id)} className="rounded-xl font-bold cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"><Trash2 className="mr-2 h-4 w-4" /><span>Hapus Permanen</span></DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedSubmission}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedSubmission(null);
            if (typeof document !== 'undefined') {
              document.body.style.pointerEvents = 'auto';
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-primary p-8 md:p-10 text-white">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-tight italic">Detail Pengajuan: {selectedSubmission?.letterType}</DialogTitle>
            <DialogDescription className="text-white/50 font-medium">ID: {selectedSubmission?.id}</DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
            {selectedSubmission && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Phone className="h-5 w-5 text-sky-600" /></div>
                    <div>
                      <p className="text-[10px] text-sky-600/70 font-black uppercase tracking-widest">WhatsApp</p>
                      <p className="text-sm font-black">{selectedSubmission.phoneNumber || 'Tidak ada'}</p>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Mail className="h-5 w-5 text-blue-600" /></div>
                    <div>
                      <p className="text-[10px] text-blue-600/70 font-black uppercase tracking-widest">Email</p>
                      <p className="text-sm font-black truncate max-w-[150px]">{selectedSubmission.email || 'Tidak ada'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-l-4 border-primary pl-3">Data Formulir Warga</h4>
                  <div className="rounded-3xl border border-slate-100 overflow-hidden">
                    <Table>
                      <TableBody>
                        {Object.entries(selectedSubmission.formData).map(([key, value]) => {
                          // Skip internal fields
                          if (['id', 'status', 'createdAt', 'updatedAt', 'formData', 'fileLinks', 'letterType', 'requestorAuthUid', 'ticketNumber', 'nik', 'requesterName', 'documentNumber'].includes(key)) return null;
                          return (
                            <TableRow key={key} className="hover:bg-transparent">
                              <TableCell className="font-black uppercase text-[9px] tracking-widest text-slate-400 bg-slate-50/50 w-1/3">{formatLabel(key)}</TableCell>
                              <TableCell className="text-xs font-bold text-slate-700 py-4">{formatValue(value)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {selectedSubmission.fileLinks && selectedSubmission.fileLinks.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-l-4 border-primary pl-3">Berkas Lampiran (Google Drive)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedSubmission.fileLinks.map((file) => (
                        <Button key={file.fileId} variant="outline" className="justify-between h-auto py-4 px-6 rounded-2xl border-slate-100 bg-slate-50/30 hover:bg-primary hover:text-white transition-all group" onClick={() => handleDownload(file)}>
                          <div className="flex items-center gap-3">
                            <Download className="h-4 w-4 text-slate-400 group-hover:text-white" />
                            <span className="font-bold text-[10px] uppercase tracking-widest">{formatLabel(file.fieldName)}</span>
                          </div>
                          <FileSignature className="h-3 w-3 opacity-20" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t">
            <Button className="w-full h-12 rounded-2xl font-black uppercase tracking-widest" onClick={() => { setSelectedSubmission(null); if (typeof document !== 'undefined') document.body.style.pointerEvents = 'auto'; }}>Tutup Jendela</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Number Dialog */}
      <Dialog open={!!manualNumberSubmission} onOpenChange={(isOpen) => { if (!isOpen) { setManualNumberSubmission(null); if (typeof document !== 'undefined') document.body.style.pointerEvents = 'auto'; } }}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Buat Nomor Surat</DialogTitle>
            <DialogDescription className="font-medium">Masukkan nomor urut surat resmi untuk pengajuan ini.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-3">
              <Label htmlFor="manual-number" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nomor Urut Surat</Label>
              <Input id="manual-number" type="number" value={manualNumberInput} onChange={(e) => setManualNumberInput(e.target.value)} placeholder="Contoh: 152" disabled={isSubmittingManualNumber} className="h-14 rounded-2xl text-xl font-black text-center" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleManualNumberSubmit} disabled={isSubmittingManualNumber || !manualNumberInput} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">
              {isSubmittingManualNumber ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileSignature className="mr-2 h-5 w-5" />}
              Simpan & Format Nomor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Signatory Choice Dialog */}
      <Dialog open={!!signatorySubmission} onOpenChange={(isOpen) => { if (!isOpen) { setSignatorySubmission(null); if (typeof document !== 'undefined') document.body.style.pointerEvents = 'auto'; } }}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight italic">
              <UserCheck className="h-6 w-6 text-primary" />
              Pilih Penandatangan
            </DialogTitle>
            <DialogDescription className="font-medium">
              Tentukan siapa yang akan menandatangani dokumen ini.
            </DialogDescription>
          </DialogHeader>

          <div className="py-8">
            <RadioGroup value={selectedSigner} onValueChange={(v) => setSelectedSigner(v as 'kades' | 'sekdes')} className="grid gap-4">
              <div className="flex items-center space-x-4 p-5 rounded-2xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                <RadioGroupItem value="kades" id="signer-kades" />
                <Label htmlFor="signer-kades" className="flex-1 cursor-pointer space-y-1">
                  <p className="font-black uppercase tracking-tight text-slate-800">Kepala Desa</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">TASIMIN</p>
                </Label>
              </div>

              <div className="flex items-center space-x-4 p-5 rounded-2xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                <RadioGroupItem value="sekdes" id="signer-sekdes" />
                <Label htmlFor="signer-sekdes" className="flex-1 cursor-pointer space-y-1">
                  <p className="font-black uppercase tracking-tight text-slate-800">Sekretaris Desa</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SOFA BURHANI</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => { setSignatorySubmission(null); if (typeof document !== 'undefined') document.body.style.pointerEvents = 'auto'; }}>BATAL</Button>
            <Button onClick={confirmPrint} className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">LANJUTKAN CETAK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

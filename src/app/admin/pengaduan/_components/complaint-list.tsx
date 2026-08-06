
'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Complaint } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Lightbulb, MessageSquare, Tag, Calendar, Trash2, User, MapPin, Phone, Mail, CornerDownRight } from 'lucide-react';
import { updateComplaintResponse, deleteComplaint } from '@/lib/complaints';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function AdminResponseForm({ complaintId, existingResponse }: { complaintId: string, existingResponse?: string }) {
    const [response, setResponse] = useState(existingResponse || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    const handleSubmit = async () => {
        if (!response.trim() || !firestore) return;
        
        setIsSubmitting(true);
        try {
            await updateComplaintResponse(firestore, complaintId, response);
            toast({
                title: "Jawaban Terkirim",
                description: "Tanggapan Anda telah disimpan dan akan ditampilkan kepada warga.",
            });
        } catch (error) {
             toast({
                title: "Gagal Mengirim Jawaban",
                description: "Terjadi kesalahan saat mengirim tanggapan.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="mt-4 space-y-2">
            <Textarea 
                placeholder="Tulis jawaban atau tanggapan Anda di sini..." 
                rows={4}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                disabled={isSubmitting}
                className="bg-white"
            />
            <Button onClick={handleSubmit} disabled={isSubmitting || !response.trim()} className="w-full sm:w-auto">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {existingResponse ? 'Perbarui Jawaban' : 'Kirim Jawaban'}
            </Button>
        </div>
    );
}

export function ComplaintList() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const complaintsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'complaints'), orderBy('submissionDate', 'desc'), limit(100));
  }, [firestore, user]);

  const { data: complaints, isLoading: isLoadingComplaints } = useCollection<Complaint>(complaintsQuery, { realtime: true });
  
  const handleDelete = async (complaintId: string) => {
    if (!firestore) return;

    try {
        await deleteComplaint(firestore, complaintId);
        toast({
            title: "Pengaduand Dihapus",
            description: "Pengaduan telah berhasil dihapus dari sistem.",
        });
    } catch (error) {
        toast({
            title: "Gagal Menghapus",
            description: "Terjadi kesalahan saat menghapus pengaduan.",
            variant: "destructive",
        });
    }
  };

  return (
    <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50 border-b p-8">
        <CardTitle className="text-xl font-black uppercase tracking-tight">Daftar Pengaduan Masuk</CardTitle>
        <CardDescription className="font-medium">Tinjau laporan warga dan berikan tanggapan resmi pemerintah desa.</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        {isLoadingComplaints || !user ? (
             <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
             </div>
        ) : (
            <Accordion
            type="single"
            collapsible
            className="w-full space-y-4"
            >
            {complaints?.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed">
                    <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Belum ada pengaduan masuk.</p>
                </div>
            )}
            {complaints?.map((complaint) => (
                <AccordionItem
                value={complaint.id}
                key={complaint.id}
                className="border rounded-[1.5rem] px-6 hover:shadow-sm transition-all"
                >
                <AccordionTrigger className="py-5 hover:no-underline">
                    <div className="flex flex-col gap-2 text-left w-full">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-800 line-clamp-1 uppercase">
                            {complaint.reporterName || 'ANONIM'}
                          </p>
                          <p className="text-xs text-slate-500 italic line-clamp-1">"{complaint.description}"</p>
                        </div>

                        <Badge
                        variant={complaint.adminResponse ? 'default' : 'secondary'}
                        className="capitalize shrink-0 font-bold px-3 py-1 rounded-full text-[10px]"
                        >
                        {complaint.adminResponse ? 'DIJAWAB' : 'BARU'}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Calendar className="h-3 w-3" />
                        {complaint.submissionDate?.toDate().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'})}
                    </div>
                    </div>
                </AccordionTrigger>

                <AccordionContent className="space-y-8 pt-4 pb-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <p className="font-black uppercase tracking-widest text-[10px] text-slate-400 flex items-center gap-2">
                                    <User className="w-3 h-3 text-primary" />
                                    Identitas Lengkap Pengadu
                                </p>
                                <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Nama Lengkap</p>
                                        <p className="font-bold text-slate-900 uppercase">{complaint.reporterName || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Alamat Domisili</p>
                                        <p className="text-sm font-medium text-slate-700 flex items-center gap-2"><MapPin className="h-3 w-3" /> {complaint.reporterAddress || '-'}</p>
                                    </div>
                                    <div className="pt-2 grid grid-cols-2 gap-4 border-t border-slate-200">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase">WhatsApp</p>
                                            <p className="text-xs font-bold text-sky-600 flex items-center gap-2"><Phone className="h-3 w-3" /> {complaint.phoneNumber || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Email</p>
                                            <p className="text-xs font-bold text-blue-600 flex items-center gap-2 truncate"><Mail className="h-3 w-3" /> {complaint.email || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <p className="font-black uppercase tracking-widest text-[10px] text-slate-400 flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3 text-primary" />
                                    Isi Aduan Warga
                                </p>
                                <div className="p-6 rounded-[2rem] bg-white border-2 border-dashed border-slate-200 text-sm font-medium text-slate-700 italic leading-relaxed">
                                    "{complaint.description}"
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-[2rem] border-2 border-dashed border-primary/10 bg-primary/5 space-y-6">
                                <h4 className="font-black uppercase tracking-widest text-[10px] text-primary flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" />
                                    Analisis AI Desa
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="font-black text-slate-900 uppercase text-[9px]">Ringkasan Eksekutif:</p>
                                        <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                            {complaint.summaryLLM}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-black text-slate-900 uppercase text-[9px]">Topik Relevan:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {complaint.keywords?.map((kw, i) => (
                                            <Badge key={i} variant="outline" className="font-bold border-primary/20 text-primary uppercase text-[8px] bg-white">
                                                <Tag className="mr-1.5 h-2 w-2" />
                                                {kw}
                                            </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="font-black uppercase tracking-widest text-[10px] text-slate-400 flex items-center gap-2">
                                    <CornerDownRight className="w-3 h-3 text-primary" />
                                    Berikan Tanggapan Resmi
                                </p>
                                <AdminResponseForm complaintId={complaint.id} existingResponse={complaint.adminResponse} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest">
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Hapus Aduan Permanen
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem]">
                                <AlertDialogHeader>
                                <AlertDialogTitle className="font-black uppercase tracking-tight">Konfirmasi Hapus</AlertDialogTitle>
                                <AlertDialogDescription className="font-medium">
                                    Apakah Anda yakin ingin menghapus aduan ini? Tindakan ini tidak dapat dibatalkan dan data akan hilang dari server.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl font-bold">BATAL</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(complaint.id)} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold">YA, HAPUS SEKARANG</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

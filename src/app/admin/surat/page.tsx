'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmissionList } from './_components/submission-list';

export default function AdminSuratPage() {
  return (
    <>
      <PageHeader
        title="Kelola Pengajuan Surat"
        description="Tinjau, setujui, atau tolak pengajuan surat dari warga Desa Sidaurip."
      />
      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-8 border-b bg-slate-50/50">
          <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-800">Daftar Pengajuan Masuk</CardTitle>
          <CardDescription className="font-medium text-slate-500">Seluruh permohonan surat dari warga yang masuk ke sistem.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <SubmissionList />
        </CardContent>
      </Card>
    </>
  );
}

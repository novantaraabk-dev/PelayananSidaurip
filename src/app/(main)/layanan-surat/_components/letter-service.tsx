'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  ShieldCheck, 
  MapPinned, 
  Store, 
  Baby, 
  Skull, 
  Heart, 
  Home, 
  Music, 
  Users, 
  Flower2, 
  UserCheck, 
  Activity, 
  HandHelping,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SktmForm } from './forms/sktm-form';
import { SkckForm } from './forms/skck-form';
import { PindahForm } from './forms/pindah-form';
import { SkuForm } from './forms/sku-form';
import { KelahiranForm } from './forms/kelahiran-form';
import { KematianForm } from './forms/kematian-form';
import { BelumMenikahForm } from './forms/belum-menikah-form';
import { DomisiliForm } from './forms/domisili-form';
import { IjinKeramaianForm } from './forms/ijin-keramaian-form';
import { MoyangForm } from './forms/moyang-form';
import { PemakamanForm } from './forms/pemakaman-form';
import { WaliForm } from './forms/wali-form';
import { ReaktivasiBpjsForm } from './forms/reaktivasi-bpjs-form';
import { PengantarUmumForm } from './forms/pengantar-umum-form';
import { KeteranganUmumForm } from './forms/keterangan-umum-form';

interface LetterServiceProps {
  isAdmin?: boolean;
}

const letterOptions = [
  { type: 'Surat Keterangan Umum', icon: FileText, color: 'bg-slate-200 text-slate-800', description: 'Keperluan administratif desa secara umum.' },
  { type: 'Surat Keterangan Tidak Mampu', icon: HandHelping, color: 'bg-orange-100 text-orange-600', description: 'Untuk bantuan sosial & biaya sekolah.' },
  { type: 'Surat Pengantar SKCK', icon: ShieldCheck, color: 'bg-blue-100 text-blue-600', description: 'Persyaratan melamar pekerjaan / kepolisian.' },
  { type: 'Surat Pengantar Pindah', icon: MapPinned, color: 'bg-sky-100 text-sky-600', description: 'Keterangan pindah domisili antar wilayah.' },
  { type: 'Surat Keterangan Usaha', icon: Store, color: 'bg-purple-100 text-purple-600', description: 'Untuk pengajuan KUR / identitas UMKM.' },
  { type: 'Surat Keterangan Kelahiran', icon: Baby, color: 'bg-pink-100 text-pink-600', description: 'Data kelahiran baru bagi warga desa.' },
  { type: 'Surat Keterangan Kematian', icon: Skull, color: 'bg-slate-200 text-slate-700', description: 'Surat keterangan duka cita & lapor diri.' },
  { type: 'Surat Keterangan Belum Menikah', icon: Heart, color: 'bg-red-100 text-red-600', description: 'Syarat pernikahan atau status lajang.' },
  { type: 'Surat Keterangan Domisili', icon: Home, color: 'bg-amber-100 text-amber-700', description: 'Keterangan tempat tinggal sementara.' },
  { type: 'Surat Ijin Keramaian', icon: Music, color: 'bg-indigo-100 text-indigo-600', description: 'Syarat mengadakan acara / hajatan.' },
  { type: 'Surat Keterangan Moyang', icon: Users, color: 'bg-teal-100 text-teal-600', description: 'Keterangan silsilah keluarga / garis keturunan.' },
  { type: 'Surat Keterangan Pemakaman', icon: Flower2, color: 'bg-sky-100 text-sky-700', description: 'Ijin penguburan di makam umum desa.' },
  { type: 'Surat Keterangan Wali', icon: UserCheck, color: 'bg-sky-100 text-sky-600', description: 'Keterangan perwalian anak di bawah umur.' },
  { type: 'Surat Keterangan Reaktivasi BPJS Kesehatan', icon: Activity, color: 'bg-rose-100 text-rose-600', description: 'Pengurusan BPJS yang terblokir / nonaktif.' },
  { type: 'Surat Pengantar Umum', icon: FileText, color: 'bg-slate-200 text-slate-800', description: 'Keperluan pengantar administrasi umum lainnya.' },
];

export function LetterService({ isAdmin = false }: LetterServiceProps) {
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderForm = () => {
    const props = { isAdmin };
    switch (selectedLetter) {
      case 'Surat Keterangan Umum': return <KeteranganUmumForm {...props} />;
      case 'Surat Keterangan Tidak Mampu': return <SktmForm {...props} />;
      case 'Surat Pengantar SKCK': return <SkckForm {...props} />;
      case 'Surat Pengantar Pindah': return <PindahForm {...props} />;
      case 'Surat Keterangan Usaha': return <SkuForm {...props} />;
      case 'Surat Keterangan Kelahiran': return <KelahiranForm {...props} />;
      case 'Surat Keterangan Kematian': return <KematianForm {...props} />;
      case 'Surat Keterangan Belum Menikah': return <BelumMenikahForm {...props} />;
      case 'Surat Keterangan Domisili': return <DomisiliForm {...props} />;
      case 'Surat Ijin Keramaian': return <IjinKeramaianForm {...props} />;
      case 'Surat Keterangan Moyang': return <MoyangForm {...props} />;
      case 'Surat Keterangan Pemakaman': return <PemakamanForm {...props} />;
      case 'Surat Keterangan Wali': return <WaliForm {...props} />;
      case 'Surat Keterangan Reaktivasi BPJS Kesehatan': return <ReaktivasiBpjsForm {...props} />;
      case 'Surat Pengantar Umum': return <PengantarUmumForm {...props} />;
      default: return null;
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-10">
      {!selectedLetter ? (
        <div className="space-y-8">
           <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight font-display italic">
                Pilih <span className="text-primary not-italic">Layanan Surat</span>
              </h2>
              <p className="text-sm text-slate-500 font-medium max-w-lg mx-auto">
                Silakan pilih salah satu kartu di bawah ini untuk memulai pengisian formulir pengajuan surat resmi Anda.
              </p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {letterOptions.map((opt) => (
                <Card 
                  key={opt.type} 
                  className="cursor-pointer group relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none bg-white overflow-hidden rounded-[3rem] flex flex-col border-2 border-transparent hover:border-primary/10 shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
                  onClick={() => {
                    setSelectedLetter(opt.type);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <CardContent className="p-10 flex flex-col h-full items-center text-center">
                    <div className={cn("w-24 h-24 rounded-[2rem] mb-8 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg", opt.color)}>
                      <opt.icon className="h-12 w-12" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {opt.type}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-50 w-full flex items-center justify-center gap-4">
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">BUKA FORMULIR</span>
                       <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <ArrowLeft className="h-5 w-5 rotate-180" />
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
           </div>
        </div>
      ) : (
        <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          <CardHeader className="bg-primary p-10 md:p-16 text-white relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
               <FileText className="w-48 h-48" />
            </div>
            <div className="space-y-8 relative z-10">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedLetter('')} 
                className="text-white hover:bg-white/10 -ml-4 font-black uppercase text-[10px] tracking-[0.4em]"
              >
                <ArrowLeft className="h-5 w-5 mr-3" /> KEMBALI KE DAFTAR
              </Button>
              <div className="space-y-3">
                <CardTitle className="text-3xl md:text-5xl font-black uppercase font-display italic tracking-tighter">
                  {selectedLetter}
                </CardTitle>
                <CardDescription className="text-white/60 font-medium text-lg italic">
                  Lengkapi data formulir pengajuan {isAdmin ? 'oleh Admin' : ''} secara akurat.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 md:p-16 bg-white">
            {renderForm()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

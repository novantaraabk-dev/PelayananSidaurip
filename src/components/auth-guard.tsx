'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { getCitizenProfile } from '@/lib/citizens';
import { Loader2, ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AuthGuard({
  children,
  title = "Akses Terbatas",
  description = "Silakan masuk ke portal warga untuk mengakses layanan ini."
}: AuthGuardProps) {
  const { user, isUserLoading, firestore } = useFirebase();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      if (isUserLoading) return;

      if (!user) {
        setHasProfile(false);
        return;
      }

      // Bypass for admin
      if (user) {
        setHasProfile(true);
        return;
      }

      if (firestore) {
        try {
          const profile = await getCitizenProfile(firestore, user.uid);
          setHasProfile(!!profile);
        } catch (e) {
          console.error("Profile check error:", e);
          setHasProfile(false);
        }
      }
    };

    checkProfile();
  }, [user, isUserLoading, firestore]);

  if (isUserLoading || hasProfile === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Memeriksa Otoritas...</p>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center space-y-8 bg-white rounded-[3rem] border shadow-xl shadow-slate-200/50">
        <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto">
          <ShieldAlert className="h-10 w-10 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">{title}</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {description}
          </p>
        </div>
        <div className="pt-4">
          <Button asChild className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
            <Link href="/portal" className="flex items-center gap-3">
              Masuk Portal Digital
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Layanan Mandiri Desa Sidaurip
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

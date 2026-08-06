'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function PortalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white p-4">
      <Card className="w-full max-w-md shadow-xl border-sky-100">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-sky-900">Portal Layanan Digital</CardTitle>
            <CardDescription className="text-gray-600">
              Warga dapat langsung menggunakan layanan publik tanpa mengisi data telepon atau email. Login hanya untuk admin desa.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/dashboard')} className="w-full h-12 bg-sky-700 hover:bg-sky-800 text-lg font-semibold">
            Masuk ke Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-sky-600" />
            Akses layanan publik tersedia tanpa registrasi tambahan.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

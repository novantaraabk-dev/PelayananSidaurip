'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Phone,
  Shield,
  Heart,
  Building2,
  Users,
  Siren,
  MapPin,
  Landmark,
  UserCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ContactItem = {
  label: string;
  number: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  category: 'pemerintah' | 'keamanan' | 'kesehatan' | 'wilayah';
};

const contacts: ContactItem[] = [
  {
    label: 'Kepala Desa',
    number: '082324502378',
    icon: Landmark,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    category: 'pemerintah',
  },
  {
    label: 'Babinsa',
    number: '081282148178',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'keamanan',
  },
  {
    label: 'Bhabinkamitibmas',
    number: '085229658988',
    icon: Shield,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    category: 'keamanan',
  },
  {
    label: 'Bidan Desa',
    number: '081226370112',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    category: 'kesehatan',
  },
  {
    label: 'Camat Karangpucung',
    number: '08122727683',
    icon: Building2,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    category: 'pemerintah',
  },
  {
    label: 'Koramil Karangpucung',
    number: '085229658988',
    icon: Shield,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    category: 'keamanan',
  },
  {
    label: 'Polsek Karangpucung',
    number: '083867770110',
    icon: Siren,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    category: 'keamanan',
  },
  {
    label: 'Pukesmas Karangapucung',
    number: '082234577980',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    category: 'kesehatan',
  },
  {
    label: 'Kadus 1',
    number: '082138337494',
    icon: Users,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    category: 'wilayah',
  },
  {
    label: 'Kadus 2',
    number: '085282256678',
    icon: Users,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    category: 'wilayah',
  },
  {
    label: 'Kadus 3',
    number: '083113339132',
    icon: Users,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    category: 'wilayah',
  },
];

const formatPhoneDisplay = (number: string) => {
  if (number.length === 12) {
    return `${number.slice(0, 4)} ${number.slice(4, 8)} ${number.slice(8)}`;
  }
  if (number.length === 11) {
    return `${number.slice(0, 4)} ${number.slice(4, 7)} ${number.slice(7)}`;
  }
  if (number.length === 13) {
    return `${number.slice(0, 4)} ${number.slice(4, 8)} ${number.slice(8)}`;
  }
  return number;
};

const categoryLabels: Record<string, { label: string; icon: React.ElementType; color: string; border: string }> = {
  pemerintah: { label: 'Pemerintahan', icon: Landmark, color: 'text-emerald-700 bg-emerald-50', border: 'border-emerald-200' },
  keamanan: { label: 'Keamanan & Ketertiban', icon: Shield, color: 'text-blue-700 bg-blue-50', border: 'border-blue-200' },
  kesehatan: { label: 'Kesehatan', icon: Heart, color: 'text-rose-700 bg-rose-50', border: 'border-rose-200' },
  wilayah: { label: 'Kepala Dusun', icon: Users, color: 'text-violet-700 bg-violet-50', border: 'border-violet-200' },
};

export default function NomorPentingPage() {
  const groupedContacts = contacts.reduce(
    (acc, contact) => {
      if (!acc[contact.category]) acc[contact.category] = [];
      acc[contact.category].push(contact);
      return acc;
    },
    {} as Record<string, ContactItem[]>
  );

  const categoryOrder = ['pemerintah', 'keamanan', 'kesehatan', 'wilayah'];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                className="font-bold gap-2 text-primary hover:bg-slate-100 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Beranda</span>
              </Button>
            </Link>
            <Link href="/layanan-surat/">
              <Button className="bg-secondary hover:bg-yellow-600 text-primary-foreground font-black px-6 rounded-xl shadow-lg shadow-secondary/20 h-10">
                Portal Layanan
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* KOP SURAT / OFFICIAL HEADER */}
        <div className="mb-10">
          <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
            {/* Green accent bar */}
            <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-secondary" />
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                    <Landmark className="h-7 w-7" />
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 font-display">
                  Pemerintah Desa Pangawaren
                </h2>
                <p className="text-sm md:text-base font-bold uppercase tracking-widest text-slate-500">
                  Kecamatan Karangpucung
                </p>
                <p className="text-sm md:text-base font-bold uppercase tracking-widest text-slate-500">
                  Kabupaten Cilacap
                </p>
                <div className="flex items-center justify-center gap-2 text-slate-400 text-xs md:text-sm font-medium pt-2">
                  <MapPin className="h-3.5 w-3.5 text-primary/60" />
                  <span>Jl. Desa Pangawaren No. 1 Karangpucung Cilacap Kode Pos 53255</span>
                </div>
              </div>

              {/* Divider */}
              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="w-2 h-2 rounded-full bg-primary/30" />
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              </div>

              {/* Title */}
              <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 font-display italic">
                  Daftar Nomor <span className="text-primary not-italic">Penting</span>
                </h1>
                <div className="max-w-xl mx-auto">
                  <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed">
                    Jika terjadi kejadian silahkan hubungi nomor di bawah ini :
                  </p>
                </div>
                <Badge className="bg-red-50 text-red-600 font-black uppercase text-[10px] tracking-widest px-6 py-2 border-none shadow-sm animate-pulse">
                  <Siren className="h-3 w-3 mr-2" />
                  Nomor Darurat
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CONTACT LIST BY CATEGORY */}
        <div className="space-y-10">
          {categoryOrder.map((catKey) => {
            const catInfo = categoryLabels[catKey];
            const catContacts = groupedContacts[catKey];
            if (!catContacts) return null;

            return (
              <section key={catKey} className="space-y-6">
                {/* Category Header */}
                <div className="flex items-center gap-4">
                  <div className={cn('p-3 rounded-2xl shadow-lg', catInfo.color)}>
                    <catInfo.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">
                    {catInfo.label}
                  </h3>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                {/* Contact Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catContacts.map((contact, i) => (
                    <Card
                      key={i}
                      className={cn(
                        'rounded-[2rem] border-none shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 bg-white group overflow-hidden'
                      )}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-stretch">
                          {/* Icon side */}
                          <div
                            className={cn(
                              'flex items-center justify-center w-20 md:w-24 shrink-0',
                              contact.bgColor,
                              contact.color
                            )}
                          >
                            <contact.icon className="h-8 w-8 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6" />
                          </div>
                          {/* Info side */}
                          <div className="flex-1 p-5 md:p-6 space-y-2 min-w-0">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                              {contact.label}
                            </p>
                            <p className="text-lg md:text-xl font-black text-slate-900 tracking-tight font-mono">
                              {formatPhoneDisplay(contact.number)}
                            </p>
                            <a
                              href={`tel:${contact.number}`}
                              className={cn(
                                'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                                contact.bgColor,
                                contact.color,
                                'hover:shadow-md hover:scale-105'
                              )}
                            >
                              <Phone className="h-3 w-3" />
                              Hubungi
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* LAYANAN DESA PHONE NUMBER - BOTTOM CTA */}
        <div className="mt-16 mb-8">
          <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-primary text-white relative">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-[0.04]">
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
              <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white -translate-x-1/3 translate-y-1/3" />
            </div>

            <CardContent className="relative z-10 p-10 md:p-16 text-center space-y-8">
              <div className="space-y-4">
                <Badge className="bg-secondary text-primary-foreground font-black uppercase text-[10px] tracking-widest px-6 py-2 border-none shadow-lg">
                  <Phone className="h-3 w-3 mr-2" />
                  Nomor Pelayanan
                </Badge>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-display italic">
                  Nomor Pelayanan Desa Pangawaren
                </h3>
              </div>

              <a
                href="tel:085111318412"
                className="group inline-block"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-[2rem] blur-xl group-hover:bg-white/20 transition-all duration-500" />
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-[2rem] px-10 md:px-16 py-8 group-hover:bg-white/15 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl">
                    <p className="text-4xl md:text-6xl font-black tracking-wider font-mono text-secondary">
                      0851 1131 8412
                    </p>
                  </div>
                </div>
              </a>

              <p className="text-sm text-white/60 font-semibold max-w-md mx-auto">
                Hubungi nomor di atas untuk informasi pelayanan administrasi Desa Pangawaren.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-primary text-white/40 py-12 border-t border-white/5 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <Logo />
          <p className="mt-8 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Pemerintah Desa Pangawaren Digital Portal
          </p>
        </div>
      </footer>
    </div>
  );
}

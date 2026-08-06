'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemoFirebase, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ArrowRight, CheckCircle2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SambutanSection() {
  const firestore = useFirestore();
  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData } = useDoc<{ kadesPhotoUrl?: string }>(profileRef);
  const imageUrl = profileData?.kadesPhotoUrl || "https://picsum.photos/seed/kades/600/800";

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid items-stretch gap-10 lg:grid-cols-12">
        {/* Foto Kades */}
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-4 flex justify-center"
        >
          <Card className="w-full max-w-[340px] rounded-[2.5rem] overflow-hidden border border-sky-600/20 bg-white shadow-xl hover:shadow-[0_30px_60px_rgba(14,165,233,0.14)] transition-all duration-500 flex flex-col group">
            <div className="aspect-[3/4] relative bg-slate-100 flex-grow overflow-hidden">
              <Image
                src={imageUrl}
                alt="Foto Kepala Desa Sidaurip"
                fill
                sizes="(max-w-768px) 100vw, 340px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-transparent to-transparent" />
            </div>
            <div className="p-6 text-center bg-sky-900 text-white">
              <h3 className="text-lg font-black uppercase tracking-tight font-display italic">TASIMIN</h3>
              <p className="text-[9px] font-bold text-amber-300 uppercase tracking-[0.3em] mt-1">Kepala Desa Sidaurip</p>
            </div>
          </Card>
        </motion.div>

        {/* Narasi Sambutan */}
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-8 flex flex-col justify-center space-y-6"
        >
          <div className="flex items-center">
            <Badge className="bg-sky-50 text-sky-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border border-sky-200/50 shadow-sm rounded-full">
              <User className="h-3 w-3 mr-1 text-sky-600 inline" /> Profil & Sambutan
            </Badge>
          </div>

          <h2 className="text-3xl font-black text-slate-900 leading-tight uppercase font-display italic tracking-tight sm:text-4xl">
            Melayani dengan <span className="text-sky-700 not-italic">Hati</span>, Membangun dengan <span className="text-amber-500">Inovasi</span>.
          </h2>

          <div className="prose prose-slate max-w-none">
            <p className="text-base md:text-lg leading-relaxed text-slate-600 font-medium italic border-l-4 border-amber-500 pl-4 py-1">
              "Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi digital Desa Sidaurip. Website ini adalah perwujudan dari visi kami untuk menciptakan transparansi dan kemudahan layanan bagi seluruh warga."
            </p>
            <p className="mt-4 text-slate-600 text-sm md:text-base leading-relaxed">
              Di era transformasi digital ini, kecepatan informasi dan kemudahan akses layanan adalah kunci kemajuan wilayah. Kami menghadirkan sistem layanan mandiri ini agar warga dapat mengurus berbagai kebutuhan administrasi dari mana saja secara cepat dan terbuka.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {["Transparansi", "Efisiensi", "Digitalisasi"].map(tag => (
              <div key={tag} className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 border rounded-full text-[9px] font-black uppercase tracking-widest text-sky-800">
                <CheckCircle2 className="h-3 w-3 text-amber-500" /> {tag}
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link href="/profil-desa" aria-label="Baca selengkapnya tentang profil desa">
              <Button className="h-11 rounded-full bg-sky-700 px-6 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-800">
                Selengkapnya
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

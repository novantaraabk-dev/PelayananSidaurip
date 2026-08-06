'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Menu, ArrowRight, ChevronDown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const primaryLinks = [
  { href: '/pelayanan-desa/', label: 'Pelayanan Desa' },
  { href: '/profil-desa/', label: 'Profil Desa' },
  { href: '/statistik/', label: 'Statistik' },
  { href: '/BeritaDesa/', label: 'Berita Desa' },
];

const moreLinks = [
  { href: '/layanan-surat/', label: 'Layanan Surat' },
  { href: '/tata-kelola-desa/', label: 'Tata Kelola Desa' },
  { href: '/desa-anti-korupsi/', label: 'Desa Anti Korupsi' },
  { href: '/pengumuman/', label: 'Pengumuman' },
  { href: '/pengaduan/', label: 'Pengaduan Warga' },
  { href: '/nomor-penting/', label: 'Nomor Penting' },
];

const potensiSubLinks = [
  { href: '/potensi-desa?tab=pariwisata-kebudayaan', label: 'Pariwisata & Kebudayaan' },
  { href: '/potensi-desa?tab=umkm-industri', label: 'UMKM & Industri Kreatif' },
  { href: '/potensi-desa?tab=bumdes', label: 'BUMDes Sidaurip' },
  { href: '/potensi-desa?tab=pertanian-perkebunan', label: 'Pertanian & Perkebunan' },
  { href: '/potensi-desa?tab=sda-lingkungan', label: 'Sumber Daya Alam & Lingkungan' }
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [mobilePotensiOpen, setMobilePotensiOpen] = useState(false);

  useEffect(() => {
    const checkScrollable = () => {
      try {
        const scrollable = document.documentElement.scrollHeight > window.innerHeight;
        setIsScrollable(scrollable);
        return scrollable;
      } catch (e) {
        setIsScrollable(false);
        return false;
      }
    };

    const onScroll = () => {
      const scrollableNow = checkScrollable();
      setIsScrolled(window.scrollY > 16 || scrollableNow);
    };

    // Initial checks
    const initialScrollable = checkScrollable();
    setIsScrolled(window.scrollY > 16 || initialScrollable);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      const s = checkScrollable();
      setIsScrolled(window.scrollY > 16 || s);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', () => {
        const s = checkScrollable();
        setIsScrolled(window.scrollY > 16 || s);
      });
    };
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 z-50 w-full border-b transition-all duration-300',
        isScrolled
          ? 'border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.06)]'
          : 'border-transparent bg-transparent backdrop-blur-none'
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className={cn('transition-colors', isScrolled ? 'text-slate-900' : 'text-white')} aria-label="Beranda Portal Portal Desa Sidaurip">
          <Logo />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-4 xl:gap-6 md:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group relative text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 whitespace-nowrap',
                isScrolled ? 'text-slate-600 hover:text-sky-700' : 'text-white/90 hover:text-white'
              )}
            >
              <span>{link.label}</span>
              <span className={cn(
                'absolute bottom-[-0.4rem] left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100',
                isScrolled ? 'bg-sky-600' : 'bg-white'
              )} />
            </Link>
          ))}

          {/* Dropdown "Potensi Desa" */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              'group relative flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 whitespace-nowrap outline-none',
              isScrolled ? 'text-slate-600 hover:text-sky-700' : 'text-white/90 hover:text-white'
            )}>
              <span>Potensi Desa</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              <span className={cn(
                'absolute bottom-[-0.4rem] left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100',
                isScrolled ? 'bg-sky-600' : 'bg-white'
              )} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="mt-3 w-60 rounded-xl border border-slate-100 bg-white/95 backdrop-blur-xl p-2 shadow-xl shadow-slate-200/50">
              {potensiSubLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild className="rounded-lg px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 transition-colors hover:text-sky-700 hover:bg-sky-50 cursor-pointer">
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dropdown "Lainnya" */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              'group relative flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 whitespace-nowrap outline-none',
              isScrolled ? 'text-slate-600 hover:text-sky-700' : 'text-white/90 hover:text-white'
            )}>
              <span>Lainnya</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              <span className={cn(
                'absolute bottom-[-0.4rem] left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100',
                isScrolled ? 'bg-sky-600' : 'bg-white'
              )} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="mt-3 w-52 rounded-xl border border-slate-100 bg-white/95 backdrop-blur-xl p-2 shadow-xl shadow-slate-200/50">
              {moreLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild className="rounded-lg px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 transition-colors hover:text-sky-700 hover:bg-sky-50 cursor-pointer">
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/login/" aria-label="Masuk area admin">
            <Button variant="outline" size="sm" className={cn(
              'h-8 rounded-full border px-3 text-[11px] font-semibold',
              isScrolled
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-white/20 bg-white/10 text-white hover:bg-white/15'
            )}>
              Admin
            </Button>
          </Link>
          <Link href="/layanan-surat/" aria-label="Ajukan layanan desa">
            <Button className="h-8 rounded-full bg-sky-700 px-3 text-[11px] font-semibold text-white shadow-[0_12px_30px_rgba(5,150,105,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-800">
              Ajukan Layanan
            </Button>
          </Link>
        </div>

        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={cn('rounded-full', isScrolled ? 'text-slate-700' : 'text-white')} aria-label="Buka menu navigasi">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] border-l border-white/10 bg-slate-950/95 text-white">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu navigasi</SheetTitle>
                <SheetDescription>Menu cepat layanan desa</SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-6 h-[calc(100vh-80px)] overflow-y-auto pb-12 pr-2 no-scrollbar">
                <Link href="/" className="inline-flex shrink-0">
                  <Logo />
                </Link>
                <div className="space-y-3">
                  {primaryLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="block rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                      {link.label}
                    </Link>
                  ))}

                  {/* Collapsible Potensi Desa on Mobile */}
                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    <button
                      onClick={() => setMobilePotensiOpen(!mobilePotensiOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <span>Potensi Desa</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", mobilePotensiOpen && "rotate-180")} />
                    </button>
                    {mobilePotensiOpen && (
                      <div className="bg-white/5 border-t border-white/5 p-2 space-y-1">
                        {potensiSubLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {moreLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="block rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                      {link.label}
                    </Link>
                  ))}
                </div>
                <Link href="/layanan-surat/" className="shrink-0">
                  <Button className="mt-2 h-12 w-full rounded-full bg-sky-600 text-white">
                    Ajukan Layanan
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

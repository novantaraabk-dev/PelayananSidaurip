
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';

import { Logo } from '@/components/logo';
import {
  FileCheck,
  Megaphone,
  LogOut,
  Settings,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Users,
  FilePlus,
  Files,
  ChevronDown,
  Newspaper,
  PlusCircle,
  List,
  Building2,
  Menu,
  X,
  ArrowLeft,
  FileStack,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Landmark,
} from 'lucide-react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin/pelayanan', icon: BookOpen, label: 'Data Pelayanan' },
  { href: '/admin/penduduk', icon: Users, label: 'Data Penduduk' },
  { href: '/admin/pemerintahan', icon: Building2, label: 'Pemerintahan Desa' },
  { href: '/admin/tata-kelola-desa', icon: BarChart3, label: 'Tata Kelola Desa' },
  { href: '/admin/desa-anti-korupsi', icon: ShieldCheck, label: 'Desa Anti Korupsi' },
  { href: '/admin/potensi-desa', icon: Landmark, label: 'Potensi Desa' },
  { href: '/admin/pengaduan', icon: MessageSquare, label: 'Jawab Pengaduan' },
  { href: '/admin/pengumuman', icon: Megaphone, label: 'Kelola Pengumuman' },
  { href: '/admin/settings', icon: Settings, label: 'Pengaturan' },
];

function AdminMobileHeader() {
  const { toggleSidebar, openMobile } = useSidebar();

  return (
    <header className="md:hidden sticky top-0 z-40 w-full h-16 bg-primary flex items-center justify-between px-6 shadow-md border-b border-white/10 text-white">
      <Logo />
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="text-white hover:bg-white/10"
      >
        {openMobile ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { auth, user } = useFirebase();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSuratOpen, setIsSuratOpen] = useState(pathname.startsWith('/admin/surat'));
  const [isBeritaOpen, setIsBeritaOpen] = useState(pathname.startsWith('/admin/berita'));

  useEffect(() => {
    if (isLoggingOut) return;
    const adminFlag = localStorage.getItem('isAdmin');
    if (adminFlag === 'true' && user) {
      setIsAdmin(true);
    } else if (adminFlag === 'true' && !user) {
      return;
    } else {
      setIsAdmin(false);
      router.replace('/login');
    }
  }, [router, user, isLoggingOut]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem('isAdmin');
      if (auth) await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Gagal logout:', error);
      setIsLoggingOut(false);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-primary">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary mb-4" />
          <p className="text-[10px] font-black tracking-[0.4em] text-white/50 uppercase">Otoritas Terverifikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-white/10 bg-primary">
        <SidebarHeader className="p-8">
          <Logo />
        </SidebarHeader>

        <SidebarContent className="px-6">
          <div className="mb-6 px-4">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Navigasi Admin</p>
          </div>

          <SidebarMenu className="gap-3 font-sans">
            <div className="mb-2 mt-2 px-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">Prioritas Utama</p>
            </div>

            <Collapsible
              open={isSuratOpen}
              onOpenChange={setIsSuratOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip="Manajemen Surat"
                    isActive={pathname.startsWith('/admin/surat')}
                    className="rounded-2xl h-12 transition-all data-[active=true]:bg-secondary data-[active=true]:text-primary-foreground"
                  >
                    <Files className={pathname.startsWith('/admin/surat') ? 'text-primary-foreground' : 'text-white/40'} />
                    <span className="font-bold">Manajemen Surat</span>
                    <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform duration-200", isSuratOpen && "rotate-180")} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-6 mt-2 border-l pl-2 border-white/10 gap-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/admin/surat'} className="rounded-xl h-10 transition-all data-[active=true]:text-secondary">
                        <Link href="/admin/surat" className="flex items-center gap-3">
                          <FileCheck className="h-4 w-4" />
                          <span className="font-bold text-xs">Kelola Surat</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/admin/surat/input'} className="rounded-xl h-10 transition-all data-[active=true]:text-secondary">
                        <Link href="/admin/surat/input" className="flex items-center gap-3">
                          <FilePlus className="h-4 w-4" />
                          <span className="font-bold text-xs">Pengajuan Baru</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/admin/surat/capil'} className="rounded-xl h-10 transition-all data-[active=true]:text-secondary">
                        <Link href="/admin/surat/capil" className="flex items-center gap-3">
                          <FileStack className="h-4 w-4" />
                          <span className="font-bold text-xs">Formulir Capil</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <Collapsible
              open={isBeritaOpen}
              onOpenChange={setIsBeritaOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip="Berita"
                    isActive={pathname.startsWith('/admin/berita')}
                    className="rounded-2xl h-12 transition-all data-[active=true]:bg-secondary data-[active=true]:text-primary-foreground"
                  >
                    <Newspaper className={pathname.startsWith('/admin/berita') ? 'text-primary-foreground' : 'text-white/40'} />
                    <span className="font-bold">Berita Desa</span>
                    <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform duration-200", isBeritaOpen && "rotate-180")} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-6 mt-2 border-l pl-2 border-white/10 gap-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/admin/berita/buat'} className="rounded-xl h-10 transition-all data-[active=true]:text-secondary">
                        <Link href="/admin/berita/buat" className="flex items-center gap-3">
                          <PlusCircle className="h-4 w-4" />
                          <span className="font-bold text-xs">Buat Berita</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/admin/berita'} className="rounded-xl h-10 transition-all data-[active=true]:text-secondary">
                        <Link href="/admin/berita" className="flex items-center gap-3">
                          <List className="h-4 w-4" />
                          <span className="font-bold text-xs">Rincian Berita</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <div className="mb-2 mt-4 px-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">Data & Informasi</p>
            </div>

            {adminNavItems
              .filter((item) => item.href !== '/admin/settings')
              .map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    className="rounded-2xl h-12 transition-all data-[active=true]:bg-secondary data-[active=true]:text-primary-foreground"
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className={pathname.startsWith(item.href) ? 'text-primary-foreground' : 'text-white/40'} />
                      <span className="font-bold">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

            <div className="mb-2 mt-4 px-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">Sistem</p>
            </div>

            <SidebarMenuItem key="/admin/settings">
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/admin/settings')}
                tooltip="Pengaturan"
                className="rounded-2xl h-12 transition-all data-[active=true]:bg-secondary data-[active=true]:text-primary-foreground"
              >
                <Link href="/admin/settings" className="flex items-center gap-3">
                  <Settings className={pathname.startsWith('/admin/settings') ? 'text-primary-foreground' : 'text-white/40'} />
                  <span className="font-bold">Pengaturan</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-8">
          <div className="bg-white/5 rounded-3xl p-5 border border-white/10 space-y-4">
            <SidebarMenuItem className="list-none">
              <SidebarMenuButton
                onClick={handleLogout}
                className="w-full justify-center bg-secondary text-primary-foreground rounded-2xl hover:bg-yellow-600 transition-all font-black shadow-lg shadow-secondary/30"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>KELUAR</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background flex flex-col min-h-screen">
        <AdminMobileHeader />
        <main className="max-w-[1400px] mx-auto w-full p-4 md:p-12 flex-1 overflow-x-hidden">
          {children}
        </main>

        <footer className="bg-primary border-t border-white/10 py-8 px-4 md:px-12 mt-auto text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-4 bg-secondary rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Sistem Administrasi Desa Sidaurip v1.0
              </p>
            </div>
            <p className="text-[10px] font-bold text-white/20 uppercase">
              © 2026 Pemerintah Kabupaten Cilacap • Hak Cipta Dilindungi
            </p>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

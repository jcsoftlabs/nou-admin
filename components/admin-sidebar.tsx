'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  BarChart3,
  Receipt,
  Mic,
  HelpCircle,
  Bell,
  BookOpen,
  GitBranch, // Icone pour Parrainage
  Gift, // Icone pour Dons
  Newspaper, // Icone pour News
  Megaphone, // Icone pour Annonces
  Image as ImageIcon, // Icone pour Médiathèque
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Membres',
    href: '/dashboard/membres',
    icon: Users,
  },
  {
    title: 'Cotisations',
    href: '/dashboard/cotisations',
    icon: Receipt,
  },
  {
    title: 'Dons',
    href: '/dashboard/dons',
    icon: Gift,
  },
  {
    title: 'Formations',
    href: '/dashboard/formations',
    icon: BookOpen,
  },
  {
    title: 'Podcasts',
    href: '/dashboard/podcasts',
    icon: Mic,
  },
  {
    title: 'Quiz',
    href: '/dashboard/quiz',
    icon: HelpCircle,
  },
  {
    title: 'News',
    href: '/dashboard/news',
    icon: Newspaper,
  },
  {
    title: 'Annonces',
    href: '/dashboard/annonces',
    icon: Megaphone,
  },
  {
    title: 'Médiathèque',
    href: '/dashboard/mediatheque',
    icon: ImageIcon,
  },
  {
    title: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
  },
  {
    title: 'Statistiques',
    href: '/dashboard/stats',
    icon: BarChart3,
  },
  {
    title: 'Parrainage',
    href: '/dashboard/parrainage',
    icon: GitBranch,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-center">
          <Image
            src="/nou-logo.svg"
            alt="NOU Logo"
            width={120}
            height={60}
            priority
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

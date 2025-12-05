import { AdminSidebar } from '@/components/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

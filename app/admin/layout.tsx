import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Mail,
  Activity,
  FileUp,
  LogOut,
  BarChart3,
} from 'lucide-react';
import { NavLink } from '@/components/admin/nav-link';
import { NotificationBell } from '@/components/admin/notification-bell';

const adminNav = [
  { name: 'Dashboard', href: '/admin', iconName: 'LayoutDashboard' },
  { name: 'Blogs', href: '/admin/blogs', iconName: 'FileText' },
  { name: 'Projects', href: '/admin/projects', iconName: 'Briefcase' },
  { name: 'Messages', href: '/admin/messages', iconName: 'Mail' },
  { name: 'Newsletter', href: '/admin/newsletter', iconName: 'MailPlus' },
  { name: 'Analytics', href: '/admin/analytics', iconName: 'BarChart3' },
  { name: 'Activity', href: '/admin/activity', iconName: 'Activity' },
  { name: 'Resume', href: '/admin/resume', iconName: 'FileUp' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Portfolio Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="ghost" size="sm" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <nav className="space-y-1 sticky top-24">
              {adminNav.map((item) => (
                <NavLink key={item.name} href={item.href} iconName={item.iconName}>
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <div className="min-h-[calc(100vh-12rem)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

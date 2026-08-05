'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, FileWarning, Brain, MessageSquare, Users, Tent,
  BarChart3, Bell, Settings, Eye, LogOut, Menu, X, Moon, Sun, ShieldAlert, Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  supabase, Incident, Volunteer, ReliefCamp, Notification as NotifType,
} from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/map', label: 'Live Map', icon: Map },
  { href: '/dashboard/report', label: 'Report Incident', icon: FileWarning },
  { href: '/dashboard/ai-detection', label: 'AI Detection', icon: Brain },
  { href: '/dashboard/chat', label: 'Emergency Chat', icon: MessageSquare },
  { href: '/dashboard/volunteers', label: 'Volunteers', icon: Users },
  { href: '/dashboard/camps', label: 'Relief Camps', icon: Tent },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function useDashboardData(userId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-data', userId],
    queryFn: async () => {
      const [incidents, notifs] = await Promise.all([
        supabase.from('incidents').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('notifications').select('*').eq('user_id', userId!).order('created_at', { ascending: false }).limit(20),
      ]);
      return {
        incidents: (incidents.data || []) as Incident[],
        unreadNotifs: ((notifs.data || []) as NotifType[]).filter(n => !n.read).length,
      };
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data } = useDashboardData(user?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-chart-5 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const isAdmin = profile?.role === 'admin';
  const navList = isAdmin ? [...navItems, { href: '/dashboard/admin', label: 'Admin Panel', icon: ShieldAlert }] : navItems;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const Sidebar = (
    <div className="flex flex-col h-full">
      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-chart-5 flex items-center justify-center shrink-0">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-sm">DisasterEye <span className="gradient-text">AI</span></span>
      </Link>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navList.map((item) => {
          const isActive = pathname === item.href;
          const showBadge = item.href === '/dashboard/notifications' && data?.unreadNotifs;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', isActive && 'text-primary')} />
              <span className="flex-1">{item.label}</span>
              {showBadge ? (
                <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
                  {showBadge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-2 px-2 py-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-chart-5 text-white text-xs">
              {profile?.display_name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{profile?.display_name || 'User'}</div>
            <div className="text-xs text-muted-foreground capitalize">{profile?.role || 'citizen'}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-border glass">
        {Sidebar}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 lg:hidden"
            >
              {Sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border glass flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium hidden sm:block">
              {navItems.find(n => n.href === pathname)?.label || 'DisasterEye AI'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                {data?.unreadNotifs ? (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                    {data.unreadNotifs}
                  </span>
                ) : null}
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

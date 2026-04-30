'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Mail,
  MailPlus,
  Activity,
  FileUp,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

// Icon mapping to avoid passing components from server to client
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  Briefcase,
  Mail,
  MailPlus,
  Activity,
  FileUp,
  BarChart3,
};

interface NavLinkProps {
  href: string;
  iconName: string;
  children: React.ReactNode;
}

export function NavLink({ href, iconName, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
  const Icon = iconMap[iconName];

  if (!Icon) {
    console.warn(`Icon "${iconName}" not found in iconMap`);
    return null;
  }

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200',
        isActive
          ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
      <span>{children}</span>
    </Link>
  );
}


import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border">
      <div className="mx-auto max-w-[720px] px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-foreground hover:text-brand transition-colors">
          Divij Shrivastava
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-sm text-muted-fg hover:text-foreground transition-colors">
            Blog
          </Link>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[11px] text-muted-fg border border-border rounded px-1.5 py-0.5 font-mono">
            <span className="text-[10px]">&#8984;</span>K
          </kbd>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

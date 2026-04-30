'use client';

import { Command } from 'cmdk';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const run = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    []
  );

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setOpen(false)}
        />
      )}

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command palette"
        className="fixed top-[20vh] left-1/2 z-50 w-[90vw] max-w-lg -translate-x-1/2 rounded-xl border border-border bg-surface shadow-2xl overflow-hidden"
      >
        <Command.Input
          placeholder="Type a command or search..."
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-fg outline-none"
        />
        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-fg">
            No results found.
          </Command.Empty>

          <Command.Group
            heading="Navigation"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-fg"
          >
            <CommandItem
              onSelect={() =>
                run(() =>
                  document
                    .getElementById('systems')
                    ?.scrollIntoView({ behavior: 'smooth' })
                )
              }
            >
              <ArrowIcon /> View Systems
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/blog'))}>
              <PenIcon /> Read Blog
            </CommandItem>
            <CommandItem
              onSelect={() => run(() => window.open('/api/resume/download'))}
            >
              <DownloadIcon /> Download Resume
            </CommandItem>
          </Command.Group>

          <Command.Group
            heading="Links"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-fg"
          >
            <CommandItem
              onSelect={() =>
                run(() => window.open('mailto:divijshrivastava@gmail.com'))
              }
            >
              <MailIcon /> Email
            </CommandItem>
            <CommandItem
              onSelect={() =>
                run(() =>
                  window.open(
                    'https://linkedin.com/in/divij-shrivastava',
                    '_blank'
                  )
                )
              }
            >
              <LinkIcon /> LinkedIn
            </CommandItem>
            <CommandItem
              onSelect={() =>
                run(() =>
                  window.open(
                    'https://github.com/divijshrivastava',
                    '_blank'
                  )
                )
              }
            >
              <LinkIcon /> GitHub
            </CommandItem>
          </Command.Group>

          <Command.Group
            heading="Settings"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-fg"
          >
            <CommandItem
              onSelect={() =>
                run(() =>
                  setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
                )
              }
            >
              <ThemeIcon /> Toggle Theme
            </CommandItem>
          </Command.Group>
        </Command.List>

        <div className="border-t border-border px-4 py-2 flex items-center justify-between">
          <span className="text-[11px] text-muted-fg">Navigate with arrow keys</span>
          <kbd className="text-[11px] text-muted-fg bg-muted px-1.5 py-0.5 rounded">
            esc
          </kbd>
        </div>
      </Command.Dialog>
    </>
  );
}

function CommandItem({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-2.5 px-2 py-2 text-sm text-foreground rounded-md cursor-pointer select-none data-[selected=true]:bg-brand/10 data-[selected=true]:text-brand transition-colors"
    >
      {children}
    </Command.Item>
  );
}

// Minimal inline SVG icons (no lucide dependency in this client component)
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const PenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
    <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
    <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);
const ThemeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

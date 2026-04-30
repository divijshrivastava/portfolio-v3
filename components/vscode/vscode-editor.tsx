'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import type { TabId, SystemItem, WritingPost } from './types';
import { FILE_ENTRIES } from './types';
import { FileIcon } from './file-icons';
import { HomePanel } from './panels/home-panel';
import { SystemsPanel } from './panels/systems-panel';
import { ImpactPanel } from './panels/impact-panel';
import { ThinkingPanel } from './panels/thinking-panel';
import { BlogPanel } from './panels/blog-panel';
import { SkillsPanel } from './panels/skills-panel';
import { ContactPanel } from './panels/contact-panel';

interface VSCodeEditorProps {
  systems: SystemItem[];
  posts: WritingPost[];
}

export function VSCodeEditor({ systems, posts }: VSCodeEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('home.tsx');
  const [openTabs, setOpenTabs] = useState<TabId[]>(['home.tsx']);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  const openFile = useCallback((id: TabId) => {
    setOpenTabs((tabs) => (tabs.includes(id) ? tabs : [...tabs, id]));
    setActiveTab(id);
    setSidebarOpen(false);
  }, []);

  const closeTab = useCallback(
    (id: TabId, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setOpenTabs((tabs) => {
        const next = tabs.filter((t) => t !== id);
        if (next.length === 0) {
          next.push('home.tsx');
        }
        if (activeTab === id) {
          const idx = tabs.indexOf(id);
          const neighbor = next[Math.min(idx, next.length - 1)];
          setActiveTab(neighbor);
        }
        return next;
      });
    },
    [activeTab],
  );

  // Cmd+K / Ctrl+K to open palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === 'p' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const run = useCallback((command: () => void) => {
    setCmdOpen(false);
    command();
  }, []);

  return (
    <div className="vscode-theme h-screen flex flex-col bg-[#1e1e2e] text-[#cdd6f4] font-mono overflow-hidden">
      {/* ── Title Bar ── */}
      <div className="flex items-center justify-between h-10 px-4 bg-[#11111b] border-b border-[#313244] shrink-0 select-none">
        <div className="flex items-center gap-2">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#f38ba8]" />
            <span className="w-3 h-3 rounded-full bg-[#f9e2af]" />
            <span className="w-3 h-3 rounded-full bg-[#a6e3a1]" />
          </div>
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="md:hidden ml-2 p-1 text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect y="2" width="16" height="1.5" rx="0.5" />
              <rect y="7" width="16" height="1.5" rx="0.5" />
              <rect y="12" width="16" height="1.5" rx="0.5" />
            </svg>
          </button>
        </div>
        <span className="text-xs text-[#6c7086] hidden sm:block">
          Divij Shrivastava &mdash; Portfolio
        </span>
        <button
          onClick={() => setCmdOpen(true)}
          className="text-xs text-[#6c7086] hover:text-[#cdd6f4] transition-colors flex items-center gap-1"
        >
          <kbd className="text-[10px] bg-[#313244] px-1.5 py-0.5 rounded">&#8984;P</kbd>
        </button>
      </div>

      {/* ── Menu Bar (desktop) ── */}
      <div className="hidden md:flex items-center gap-4 h-7 px-4 bg-[#181825] border-b border-[#313244] text-xs text-[#6c7086] shrink-0 select-none">
        <span className="hover:text-[#cdd6f4] cursor-default">File</span>
        <span className="hover:text-[#cdd6f4] cursor-default">Edit</span>
        <span className="hover:text-[#cdd6f4] cursor-default">View</span>
        <span className="hover:text-[#cdd6f4] cursor-default">Terminal</span>
        <span className="hover:text-[#cdd6f4] cursor-default">Help</span>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar (desktop: always visible, mobile: overlay) ── */}
        <aside className="hidden md:flex flex-col w-56 bg-[#181825] border-r border-[#313244] shrink-0">
          <SidebarContent activeTab={activeTab} onFileClick={openFile} />
        </aside>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-[#181825] border-r border-[#313244] md:hidden flex flex-col"
              >
                <div className="flex items-center justify-between h-10 px-4 border-b border-[#313244]">
                  <span className="text-xs text-[#6c7086] font-semibold uppercase tracking-widest">
                    Explorer
                  </span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-[#6c7086] hover:text-[#cdd6f4]"
                    aria-label="Close sidebar"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 1l12 12M13 1L1 13" />
                    </svg>
                  </button>
                </div>
                <SidebarContent activeTab={activeTab} onFileClick={openFile} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Editor Area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Bar */}
          <div className="flex items-center h-9 bg-[#181825] border-b border-[#313244] shrink-0 overflow-x-auto scrollbar-none">
            {openTabs.map((tabId) => {
              const entry = FILE_ENTRIES.find((f) => f.id === tabId)!;
              const isActive = tabId === activeTab;
              return (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={`flex items-center gap-1.5 px-3 h-full text-xs border-r border-[#313244] shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#1e1e2e] text-[#cdd6f4] border-t-2 border-t-[#89b4fa]'
                      : 'bg-[#181825] text-[#6c7086] hover:text-[#a6adc8] border-t-2 border-t-transparent'
                  }`}
                >
                  <FileIcon tabId={tabId} />
                  <span>{entry.label}</span>
                  <span
                    onClick={(e) => closeTab(tabId, e)}
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-[#313244] rounded p-0.5 transition-opacity"
                    style={{ opacity: isActive ? 1 : undefined }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 2l6 6M8 2L2 8" />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Breadcrumb (desktop) */}
          <div className="hidden md:flex items-center gap-1 h-6 px-4 text-[11px] text-[#6c7086] bg-[#1e1e2e] border-b border-[#313244] shrink-0">
            <span>divij</span>
            <ChevronRight />
            <span>src</span>
            <ChevronRight />
            <span className="text-[#cdd6f4]">{activeTab}</span>
          </div>

          {/* Content Panels */}
          <div className="flex-1 overflow-y-auto bg-[#1e1e2e]">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
              {FILE_ENTRIES.map((entry) => (
                <section
                  key={entry.id}
                  hidden={entry.id !== activeTab}
                  aria-hidden={entry.id !== activeTab}
                >
                  {entry.id === 'home.tsx' && <HomePanel />}
                  {entry.id === 'systems.ts' && <SystemsPanel systems={systems} />}
                  {entry.id === 'impact.json' && <ImpactPanel />}
                  {entry.id === 'thinking.md' && <ThinkingPanel />}
                  {entry.id === 'blog.ts' && <BlogPanel posts={posts} />}
                  {entry.id === 'skills.json' && <SkillsPanel />}
                  {entry.id === 'contact.css' && <ContactPanel />}
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between h-6 px-4 bg-[#11111b] border-t border-[#313244] text-[11px] text-[#6c7086] shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <BranchSvg />
            main
          </span>
          <span className="hidden sm:inline">0 errors, 0 warnings</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">{activeTab.split('.').pop()?.toUpperCase()}</span>
          <span className="hidden sm:inline">UTF-8</span>
          <span>Catppuccin Mocha</span>
        </div>
      </div>

      {/* ── Command Palette ── */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setCmdOpen(false)}
        />
      )}
      <Command.Dialog
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        label="Command palette"
        className="fixed top-[20vh] left-1/2 z-50 w-[90vw] max-w-lg -translate-x-1/2 rounded-xl border border-[#313244] bg-[#1e1e2e] shadow-2xl overflow-hidden"
      >
        <Command.Input
          placeholder="Search files, commands..."
          className="w-full border-b border-[#313244] bg-transparent px-4 py-3 text-sm text-[#cdd6f4] placeholder:text-[#6c7086] outline-none"
        />
        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-[#6c7086]">
            No results found.
          </Command.Empty>

          <Command.Group
            heading="Files"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#6c7086]"
          >
            {FILE_ENTRIES.map((entry) => (
              <Command.Item
                key={entry.id}
                value={`${entry.label} ${entry.comment}`}
                onSelect={() => run(() => openFile(entry.id))}
                className="flex items-center gap-2.5 px-2 py-2 text-sm text-[#cdd6f4] rounded-md cursor-pointer select-none data-[selected=true]:bg-[#313244] transition-colors"
              >
                <FileIcon tabId={entry.id} />
                <span>{entry.label}</span>
                <span className="text-xs text-[#6c7086] ml-auto">{entry.comment}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group
            heading="Navigation"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#6c7086]"
          >
            <CmdItem onSelect={() => run(() => router.push('/blog'))}>
              Read Blog
            </CmdItem>
            <CmdItem onSelect={() => run(() => window.open('/api/resume/download'))}>
              Download Resume
            </CmdItem>
            <CmdItem
              onSelect={() => run(() => window.open('mailto:divijshrivastava@gmail.com'))}
            >
              Email
            </CmdItem>
            <CmdItem
              onSelect={() =>
                run(() => window.open('https://linkedin.com/in/divij-shrivastava', '_blank'))
              }
            >
              LinkedIn
            </CmdItem>
            <CmdItem
              onSelect={() =>
                run(() => window.open('https://github.com/divijshrivastava', '_blank'))
              }
            >
              GitHub
            </CmdItem>
          </Command.Group>

          <Command.Group
            heading="Settings"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#6c7086]"
          >
            <CmdItem
              onSelect={() =>
                run(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))
              }
            >
              Toggle Theme
            </CmdItem>
          </Command.Group>
        </Command.List>

        <div className="border-t border-[#313244] px-4 py-2 flex items-center justify-between">
          <span className="text-[11px] text-[#6c7086]">Navigate with arrow keys</span>
          <kbd className="text-[11px] text-[#6c7086] bg-[#313244] px-1.5 py-0.5 rounded">esc</kbd>
        </div>
      </Command.Dialog>
    </div>
  );
}

/* ── Sidebar Content ── */
function SidebarContent({
  activeTab,
  onFileClick,
}: {
  activeTab: TabId;
  onFileClick: (id: TabId) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-2">
        <span className="text-[11px] font-semibold tracking-widest text-[#6c7086] uppercase">
          Explorer
        </span>
      </div>
      <div className="px-2">
        <div className="flex items-center gap-1 px-2 py-1 text-xs text-[#6c7086]">
          <ChevronDown />
          <FolderSvg />
          <span className="font-semibold">src</span>
        </div>
        {FILE_ENTRIES.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onFileClick(entry.id)}
            className={`flex items-center gap-1.5 w-full px-6 py-1 text-xs rounded transition-colors ${
              entry.id === activeTab
                ? 'bg-[#313244]/50 text-[#cdd6f4]'
                : 'text-[#a6adc8] hover:bg-[#313244]/30 hover:text-[#cdd6f4]'
            }`}
          >
            <FileIcon tabId={entry.id} />
            <span>{entry.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Reusable command item ── */
function CmdItem({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-2.5 px-2 py-2 text-sm text-[#cdd6f4] rounded-md cursor-pointer select-none data-[selected=true]:bg-[#313244] transition-colors"
    >
      {children}
    </Command.Item>
  );
}

/* ── Tiny SVG helpers ── */
function ChevronRight() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50">
      <path d="M3 2l4 3-4 3" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#6c7086]">
      <path d="M2 3l3 4 3-4" />
    </svg>
  );
}

function FolderSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 3.5A1.5 1.5 0 013.5 2h2.879a1.5 1.5 0 011.06.44l.622.62a1.5 1.5 0 001.06.44H12.5A1.5 1.5 0 0114 5v7.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9z" fill="#89b4fa" fillOpacity="0.5" />
    </svg>
  );
}

function BranchSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="5" cy="4" r="2" />
      <circle cx="5" cy="12" r="2" />
      <circle cx="13" cy="8" r="2" />
      <path d="M5 6v4M7 12h4a2 2 0 002-2V8" />
    </svg>
  );
}

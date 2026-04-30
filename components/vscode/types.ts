export type TabId =
  | 'home.tsx'
  | 'systems.ts'
  | 'impact.json'
  | 'thinking.md'
  | 'blog.ts'
  | 'skills.json'
  | 'contact.css';

export interface FileEntry {
  id: TabId;
  label: string;
  comment: string;
}

export const FILE_ENTRIES: FileEntry[] = [
  { id: 'home.tsx', label: 'home.tsx', comment: '// hello world' },
  { id: 'systems.ts', label: 'systems.ts', comment: "// systems I've built & shipped" },
  { id: 'impact.json', label: 'impact.json', comment: '{ "focus": "outcomes" }' },
  { id: 'thinking.md', label: 'thinking.md', comment: '# System Design Thinking' },
  { id: 'blog.ts', label: 'blog.ts', comment: '// recent writing' },
  { id: 'skills.json', label: 'skills.json', comment: '{ "status": "always_building" }' },
  { id: 'contact.css', label: 'contact.css', comment: "/* let's connect */" },
];

export interface SystemItem {
  slug: string;
  name: string;
  company: string;
  dates: string;
  summary: string;
  metric?: string;
  tags: string[];
}

export interface WritingPost {
  slug: string;
  title: string;
  date: string;
  readTime?: number;
}

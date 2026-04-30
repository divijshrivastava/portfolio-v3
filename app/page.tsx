import { VSCodeEditor } from '@/components/vscode/vscode-editor';
import type { SystemItem, WritingPost } from '@/components/vscode/types';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600;

export default async function Home() {
  const supabase = await createClient();

  const [projectsResult, blogsResult] = await Promise.all([
    supabase
      .from('projects')
      .select('id, slug, title, company, start_date, end_date, description, metric, tech_stack, project_type')
      .eq('status', 'published')
      .eq('project_type', 'professional')
      .order('start_date', { ascending: false }),
    supabase
      .from('blogs')
      .select('id, slug, title, created_at, read_time')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const systems: SystemItem[] = (projectsResult.data ?? []).map((p) => ({
    slug: p.slug,
    name: p.title,
    company: p.company ?? '',
    dates: formatDateRange(p.start_date, p.end_date),
    summary: p.description ?? '',
    metric: p.metric ?? undefined,
    tags: parseTags(p.tech_stack),
  }));

  const posts: WritingPost[] = (blogsResult.data ?? []).map((b) => ({
    slug: b.slug,
    title: b.title,
    date: b.created_at,
    readTime: b.read_time ?? undefined,
  }));

  return <VSCodeEditor systems={systems} posts={posts} />;
}

function formatDateRange(start: string | null, end: string | null): string {
  const startYear = start ? new Date(start).getFullYear().toString() : '';
  const endYear = end ? new Date(end).getFullYear().toString() : 'Present';
  if (!startYear) return endYear;
  return startYear === endYear ? startYear : `${startYear} — ${endYear}`;
}

function parseTags(techStack: string | string[] | null): string[] {
  if (!techStack) return [];
  if (Array.isArray(techStack)) return techStack;
  try {
    const parsed = JSON.parse(techStack);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Not JSON — try comma-separated
  }
  return techStack.split(',').map((s: string) => s.trim()).filter(Boolean);
}

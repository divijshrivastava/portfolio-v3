import { SiteHeader } from '@/components/site-header';
import { Hero } from '@/components/sections/hero';
import { ImpactNumbers } from '@/components/sections/impact-numbers';
import { SystemsList, type SystemItem } from '@/components/sections/systems-list';
import { HowIThink } from '@/components/sections/how-i-think';
import { Writing, type WritingPost } from '@/components/sections/writing';
import { Toolkit } from '@/components/sections/toolkit';
import { CloseCTA } from '@/components/sections/close-cta';
import { ScrollReveal } from '@/components/scroll-reveal';
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

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6">
        <Hero />
        <ScrollReveal>
          <ImpactNumbers />
        </ScrollReveal>
        <ScrollReveal>
          <SystemsList systems={systems} />
        </ScrollReveal>
        <ScrollReveal>
          <HowIThink />
        </ScrollReveal>
        <ScrollReveal>
          <Writing posts={posts} />
        </ScrollReveal>
        <ScrollReveal>
          <Toolkit />
        </ScrollReveal>
        <ScrollReveal>
          <CloseCTA />
        </ScrollReveal>
      </main>
    </>
  );
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

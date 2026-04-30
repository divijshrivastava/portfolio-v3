import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { TrackPageView } from '@/components/track-page-view';
import { SiteHeader } from '@/components/site-header';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: project, error } = await supabase
      .from('projects')
      .select('title, description')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !project) {
      return { title: 'System Not Found' };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divij.tech';

    return {
      title: project.title,
      description: project.description || project.title,
      openGraph: {
        title: project.title,
        description: project.description || project.title,
        type: 'article',
        url: `${baseUrl}/systems/${slug}`,
        images: [
          {
            url: `${baseUrl}/og-image.png`,
            width: 1200,
            height: 630,
            alt: project.title,
          },
        ],
      },
    };
  } catch {
    return { title: 'System' };
  }
}

function parseTags(techStack: string | string[] | null): string[] {
  if (!techStack) return [];
  if (Array.isArray(techStack)) return techStack;
  try {
    const parsed = JSON.parse(techStack);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Not JSON
  }
  return techStack.split(',').map((s: string) => s.trim()).filter(Boolean);
}

export default async function SystemDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !project) {
    notFound();
  }

  const tags = parseTags(project.tech_stack);
  const startYear = project.start_date
    ? new Date(project.start_date).getFullYear()
    : null;
  const endYear = project.end_date
    ? new Date(project.end_date).getFullYear()
    : 'Present';

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-12">
        <TrackPageView type="project" id={project.id} />

        <Link
          href="/#systems"
          className="inline-flex items-center gap-1 text-sm text-muted-fg hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <header className="mb-8">
          {project.company && (
            <p className="text-sm text-muted-fg mb-1">
              {project.company}
              {startYear && ` · ${startYear}${endYear ? ` — ${endYear}` : ''}`}
            </p>
          )}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {project.title}
          </h1>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {project.description && (
            <p className="text-base text-muted-fg leading-relaxed">
              {project.description}
            </p>
          )}
        </header>

        {project.detailed_content && (
          <article
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: project.detailed_content }}
          />
        )}
      </main>
    </>
  );
}

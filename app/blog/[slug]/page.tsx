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

    const { data: blog, error } = await supabase
      .from('blogs')
      .select('title, summary, cover_image_url, og_image_url')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !blog) {
      return { title: 'Blog Not Found' };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divij.tech';

    let ogImage = `${baseUrl}/og-image.png`;
    if (blog.og_image_url && blog.og_image_url.trim()) {
      ogImage = blog.og_image_url.startsWith('http')
        ? blog.og_image_url
        : `${baseUrl}${blog.og_image_url.startsWith('/') ? blog.og_image_url : `/${blog.og_image_url}`}`;
    } else if (blog.cover_image_url) {
      ogImage = blog.cover_image_url.startsWith('http')
        ? blog.cover_image_url
        : `${baseUrl}${blog.cover_image_url.startsWith('/') ? blog.cover_image_url : `/${blog.cover_image_url}`}`;
    }

    return {
      title: blog.title,
      description: blog.summary || blog.title,
      openGraph: {
        title: blog.title,
        description: blog.summary || blog.title,
        type: 'article',
        url: `${baseUrl}/blog/${slug}`,
        images: [{ url: ogImage, width: 1200, height: 630, alt: blog.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.summary || blog.title,
        images: [ogImage],
      },
    };
  } catch {
    return { title: 'Blog' };
  }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !blog) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-12">
        <TrackPageView type="blog" id={blog.id} />

        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-fg hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {blog.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-fg">
            <time>
              {new Date(blog.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {blog.read_time && (
              <>
                <span>&middot;</span>
                <span>{blog.read_time} min read</span>
              </>
            )}
          </div>
        </header>

        <article
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </main>
    </>
  );
}

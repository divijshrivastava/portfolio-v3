import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SiteHeader } from '@/components/site-header';

export const revalidate = 3600;

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">Blog</h1>
        <p className="text-sm text-muted-fg mb-10">
          Engineering problems, architectural trade-offs, and lessons from production systems.
        </p>

        {blogs && blogs.length > 0 ? (
          <div className="space-y-8">
            {blogs.map((blog) => (
              <article key={blog.id}>
                <Link href={`/blog/${blog.slug}`} className="group">
                  <h2 className="text-base font-medium text-foreground group-hover:text-brand transition-colors">
                    {blog.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-fg">
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
                  {blog.summary && (
                    <p className="mt-2 text-sm text-muted-fg line-clamp-2">
                      {blog.summary}
                    </p>
                  )}
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-fg">No blog posts yet. Check back soon!</p>
        )}
      </main>
    </>
  );
}

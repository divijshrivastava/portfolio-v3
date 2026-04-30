import Link from 'next/link';
import { SectionHeader } from '@/components/section-header';

export interface WritingPost {
  slug: string;
  title: string;
  date: string;
  readTime?: number;
}

interface WritingProps {
  posts: WritingPost[];
}

export function Writing({ posts }: WritingProps) {
  return (
    <section className="py-12 border-t border-border">
      <SectionHeader
        number="04"
        title="Writing"
        subtitle="System design decisions, production debugging, and architectural trade-offs — the stuff that's hard to learn from docs alone."
      />

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex items-baseline gap-3"
            >
              <span className="text-brand shrink-0">&rarr;</span>
              <span className="text-sm text-foreground group-hover:text-brand transition-colors">
                {post.title}
              </span>
              <span className="text-xs text-muted-fg shrink-0 ml-auto">
                {new Date(post.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
                {post.readTime ? ` · ${post.readTime} min` : ''}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-fg">Posts coming soon.</p>
      )}

      <div className="mt-6">
        <Link
          href="/blog"
          className="text-sm text-brand hover:underline underline-offset-4"
        >
          Read all posts &rarr;
        </Link>
      </div>
    </section>
  );
}

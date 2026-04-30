import Link from 'next/link';
import type { WritingPost } from '../types';

interface BlogPanelProps {
  posts: WritingPost[];
}

export function BlogPanel({ posts }: BlogPanelProps) {
  return (
    <div className="space-y-6">
      <div className="text-[#6c7086] font-mono text-sm">
        {'// recent writing'}
      </div>

      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex items-baseline gap-3 border border-[#313244] rounded-lg px-4 py-3 bg-[#181825]/30 hover:border-[#45475a] transition-colors"
            >
              <span className="text-[#89b4fa] shrink-0 font-mono text-sm">&rarr;</span>
              <span className="text-sm text-[#cdd6f4] group-hover:text-[#89b4fa] transition-colors flex-1">
                {post.title}
              </span>
              <span className="text-xs text-[#6c7086] shrink-0">
                {new Date(post.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
                {post.readTime ? ` \u00B7 ${post.readTime} min` : ''}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#6c7086]">Posts coming soon.</p>
      )}

      <div>
        <Link
          href="/blog"
          className="text-sm text-[#89b4fa] hover:underline underline-offset-4"
        >
          Read all posts &rarr;
        </Link>
      </div>
    </div>
  );
}

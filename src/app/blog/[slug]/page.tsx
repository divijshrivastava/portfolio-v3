import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 60;

export default async function BlogPost(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const blog = await prisma.blog.findUnique({
        where: { slug: params.slug },
    });

    if (!blog) {
        notFound();
    }

    return (
        <article className="container section-padding" style={{ paddingTop: '150px', maxWidth: '800px' }}>
            <Link href="/blog" style={{ display: 'inline-block', marginBottom: '2rem', color: '#888', textDecoration: 'none' }}>
                ← Back to all posts
            </Link>

            <header style={{ marginBottom: '3rem' }}>
                {blog.coverImage && (
                    <div style={{
                        width: '100%',
                        height: '400px',
                        background: `url(${blog.coverImage}) center/cover no-repeat`,
                        borderRadius: '16px',
                        marginBottom: '2rem',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }} />
                )}
                <h1 className="text-gradient" style={{ fontSize: '3rem', lineHeight: '1.2', marginBottom: '1.5rem' }}>
                    {blog.title}
                </h1>
                <div style={{ display: 'flex', gap: '1.5rem', color: '#888', fontSize: '0.9rem' }}>
                    <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>•</span>
                    <span>{blog.readTime} min read</span>
                </div>
            </header>

            <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px' }}>
                {/* Simple rendering for now - typically you'd use a Markdown renderer like react-markdown */}
                <div style={{ lineHeight: '1.8', fontSize: '1.1rem', whiteSpace: 'pre-wrap', color: '#e0e0e0' }}>
                    {blog.content}
                </div>
            </div>
        </article>
    );
}

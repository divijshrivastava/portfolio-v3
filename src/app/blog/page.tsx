import Link from 'next/link';
import { prisma } from '@/lib/db';

export const revalidate = 60; // Revalidate every minute

export default async function BlogIndex() {
    const blogs = await prisma.blog.findMany({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="container section-padding" style={{ paddingTop: '150px' }}>
            <div className="flex-center" style={{ flexDirection: 'column', textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Thoughts & Insights</h1>
                <p className="description" style={{ maxWidth: '600px', margin: '0 auto', color: '#888' }}>
                    Exploring software architecture, modern web development, and the future of tech.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {blogs.map(blog => (
                    <Link href={`/blog/${blog.slug}`} key={blog.id} className="glass-panel" style={{
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'row',
                        overflow: 'hidden',
                        transition: 'transform 0.2s',
                        border: '1px solid rgba(255,255,255,0.05)',
                        textDecoration: 'none'
                    }}>
                        {blog.coverImage && (
                            <div style={{
                                flex: '0 0 300px',
                                background: `url(${blog.coverImage}) center/cover no-repeat`,
                                minHeight: '250px'
                            }} className="blog-cover-image" />
                        )}

                        <div style={{ padding: '2rem', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>{blog.title}</h2>
                                <span style={{
                                    color: 'var(--primary)',
                                    fontSize: '0.9rem',
                                    background: 'rgba(0, 240, 255, 0.1)',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '50px',
                                    whiteSpace: 'nowrap',
                                    marginLeft: '1rem'
                                }}>
                                    {new Date(blog.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <p style={{ color: '#aaa', lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                {blog.summary}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ color: '#666', fontSize: '0.9rem' }}>{blog.readTime} min read</span>
                                <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>Read Article →</span>
                            </div>
                        </div>
                    </Link>
                ))}
                {blogs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
                        No blog posts found. Check back soon!
                    </div>
                )}
            </div>
        </div>
    );
}

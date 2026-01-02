import Link from 'next/link';
import { getBlogs, deleteBlog } from '@/app/actions/blog';
import { redirect } from 'next/navigation';

export default async function BlogList() {
    const blogs = await getBlogs();

    async function handleDelete(id: string) {
        'use server'
        await deleteBlog(id);
    }

    return (
        <div className="container" style={{ paddingTop: '120px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Manage Blogs</h1>
                <Link href="/admin/blogs/new" className="glass-panel" style={{ padding: '0.8rem 1.5rem', borderRadius: '6px' }}>
                    + New Post
                </Link>
            </div>

            <div className="glass-panel" style={{ borderRadius: '12px', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: '#888', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Title</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Views</th>
                            <th style={{ padding: '1rem' }}>Created</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.map(blog => (
                            <tr key={blog.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: '500' }}>{blog.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>/{blog.slug}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        background: blog.status === 'published' ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                        color: blog.status === 'published' ? 'var(--primary)' : '#888'
                                    }}>
                                        {blog.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#888' }}>{blog.viewCount}</td>
                                <td style={{ padding: '1rem', color: '#888' }}>{new Date(blog.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <Link href={`/admin/blogs/${blog.id}`} style={{ marginRight: '1rem', color: 'var(--primary)' }}>Edit</Link>
                                    <form action={handleDelete.bind(null, blog.id)} style={{ display: 'inline' }}>
                                        <button type="submit" style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>Delete</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {blogs.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>No blogs found. Start writing!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

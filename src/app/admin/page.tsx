import { logout } from '@/app/actions/auth';
import Link from 'next/link';
import { prisma } from '@/lib/db';

export const revalidate = 0; // Dynamic data

export default async function AdminDashboard() {
    let projectCount = 0
    let blogCount = 0
    let messageCount = 0

    try {
        [projectCount, blogCount, messageCount] = await Promise.all([
            prisma.project.count(),
            prisma.blog.count(),
            prisma.message.count(),
        ])
    } catch (error) {
        console.error('Database error:', error)
        // Database might not be initialized yet
    }

    return (
        <div className="container" style={{ padding: '40px 20px', paddingTop: '120px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p className="text-muted">Welcome back, Admin.</p>
                </div>
                <form action={logout}>
                    <button
                        type="submit"
                        style={{
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid rgba(255, 68, 68, 0.2)',
                            color: '#ff4444',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                </form>
            </div>

            <div className="grid-cols-3">
                {/* Stats Cards */}
                <Link href="/admin/projects" className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'block' }}>
                    <h3 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Projects</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700' }}>{projectCount}</p>
                </Link>
                <Link href="/admin/blogs" className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'block' }}>
                    <h3 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Blogs</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700' }}>{blogCount}</p>
                </Link>
                <Link href="/admin/messages" className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'block' }}>
                    <h3 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Messages</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700' }}>{messageCount}</p>
                </Link>
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Quick Actions</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/admin/projects" className="glass-panel" style={{ padding: '1rem 2rem', borderRadius: '8px', display: 'inline-block' }}>
                        Manage Projects
                    </Link>
                    <Link href="/admin/blogs/new" className="glass-panel" style={{ padding: '1rem 2rem', borderRadius: '8px', display: 'inline-block' }}>
                        + New Blog Post
                    </Link>
                </div>
            </div>
        </div>
    );
}

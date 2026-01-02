import Link from 'next/link';
import { getProjects, deleteProject } from '@/app/actions/project';

export default async function ProjectList() {
    const projects = await getProjects();

    async function handleDelete(id: string) {
        'use server'
        await deleteProject(id);
    }

    return (
        <div className="container" style={{ paddingTop: '120px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Manage Projects</h1>
                <Link href="/admin/projects/new" className="glass-panel" style={{ padding: '0.8rem 1.5rem', borderRadius: '6px' }}>
                    + New Project
                </Link>
            </div>

            <div className="glass-panel" style={{ borderRadius: '12px', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: '#888', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Title</th>
                            <th style={{ padding: '1rem' }}>Type</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Tech Stack</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(project => (
                            <tr key={project.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{project.title}</td>
                                <td style={{ padding: '1rem', color: '#ccc' }}>{project.type}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        background: project.status === 'published' ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                        color: project.status === 'published' ? 'var(--primary)' : '#888'
                                    }}>
                                        {project.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#888', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {JSON.parse(project.techStack).join(', ')}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <Link href={`/admin/projects/${project.id}`} style={{ marginRight: '1rem', color: 'var(--primary)' }}>Edit</Link>
                                    <form action={handleDelete.bind(null, project.id)} style={{ display: 'inline' }}>
                                        <button type="submit" style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>Delete</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {projects.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>No projects found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

import { prisma } from '@/lib/db';
import Link from 'next/link';

export const revalidate = 60;

export default async function Projects() {
    const projects = await prisma.project.findMany({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="container section-padding" style={{ paddingTop: '150px' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Featured Work</h1>
                <p className="text-muted" style={{ fontSize: '1.2rem' }}>
                    A selection of professional and personal projects.
                </p>
            </div>

            <div className="grid-cols-2">
                {projects.map((project) => (
                    <div key={project.id} className="glass-panel" style={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            height: '240px',
                            background: `url(${project.imageUrl}) center/cover no-repeat, linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`,
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                padding: '0.4rem 0.8rem',
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(4px)',
                                borderRadius: '50px',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                fontWeight: '600',
                                letterSpacing: '0.05em'
                            }}>
                                {project.type}
                            </div>
                        </div>

                        <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.8rem' }}>{project.title}</h2>
                            <p style={{ color: '#aaa', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                                {project.description}
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                                {JSON.parse(project.techStack).map((tag: string, i: number) => (
                                    <span key={i} style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--primary)',
                                        background: 'rgba(0, 240, 255, 0.08)',
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '4px'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {project.links && JSON.parse(project.links).github && (
                                    <a href={JSON.parse(project.links).github} target="_blank" style={{ textDecoration: 'underline', color: 'white' }}>GitHub</a>
                                )}
                                {project.links && JSON.parse(project.links).website && (
                                    <a href={JSON.parse(project.links).website} target="_blank" style={{ textDecoration: 'underline', color: 'white' }}>Live Demo</a>
                                )}
                                {/* If no links, maybe show a 'Coming Soon' or just nothing? 
                         Let's just show nothing to keep it clean.
                     */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {projects.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
                    No projects found.
                </div>
            )}
        </div>
    );
}

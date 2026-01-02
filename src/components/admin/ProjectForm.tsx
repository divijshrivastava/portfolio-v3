'use client'

import { createProject, updateProject } from '@/app/actions/project'
import { useState } from 'react'

export default function ProjectForm({ project }: { project?: any }) {
    const [loading, setLoading] = useState(false)

    // Use state for complex inputs to make editing easier (pseudo-controlled)
    const [techStack, setTechStack] = useState(project ? JSON.parse(project.techStack).join(', ') : '')
    const [links, setLinks] = useState(project ? JSON.stringify(JSON.parse(project.links), null, 2) : '{\n  "github": "",\n  "website": ""\n}')

    async function handleSubmit(formData: FormData) {
        setLoading(true)

        // Convert tech stack csv to JSON
        const stackArray = techStack.split(',').map((t: string) => t.trim()).filter((t: string) => t)
        formData.set('techStack', JSON.stringify(stackArray))

        // Ensure links is valid JSON (basic validation could be better)
        try {
            JSON.parse(links)
            formData.set('links', links)
        } catch (e) {
            alert("Invalid JSON in Links field")
            setLoading(false)
            return
        }

        if (project) {
            await updateProject(project.id, formData)
        } else {
            await createProject(formData)
        }
        setLoading(false)
    }

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '50px' }}>
            <h1 style={{ marginBottom: '2rem' }}>{project ? 'Edit Project' : 'New Project'}</h1>

            <form action={handleSubmit} className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Title</label>
                    <input
                        name="title"
                        defaultValue={project?.title}
                        required
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Description</label>
                    <textarea
                        name="description"
                        defaultValue={project?.description}
                        required
                        rows={4}
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                    />
                </div>

                <div className="grid-cols-2">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Type</label>
                        <select
                            name="type"
                            defaultValue={project?.type || 'professional'}
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                        >
                            <option value="professional">Professional</option>
                            <option value="coding">Coding / Personal</option>
                            <option value="youtube">YouTube</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Status</label>
                        <select
                            name="status"
                            defaultValue={project?.status || 'draft'}
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Image URL</label>
                    <input
                        name="imageUrl"
                        defaultValue={project?.imageUrl}
                        placeholder="/images/projects/demo.jpg"
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Tech Stack (comma separated)</label>
                    <input
                        value={techStack}
                        onChange={(e) => setTechStack(e.target.value)}
                        placeholder="React, TypeScript, Node.js"
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Links (JSON)</label>
                    <textarea
                        value={links}
                        onChange={(e) => setLinks(e.target.value)}
                        rows={5}
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px', fontFamily: 'monospace' }}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                        <input
                            name="isFeatured"
                            type="checkbox"
                            defaultChecked={project?.isFeatured}
                        />
                        Feature this project on homepage
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="primaryBtn"
                    style={{
                        padding: '1rem 2rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        background: 'var(--primary)',
                        color: 'black',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '6px',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
                </button>
            </form>
        </div>
    )
}

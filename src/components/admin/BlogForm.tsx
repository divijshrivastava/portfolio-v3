'use client'

import { createBlog, updateBlog } from '@/app/actions/blog'
import { uploadImage } from '@/app/actions/upload'
import { useState } from 'react'

export default function BlogForm({ post }: { post?: any }) {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImage || '')
    const [preview, setPreview] = useState<string | null>(post?.coverImage || null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        // Set the coverImage from state if it was uploaded
        if (coverImageUrl) {
            formData.set('coverImage', coverImageUrl)
        }
        if (post) {
            await updateBlog(post.id, formData)
        } else {
            await createBlog(formData)
        }
        setLoading(false)
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadImage(formData)
        
        if (result.success && result.url) {
            setCoverImageUrl(result.url)
            setPreview(result.url)
        } else {
            alert(result.error || 'Upload failed')
        }
        setUploading(false)
    }

    function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
        const url = e.target.value
        setCoverImageUrl(url)
        setPreview(url || null)
    }

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '50px' }}>
            <h1 style={{ marginBottom: '2rem' }}>{post ? 'Edit Post' : 'New Blog Post'}</h1>

            <form action={handleSubmit} className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
                <div className="grid-cols-2">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Title</label>
                        <input
                            name="title"
                            defaultValue={post?.title}
                            required
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Slug</label>
                        <input
                            name="slug"
                            defaultValue={post?.slug}
                            required
                            placeholder="my-awesome-post"
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Summary (SEO)</label>
                    <textarea
                        name="summary"
                        defaultValue={post?.summary}
                        rows={3}
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Content (Markdown)</label>
                    <textarea
                        name="content"
                        defaultValue={post?.content}
                        required
                        rows={15}
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px', fontFamily: 'monospace' }}
                    />
                </div>

                <div className="grid-cols-3">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Status</label>
                        <select
                            name="status"
                            defaultValue={post?.status || 'draft'}
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Read Time (min)</label>
                        <input
                            name="readTime"
                            type="number"
                            defaultValue={post?.readTime || 5}
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Cover Image</label>
                        
                        {/* File Upload */}
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                style={{ 
                                    width: '100%', 
                                    padding: '0.8rem', 
                                    background: 'rgba(255,255,255,0.03)', 
                                    border: '1px solid var(--border)', 
                                    color: 'white', 
                                    borderRadius: '6px',
                                    cursor: uploading ? 'not-allowed' : 'pointer'
                                }}
                            />
                            {uploading && (
                                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
                                    Uploading...
                                </p>
                            )}
                        </div>

                        {/* Or URL Input */}
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
                                OR
                            </p>
                            <input
                                type="url"
                                value={coverImageUrl}
                                onChange={handleUrlChange}
                                placeholder="https://images.unsplash.com/photo-... or /images/blog/cover.jpg"
                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                            />
                            <input type="hidden" name="coverImage" value={coverImageUrl} />
                        </div>

                        {/* Preview */}
                        {preview && (
                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>Preview:</p>
                                <div style={{
                                    width: '100%',
                                    height: '200px',
                                    background: `url(${preview}) center/cover no-repeat`,
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)'
                                }} />
                            </div>
                        )}
                    </div>
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
                    {loading ? 'Saving...' : (post ? 'Update Post' : 'Create Post')}
                </button>
            </form>
        </div>
    )
}

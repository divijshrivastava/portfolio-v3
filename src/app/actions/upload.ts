'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { revalidatePath } from 'next/cache'

export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File | null

    if (!file) {
        return { error: 'No file provided' }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        return { error: 'File must be an image' }
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        return { error: 'File size must be less than 5MB' }
    }

    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const timestamp = Date.now()
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filename = `${timestamp}-${originalName}`
        
        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public', 'images', 'blog')
        await mkdir(uploadDir, { recursive: true })

        // Write file
        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)

        // Return the public URL path
        const publicPath = `/images/blog/${filename}`
        
        revalidatePath('/admin/blogs')
        return { success: true, url: publicPath }
    } catch (error) {
        console.error('Upload error:', error)
        return { error: 'Failed to upload image' }
    }
}


'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const BlogSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    summary: z.string().min(1),
    content: z.string().min(1),
    coverImage: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']),
    readTime: z.number().int().default(5)
})

export async function getBlogs() {
    return await prisma.blog.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export async function getBlog(id: string) {
    return await prisma.blog.findUnique({
        where: { id }
    })
}

export async function createBlog(formData: FormData) {
    const data = {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        summary: formData.get('summary') as string,
        content: formData.get('content') as string,
        coverImage: formData.get('coverImage') as string,
        status: formData.get('status') as any,
        readTime: parseInt(formData.get('readTime') as string || '5')
    }

    // Basic validation (can expand later)
    if (!data.title || !data.slug) {
        return { error: 'Missing required fields' }
    }

    try {
        await prisma.blog.create({
            data
        })
    } catch (e) {
        return { error: 'Failed to create blog. Slug might be taken.' }
    }

    revalidatePath('/admin/blogs')
    redirect('/admin/blogs')
}

export async function updateBlog(id: string, formData: FormData) {
    const data = {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        summary: formData.get('summary') as string,
        content: formData.get('content') as string,
        coverImage: formData.get('coverImage') as string,
        status: formData.get('status') as any,
        readTime: parseInt(formData.get('readTime') as string || '5')
    }

    try {
        await prisma.blog.update({
            where: { id },
            data
        })
    } catch (e) {
        return { error: 'Failed to update blog' }
    }

    revalidatePath('/admin/blogs')
    redirect('/admin/blogs')
}

export async function deleteBlog(id: string) {
    await prisma.blog.delete({ where: { id } })
    revalidatePath('/admin/blogs')
}

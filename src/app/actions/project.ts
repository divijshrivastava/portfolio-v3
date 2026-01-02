'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getProjects() {
    return await prisma.project.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export async function getProject(id: string) {
    return await prisma.project.findUnique({
        where: { id }
    })
}

export async function createProject(formData: FormData) {
    const data = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        type: formData.get('type') as string,
        imageUrl: formData.get('imageUrl') as string,
        techStack: formData.get('techStack') as string, // Expecting JSON string
        links: formData.get('links') as string,         // Expecting JSON string
        status: formData.get('status') as string,
        isFeatured: formData.get('isFeatured') === 'on'
    }

    // Basic validation
    if (!data.title || !data.description) {
        return { error: 'Missing required fields' }
    }

    await prisma.project.create({
        data
    })

    revalidatePath('/admin/projects')
    redirect('/admin/projects')
}

export async function updateProject(id: string, formData: FormData) {
    const data = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        type: formData.get('type') as string,
        imageUrl: formData.get('imageUrl') as string,
        techStack: formData.get('techStack') as string,
        links: formData.get('links') as string,
        status: formData.get('status') as string,
        isFeatured: formData.get('isFeatured') === 'on'
    }

    await prisma.project.update({
        where: { id },
        data
    })

    revalidatePath('/admin/projects')
    redirect('/admin/projects')
}

export async function deleteProject(id: string) {
    await prisma.project.delete({ where: { id } })
    revalidatePath('/admin/projects')
}

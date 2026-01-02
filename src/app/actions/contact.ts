'use server'

import { prisma } from '@/lib/db'
import { z } from 'zod'

const ContactSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function sendMessage(prevState: any, formData: FormData) {
    const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        message: formData.get('message') as string,
    }

    const result = ContactSchema.safeParse(data)

    if (!result.success) {
        return { error: result.error.errors[0].message }
    }

    try {
        await prisma.message.create({
            data: result.data,
        })
        return { success: 'Message sent successfully! I will get back to you soon.' }
    } catch (e) {
        return { error: 'Failed to send message. Please try again later.' }
    }
}

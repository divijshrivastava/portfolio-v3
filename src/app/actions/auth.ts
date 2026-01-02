'use server'

import { prisma } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!username || !password) {
        return { error: 'Please provide both username and password.' }
    }

    const user = await prisma.user.findUnique({
        where: { username },
    })

    if (!user || !user.password) {
        return { error: 'Invalid credentials.' }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return { error: 'Invalid credentials.' }
    }

    await createSession(user.id)
    redirect('/admin')
}

export async function logout() {
    await deleteSession()
    redirect('/admin/login')
}

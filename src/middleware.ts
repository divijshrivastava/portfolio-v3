import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from '@/lib/session'

export async function middleware(request: NextRequest) {
    // 1. Check if the route is protected
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Exclude login page itself
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next()
        }

        // 2. Verify Session
        const session = await verifySession()

        // 3. Redirect if no session
        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}

'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function AdminLogin() {
    const [state, action, isPending] = useActionState(login, undefined)

    return (
        <div className="flex-center" style={{ minHeight: '100vh' }}>
            <div className="glass-panel" style={{ padding: '3rem 2rem', width: '100%', maxWidth: '400px', borderRadius: '12px' }}>
                <h1 style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '1.8rem' }}>Admin Access</h1>
                <form action={action}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.9rem' }}>Username</label>
                        <input
                            name="username"
                            type="text"
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid #333',
                                borderRadius: '6px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.9rem' }}>Password</label>
                        <input
                            name="password"
                            type="password"
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid #333',
                                borderRadius: '6px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {state?.error && (
                        <p style={{ color: '#ff4444', marginBottom: '1rem', textAlign: 'center' }}>{state.error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        style={{
                            width: '100%',
                            cursor: isPending ? 'not-allowed' : 'pointer',
                            background: 'var(--primary)',
                            color: '#000',
                            border: 'none',
                            padding: '1rem',
                            fontWeight: '700',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            opacity: isPending ? 0.7 : 1,
                            transition: 'opacity 0.2s'
                        }}
                    >
                        {isPending ? 'Logging in...' : 'Login to Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    )
}

'use client'

import { useActionState } from 'react'
import { sendMessage } from '@/app/actions/contact'

export default function Contact() {
    const [state, action, isPending] = useActionState(sendMessage, undefined)

    return (
        <div className="container" style={{ paddingTop: '150px', maxWidth: '600px' }}>
            <div className="text-center" style={{ marginBottom: '3rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Let's Talk</h1>
                <p className="text-muted">
                    Have a project in mind or just want to say hi? <br />
                    Fill out the form below and I'll get back to you.
                </p>
            </div>

            <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px' }}>
                {state?.success ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Message Sent!</h3>
                        <p className="text-muted">{state.success}</p>
                    </div>
                ) : (
                    <form action={action}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                placeholder="John Doe"
                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="john@example.com"
                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Message</label>
                            <textarea
                                name="message"
                                required
                                rows={5}
                                placeholder="Tell me about your project..."
                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                            />
                        </div>

                        {state?.error && (
                            <p style={{ color: '#ff4444', marginBottom: '1.5rem', textAlign: 'center' }}>{state.error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="primaryBtn"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                cursor: isPending ? 'not-allowed' : 'pointer',
                                background: 'var(--primary)',
                                color: 'black',
                                fontWeight: 'bold',
                                border: 'none',
                                borderRadius: '6px',
                                opacity: isPending ? 0.7 : 1
                            }}
                        >
                            {isPending ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

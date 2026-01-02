import { prisma } from '@/lib/db'

export const revalidate = 0

export default async function AdminMessages() {
    const messages = await prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="container" style={{ paddingTop: '120px' }}>
            <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Inbox</h1>

            <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                {messages.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                        No messages yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1px', background: 'var(--border)' }}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={{ padding: '1.5rem', background: 'var(--background)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{msg.name}</h3>
                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                                </div>
                                <div style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{msg.email}</div>
                                <p style={{ color: '#ccc', lineHeight: '1.6' }}>{msg.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function About() {
    const experiences = [
        {
            company: 'Morgan Stanley',
            role: 'Decision Workflow Management System',
            period: 'August 2021 - Present',
            location: 'Mumbai',
            details: [
                'Built DWMS platform automating pre-trade workflows for ESG funds using Java, Spring, and Angular.',
                'Implemented ElasticSearch for high-performance searching, replacing vendor products.',
                'Developed Verity RMS Engagement platform in Python for ESG data collection.',
                'Created Custom Portfolio Application for portfolio managers to compare benchmarks.',
                'Managed CI/CD pipelines in Jenkins and ensured high test coverage.'
            ]
        },
        {
            company: 'TIAA GBS',
            role: 'Software Engineer',
            period: 'June 2019 - August 2021',
            location: 'Pune',
            details: [
                'Designed UD Prime, an e-commerce like insurance application.',
                'Migrated to microservices architecture using OpenShift and Kafka.',
                'Optimized lifecycle management of orders.'
            ]
        },
        {
            company: 'TCS',
            role: 'Software Engineer',
            period: 'March 2017 - June 2019',
            location: 'Pune',
            details: [
                'Engineered DG Drive, a massive storage drive application.',
                'Utilized Java, Angular, Restful Web Services, and MySQL.',
                'Implemented OpenAPI specs for easy integration.'
            ]
        }
    ];

    const skills = [
        'Java', 'Angular', 'Python', 'MySQL', 'DB2', 'Snowflake',
        'MongoDB', 'ElasticSearch', 'SpringBoot', 'Git', 'Kafka', 'Jenkins'
    ];

    const awards = [
        'Won Tech Showcase twice (2023, 2024) - Morgan Stanley',
        'Pat on the Back Award - TIAA',
        'On the Spot Award - TCS',
        'Arctic Code Vault Contributor - Github'
    ];

    return (
        <div className="container section-padding" style={{ paddingTop: '120px' }}>
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '2rem' }}>About Me</h1>

                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Technical Arsenal</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                        {skills.map(skill => (
                            <span key={skill} style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '50px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Experience</h2>
                    <div style={{ display: 'grid', gap: '2rem' }}>
                        {experiences.map((exp, i) => (
                            <div key={i} style={{ paddingLeft: '20px', borderLeft: '2px solid var(--primary)' }}>
                                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{exp.company}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span>{exp.role}</span>
                                    <span>{exp.period}</span>
                                </div>
                                <ul style={{ listStyle: 'none', color: '#ccc', lineHeight: '1.6' }}>
                                    {exp.details.map((point, j) => (
                                        <li key={j} style={{ marginBottom: '0.5rem' }}>• {point}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Awards & Recognition</h2>
                    <div className="grid-cols-2">
                        {awards.map((award, i) => (
                            <div key={i} style={{
                                padding: '1rem',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.02)'
                            }}>
                                {award}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

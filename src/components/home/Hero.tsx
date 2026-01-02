import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.blob} />
            <div className={styles.blob2} />

            <div className={`container ${styles.gridContainer}`} style={{ position: 'relative', zIndex: 2 }}>
                <div className={`${styles.content} animate-fade-in`}>
                    <span className={styles.eyebrow}>Senior Software Engineer • 8+ Years Experience</span>
                    <h1 className={styles.title}>
                        Hello, I'm <br />
                        <span className="text-gradient">Divij Shrivastava</span>
                    </h1>
                    <p className={styles.description}>
                        Specialized in building scalable, high-performance web applications with
                        <strong style={{ color: 'var(--foreground)' }}> Java, Angular, and Spring Boot</strong>.
                        Proven track record at Morgan Stanley, TIAA, and TCS.
                    </p>

                    <div className={styles.actions}>
                        <Link href="/projects" className={styles.primaryBtn}>
                            View My Work
                        </Link>
                        <Link href="/contact" className={styles.secondaryBtn}>
                            Contact Me
                        </Link>
                    </div>

                    <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', opacity: 0.7 }}>
                        <a href="https://github.com/divijshrivastava" target="_blank" className="hover-text-primary">Github</a>
                        <a href="https://linkedin.com" target="_blank" className="hover-text-primary">LinkedIn</a>
                        <a href="https://divij.tech" target="_blank" className="hover-text-primary">divij.tech</a>
                    </div>
                </div>

                <div className={`${styles.imageWrapper} animate-fade-in`}>
                    <div className={styles.imageBackgroundBlob} />
                    <img
                        src="/images/me.jpg"
                        alt="Divij Shrivastava"
                        className={styles.profileImage}
                    />
                </div>
            </div>
        </section>
    );
}

import Link from 'next/link';
import styles from './Navbar.module.css';

import { verifySession } from '@/lib/session';

export default async function Navbar() {
  const session = await verifySession();

  return (
    <nav className={`${styles.nav} glass-panel`}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          AN<span className="text-gradient">TIGRAVITY</span>
        </Link>

        <div className={styles.links}>
          <Link href="/projects" className={styles.link}>Projects</Link>
          <Link href="/blog" className={styles.link}>Blog</Link>
          <Link href="/about" className={styles.link}>About</Link>
          {session && (
            <Link href="/admin" className={styles.link} style={{ color: 'var(--primary)' }}>Dashboard</Link>
          )}
        </div>

        <Link href="/contact" className={styles.cta}>
          Let's Talk
        </Link>
      </div>
    </nav>
  );
}

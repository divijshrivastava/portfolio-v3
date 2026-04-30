import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-24 text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-muted-fg mb-8">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="text-sm text-brand hover:underline underline-offset-4"
        >
          Go home &rarr;
        </Link>
      </main>
    </>
  );
}

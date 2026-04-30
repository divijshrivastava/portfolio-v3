import { SiteHeader } from '@/components/site-header';

export default function BlogPostLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-12">
        <div className="h-4 w-28 bg-muted rounded animate-pulse mb-8" />
        <div className="h-10 w-4/5 bg-muted rounded animate-pulse mb-4" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse mb-10" />
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-muted rounded animate-pulse"
              style={{ width: `${70 + Math.random() * 30}%` }}
            />
          ))}
        </div>
      </main>
    </>
  );
}

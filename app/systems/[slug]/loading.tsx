import { SiteHeader } from '@/components/site-header';

export default function SystemDetailLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-12">
        <div className="h-4 w-16 bg-muted rounded animate-pulse mb-8" />
        <div className="h-4 w-40 bg-muted rounded animate-pulse mb-1" />
        <div className="h-10 w-3/4 bg-muted rounded animate-pulse mb-4" />
        <div className="flex gap-2 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-16 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-muted rounded animate-pulse"
              style={{ width: `${60 + Math.random() * 40}%` }}
            />
          ))}
        </div>
      </main>
    </>
  );
}

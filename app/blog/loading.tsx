import { SiteHeader } from '@/components/site-header';

export default function BlogLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-12">
        <div className="h-8 w-24 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse mb-10" />
        <div className="space-y-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-3 w-40 bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

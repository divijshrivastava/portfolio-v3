import Link from 'next/link';
import { SectionHeader } from '@/components/section-header';

export interface SystemItem {
  slug: string;
  name: string;
  company: string;
  dates: string;
  summary: string;
  metric?: string;
  tags: string[];
}

interface SystemsListProps {
  systems: SystemItem[];
}

export function SystemsList({ systems }: SystemsListProps) {
  if (systems.length === 0) {
    return (
      <section id="systems" className="py-12 border-t border-border">
        <SectionHeader
          number="02"
          title="Systems I've Built"
          subtitle="Production systems I've designed and owned end-to-end — from architecture decisions to deployment and scale."
        />
        <p className="text-sm text-muted-fg">
          Loading from database...
        </p>
      </section>
    );
  }

  return (
    <section id="systems" className="py-12 border-t border-border">
      <SectionHeader
        number="02"
        title="Systems I've Built"
        subtitle="Production systems I've designed and owned end-to-end — from architecture decisions to deployment and scale."
      />
      <div className="space-y-10">
        {systems.map((system) => (
          <article key={system.slug} className="group">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
              <h3 className="text-lg font-medium text-foreground">
                {system.name}
              </h3>
              <span className="text-sm text-muted-fg shrink-0">
                {system.company} &middot; {system.dates}
              </span>
            </div>
            <p className="text-sm text-muted-fg leading-relaxed mb-2">
              {system.summary}
            </p>
            {system.metric && (
              <p className="text-sm font-medium text-brand mb-3">
                {system.metric}
              </p>
            )}
            {system.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {system.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <Link
              href={`/systems/${system.slug}`}
              className="text-sm text-brand hover:underline underline-offset-4"
            >
              Read more &rarr;
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

import Link from 'next/link';
import type { SystemItem } from '../types';

interface SystemsPanelProps {
  systems: SystemItem[];
}

export function SystemsPanel({ systems }: SystemsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="text-[#6c7086] font-mono text-sm">
        {"// systems I've built & shipped"}
      </div>

      {systems.length === 0 ? (
        <p className="text-sm text-[#6c7086]">Loading from database...</p>
      ) : (
        <div className="space-y-8">
          {systems.map((system) => (
            <article
              key={system.slug}
              className="border border-[#313244] rounded-lg p-5 bg-[#181825]/30 hover:border-[#45475a] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                <h3 className="text-base font-semibold text-[#cdd6f4]">
                  {system.name}
                </h3>
                <span className="text-xs text-[#6c7086] shrink-0">
                  {system.company} &middot; {system.dates}
                </span>
              </div>
              <p className="text-sm text-[#a6adc8] leading-relaxed mb-2">
                {system.summary}
              </p>
              {system.metric && (
                <p className="text-sm font-medium text-[#a6e3a1] mb-3">
                  {system.metric}
                </p>
              )}
              {system.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {system.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#313244] text-[#bac2de]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <Link
                href={`/systems/${system.slug}`}
                className="text-sm text-[#89b4fa] hover:underline underline-offset-4"
              >
                Read more &rarr;
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

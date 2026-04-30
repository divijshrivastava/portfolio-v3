import { TerminalHero } from '@/components/terminal-hero';

export function Hero() {
  return (
    <section className="pt-16 sm:pt-20 pb-12">
      <TerminalHero />

      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href="#systems"
          className="text-sm font-medium text-brand hover:underline underline-offset-4"
        >
          View Systems I&apos;ve Built &darr;
        </a>
        <a
          href="/api/resume/download"
          className="text-sm font-medium text-brand hover:underline underline-offset-4"
        >
          Resume &darr;
        </a>
      </div>
    </section>
  );
}

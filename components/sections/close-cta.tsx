import { Mail, ExternalLink } from 'lucide-react';

export function CloseCTA() {
  return (
    <section className="py-16 border-t border-border">
      <div className="rounded-lg border border-brand/20 bg-brand/5 px-6 py-10 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
          Looking for a backend engineer who owns outcomes, not just tickets.
        </h2>
        <p className="text-sm text-muted-fg max-w-lg mx-auto mb-8 leading-relaxed">
          I&apos;m targeting Staff/Senior Backend Engineer roles where I can design
          systems, lead technical decisions, and ship production infrastructure
          that scales. If you&apos;re building something that needs real engineering
          depth — distributed systems, high-throughput APIs, or complex
          integrations — let&apos;s talk.
        </p>
        <div className="flex items-center justify-center gap-6 mb-6">
          <a
            href="mailto:divijshrivastava@gmail.com"
            className="inline-flex items-center gap-2 text-sm text-muted-fg hover:text-foreground transition-colors"
          >
            <Mail className="h-4 w-4" />
            Email
          </a>
          <a
            href="https://linkedin.com/in/divij-shrivastava"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-fg hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            LinkedIn
          </a>
          <a
            href="https://github.com/divijshrivastava"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-fg hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            GitHub
          </a>
        </div>
        <a
          href="/api/resume/download"
          className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Download Resume
        </a>
      </div>
    </section>
  );
}

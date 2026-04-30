import { GithubIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from '@/components/icons';

const socialLinks = [
  { href: 'https://github.com/divijshrivastava', label: 'GitHub', Icon: GithubIcon, desc: '@divijshrivastava' },
  { href: 'https://linkedin.com/in/divij-shrivastava', label: 'LinkedIn', Icon: LinkedinIcon, desc: '/in/divij-shrivastava' },
  { href: 'https://x.com/divaborni', label: 'Twitter / X', Icon: TwitterIcon, desc: '@divaborni' },
  { href: 'https://youtube.com/@divaborni', label: 'YouTube', Icon: YoutubeIcon, desc: '@divaborni' },
];

export function ContactPanel() {
  return (
    <div className="space-y-6">
      <div className="text-[#6c7086] font-mono text-sm">
        {"/* let's connect */"}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs font-semibold tracking-widest text-[#6c7086] mb-4 uppercase">
            Find me on
          </h3>
          <div className="space-y-3">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-[#313244] rounded-lg px-4 py-3 bg-[#181825]/30 hover:border-[#45475a] transition-colors group"
              >
                <s.Icon className="w-5 h-5 text-[#6c7086] group-hover:text-[#cdd6f4] transition-colors" />
                <div>
                  <div className="text-sm text-[#cdd6f4]">{s.label}</div>
                  <div className="text-xs text-[#6c7086]">{s.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-widest text-[#6c7086] mb-4 uppercase">
            Get in touch
          </h3>
          <div className="space-y-4">
            <div className="border border-[#313244] rounded-lg p-5 bg-[#181825]/30">
              <div className="font-mono text-xs text-[#6c7086] mb-2">
                <span className="text-[#cba6f7]">.contact</span> {'{'}{' '}
              </div>
              <p className="text-sm text-[#a6adc8] leading-relaxed mb-4 pl-4">
                Looking for a backend engineer who owns outcomes, not just tickets.
                Targeting Staff/Senior Backend Engineer roles in distributed systems,
                high-throughput APIs, or complex integrations.
              </p>
              <div className="font-mono text-xs text-[#6c7086]">{'}'}</div>
            </div>

            <a
              href="mailto:divijshrivastava@gmail.com"
              className="flex items-center justify-center gap-2 w-full h-10 rounded-md bg-[#89b4fa] text-[#1e1e2e] text-sm font-medium hover:bg-[#89b4fa]/90 transition-colors"
            >
              <MailSvg />
              divijshrivastava@gmail.com
            </a>

            <a
              href="/api/resume/download"
              className="flex items-center justify-center gap-2 w-full h-10 rounded-md border border-[#313244] text-[#cdd6f4] text-sm font-medium hover:bg-[#313244]/50 transition-colors"
            >
              <DownloadSvg />
              Download Resume
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function MailSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function DownloadSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

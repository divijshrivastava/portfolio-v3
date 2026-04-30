import { GithubIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from '@/components/icons';

const stats = [
  { label: 'YEARS', value: '8+' },
  { label: 'PLATFORMS', value: '9' },
  { label: 'SHOWCASE', value: '2x' },
  { label: 'CURIOSITY', value: '\u221E' },
];

const roles = [
  { label: 'Backend Engineer', color: 'bg-[#89b4fa]' },
  { label: 'System Designer', color: 'bg-[#a6e3a1]' },
  { label: 'Distributed Systems', color: 'bg-[#f9e2af]' },
  { label: 'Tech Lead', color: 'bg-[#f38ba8]' },
];

const socials = [
  { href: 'https://github.com/divijshrivastava', label: 'GitHub', Icon: GithubIcon },
  { href: 'https://linkedin.com/in/divij-shrivastava', label: 'LinkedIn', Icon: LinkedinIcon },
  { href: 'https://x.com/divaborni', label: 'Twitter', Icon: TwitterIcon },
  { href: 'https://youtube.com/@divaborni', label: 'YouTube', Icon: YoutubeIcon },
];

export function HomePanel() {
  return (
    <div className="space-y-8">
      <div className="text-[#6c7086] font-mono text-sm">{'// hello world'}</div>

      <div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          <span className="text-[#cdd6f4]">Divij</span>{' '}
          <span className="text-[#f38ba8]">Shrivastava</span>
        </h1>
        <p className="mt-4 text-lg text-[#a6adc8] max-w-xl leading-relaxed">
          Senior Backend Engineer building distributed systems, real-time platforms,
          and scalable architecture
          <span className="inline-block w-2 h-5 bg-[#89dceb] ml-1 align-middle animate-[blink_1s_step-end_infinite]" />
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <span
            key={role.label}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#cdd6f4] bg-[#313244] px-3 py-1.5 rounded-full"
          >
            <span className={`w-2 h-2 rounded-full ${role.color}`} />
            {role.label}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-6 border border-[#313244] rounded-lg px-6 py-4 bg-[#181825]/50">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-xl font-bold text-[#89dceb]">{stat.value}</div>
            <div className="text-[10px] font-semibold tracking-widest text-[#6c7086] mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
            aria-label={s.label}
          >
            <s.Icon className="w-5 h-5" />
          </a>
        ))}
      </div>
    </div>
  );
}

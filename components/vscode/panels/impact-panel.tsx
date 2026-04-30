const impacts = [
  {
    key: 'cost_elimination',
    headline: 'Cost Elimination',
    detail:
      'Replaced FactSet RMS (6-figure/user/year licensing) with scalable in-house solution. Built real-time trading platform from scratch, integrated 9 downstream systems.',
  },
  {
    key: 'system_integration',
    headline: 'System Integration at Scale',
    detail:
      'Architected real-time integration with 9 platforms including BlackRock Aladdin. Event-driven protocols, Elasticsearch-powered search, zero-downtime deployments serving equity and fixed income desks.',
  },
  {
    key: 'team_leadership',
    headline: 'Team Leadership',
    detail:
      'Led 5-engineer team building ESG analytics platform from concept to production. Owned full stack: Verity RMS integration, automated PowerBI pipelines, Autosys scheduling. Won Tech Showcase 2 consecutive years.',
  },
  {
    key: 'data_engineering',
    headline: 'Data Engineering',
    detail:
      'Migrated millions of XML records from RDBMS to MongoDB. Built automated data pipelines with Python and Autosys. Designed Elasticsearch search across massive document repositories.',
  },
];

export function ImpactPanel() {
  return (
    <div className="space-y-6">
      <div className="text-[#6c7086] font-mono text-sm">
        {'{ "focus": "outcomes" }'}
      </div>

      <div className="font-mono text-sm text-[#6c7086] mb-2">
        <span className="text-[#cba6f7]">const</span>{' '}
        <span className="text-[#89b4fa]">keyImpact</span>{' '}
        <span className="text-[#89dceb]">=</span>{' '}
        <span className="text-[#f9e2af]">{'['}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {impacts.map((item) => (
          <div
            key={item.key}
            className="border border-[#313244] rounded-lg p-4 bg-[#181825]/30"
          >
            <div className="font-mono text-xs text-[#6c7086] mb-2">
              {'{'} <span className="text-[#f38ba8]">&quot;{item.key}&quot;</span>:
            </div>
            <h3 className="text-sm font-semibold text-[#a6e3a1] mb-1.5">
              {item.headline}
            </h3>
            <p className="text-sm text-[#a6adc8] leading-relaxed">
              {item.detail}
            </p>
            <div className="font-mono text-xs text-[#6c7086] mt-2">{'}'}</div>
          </div>
        ))}
      </div>

      <div className="font-mono text-sm text-[#f9e2af]">{']'}</div>
    </div>
  );
}

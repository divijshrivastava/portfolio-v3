const skillGroups = [
  {
    category: 'Languages',
    color: '#f38ba8',
    skills: [
      { name: 'Java', pct: 95 },
      { name: 'Python', pct: 80 },
      { name: 'TypeScript', pct: 75 },
      { name: 'SQL', pct: 85 },
    ],
  },
  {
    category: 'Frameworks',
    color: '#a6e3a1',
    skills: [
      { name: 'Spring Boot', pct: 95 },
      { name: 'Next.js / React', pct: 70 },
      { name: 'REST / OpenAPI', pct: 90 },
      { name: 'Kafka Streams', pct: 80 },
    ],
  },
  {
    category: 'Data Systems',
    color: '#89dceb',
    skills: [
      { name: 'PostgreSQL', pct: 90 },
      { name: 'Elasticsearch', pct: 85 },
      { name: 'MongoDB', pct: 80 },
      { name: 'DB2', pct: 75 },
    ],
  },
  {
    category: 'Infrastructure',
    color: '#cba6f7',
    skills: [
      { name: 'Docker', pct: 85 },
      { name: 'OpenShift / K8s', pct: 75 },
      { name: 'Jenkins / CI-CD', pct: 85 },
      { name: 'LaunchDarkly', pct: 70 },
    ],
  },
];

export function SkillsPanel() {
  return (
    <div className="space-y-6">
      <div className="text-[#6c7086] font-mono text-sm">
        {'{ "status": "always_building" }'}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {skillGroups.map((group) => (
          <div key={group.category}>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: group.color }}
            >
              {group.category}
            </h3>
            <div className="space-y-2.5">
              {group.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#cdd6f4]">{skill.name}</span>
                    <span className="text-[#6c7086]">{skill.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#313244] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${skill.pct}%`,
                        backgroundColor: group.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { SectionHeader } from '@/components/section-header';

const groups = [
  {
    title: 'Distributed Systems & Messaging',
    items: ['Kafka', 'Event-driven architecture', 'Microservices', 'System integration', 'Circuit breakers'],
  },
  {
    title: 'Backend Architecture',
    items: ['Java', 'Spring Boot', 'Python', 'RESTful APIs', 'API design (Swagger/OpenAPI)'],
  },
  {
    title: 'Data & Storage',
    items: ['Elasticsearch', 'PostgreSQL', 'MongoDB', 'DB2', 'MySQL', 'Data migration', 'ETL pipelines'],
  },
  {
    title: 'Infrastructure & Observability',
    items: ['Docker', 'OpenShift', 'Jenkins', 'CI/CD', 'Monitoring', 'Feature toggles (LaunchDarkly)'],
  },
];

export function Toolkit() {
  return (
    <section className="py-12 border-t border-border">
      <SectionHeader
        number="05"
        title="Technical Skills"
        subtitle="Grouped by the kind of problems I solve, not just the tools I use."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              {group.title}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

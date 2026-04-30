import { SectionHeader } from '@/components/section-header';

const topics = [
  {
    title: 'Event-Driven Architecture',
    how: 'Insurance product lifecycle with event-driven state machines on Kafka. Decoupled services, guaranteed delivery, horizontal scalability. Millions of state transitions in production.',
  },
  {
    title: 'System Integration',
    how: '9-system integration including BlackRock Aladdin, LaunchDarkly, Verity RMS. Protocol design, retry strategies, circuit breakers, monitoring. Zero coupling between trading desks.',
  },
  {
    title: 'Data Architecture',
    how: 'Elasticsearch for search, MongoDB for documents, DB2 for transactions. Migrated millions of records across storage engines with zero downtime. Right tool for each access pattern.',
  },
  {
    title: 'Scaling Without Drama',
    how: 'High-throughput APIs, connection pooling, caching layers. Containerized microservices on OpenShift. Designing for 10x before the traffic arrives, not after.',
  },
];

export function HowIThink() {
  return (
    <section className="py-12 border-t border-border">
      <SectionHeader
        number="03"
        title="System Design Thinking"
        subtitle="Architectural principles I apply when designing production systems."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {topics.map((topic) => (
          <div key={topic.title}>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              {topic.title}
            </h3>
            <p className="text-sm text-muted-fg leading-relaxed">
              {topic.how}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

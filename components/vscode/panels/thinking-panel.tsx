const topics = [
  {
    title: 'Event-Driven Architecture',
    content:
      'Insurance product lifecycle with event-driven state machines on Kafka. Decoupled services, guaranteed delivery, horizontal scalability. Millions of state transitions in production.',
  },
  {
    title: 'System Integration',
    content:
      '9-system integration including BlackRock Aladdin, LaunchDarkly, Verity RMS. Protocol design, retry strategies, circuit breakers, monitoring. Zero coupling between trading desks.',
  },
  {
    title: 'Data Architecture',
    content:
      'Elasticsearch for search, MongoDB for documents, DB2 for transactions. Migrated millions of records across storage engines with zero downtime. Right tool for each access pattern.',
  },
  {
    title: 'Scaling Without Drama',
    content:
      'High-throughput APIs, connection pooling, caching layers. Containerized microservices on OpenShift. Designing for 10x before the traffic arrives, not after.',
  },
];

export function ThinkingPanel() {
  return (
    <div className="space-y-6">
      <div className="text-[#6c7086] font-mono text-sm">
        # System Design Thinking
      </div>

      <div className="space-y-6">
        {topics.map((topic) => (
          <div key={topic.title}>
            <h3 className="text-base font-semibold text-[#cdd6f4] mb-1 flex items-center gap-2">
              <span className="text-[#89b4fa] font-mono text-sm">##</span>
              {topic.title}
            </h3>
            <p className="text-sm text-[#a6adc8] leading-relaxed pl-6">
              {topic.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

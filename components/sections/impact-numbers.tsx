import { SectionHeader } from '@/components/section-header';

const impacts = [
  {
    headline: 'Cost Elimination',
    detail:
      'Replaced FactSet RMS (6-figure/user/year licensing) with scalable in-house solution. Built real-time trading platform from scratch, integrated 9 downstream systems.',
  },
  {
    headline: 'System Integration at Scale',
    detail:
      'Architected real-time integration with 9 platforms including BlackRock Aladdin. Event-driven protocols, Elasticsearch-powered search, zero-downtime deployments serving equity and fixed income desks.',
  },
  {
    headline: 'Team Leadership',
    detail:
      'Led 5-engineer team building ESG analytics platform from concept to production. Owned full stack: Verity RMS integration, automated PowerBI pipelines, Autosys scheduling. Won Tech Showcase 2 consecutive years.',
  },
  {
    headline: 'Data Engineering',
    detail:
      'Migrated millions of XML records from RDBMS to MongoDB. Built automated data pipelines with Python and Autosys. Designed Elasticsearch search across massive document repositories.',
  },
];

export function ImpactNumbers() {
  return (
    <section className="py-12 border-t border-border">
      <SectionHeader
        number="01"
        title="Key Impact"
        subtitle="Outcomes I've driven in production, not just features shipped."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {impacts.map((item) => (
          <div key={item.headline}>
            <h3 className="text-sm font-semibold text-brand mb-1">
              {item.headline}
            </h3>
            <p className="text-sm text-muted-fg leading-relaxed">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsletterForm } from '@/components/newsletter/newsletter-form';
import { cn } from '@/lib/utils';

export function NewsletterCTA({
  title = 'Subscribe to my newsletter',
  description = 'Get new posts and engineering notes—no spam.',
  source,
  className,
}: {
  title?: string;
  description?: string;
  source: string;
  className?: string;
}) {
  return (
    <Card className={cn('border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <NewsletterForm source={source} />
      </CardContent>
    </Card>
  );
}



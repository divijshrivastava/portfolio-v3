import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MailCheck, MailX, Users, UserX } from 'lucide-react';

export default async function NewsletterSendDetailPage({
  params,
}: {
  params: Promise<{ sendId: string }>;
}) {
  const { sendId } = await params;
  const supabase = createAdminClient();

  const { data: send, error: sendErr } = await supabase
    .from('newsletter_sends')
    .select('id, status, created_at, started_at, completed_at, total_recipients, sent_count, failed_count, audience, newsletters(id, subject)')
    .eq('id', sendId)
    .single();

  if (sendErr || !send) {
    return (
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Send details</h1>
        <p className="text-destructive">Failed to load send: {sendErr?.message || 'Not found'}</p>
        <Link href="/admin/newsletter/history">
          <Button variant="outline">Back to history</Button>
        </Link>
      </div>
    );
  }

  const { data: deliveries, error: delErr } = await supabase
    .from('newsletter_deliveries')
    .select('id, email, status, sent_at, error')
    .eq('send_id', sendId)
    .order('email', { ascending: true })
    .limit(5000);

  if (delErr) {
    return (
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Send details</h1>
        <p className="text-destructive">Failed to load deliveries: {delErr.message}</p>
      </div>
    );
  }

  // Supabase relationship typing can be array vs object depending on schema inference.
  // Normalize to a single newsletter object for display.
  const newsletter = Array.isArray((send as any).newsletters) ? (send as any).newsletters?.[0] : (send as any).newsletters;

  // Parse audience data
  const audience = send.audience as any;
  const audienceType = audience?.type || 'unknown';
  const audienceSource = audience?.source || null;
  const manualEmails = audience?.emails || [];
  const excludedEmails = audience?.excludedEmails || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/newsletter/history">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Send details</h1>
            <p className="text-muted-foreground mt-2">
              {newsletter?.subject || '—'}
            </p>
          </div>
        </div>
        {newsletter?.id && (
          <Link href={`/admin/newsletter/${newsletter.id}/send`}>
            <Button>Send again</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{send.status}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Sent</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold inline-flex items-center gap-2">
            <MailCheck className="h-5 w-5" />
            {send.sent_count}/{send.total_recipients}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold inline-flex items-center gap-2">
            <MailX className="h-5 w-5" />
            {send.failed_count}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Started: {new Date(send.started_at ?? send.created_at).toLocaleString()}</span>
            </div>
            {send.completed_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Completed: {new Date(send.completed_at).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Audience
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Type</span>
                <p className="text-sm font-medium mt-1 capitalize">
                  {audienceType === 'all' && 'Everyone subscribed'}
                  {audienceType === 'source' && `By source: ${audienceSource}`}
                  {audienceType === 'manual' && 'Manual list'}
                </p>
              </div>

              {audienceType === 'manual' && manualEmails.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Recipients ({manualEmails.length})
                  </span>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {manualEmails.map((email: string, idx: number) => (
                      <div key={idx} className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {email}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {excludedEmails.length > 0 && (
                <div>
                  <span className="text-xs text-destructive uppercase tracking-wide flex items-center gap-1">
                    <UserX className="h-3 w-3" />
                    Excluded ({excludedEmails.length})
                  </span>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {excludedEmails.map((email: string, idx: number) => (
                      <div key={idx} className="text-xs font-mono bg-destructive/10 text-destructive px-2 py-1 rounded border border-destructive/20">
                        {email}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {!deliveries || deliveries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No deliveries found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Sent at</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d: any) => (
                    <tr key={d.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-medium">{d.email}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-muted-foreground">{d.status}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-muted-foreground">
                          {d.sent_at ? new Date(d.sent_at).toLocaleString() : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-xs text-muted-foreground">{d.error || '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



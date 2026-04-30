import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, History, MailCheck, MailX } from 'lucide-react';

export default async function NewsletterHistoryPage() {
  const supabase = createAdminClient();

  const { data: sends, error } = await supabase
    .from('newsletter_sends')
    .select(
      'id, status, created_at, started_at, completed_at, scheduled_for, total_recipients, sent_count, failed_count, newsletters(subject)'
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Newsletter History</h1>
        <p className="text-destructive">Failed to load history: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Newsletter History</h1>
          <p className="text-muted-foreground mt-2">All send runs (who, when, and results).</p>
        </div>
        <Link href="/admin/newsletter/new">
          <Button>New Newsletter</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Send runs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!sends || sends.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No sends yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Newsletter</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Results</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {sends.map((s: any) => {
                    const isScheduled = s.status === 'scheduled';
                    const displayTime = isScheduled
                      ? s.scheduled_for
                      : (s.started_at ?? s.created_at);
                    
                    const statusColors: Record<string, string> = {
                      draft: 'bg-gray-100 text-gray-700',
                      scheduled: 'bg-blue-100 text-blue-700',
                      sending: 'bg-yellow-100 text-yellow-700',
                      sent: 'bg-green-100 text-green-700',
                      failed: 'bg-red-100 text-red-700',
                    };
                    
                    return (
                      <tr key={s.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2">
                          <div className="font-medium">{s.newsletters?.subject || '—'}</div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[s.status] || 'bg-gray-100 text-gray-700'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {isScheduled ? (
                              <>
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">Scheduled:</span>
                                {new Date(displayTime).toLocaleString()}
                              </>
                            ) : (
                              <>
                                <Calendar className="h-4 w-4" />
                                {new Date(displayTime).toLocaleString()}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {isScheduled ? (
                            <span className="text-sm text-muted-foreground">—</span>
                          ) : (
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <MailCheck className="h-4 w-4" />
                                {s.sent_count}/{s.total_recipients}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MailX className="h-4 w-4" />
                                {s.failed_count}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Link href={`/admin/newsletter/history/${s.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



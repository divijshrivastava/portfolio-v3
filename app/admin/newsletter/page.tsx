import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { FileText, History, MailPlus, Users } from 'lucide-react';

export default async function NewsletterAdminLandingPage() {
  const supabase = createAdminClient();

  const [{ count: subscribersCount }, { count: newslettersCount }, { count: sendsCount }] = await Promise.all([
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    supabase.from('newsletters').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_sends').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Newsletter</h1>
          <p className="text-muted-foreground mt-2">
            Create newsletters, choose recipients, and track sending history.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/newsletter/new">
            <Button>New Newsletter</Button>
          </Link>
          <Link href="/admin/newsletter/history">
            <Button variant="outline">History</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-3xl font-bold">{subscribersCount || 0}</div>
            <Link href="/admin/newsletter/subscribers">
              <Button variant="ghost" size="sm">Manage</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Newsletters
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-3xl font-bold">{newslettersCount || 0}</div>
            <Link href="/admin/newsletter/list">
              <Button variant="ghost" size="sm">View</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <History className="h-4 w-4" />
              Sends
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-3xl font-bold">{sendsCount || 0}</div>
            <Link href="/admin/newsletter/history">
              <Button variant="ghost" size="sm">View</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailPlus className="h-5 w-5" />
            Quick links
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/admin/newsletter/new">
            <Button>Compose</Button>
          </Link>
          <Link href="/admin/newsletter/list">
            <Button variant="outline">All newsletters</Button>
          </Link>
          <Link href="/admin/newsletter/subscribers">
            <Button variant="outline">Subscribers</Button>
          </Link>
          <Link href="/admin/newsletter/history">
            <Button variant="outline">History</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}



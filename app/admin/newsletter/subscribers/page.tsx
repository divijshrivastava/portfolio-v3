'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/admin/loading-skeleton';
import { Calendar, Download, MailPlus, Search, Trash2 } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  ip_address: string | null;
  created_at: string;
}

function formatCsvValue(value: unknown): string {
  const s = String(value ?? '');
  // Escape double quotes and wrap in quotes if needed
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function NewsletterSubscribersAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setIsLoading(true);
    setLoadError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, source, ip_address, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      // PostgrestError properties are often non-enumerable; log fields explicitly.
      console.error('Error loading newsletter subscribers:', {
        message: (error as any).message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      });
      setLoadError(
        (error as any).message
          ? `Failed to load subscribers: ${(error as any).message}${(error as any).code ? ` (code ${(error as any).code})` : ''}`
          : 'Failed to load subscribers. Check console for details.'
      );
    } else {
      setSubscribers((data as Subscriber[]) || []);
    }
    setIsLoading(false);
  };

  const filteredSubscribers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) => {
      return (
        s.email.toLowerCase().includes(q) ||
        (s.source || '').toLowerCase().includes(q) ||
        (s.ip_address || '').toLowerCase().includes(q)
      );
    });
  }, [subscribers, searchQuery]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete subscriber ${email}?`)) return;

    const supabase = createClient();
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);

    if (error) {
      console.error('Error deleting subscriber:', {
        message: (error as any).message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      });
      alert('Failed to delete subscriber');
      return;
    }

    await loadSubscribers();
  };

  const handleExportCsv = () => {
    const rows = filteredSubscribers.map((s) => ({
      email: s.email,
      source: s.source ?? '',
      ip_address: s.ip_address ?? '',
      created_at: s.created_at,
    }));

    const header = ['email', 'source', 'ip_address', 'created_at'];
    const csv =
      header.join(',') +
      '\n' +
      rows
        .map((r) => header.map((k) => formatCsvValue((r as any)[k])).join(','))
        .join('\n') +
      '\n';

    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(`newsletter-subscribers-${date}.csv`, csv);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-9 w-64 bg-muted animate-pulse rounded mb-2" />
          <div className="h-5 w-80 bg-muted animate-pulse rounded" />
        </div>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Newsletter Subscribers</h1>
          <p className="text-muted-foreground mt-2">
            {filteredSubscribers.length} subscriber{filteredSubscribers.length !== 1 ? 's' : ''}{' '}
            {searchQuery ? `matching “${searchQuery}”` : 'total'}
          </p>
          {loadError && (
            <p className="mt-2 text-sm text-destructive">{loadError}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv} disabled={filteredSubscribers.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={loadSubscribers}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search by email, source, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Subscribers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailPlus className="h-5 w-5" />
            Subscribers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-12">
              <MailPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No subscribers</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'No subscribers match your search.' : 'Subscribers will show up here as people sign up.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Source</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">IP</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Created</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((s) => (
                    <tr key={s.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-medium">{s.email}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-muted-foreground">{s.source || '—'}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-muted-foreground">{s.ip_address || '—'}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(s.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(s.id, s.email)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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



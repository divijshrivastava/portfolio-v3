'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send } from 'lucide-react';

type AudienceType = 'all' | 'source' | 'manual';

export default function SendNewsletterPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const newsletterId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [audienceType, setAudienceType] = useState<AudienceType>('all');
  const [source, setSource] = useState('');
  const [manualEmails, setManualEmails] = useState('');
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [recipients, setRecipients] = useState<Array<{ email: string; source?: string; created_at: string }>>([]);
  const [excludedEmails, setExcludedEmails] = useState<Set<string>>(new Set());
  const [alreadySentEmails, setAlreadySentEmails] = useState<Set<string>>(new Set());
  const [showAllRecipients, setShowAllRecipients] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Scheduling
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('newsletters')
        .select('id, subject, status')
        .eq('id', newsletterId)
        .single();

      if (error) {
        console.error('Failed to load newsletter:', error);
        alert(`Failed to load newsletter: ${error.message}`);
        router.push('/admin/newsletter');
        return;
      }

      setSubject(data.subject);
      setStatus(data.status);
      setIsLoading(false);
    };
    load();
  }, [newsletterId, router, supabase]);

  const computeRecipientCount = async () => {
    // First, fetch SUCCESSFULLY sent emails for this newsletter (status = 'sent')
    const { data: deliveries } = await supabase
      .from('newsletter_deliveries')
      .select('email, newsletter_sends!inner(newsletter_id)')
      .eq('newsletter_sends.newsletter_id', newsletterId)
      .eq('status', 'sent'); // Only count successful deliveries
    
    const alreadySent = new Set(deliveries?.map(d => d.email.toLowerCase()) || []);
    setAlreadySentEmails(alreadySent);
    
    if (audienceType === 'manual') {
      const parsed = manualEmails
        .split(/[\n,; ]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const uniq = Array.from(new Set(parsed));
      setRecipientCount(uniq.length);
      // Create mock recipients for manual emails
      const recipientList = uniq.map(email => ({ 
        email, 
        source: 'manual', 
        created_at: new Date().toISOString() 
      }));
      setRecipients(recipientList);
      
      // Auto-exclude already sent
      const autoExclude = new Set(uniq.filter(email => alreadySent.has(email.toLowerCase())));
      setExcludedEmails(autoExclude);
      return;
    }

    if (audienceType === 'source') {
      if (!source.trim()) {
        setRecipientCount(0);
        setRecipients([]);
        setExcludedEmails(new Set());
        return;
      }
      const { data, count } = await supabase
        .from('newsletter_subscribers')
        .select('email, source, created_at')
        .eq('source', source.trim())
        .is('unsubscribed_at', null)
        .order('created_at', { ascending: false });
      setRecipientCount(count ?? 0);
      setRecipients(data || []);
      
      // Auto-exclude already sent
      const autoExclude = new Set((data || []).filter(r => alreadySent.has(r.email.toLowerCase())).map(r => r.email));
      setExcludedEmails(autoExclude);
      return;
    }

    // All subscribers
    const { data, count } = await supabase
      .from('newsletter_subscribers')
      .select('email, source, created_at')
      .is('unsubscribed_at', null)
      .order('created_at', { ascending: false });
    setRecipientCount(count ?? 0);
    setRecipients(data || []);
    
    // Auto-exclude already sent
    const autoExclude = new Set((data || []).filter(r => alreadySent.has(r.email.toLowerCase())).map(r => r.email));
    setExcludedEmails(autoExclude);
  };

  useEffect(() => {
    setRecipientCount(null);
    setRecipients([]);
    setExcludedEmails(new Set());
    setAlreadySentEmails(new Set());
    setShowAllRecipients(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceType, source, manualEmails]);

  const toggleRecipient = (email: string) => {
    setExcludedEmails(prev => {
      const next = new Set(prev);
      if (next.has(email)) {
        next.delete(email);
      } else {
        next.add(email);
      }
      return next;
    });
  };

  const includeAll = () => {
    setExcludedEmails(new Set());
  };

  const excludeAll = () => {
    setExcludedEmails(new Set(recipients.map(r => r.email)));
  };

  const excludeAlreadySent = () => {
    setExcludedEmails(new Set(recipients.filter(r => alreadySentEmails.has(r.email.toLowerCase())).map(r => r.email)));
  };

  const includedCount = recipients.length - excludedEmails.size;

  const handleSend = async () => {
    if (status !== 'published') {
      alert('Please publish the newsletter first (Edit → Publish).');
      return;
    }

    let audience: any = null;
    if (audienceType === 'all') {
      audience = { type: 'all' };
    } else if (audienceType === 'source') {
      const s = source.trim();
      if (!s) {
        alert('Source is required for source targeting.');
        return;
      }
      audience = { type: 'source', source: s };
    } else {
      const emails = manualEmails
        .split(/[\n,; ]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (emails.length === 0) {
        alert('Please enter at least one email.');
        return;
      }
      audience = { type: 'manual', emails };
    }

    let scheduledFor: string | null = null;
    if (isScheduled) {
      if (!scheduledDate || !scheduledTime) {
        alert('Please select both date and time for scheduled sending.');
        return;
      }
      
      // Combine date and time in local timezone, then convert to ISO (UTC)
      const localDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      // Validate it's in the future
      if (localDateTime <= new Date()) {
        alert('Scheduled time must be in the future.');
        return;
      }
      
      // Convert to ISO string for API (automatically converts to UTC)
      scheduledFor = localDateTime.toISOString();
      
      if (!confirm(`Schedule "${subject}" for ${localDateTime.toLocaleString()}?`)) return;
    } else {
      if (!confirm(`Send "${subject}" now?`)) return;
    }

    setIsSending(true);
    const res = await fetch('/api/admin/newsletter/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        newsletterId, 
        audience, 
        scheduledFor,
        excludedEmails: Array.from(excludedEmails)
      }),
    });
    const json = await res.json().catch(() => ({}));
    setIsSending(false);

    if (!res.ok) {
      alert(json.error || 'Failed to send newsletter');
      return;
    }

    router.push(`/admin/newsletter/history/${json.sendId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <div className="h-5 w-96 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href={`/admin/newsletter/${newsletterId}/edit`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Send Newsletter</h1>
            <p className="text-muted-foreground mt-2">
              <span className="font-medium">Subject:</span> {subject}
            </p>
          </div>
        </div>
        <Button onClick={handleSend} disabled={isSending}>
          <Send className="h-4 w-4 mr-2" />
          {isSending ? (isScheduled ? 'Scheduling…' : 'Sending…') : (isScheduled ? 'Schedule' : 'Send now')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recipients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={audienceType === 'all'}
                onChange={() => setAudienceType('all')}
              />
              <span>Everyone subscribed</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={audienceType === 'source'}
                onChange={() => setAudienceType('source')}
              />
              <span>By source</span>
            </label>
            {audienceType === 'source' && (
              <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. footer, blog_index" />
            )}
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={audienceType === 'manual'}
                onChange={() => setAudienceType('manual')}
              />
              <span>Manual list</span>
            </label>
            {audienceType === 'manual' && (
              <Textarea
                value={manualEmails}
                onChange={(e) => setManualEmails(e.target.value)}
                placeholder="one@email.com\nother@email.com"
                rows={6}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={computeRecipientCount}>
              Preview Recipients
            </Button>
            {recipients.length > 0 && (
              <span className="text-sm text-muted-foreground font-medium">
                {includedCount} {includedCount === 1 ? 'recipient' : 'recipients'}
                {excludedEmails.size > 0 && (
                  <span className="text-destructive ml-1">
                    ({excludedEmails.size} excluded)
                  </span>
                )}
              </span>
            )}
          </div>

          {recipients.length > 0 && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">Recipients List</h3>
                  <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded border">
                    {includedCount} will receive
                  </span>
                  {excludedEmails.size > 0 && (
                    <span className="text-xs text-destructive px-2 py-1 bg-destructive/10 rounded border border-destructive/20">
                      {excludedEmails.size} excluded
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={includeAll}
                  >
                    Include All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={excludeAll}
                  >
                    Exclude All
                  </Button>
                  {alreadySentEmails.size > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={excludeAlreadySent}
                      className="text-xs"
                    >
                      Exclude Already Sent ({alreadySentEmails.size})
                    </Button>
                  )}
                  {recipients.length > 10 && !showAllRecipients && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllRecipients(true)}
                    >
                      Show All
                    </Button>
                  )}
                  {showAllRecipients && recipients.length > 10 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllRecipients(false)}
                    >
                      Show Less
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {(showAllRecipients ? recipients : recipients.slice(0, 10)).map((recipient, idx) => {
                  const isExcluded = excludedEmails.has(recipient.email);
                  const wasAlreadySent = alreadySentEmails.has(recipient.email.toLowerCase());
                  
                  return (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 text-sm py-2 px-3 bg-background rounded border cursor-pointer hover:bg-accent/50 transition-colors ${
                        isExcluded ? 'opacity-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!isExcluded}
                        onChange={() => toggleRecipient(recipient.email)}
                        className="h-4 w-4"
                      />
                      <span className="font-mono text-xs flex-1">{recipient.email}</span>
                      {wasAlreadySent && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                          already sent
                        </span>
                      )}
                      {recipient.source && recipient.source !== 'manual' && (
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                          {recipient.source}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              {!showAllRecipients && recipients.length > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing 10 of {recipients.length} recipients
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="schedule-toggle"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="schedule-toggle" className="text-sm font-medium cursor-pointer">
              Schedule for later
            </label>
          </div>

          {isScheduled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Date</label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Time ({userTimezone})
                </label>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {isScheduled && scheduledDate && scheduledTime && (
            <p className="text-sm text-muted-foreground">
              Newsletter will be sent at{' '}
              <span className="font-medium">
                {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
              </span>
            </p>
          )}

          {status !== 'published' && (
            <p className="text-sm text-destructive">
              This newsletter is still a draft. Publish it first before sending.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



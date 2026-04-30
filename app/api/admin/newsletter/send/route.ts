import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Audience =
  | { type: 'all' }
  | { type: 'source'; source: string }
  | { type: 'manual'; emails: string[] };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, reason: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { ok: false as const, reason: 'Not authorized' };
  }

  return { ok: true as const, userId: user.id };
}

export async function POST(req: Request) {
  try {
    const auth = await assertAdmin();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.reason }, { status: 401 });
    }

    const body = await req.json();
    const newsletterId = String(body.newsletterId || '').trim();
    const audience = body.audience as Audience | undefined;
    const scheduledFor = body.scheduledFor ? String(body.scheduledFor).trim() : null;
    const excludedEmails = Array.isArray(body.excludedEmails) 
      ? body.excludedEmails.map((e: any) => normalizeEmail(String(e || '')))
      : [];

    if (!newsletterId) {
      return NextResponse.json({ error: 'newsletterId is required' }, { status: 400 });
    }
    if (!audience || !('type' in audience)) {
      return NextResponse.json({ error: 'audience is required' }, { status: 400 });
    }
    
    // Validate scheduledFor if provided
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json({ error: 'Invalid scheduledFor date' }, { status: 400 });
      }
      if (scheduledDate <= new Date()) {
        return NextResponse.json({ error: 'scheduledFor must be in the future' }, { status: 400 });
      }
    }

    const admin = createAdminClient();

    const { data: newsletter, error: nErr } = await admin
      .from('newsletters')
      .select('id, subject, preview_text, body_html, attachments, status')
      .eq('id', newsletterId)
      .single();

    if (nErr || !newsletter) {
      return NextResponse.json({ error: nErr?.message || 'Newsletter not found' }, { status: 404 });
    }
    if (newsletter.status !== 'published') {
      return NextResponse.json({ error: 'Newsletter must be published before sending.' }, { status: 400 });
    }

    let recipients: { subscriber_id: string | null; email: string }[] = [];

    if (audience.type === 'all') {
      let { data, error } = await admin
        .from('newsletter_subscribers')
        .select('id, email')
        .is('unsubscribed_at', null)
        .order('created_at', { ascending: true });

      // Backward-compat: if migrations haven't added `unsubscribed_at` yet, retry without the filter.
      if (error && String((error as any).message || '').includes('unsubscribed_at')) {
        ({ data, error } = await admin
          .from('newsletter_subscribers')
          .select('id, email')
          .order('created_at', { ascending: true }));
      }

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      recipients = (data || []).map((r) => ({ subscriber_id: r.id, email: r.email }));
    } else if (audience.type === 'source') {
      const source = String((audience as any).source || '').trim();
      if (!source) return NextResponse.json({ error: 'source is required for audience.type=source' }, { status: 400 });
      let { data, error } = await admin
        .from('newsletter_subscribers')
        .select('id, email')
        .is('unsubscribed_at', null)
        .eq('source', source)
        .order('created_at', { ascending: true });

      if (error && String((error as any).message || '').includes('unsubscribed_at')) {
        ({ data, error } = await admin
          .from('newsletter_subscribers')
          .select('id, email')
          .eq('source', source)
          .order('created_at', { ascending: true }));
      }

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      recipients = (data || []).map((r) => ({ subscriber_id: r.id, email: r.email }));
    } else if (audience.type === 'manual') {
      const rawEmails: unknown[] = Array.isArray((audience as any).emails) ? (audience as any).emails : [];
      const cleaned = uniq(
        rawEmails
          .map((e) => (typeof e === 'string' ? e : String(e ?? '')))
          .map(normalizeEmail)
      ).filter((e) => e && isValidEmail(e));
      recipients = cleaned.map((email) => ({ subscriber_id: null, email }));
    } else {
      return NextResponse.json({ error: 'Unsupported audience type' }, { status: 400 });
    }

    // Dedupe by email
    const byEmail = new Map<string, { subscriber_id: string | null; email: string }>();
    for (const r of recipients) {
      const e = normalizeEmail(r.email);
      if (!e || !isValidEmail(e)) continue;
      if (!byEmail.has(e)) byEmail.set(e, { subscriber_id: r.subscriber_id, email: e });
    }
    recipients = Array.from(byEmail.values());

    // Filter out excluded emails
    const excludedSet = new Set(excludedEmails.filter((e: string) => e));
    if (excludedSet.size > 0) {
      recipients = recipients.filter(r => !excludedSet.has(normalizeEmail(r.email)));
    }

    // If scheduled, create with 'scheduled' status and don't send yet
    const isScheduled = !!scheduledFor;
    
    // Store audience with excluded emails for reference
    const audienceWithExclusions = excludedSet.size > 0 
      ? { ...audience, excludedEmails: Array.from(excludedSet) }
      : audience;
    
    const insertData: any = {
      newsletter_id: newsletterId,
      audience: audienceWithExclusions,
      status: isScheduled ? 'scheduled' : 'sending',
      sent_by: auth.userId,
      total_recipients: recipients.length,
    };
    
    if (isScheduled) {
      insertData.scheduled_for = scheduledFor;
    } else {
      insertData.started_at = new Date().toISOString();
    }

    const { data: sendRow, error: sendErr } = await admin
      .from('newsletter_sends')
      .insert(insertData)
      .select('id')
      .single();

    if (sendErr || !sendRow) {
      return NextResponse.json({ error: sendErr?.message || 'Failed to create send' }, { status: 500 });
    }

    const sendId = sendRow.id as string;

    // If scheduled, just return the sendId without triggering the Edge Function
    if (isScheduled) {
      return NextResponse.json({
        sendId,
        total: recipients.length,
        scheduled: true,
        scheduledFor,
      });
    }

    // For immediate sends, trigger the Edge Function
    const { data: settings, error: settingsErr } = await admin
      .from('app_settings')
      .select('key, value')
      .in('key', ['SUPABASE_FUNCTIONS_BASE_URL', 'NEWSLETTER_WEBHOOK_SECRET']);

    if (settingsErr) {
      console.warn('[Newsletter send] Failed to load app_settings:', settingsErr);
    }

    const settingsMap = new Map<string, string>(
      (settings || []).map((r: any) => [String(r.key), String(r.value)])
    );
    const baseUrl = settingsMap.get('SUPABASE_FUNCTIONS_BASE_URL') || '';
    const secret = settingsMap.get('NEWSLETTER_WEBHOOK_SECRET') || '';

    if (baseUrl) {
      const targetUrl = baseUrl.replace(/\/$/, '') + '/send-newsletter';
      const fnRes = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-newsletter-secret': secret,
        },
        body: JSON.stringify({ send_id: sendId }),
      });

      if (!fnRes.ok) {
        const errText = await fnRes.text().catch(() => '');
        console.error('[Newsletter send] Edge Function failed:', fnRes.status, errText);

        await admin
          .from('newsletter_sends')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', sendId);

        return NextResponse.json(
          { error: `Edge Function send-newsletter failed (${fnRes.status}): ${errText || 'Unknown error'}` },
          { status: 500 }
        );
      }
    } else {
      console.warn('[Newsletter send] SUPABASE_FUNCTIONS_BASE_URL not set; relying on DB trigger only.');
    }

    return NextResponse.json({ sendId, total: recipients.length });
  } catch (e: any) {
    console.error('[Newsletter send] Error:', e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}



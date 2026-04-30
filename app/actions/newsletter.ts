'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';

const RATE_LIMIT_CONFIG = {
  FREE_ATTEMPTS: 3, // allow a few quick retries (typos, etc.)
  COOLDOWN_SECONDS: 5 * 60, // after free attempts, enforce a cooldown
  MAX_DAILY_ATTEMPTS: 30, // hard cap per IP per 24h
};

export interface NewsletterSubscribeInput {
  email: string;
  source?: string;
}

interface RateLimitResult {
  allowed: boolean;
  error?: string;
  waitTime?: number; // seconds
}

async function getClientIP(): Promise<string> {
  const headersList = await headers();

  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-client-ip',
    'x-cluster-client-ip',
  ];

  for (const header of ipHeaders) {
    const value = headersList.get(header);
    if (value) return value.split(',')[0].trim();
  }

  return 'unknown';
}

async function checkRateLimit(ipAddress: string): Promise<RateLimitResult> {
  const supabase = createAdminClient();
  const now = new Date();

  const { data: rl } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip_address', ipAddress)
    .eq('action_type', 'newsletter_subscribe')
    .single();

  if (!rl) {
    // First attempt - allow
    return { allowed: true };
  }

  const firstAttempt = new Date(rl.first_attempt_at);
  const lastAttempt = new Date(rl.last_attempt_at);
  const hoursSinceFirstAttempt = (now.getTime() - firstAttempt.getTime()) / (1000 * 60 * 60);
  const secondsSinceLastAttempt = (now.getTime() - lastAttempt.getTime()) / 1000;

  // Reset window after 24 hours
  if (hoursSinceFirstAttempt >= 24) {
    return { allowed: true };
  }

  // Daily cap (attempt_count is within the 24h window due to reset logic in updateRateLimit)
  if (rl.attempt_count >= RATE_LIMIT_CONFIG.MAX_DAILY_ATTEMPTS) {
    return {
      allowed: false,
      error: `Too many subscription attempts from your network today. Please try again tomorrow.`,
      waitTime: 3600,
    };
  }

  // Allow first few attempts without cooldown
  if (rl.attempt_count < RATE_LIMIT_CONFIG.FREE_ATTEMPTS) {
    return { allowed: true };
  }

  // After free attempts, enforce cooldown
  if (secondsSinceLastAttempt < RATE_LIMIT_CONFIG.COOLDOWN_SECONDS) {
    const waitTime = Math.ceil(RATE_LIMIT_CONFIG.COOLDOWN_SECONDS - secondsSinceLastAttempt);
    return {
      allowed: false,
      error: `Please wait ${waitTime}s before trying again.`,
      waitTime,
    };
  }

  return { allowed: true };
}

async function updateRateLimit(ipAddress: string): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date();

  const { data: existing, error: fetchError } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip_address', ipAddress)
    .eq('action_type', 'newsletter_subscribe')
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('[Newsletter Rate Limit] Error fetching rate limit:', fetchError);
  }

  if (!existing) {
    const { error: insertError } = await supabase.from('rate_limits').insert({
      ip_address: ipAddress,
      action_type: 'newsletter_subscribe',
      attempt_count: 1,
      first_attempt_at: now.toISOString(),
      last_attempt_at: now.toISOString(),
    });

    if (insertError) {
      console.error('[Newsletter Rate Limit] Error creating rate limit record:', insertError);
      throw new Error(`Failed to create rate limit: ${insertError.message}`);
    }

    return;
  }

  const firstAttempt = new Date(existing.first_attempt_at);
  const hoursSinceFirstAttempt = (now.getTime() - firstAttempt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceFirstAttempt >= 24) {
    await supabase
      .from('rate_limits')
      .update({
        attempt_count: 1,
        first_attempt_at: now.toISOString(),
        last_attempt_at: now.toISOString(),
      })
      .eq('ip_address', ipAddress)
      .eq('action_type', 'newsletter_subscribe');
  } else {
    await supabase
      .from('rate_limits')
      .update({
        attempt_count: existing.attempt_count + 1,
        last_attempt_at: now.toISOString(),
      })
      .eq('ip_address', ipAddress)
      .eq('action_type', 'newsletter_subscribe');
  }
}

export async function subscribeToNewsletter(input: NewsletterSubscribeInput) {
  try {
    const email = (input.email || '').trim().toLowerCase();
    const source = (input.source || '').trim().slice(0, 64) || null;

    if (!email) {
      return { success: false, error: 'Email is required.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const ipAddress = await getClientIP();

    const rateLimitCheck = await checkRateLimit(ipAddress);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: rateLimitCheck.error,
        rateLimited: true,
        waitTime: rateLimitCheck.waitTime,
      };
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from('newsletter_subscribers').insert({
      email,
      ip_address: ipAddress,
      source,
    });

    // Unique violation -> treat as success (already subscribed)
    if (error) {
      if (error.code === '23505') {
        // If they were previously unsubscribed, treat this as a resubscribe.
        // (Requires `unsubscribed_at` column from migrations; safe to attempt.)
        let updated: any = null;
        try {
          const { data: u, error: updateErr } = await supabase
            .from('newsletter_subscribers')
            .update({
              unsubscribed_at: null,
              ip_address: ipAddress,
              source,
            })
            .eq('email', email)
            .select('id')
            .single();
          if (!updateErr) updated = u;
        } catch {
          // Backward-compat: if columns don't exist yet, ignore and treat as already subscribed.
        }

        if (updated) {
          try {
            await updateRateLimit(ipAddress);
          } catch (rateLimitError: any) {
            console.error('Newsletter rate limit update failed:', rateLimitError);
          }

          return { success: true, message: `You're subscribed.` };
        }

        try {
          await updateRateLimit(ipAddress);
        } catch (rateLimitError: any) {
          console.error('Newsletter rate limit update failed:', rateLimitError);
        }

        return { success: true, message: `You're already subscribed.` };
      }

      console.error('Error inserting newsletter subscriber:', error);
      return { success: false, error: 'Failed to subscribe. Please try again.' };
    }

    try {
      await updateRateLimit(ipAddress);
    } catch (rateLimitError: any) {
      console.error('Newsletter rate limit update failed:', rateLimitError);
    }

    return { success: true, message: 'Subscribed! You’ll hear from me soon.' };
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function unsubscribeFromNewsletter(input: { token: string }) {
  try {
    const token = (input.token || '').trim();
    if (!token) {
      return { success: false, error: 'Missing unsubscribe token.' };
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('unsubscribe_token', token)
      .is('unsubscribed_at', null)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('Unsubscribe error:', error);
      return { success: false, error: 'Failed to unsubscribe. Please try again.' };
    }

    if (!data) {
      return { success: true, message: 'You are already unsubscribed (or the link is invalid).' };
    }

    return { success: true, message: 'Unsubscribed. You will no longer receive emails.' };
  } catch (e: any) {
    console.error('Unsubscribe error:', e);
    return { success: false, error: String(e?.message || e) };
  }
}



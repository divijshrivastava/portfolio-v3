'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  FREE_MESSAGES: 3, // First 3 messages are free (no cooldown)
  COOLDOWN_MINUTES: 5, // 5 minutes between submissions after free messages
  MAX_DAILY_MESSAGES: 15, // Max 15 messages per day
};

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface RateLimitResult {
  allowed: boolean;
  error?: string;
  waitTime?: number; // in seconds
}

async function checkRateLimit(ipAddress: string): Promise<RateLimitResult> {
  const supabase = createAdminClient();
  const now = new Date();

  // Check daily limit first (last 24 hours)
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());

  if (count && count >= RATE_LIMIT_CONFIG.MAX_DAILY_MESSAGES) {
    return {
      allowed: false,
      error: `You've reached the maximum of ${RATE_LIMIT_CONFIG.MAX_DAILY_MESSAGES} messages in 24 hours. Please try again tomorrow.`,
      waitTime: 3600,
    };
  }

  // Get rate limit record for this IP
  const { data: rateLimit } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip_address', ipAddress)
    .eq('action_type', 'contact_form')
    .single();

  if (!rateLimit) {
    // First submission - allow
    return { allowed: true };
  }

  const firstAttempt = new Date(rateLimit.first_attempt_at);
  const lastAttempt = new Date(rateLimit.last_attempt_at);
  const hoursSinceFirstAttempt = (now.getTime() - firstAttempt.getTime()) / (1000 * 60 * 60);
  const minutesSinceLastAttempt = (now.getTime() - lastAttempt.getTime()) / (1000 * 60);

  // Reset counter if more than 24 hours have passed
  if (hoursSinceFirstAttempt >= 24) {
    return { allowed: true };
  }

  // First 3 messages are free (no cooldown)
  if (rateLimit.attempt_count < RATE_LIMIT_CONFIG.FREE_MESSAGES) {
    return { allowed: true };
  }

  // After 3 messages, enforce 5-minute cooldown
  if (minutesSinceLastAttempt < RATE_LIMIT_CONFIG.COOLDOWN_MINUTES) {
    const waitTime = Math.ceil((RATE_LIMIT_CONFIG.COOLDOWN_MINUTES - minutesSinceLastAttempt) * 60);
    return {
      allowed: false,
      error: `Please wait ${Math.ceil(RATE_LIMIT_CONFIG.COOLDOWN_MINUTES - minutesSinceLastAttempt)} minutes before submitting again.`,
      waitTime,
    };
  }

  return { allowed: true };
}

async function updateRateLimit(ipAddress: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip_address', ipAddress)
    .eq('action_type', 'contact_form')
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is OK for first submission
    console.error('[Rate Limit] Error fetching rate limit:', fetchError);
  }

  const now = new Date();

  if (!existing) {
    // Create new rate limit record
    const { error: insertError } = await supabase.from('rate_limits').insert({
      ip_address: ipAddress,
      action_type: 'contact_form',
      attempt_count: 1,
      first_attempt_at: now.toISOString(),
      last_attempt_at: now.toISOString(),
    });

    if (insertError) {
      console.error('[Rate Limit] Error creating rate limit record:', insertError);
      throw new Error(`Failed to create rate limit: ${insertError.message}`);
    }
  } else {
    const firstAttempt = new Date(existing.first_attempt_at);
    const hoursSinceFirstAttempt = (now.getTime() - firstAttempt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceFirstAttempt >= 24) {
      // Reset counter after 24 hours
      await supabase
        .from('rate_limits')
        .update({
          attempt_count: 1,
          first_attempt_at: now.toISOString(),
          last_attempt_at: now.toISOString(),
        })
        .eq('ip_address', ipAddress)
        .eq('action_type', 'contact_form');
    } else {
      // Increment counter
      await supabase
        .from('rate_limits')
        .update({
          attempt_count: existing.attempt_count + 1,
          last_attempt_at: now.toISOString(),
        })
        .eq('ip_address', ipAddress)
        .eq('action_type', 'contact_form');
    }
  }
}

async function getClientIP(): Promise<string> {
  const headersList = await headers();

  // Try multiple headers for IP address (in order of preference)
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
    'x-cluster-client-ip',
  ];

  for (const header of ipHeaders) {
    const value = headersList.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim();
    }
  }

  return 'unknown';
}

export async function submitContactForm(formData: ContactFormData) {
  try {
    const ipAddress = await getClientIP();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      return {
        success: false,
        error: 'All fields are required.',
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return {
        success: false,
        error: 'Please enter a valid email address.',
      };
    }

    // Message length validation
    if (formData.message.length < 10) {
      return {
        success: false,
        error: 'Message must be at least 10 characters long.',
      };
    }

    if (formData.message.length > 2000) {
      return {
        success: false,
        error: 'Message must be less than 2000 characters.',
      };
    }

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(ipAddress);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: rateLimitCheck.error,
        rateLimited: true,
        waitTime: rateLimitCheck.waitTime,
      };
    }

    // Insert message
    const supabase = await createClient();
    const { error } = await supabase.from('messages').insert({
      name: formData.name,
      email: formData.email,
      message: formData.message,
      ip_address: ipAddress,
    });

    if (error) {
      console.error('Error inserting message:', error);
      return {
        success: false,
        error: 'Failed to send message. Please try again.',
      };
    }

    // Update rate limit
    try {
      await updateRateLimit(ipAddress);
    } catch (rateLimitError: any) {
      // Log the error but don't fail the submission
      // Message was already saved successfully
      console.error('Rate limit update failed:', rateLimitError);
    }

    return {
      success: true,
      message: 'Message sent successfully!',
    };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

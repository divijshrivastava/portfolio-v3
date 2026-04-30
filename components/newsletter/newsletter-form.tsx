'use client';

import { useState } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterForm({ source = 'footer' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const result = await subscribeToNewsletter({ email, source });

      if (result.success) {
        setSuccessMessage(result.message ?? 'Subscribed!');
        setEmail('');
      } else {
        setError(result.error ?? 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      console.error('Newsletter subscribe error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
          required
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </form>

      {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}



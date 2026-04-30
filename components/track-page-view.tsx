'use client';

import { useEffect } from 'react';

interface TrackPageViewProps {
  type: 'blog' | 'project';
  id: string;
}

/**
 * Client Component: Track Page View
 *
 * Tracks page visits by calling the track-view API when the component mounts.
 * Only tracks once per page load to avoid duplicate counts.
 */
export function TrackPageView({ type, id }: TrackPageViewProps) {
  useEffect(() => {
    if (!type || !id) {
      return;
    }

    const trackView = async () => {
      try {
        const response = await fetch('/api/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type, id }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to track page view:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            type,
            id,
          });
        }
      } catch (error) {
        console.error('Failed to track page view (network error):', {
          error,
          type,
          id,
        });
      }
    };

    trackView();
  }, [type, id]);

  return null;
}

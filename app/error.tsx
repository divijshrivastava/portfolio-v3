'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-destructive">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">
          {error.message || 'A server-side exception has occurred.'}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4 justify-center pt-2">
          <button
            onClick={reset}
            className="text-sm font-medium text-brand hover:underline underline-offset-4"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-sm font-medium text-brand hover:underline underline-offset-4"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

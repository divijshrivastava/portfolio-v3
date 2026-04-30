'use client';

import { useState } from 'react';
import { ExternalLink, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectPreviewProps {
  url: string;
  title: string;
  canEmbed: boolean;
}

export function ProjectPreview({ url, title, canEmbed }: ProjectPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!canEmbed) {
    return (
      <div className="rounded-lg border bg-card flex flex-col items-center justify-center py-16 px-4 gap-4">
        <Globe className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm">
          This site does not support inline preview.
        </p>
        <Button asChild size="lg">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-5 w-5" />
            View Live Project
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <span className="text-sm text-muted-foreground truncate ml-2">{url}</span>
        </div>
        <Button asChild size="sm" variant="ghost" className="shrink-0 ml-2">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Open in New Tab</span>
          </a>
        </Button>
      </div>

      <div className="relative w-full" style={{ height: '70vh' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <iframe
          src={url}
          title={`Preview of ${title}`}
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}

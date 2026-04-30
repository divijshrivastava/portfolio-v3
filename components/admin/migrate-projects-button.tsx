'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function MigrateProjectsButton({ count }: { count: number }) {
  const [isMigrating, setIsMigrating] = useState(false);
  const router = useRouter();

  const handleMigrate = async () => {
    if (!confirm(`Add slugs to ${count} project(s)? This will auto-generate URL-friendly slugs based on project titles.`)) {
      return;
    }

    setIsMigrating(true);

    try {
      const response = await fetch('/api/migrate/projects', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.error || 'Migration failed'}`);
        setIsMigrating(false);
        return;
      }

      alert(`Success! ${data.updated} project(s) migrated.`);
      router.refresh();
    } catch (error) {
      console.error('Migration error:', error);
      alert('Failed to migrate projects');
      setIsMigrating(false);
    }
  };

  return (
    <Button
      onClick={handleMigrate}
      disabled={isMigrating}
      variant="outline"
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isMigrating ? 'animate-spin' : ''}`} />
      {isMigrating ? 'Migrating...' : `Add Slugs (${count})`}
    </Button>
  );
}

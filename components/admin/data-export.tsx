'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Database } from 'lucide-react';

interface DataTable {
  id: string;
  label: string;
  description: string;
}

const availableTables: DataTable[] = [
  { id: 'blogs', label: 'Blogs', description: 'All blog posts (drafts & published)' },
  { id: 'projects', label: 'Projects', description: 'All projects (drafts & published)' },
  { id: 'newsletters', label: 'Newsletters', description: 'All newsletters (drafts & published)' },
  { id: 'newsletter_subscribers', label: 'Newsletter Subscribers', description: 'All email subscribers' },
  { id: 'newsletter_sends', label: 'Newsletter Sends', description: 'Newsletter send history' },
  { id: 'newsletter_deliveries', label: 'Newsletter Deliveries', description: 'Individual delivery logs' },
  { id: 'messages', label: 'Contact Messages', description: 'All contact form submissions' },
  { id: 'user_activity', label: 'User Activity', description: 'Page visit logs' },
  { id: 'profiles', label: 'User Profiles', description: 'All user profiles' },
];

export function DataExport() {
  const [selectedTables, setSelectedTables] = useState<string[]>(
    availableTables.map((t) => t.id) // All selected by default
  );
  const [isExporting, setIsExporting] = useState(false);

  const toggleTable = (tableId: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId]
    );
  };

  const selectAll = () => {
    setSelectedTables(availableTables.map((t) => t.id));
  };

  const deselectAll = () => {
    setSelectedTables([]);
  };

  const handleExport = async () => {
    if (selectedTables.length === 0) {
      alert('Please select at least one table to export.');
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables: selectedTables }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        alert(error.error || 'Failed to export data');
        setIsExporting(false);
        return;
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Export & Backup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Select the data you want to export. All tables are selected by default.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableTables.map((table) => (
            <label
              key={table.id}
              className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedTables.includes(table.id)}
                onChange={() => toggleTable(table.id)}
                className="mt-1 h-4 w-4"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{table.label}</div>
                <div className="text-xs text-muted-foreground">{table.description}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedTables.length} {selectedTables.length === 1 ? 'table' : 'tables'} selected
          </div>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedTables.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Download Backup'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          💡 Exports are in JSON format. Store them securely as they may contain sensitive data.
        </p>
      </CardContent>
    </Card>
  );
}


'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Database, Upload } from 'lucide-react';
import Link from 'next/link';

export default function MigrateProjectsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [jsonData, setJsonData] = useState('');
  const [method, setMethod] = useState<'mysql' | 'json'>('json');

  const handleMigrateFromMySQL = async () => {
    if (!confirm('Are you sure you want to migrate projects from MySQL to Supabase? This will copy all projects that don\'t already exist.')) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/migrate/projects-from-mysql', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        error: 'Failed to migrate',
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigrateFromJSON = async () => {
    if (!jsonData.trim()) {
      alert('Please paste your projects JSON data');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const projects = JSON.parse(jsonData);

      const response = await fetch('/api/migrate/projects-from-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        error: 'Failed to migrate',
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" asChild>
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h2 className="text-3xl font-bold">Migrate Projects from MySQL</h2>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Choose Migration Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant={method === 'json' ? 'default' : 'outline'}
                onClick={() => setMethod('json')}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import from JSON
              </Button>
              <Button
                variant={method === 'mysql' ? 'default' : 'outline'}
                onClick={() => setMethod('mysql')}
              >
                <Database className="mr-2 h-4 w-4" />
                Direct MySQL Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {method === 'json' ? (
          <Card>
            <CardHeader>
              <CardTitle>Import from JSON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  1. Run the export script on a machine with MySQL access:
                  <code className="block bg-muted p-2 rounded mt-2">
                    node scripts/export-mysql-projects.js
                  </code>
                </p>
                <p className="text-sm text-muted-foreground">
                  2. Paste the exported JSON data below:
                </p>
              </div>

              <Textarea
                placeholder="Paste exported projects JSON here..."
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                rows={10}
                className="font-mono text-xs"
              />

              <Button
                onClick={handleMigrateFromJSON}
                disabled={isLoading || !jsonData.trim()}
                size="lg"
              >
                <Upload className="mr-2 h-5 w-5" />
                {isLoading ? 'Importing...' : 'Import Projects'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Direct MySQL Migration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This will directly connect to your MySQL database and migrate all projects.
                Projects that already exist (based on title) will be skipped.
              </p>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Note: This requires network access to the MySQL server. If you're running locally,
                  the connection may be blocked. Use the JSON import method instead.
                </p>
              </div>

              <Button
                onClick={handleMigrateFromMySQL}
                disabled={isLoading}
                size="lg"
              >
                <Database className="mr-2 h-5 w-5" />
                {isLoading ? 'Migrating...' : 'Start Migration'}
              </Button>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className={result.error ? 'border-destructive' : 'border-primary'}>
            <CardHeader>
              <CardTitle>{result.error ? 'Migration Failed' : 'Migration Results'}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

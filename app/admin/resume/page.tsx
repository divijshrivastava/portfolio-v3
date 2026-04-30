'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, Download, Trash2 } from 'lucide-react';
import { TableSkeleton } from '@/components/admin/loading-skeleton';

interface Resume {
  id: string;
  file_name: string;
  file_url: string;
  is_current: boolean;
  created_at: string;
}

export default function AdminResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('resume')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading resumes:', error);
      alert('Failed to load resumes');
    } else {
      setResumes(data || []);
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'resume-files');

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Upload error:', error);
        alert(error.error || 'Failed to upload resume');
        setIsUploading(false);
        return;
      }

      const { url } = await response.json();

      // Save to database
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from('resume')
        .insert({
          file_name: file.name,
          file_url: url,
          is_current: resumes.length === 0, // Set as current if first resume
        });

      if (dbError) {
        console.error('Database error:', dbError);
        alert('Failed to save resume to database');
        setIsUploading(false);
        return;
      }

      alert('Resume uploaded successfully!');
      loadResumes();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetCurrent = async (id: string) => {
    const supabase = createClient();

    // First, set all resumes to not current
    await supabase
      .from('resume')
      .update({ is_current: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Then set the selected one as current
    const { error } = await supabase
      .from('resume')
      .update({ is_current: true })
      .eq('id', id);

    if (error) {
      console.error('Error setting current resume:', error);
      alert('Failed to set current resume');
    } else {
      alert('Resume set as current!');
      loadResumes();
    }
  };

  const handleDelete = async (id: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('resume')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume');
    } else {
      alert('Resume deleted successfully!');
      loadResumes();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-9 w-64 bg-muted animate-pulse rounded" />
        <TableSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Resume Management</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage your resume files
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload New Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {isUploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
            </div>
            <p className="text-sm text-muted-foreground">
              Upload a PDF file of your resume. The first resume uploaded will be set as current automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Uploaded Resumes</h3>

        {resumes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No resumes uploaded yet. Upload your first resume above.</p>
            </CardContent>
          </Card>
        ) : (
          resumes.map((resume) => (
            <Card key={resume.id} className={resume.is_current ? 'border-primary' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="h-10 w-10 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{resume.file_name}</h3>
                        {resume.is_current && (
                          <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Uploaded: {new Date(resume.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={resume.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>

                    {!resume.is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetCurrent(resume.id)}
                      >
                        Set as Current
                      </Button>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(resume.id, resume.file_name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

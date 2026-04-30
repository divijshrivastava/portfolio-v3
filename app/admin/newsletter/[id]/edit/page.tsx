'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TiptapEditor } from '@/components/admin/tiptap-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Save, Send, UploadCloud, Trash2 } from 'lucide-react';

type Attachment =
  | { type: 'blog'; id: string; title: string; slug: string }
  | { type: 'project'; id: string; title: string; slug: string }
  | { type: 'link'; title: string; url: string };

interface BlogOption {
  id: string;
  title: string;
  slug: string;
}

interface ProjectOption {
  id: string;
  title: string;
  slug: string;
}

export default function EditNewsletterPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const newsletterId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isPublic, setIsPublic] = useState(false);

  const [blogs, setBlogs] = useState<BlogOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [customLinkTitle, setCustomLinkTitle] = useState('');
  const [customLinkUrl, setCustomLinkUrl] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('newsletters')
        .select('id, subject, preview_text, body_html, attachments, status, is_public')
        .eq('id', newsletterId)
        .single();

      if (error) {
        console.error('Failed to load newsletter:', error);
        alert(`Failed to load newsletter: ${error.message}`);
        router.push('/admin/newsletter');
        return;
      }

      setSubject(data.subject ?? '');
      setPreviewText(data.preview_text ?? '');
      setBodyHtml(data.body_html ?? '');
      setAttachments((data.attachments as any) || []);
      setStatus(data.status);
      setIsPublic(data.is_public ?? false);
      setIsLoading(false);
    };

    load();
  }, [newsletterId, router, supabase]);

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Reuse existing storage bucket used by blog editor uploads.
      formData.append('bucket', 'blog-images');

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('Upload error:', error);
        alert((error as any).error || 'Failed to upload image');
        return '';
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      return '';
    }
  };

  useEffect(() => {
    const loadOptions = async () => {
      const [{ data: blogsData }, { data: projectsData }] = await Promise.all([
        supabase.from('blogs').select('id, title, slug').eq('status', 'published').order('created_at', { ascending: false }).limit(200),
        supabase.from('projects').select('id, title, slug').eq('status', 'published').order('created_at', { ascending: false }).limit(200),
      ]);

      setBlogs((blogsData as any) || []);
      setProjects((projectsData as any) || []);
    };
    loadOptions();
  }, [supabase]);

  const handleSave = async () => {
    if (!subject.trim() || !bodyHtml.trim()) {
      alert('Subject and body are required.');
      return;
    }
    setIsSaving(true);
    const { error } = await supabase
      .from('newsletters')
      .update({
        subject: subject.trim(),
        preview_text: previewText.trim() || null,
        body_html: bodyHtml,
        attachments,
        is_public: isPublic,
      })
      .eq('id', newsletterId);
    setIsSaving(false);

    if (error) {
      console.error('Failed to save newsletter:', error);
      alert(`Failed to save newsletter: ${error.message}`);
      return;
    }
  };

  const handlePublish = async () => {
    if (!confirm('Publish this newsletter? You can still edit later, but sending is typically done after publishing.')) {
      return;
    }
    setIsPublishing(true);
    const { error } = await supabase
      .from('newsletters')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', newsletterId);
    setIsPublishing(false);

    if (error) {
      console.error('Failed to publish newsletter:', error);
      alert(`Failed to publish newsletter: ${error.message}`);
      return;
    }

    setStatus('published');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this newsletter? This will also delete all send history and deliveries. This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    const { error } = await supabase
      .from('newsletters')
      .delete()
      .eq('id', newsletterId);
    
    setIsDeleting(false);

    if (error) {
      console.error('Failed to delete newsletter:', error);
      alert(`Failed to delete newsletter: ${error.message}`);
      return;
    }

    router.push('/admin/newsletter/list');
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const addBlogAttachment = () => {
    const b = blogs.find((x) => x.id === selectedBlogId);
    if (!b) return;
    setAttachments((prev) => [...prev, { type: 'blog', id: b.id, title: b.title, slug: b.slug }]);
    setSelectedBlogId('');
  };

  const addProjectAttachment = () => {
    const p = projects.find((x) => x.id === selectedProjectId);
    if (!p) return;
    setAttachments((prev) => [...prev, { type: 'project', id: p.id, title: p.title, slug: p.slug }]);
    setSelectedProjectId('');
  };

  const addCustomLink = () => {
    const title = customLinkTitle.trim();
    const url = customLinkUrl.trim();
    if (!title || !url) return;
    setAttachments((prev) => [...prev, { type: 'link', title, url }]);
    setCustomLinkTitle('');
    setCustomLinkUrl('');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <div className="h-5 w-96 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/newsletter/list">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Edit Newsletter</h1>
            <p className="text-muted-foreground mt-2">Status: {status}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" onClick={handlePublish} disabled={status === 'published' || isPublishing}>
            <UploadCloud className="h-4 w-4 mr-2" />
            {status === 'published' ? 'Published' : isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
          <Link href={`/admin/newsletter/${newsletterId}/send`}>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" />
          </div>
          <div>
            <label className="text-sm font-medium">Preview text (optional)</label>
            <Textarea
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Short preview snippet..."
              rows={3}
            />
          </div>
          <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
            <input
              type="checkbox"
              id="is-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <div className="flex-1">
              <label htmlFor="is-public" className="text-sm font-medium cursor-pointer block">
                Show in public archive
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                When enabled, this newsletter will appear on <a href="/newsletters" target="_blank" className="underline">/newsletters</a> for anyone to read. Only published newsletters can be made public.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <TiptapEditor
            content={bodyHtml}
            onChange={setBodyHtml}
            onImageUpload={handleImageUpload}
            placeholder="Start writing your newsletter..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Attach a published blog</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  className="flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedBlogId}
                  onChange={(e) => setSelectedBlogId(e.target.value)}
                >
                  <option value="">Select blog...</option>
                  {blogs.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="outline" className="shrink-0" onClick={addBlogAttachment} disabled={!selectedBlogId}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Attach a published project</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  className="flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="outline" className="shrink-0" onClick={addProjectAttachment} disabled={!selectedProjectId}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Attach a custom link</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input value={customLinkTitle} onChange={(e) => setCustomLinkTitle(e.target.value)} placeholder="Title" />
              <Input value={customLinkUrl} onChange={(e) => setCustomLinkUrl(e.target.value)} placeholder="https://..." />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomLink}
                disabled={!customLinkTitle.trim() || !customLinkUrl.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add link
              </Button>
            </div>
          </div>

          {attachments.length > 0 && (
            <ul className="space-y-2">
              {attachments.map((a, idx) => (
                <li key={idx} className="flex items-center justify-between gap-3 border rounded-lg p-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground mr-2">{a.type}</span>
                    {'title' in a ? a.title : '—'}
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(idx)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



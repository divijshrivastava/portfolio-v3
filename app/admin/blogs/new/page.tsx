'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TiptapEditor } from '@/components/admin/tiptap-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function NewBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugError, setSlugError] = useState('');

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
      setSlugError('');
    }
  };

  const checkSlugAvailability = async (slugToCheck: string): Promise<boolean> => {
    if (!slugToCheck) return false;
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from('blogs')
      .select('id')
      .eq('slug', slugToCheck)
      .single();

    // If no data found, slug is available
    return !data && error?.code === 'PGRST116';
  };

  const handleSlugChange = async (value: string) => {
    const newSlug = generateSlug(value);
    setSlug(newSlug);
    setSlugError('');

    if (newSlug) {
      const isAvailable = await checkSlugAvailability(newSlug);
      if (!isAvailable) {
        setSlugError('This slug is already in use. Please choose a different one.');
      }
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'blog-images');

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Upload error:', error);
        alert(error.error || 'Failed to upload image');
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

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleImageUpload(file);
      setCoverImage(url);
    }
  };

  const calculateReadTime = (html: string): number => {
    const text = html.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  const handleSubmit = async (newStatus: 'draft' | 'published') => {
    if (!title || !slug || !content) {
      alert('Please fill in required fields (Title, Slug, and Content)');
      return;
    }

    if (slugError) {
      alert('Please fix the slug error before submitting.');
      return;
    }

    // Double-check slug availability before submitting
    const isAvailable = await checkSlugAvailability(slug);
    if (!isAvailable) {
      setSlugError('This slug is already in use. Please choose a different one.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/blogs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          summary,
          content,
          cover_image_url: coverImage,
          thumbnail_url: coverImage,
          status: newStatus,
          read_time: calculateReadTime(content),
          published_at: newStatus === 'published' ? new Date().toISOString() : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error creating blog:', result);
        console.error('Full response:', { status: response.status, result });

        const errorMessage = result.error || result.details || 'Unknown error';

        // Handle duplicate slug error specifically
        if (errorMessage.includes('slug')) {
          setSlugError('This slug is already in use. Please choose a different one.');
          alert('A blog post with this slug already exists. Please change the slug and try again.');
        } else {
          alert(`Error creating blog post: ${errorMessage}`);
        }

        setIsSubmitting(false);
        return;
      }

      router.push('/admin/blogs');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating blog:', error);
      alert(`Error creating blog post: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" asChild>
          <Link href="/admin/blogs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Link>
        </Button>
        <h2 className="text-3xl font-bold">Create New Blog Post</h2>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Blog Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Enter blog title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug (URL)
              </label>
              <Input
                id="slug"
                placeholder="blog-post-url"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                required
                className={slugError ? 'border-destructive' : ''}
              />
              {slugError && (
                <p className="text-xs text-destructive">{slugError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Preview: /blog/{slug || 'your-slug-here'}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="summary" className="text-sm font-medium">
                Summary
              </label>
              <Textarea
                id="summary"
                placeholder="Brief description of your blog post"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="coverImage" className="text-sm font-medium">
                Cover Image
              </label>
              <Input
                id="coverImage"
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
              />
              {coverImage && (
                <div className="mt-2">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="max-w-md rounded-lg border"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <TiptapEditor
              content={content}
              onChange={setContent}
              onImageUpload={handleImageUpload}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting || !title || !slug || !content}
          >
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting || !title || !slug || !content}
          >
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}

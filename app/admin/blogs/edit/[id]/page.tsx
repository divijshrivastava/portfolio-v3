'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TiptapEditor } from '@/components/admin/tiptap-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditBlogPage({ params }: any) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    Promise.resolve(params).then(resolvedParams => {
      setId(resolvedParams.id);
      loadBlog(resolvedParams.id);
    });
  }, []);

  const loadBlog = async (blogId: string) => {
    const supabase = createClient();
    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', blogId)
      .single();

    if (error || !blog) {
      alert('Blog not found');
      router.push('/admin/blogs');
      return;
    }

    setTitle(blog.title);
    setSlug(blog.slug);
    setSummary(blog.summary || '');
    setContent(blog.content);
    setCoverImage(blog.cover_image_url || '');
    setStatus(blog.status);
    setSlugError('');
    setIsLoading(false);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const checkSlugAvailability = async (slugToCheck: string): Promise<boolean> => {
    if (!slugToCheck || !id) return false;
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from('blogs')
      .select('id')
      .eq('slug', slugToCheck)
      .neq('id', id) // Exclude current blog post
      .single();

    // If no data found, slug is available
    return !data && error?.code === 'PGRST116';
  };

  const handleSlugChange = async (value: string) => {
    const newSlug = generateSlug(value);
    setSlug(newSlug);
    setSlugError('');

    if (newSlug && id) {
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
    if (!id) return;

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
      const updateData: any = {
        title,
        slug,
        summary,
        content,
        cover_image_url: coverImage,
        thumbnail_url: coverImage,
        status: newStatus,
        read_time: calculateReadTime(content),
      };

      if (newStatus === 'published' && status === 'draft') {
        updateData.published_at = new Date().toISOString();
      }

      const response = await fetch(`/api/blogs/${id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error updating blog:', result);

        // Handle duplicate slug error specifically
        if (result.error && result.error.includes('slug')) {
          setSlugError('This slug is already in use. Please choose a different one.');
          alert('A blog post with this slug already exists. Please change the slug and try again.');
        } else {
          alert(`Error updating blog post: ${result.error || 'Unknown error'}`);
        }

        setIsSubmitting(false);
        return;
      }

      router.push('/admin/blogs');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating blog:', error);
      alert(`Error updating blog post: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog:', error);
      alert('Error deleting blog post');
      return;
    }

    router.push('/admin/blogs');
    router.refresh();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/blogs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blogs
            </Link>
          </Button>
          <h2 className="text-3xl font-bold">Edit Blog Post</h2>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
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
                onChange={(e) => setTitle(e.target.value)}
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
            {status === 'published' ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
}

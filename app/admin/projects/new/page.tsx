'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { optimizeImageOnPublish } from '@/lib/utils/optimize-publish-image';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugError, setSlugError] = useState('');

  // Professional project fields
  const [projectType, setProjectType] = useState<'professional' | 'side'>('side');
  const [company, setCompany] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [techStack, setTechStack] = useState('');
  const [detailedContent, setDetailedContent] = useState('');
  const [featured, setFeatured] = useState(false);
  const [featuredDescription, setFeaturedDescription] = useState('');

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

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', slugToCheck)
        .maybeSingle(); // Use maybeSingle() instead of single()

      // If no data found, slug is available
      return !data;
    } catch (error) {
      console.error('Error checking slug availability:', error);
      // On error, assume slug is not available to be safe
      return false;
    }
  };

  const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
    let slug = baseSlug;
    let counter = 1;
    let isAvailable = await checkSlugAvailability(slug);

    while (!isAvailable && counter < 100) {
      slug = `${baseSlug}-${counter}`;
      isAvailable = await checkSlugAvailability(slug);
      counter++;
    }

    return slug;
  };

  const handleSlugChange = async (value: string) => {
    const newSlug = generateSlug(value);
    setSlug(newSlug);
    setSlugError('');

    if (newSlug) {
      const isAvailable = await checkSlugAvailability(newSlug);
      if (!isAvailable) {
        setSlugError('This slug is already in use. Try adding a number or different text.');
      }
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'project-images');

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

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleImageUpload(file);
      setImageUrl(url);
    }
  };

  const handleSubmit = async (newStatus: 'draft' | 'published') => {
    if (!title || !description || !slug) {
      alert('Please fill in required fields (Title, Slug, and Description)');
      return;
    }

    setIsSubmitting(true);

    // Double-check slug availability and auto-generate unique slug if needed
    let finalSlug = slug;
    const isAvailable = await checkSlugAvailability(slug);
    if (!isAvailable) {
      console.log('Slug is taken, generating unique slug...');
      finalSlug = await generateUniqueSlug(slug);
      setSlug(finalSlug);
      setSlugError('');

      if (finalSlug === slug) {
        // Failed to generate unique slug
        setSlugError('Unable to generate unique slug. Please try a different title.');
        setIsSubmitting(false);
        return;
      }

      alert(`Slug was already taken. Using "${finalSlug}" instead.`);
    }

    const supabase = createClient();

    // Optimize image if publishing and image exists
    let ogImageUrl: string | null = null;
    if (newStatus === 'published' && imageUrl) {
      ogImageUrl = await optimizeImageOnPublish(imageUrl, 'project-images');
    }

    // Parse tech stack from comma-separated string to array
    const techStackArray = techStack
      ? techStack.split(',').map(t => t.trim()).filter(Boolean)
      : null;

    const { error } = await supabase.from('projects').insert({
      title,
      slug: finalSlug,
      description,
      image_url: imageUrl,
      og_image_url: ogImageUrl,
      project_url: projectUrl || null,
      github_url: githubUrl || null,
      youtube_url: youtubeUrl || null,
      status: newStatus,
      project_type: projectType,
      company: projectType === 'professional' ? company : null,
      start_date: projectType === 'professional' && startDate ? startDate : null,
      end_date: projectType === 'professional' && endDate ? endDate : null,
      tech_stack: techStackArray,
      detailed_content: detailedContent || null,
      featured: featured,
      featured_description: featured && featuredDescription ? featuredDescription : null,
    });

    if (error) {
      console.error('Error creating project:', error);

      // Handle duplicate slug error specifically
      if (error.code === '23505' && error.message.includes('slug')) {
        setSlugError('This slug is already in use. Please choose a different one.');
        alert('A project with this slug already exists. Please change the slug and try again.');
      } else {
        alert(`Error creating project: ${error.message}`);
      }

      setIsSubmitting(false);
      return;
    }

    router.push('/admin/projects');
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
        <h2 className="text-3xl font-bold">Create New Project</h2>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                placeholder="Enter project title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug (URL) <span className="text-destructive">*</span>
              </label>
              <Input
                id="slug"
                placeholder="project-url"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                required
                className={slugError ? 'border-destructive' : ''}
              />
              {slugError && (
                <p className="text-xs text-destructive">{slugError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Preview: /systems/{slug || 'your-slug-here'}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="description"
                placeholder="Brief description of your project"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="projectType" className="text-sm font-medium">
                Project Type <span className="text-destructive">*</span>
              </label>
              <select
                id="projectType"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as 'professional' | 'side')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="side">Side Project</option>
                <option value="professional">Professional Work Experience</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Select if this is a professional work project or personal side project
              </p>
            </div>

            <div className="space-y-4 p-4 border rounded-md">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                  Featured Project
                </label>
                <p className="text-xs text-muted-foreground ml-2">
                  (Display in Featured Projects section on home page)
                </p>
              </div>

              {featured && (
                <div className="space-y-2">
                  <label htmlFor="featuredDescription" className="text-sm font-medium">
                    Featured Description
                  </label>
                  <Textarea
                    id="featuredDescription"
                    placeholder="Brief description of what you accomplished in this project (1-2 sentences). This will appear on the home page."
                    value={featuredDescription}
                    onChange={(e) => setFeaturedDescription(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Keep it concise - highlight your key achievements or impact for the home page featured section.
                  </p>
                </div>
              )}
            </div>

            {projectType === 'professional' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium">
                    Company <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="company"
                    placeholder="e.g., Morgan Stanley, TIAA, TCS"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required={projectType === 'professional'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium">
                      Start Date <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required={projectType === 'professional'}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="endDate" className="text-sm font-medium">
                      End Date
                    </label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty if currently ongoing
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="techStack" className="text-sm font-medium">
                    Tech Stack
                  </label>
                  <Input
                    id="techStack"
                    placeholder="Java, Spring Boot, Angular, Elasticsearch, DB2"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter technologies separated by commas
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="detailedContent" className="text-sm font-medium">
                    Detailed Content
                  </label>
                  <Textarea
                    id="detailedContent"
                    placeholder="Detailed description of your work, achievements, challenges solved, impact metrics, etc. This will be shown on the project detail page."
                    value={detailedContent}
                    onChange={(e) => setDetailedContent(e.target.value)}
                    rows={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Detailed description shown when users click to view the full project. Include key achievements, technical challenges, and business impact.
                  </p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">
                Project Image
              </label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
              />
              {imageUrl && (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt="Project preview"
                    className="max-w-md rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="projectUrl" className="text-sm font-medium">
                Project URL
              </label>
              <Input
                id="projectUrl"
                type="url"
                placeholder="https://example.com"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Link to the live project or demo
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="githubUrl" className="text-sm font-medium">
                GitHub URL
              </label>
              <Input
                id="githubUrl"
                type="url"
                placeholder="https://github.com/username/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Link to the GitHub repository
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="youtubeUrl" className="text-sm font-medium">
                YouTube URL
              </label>
              <Input
                id="youtubeUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Link to a demo video or presentation
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting || !title || !slug || !description}
          >
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting || !title || !slug || !description}
          >
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}

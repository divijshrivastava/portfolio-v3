import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divij.tech';
  const supabase = await createClient();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Dynamic blog posts
  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug, updated_at, created_at')
    .eq('status', 'published');

  const blogRoutes: MetadataRoute.Sitemap = (blogs ?? []).map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.updated_at || blog.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Dynamic system/project pages
  const { data: projects } = await supabase
    .from('projects')
    .select('slug, updated_at, created_at')
    .eq('status', 'published');

  const systemRoutes: MetadataRoute.Sitemap = (projects ?? []).map((project) => ({
    url: `${baseUrl}/systems/${project.slug}`,
    lastModified: new Date(project.updated_at || project.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes, ...systemRoutes];
}

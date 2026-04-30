'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Eye, FileText, Briefcase } from 'lucide-react';
import Link from 'next/link';

// Dynamically import charts to avoid SSR issues
const AnalyticsCharts = dynamic(
  () => import('@/components/admin/analytics-charts').then((mod) => mod.AnalyticsCharts),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading charts...</div> }
);

interface BlogAnalytics {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  status: string;
  created_at: string;
}

interface ProjectAnalytics {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  status: string;
  project_type: string;
  created_at: string;
}

export default function AnalyticsPage() {
  const [blogs, setBlogs] = useState<BlogAnalytics[]>([]);
  const [projects, setProjects] = useState<ProjectAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBlogViews, setTotalBlogViews] = useState(0);
  const [totalProjectViews, setTotalProjectViews] = useState(0);
  const [publishedBlogs, setPublishedBlogs] = useState(0);
  const [publishedProjects, setPublishedProjects] = useState(0);
  
  // Theme colors (cyan primary, slate secondary)
  const primaryColor = '#06b6d4';
  const secondaryColor = '#64748b';

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const supabase = createClient();

    // Load blogs sorted by view count
    const { data: blogsData, error: blogsError } = await supabase
      .from('blogs')
      .select('id, title, slug, view_count, status, created_at')
      .order('view_count', { ascending: false });

    // Load projects sorted by view count
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, slug, view_count, status, project_type, created_at')
      .order('view_count', { ascending: false });

    if (blogsError) {
      console.error('Error loading blogs:', blogsError);
    } else {
      setBlogs(blogsData || []);
      const total = (blogsData || []).reduce((sum, blog) => sum + (blog.view_count || 0), 0);
      setTotalBlogViews(total);
      setPublishedBlogs((blogsData || []).filter(b => b.status === 'published').length);
    }

    if (projectsError) {
      console.error('Error loading projects:', projectsError);
    } else {
      setProjects(projectsData || []);
      const total = (projectsData || []).reduce((sum, project) => sum + (project.view_count || 0), 0);
      setTotalProjectViews(total);
      setPublishedProjects((projectsData || []).filter(p => p.status === 'published').length);
    }

    setIsLoading(false);
  };

  const getMaxViews = () => {
    const maxBlogViews = Math.max(...blogs.map(b => b.view_count || 0), 0);
    const maxProjectViews = Math.max(...projects.map(p => p.view_count || 0), 0);
    return Math.max(maxBlogViews, maxProjectViews);
  };

  const getViewPercentage = (views: number, maxViews: number) => {
    if (maxViews === 0) return 0;
    return (views / maxViews) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  const topBlogs = blogs.filter(b => b.status === 'published').slice(0, 10);
  const topProjects = projects.filter(p => p.status === 'published').slice(0, 10);
  const maxViews = getMaxViews();

  // Prepare data for charts
  const blogChartData = topBlogs.map(blog => ({
    name: blog.title.length > 20 ? blog.title.substring(0, 20) + '...' : blog.title,
    views: blog.view_count || 0,
    fullName: blog.title,
  }));

  const projectChartData = topProjects.map(project => ({
    name: project.title.length > 20 ? project.title.substring(0, 20) + '...' : project.title,
    views: project.view_count || 0,
    fullName: project.title,
  }));

  const pieChartData = [
    { name: 'Blogs', value: totalBlogViews, color: primaryColor },
    { name: 'Projects', value: totalProjectViews, color: secondaryColor },
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Page Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Detailed view statistics for blogs and projects
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/blogs">
                <FileText className="mr-2 h-4 w-4" />
                Manage Blogs
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/projects">
                <Briefcase className="mr-2 h-4 w-4" />
                Manage Projects
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blog Views</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBlogViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {publishedBlogs} published {publishedBlogs === 1 ? 'blog' : 'blogs'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Project Views</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjectViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {publishedProjects} published {publishedProjects === 1 ? 'project' : 'projects'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalBlogViews + totalProjectViews).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All content combined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Views per Post</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {publishedBlogs + publishedProjects > 0
                ? Math.round((totalBlogViews + totalProjectViews) / (publishedBlogs + publishedProjects))
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average across all content
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graph Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Blogs Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top 10 Blogs - View Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {blogChartData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No published blogs yet.</p>
            ) : (
              <AnalyticsCharts
                blogChartData={blogChartData}
                projectChartData={[]}
                pieChartData={[]}
                totalBlogViews={0}
                totalProjectViews={0}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            )}
          </CardContent>
        </Card>

        {/* Top Projects Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top 10 Projects - View Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectChartData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No published projects yet.</p>
            ) : (
              <AnalyticsCharts
                blogChartData={[]}
                projectChartData={projectChartData}
                pieChartData={[]}
                totalBlogViews={0}
                totalProjectViews={0}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart and Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Views Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Views Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsCharts
              blogChartData={[]}
              projectChartData={[]}
              pieChartData={pieChartData}
              totalBlogViews={0}
              totalProjectViews={0}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </CardContent>
        </Card>

        {/* Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Blogs vs Projects Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsCharts
              blogChartData={[]}
              projectChartData={[]}
              pieChartData={[]}
              totalBlogViews={totalBlogViews}
              totalProjectViews={totalProjectViews}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Blogs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Top 10 Most Viewed Blogs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topBlogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No published blogs yet.</p>
            ) : (
              <div className="space-y-4">
                {topBlogs.map((blog, index) => (
                  <div key={blog.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-muted-foreground w-6">
                            #{index + 1}
                          </span>
                          <Link
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            className="font-medium hover:text-primary transition-colors truncate"
                          >
                            {blog.title}
                          </Link>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground ml-8">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {blog.view_count || 0} {blog.view_count === 1 ? 'view' : 'views'}
                          </span>
                          <span>
                            {new Date(blog.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="ml-8 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${getViewPercentage(blog.view_count || 0, maxViews)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Top 10 Most Viewed Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProjects.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No published projects yet.</p>
            ) : (
              <div className="space-y-4">
                {topProjects.map((project, index) => (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-muted-foreground w-6">
                            #{index + 1}
                          </span>
                          <Link
                            href={`/systems/${project.slug}`}
                            target="_blank"
                            className="font-medium hover:text-primary transition-colors truncate"
                          >
                            {project.title}
                          </Link>
                          {project.project_type === 'professional' && (
                            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                              Pro
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground ml-8">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {project.view_count || 0} {project.view_count === 1 ? 'view' : 'views'}
                          </span>
                          <span>
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="ml-8 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${getViewPercentage(project.view_count || 0, maxViews)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Blogs Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            All Blogs (Sorted by Views)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Title</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-right p-2 font-medium">Views</th>
                  <th className="text-left p-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id} className="border-b hover:bg-secondary/50">
                    <td className="p-2">
                      <Link
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        className="hover:text-primary transition-colors"
                      >
                        {blog.title}
                      </Link>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        blog.status === 'published'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-secondary/10 text-secondary border border-secondary/20'
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="p-2 text-right font-medium">{blog.view_count || 0}</td>
                    <td className="p-2 text-muted-foreground">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* All Projects Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            All Projects (Sorted by Views)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Title</th>
                  <th className="text-left p-2 font-medium">Type</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-right p-2 font-medium">Views</th>
                  <th className="text-left p-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-secondary/50">
                    <td className="p-2">
                      <Link
                        href={`/systems/${project.slug}`}
                        target="_blank"
                        className="hover:text-primary transition-colors"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.project_type === 'professional'
                          ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20'
                          : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                      }`}>
                        {project.project_type === 'professional' ? 'Professional' : 'Side Project'}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.status === 'published'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-secondary/10 text-secondary border border-secondary/20'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="p-2 text-right font-medium">{project.view_count || 0}</td>
                    <td className="p-2 text-muted-foreground">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


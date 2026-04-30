'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, ExternalLink, ArrowUpDown, BarChart3, TrendingUp, ArrowRight } from 'lucide-react';
import { GithubIcon as Github, YoutubeIcon as Youtube } from '@/components/icons';
import { getProjectImageUrl } from '@/lib/utils/youtube';
import { MigrateProjectsButton } from '@/components/admin/migrate-projects-button';
import { TableSkeleton } from '@/components/admin/loading-skeleton';

type SortField = 'created_at' | 'view_count' | 'title';
type SortOrder = 'asc' | 'desc';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Calculate analytics
  const totalViews = projects.reduce((sum, project) => sum + (project.view_count || 0), 0);
  const publishedCount = projects.filter(p => p.status === 'published').length;
  const professionalCount = projects.filter(p => p.project_type === 'professional').length;
  const topProject = projects
    .filter(p => p.status === 'published')
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))[0];

  const loadProjects = async () => {
    const response = await fetch('/api/admin/projects');
    const data = await response.json();
    let sortedProjects = data.projects || [];
    
    // Sort projects
    sortedProjects.sort((a: any, b: any) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'view_count') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }
      
      if (sortField === 'title') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    setProjects(sortedProjects);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, [sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = async (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    const response = await fetch(`/api/projects/${projectId}/delete`, {
      method: 'POST',
    });

    if (response.ok) {
      loadProjects();
    } else {
      alert('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-9 w-48 bg-muted animate-pulse rounded mb-2" />
        </div>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  const projectsNeedingMigration = projects?.filter(p => !p.slug).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Manage Projects</h1>
          <p className="text-muted-foreground mt-2">
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex gap-2">
          {projectsNeedingMigration > 0 && (
            <MigrateProjectsButton count={projectsNeedingMigration} />
          )}
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {projects && projects.length > 0 ? (
        <div className="space-y-6">
          {/* Analytics Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Project Analytics
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/analytics">
                  View Full Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">{publishedCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Professional</p>
                  <p className="text-2xl font-bold">{professionalCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Top Performer</p>
                  {topProject ? (
                    <div>
                      <p className="text-lg font-semibold line-clamp-1">{topProject.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {topProject.view_count || 0} views
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No published projects yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sort Controls */}
          <div className="flex gap-2 items-center text-sm">
            <span className="text-muted-foreground">Sort by:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('view_count')}
              className="h-8"
            >
              Views
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('created_at')}
              className="h-8"
            >
              Date
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('title')}
              className="h-8"
            >
              Title
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
            <span className="text-muted-foreground ml-2">
              ({sortField} {sortOrder === 'asc' ? '↑' : '↓'})
            </span>
          </div>

          {projects.map((project) => {
            const displayImage = getProjectImageUrl(project.image_url, project.youtube_url);
            return (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex gap-4">
                  {displayImage && (
                    <div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={displayImage}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="mb-2">{project.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span className={`px-2 py-1 rounded font-medium ${
                            project.status === 'published'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-secondary/10 text-secondary border border-secondary/20'
                          }`}>
                            {project.status}
                          </span>
                          <span className={`px-2 py-1 rounded font-medium ${
                            project.project_type === 'professional'
                              ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20'
                              : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                          }`}>
                            {project.project_type === 'professional' ? 'Professional' : 'Side Project'}
                          </span>
                          {project.company && (
                            <span className="px-2 py-1 rounded font-medium bg-muted text-muted-foreground">
                              {project.company}
                            </span>
                          )}
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                          {project.view_count !== null && project.view_count !== undefined && (
                            <span className="font-medium">{project.view_count} {project.view_count === 1 ? 'view' : 'views'}</span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {project.project_url && (
                            <a
                              href={project.project_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Live
                            </a>
                          )}
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center"
                            >
                              <Github className="h-3 w-3 mr-1" />
                              GitHub
                            </a>
                          )}
                          {project.youtube_url && (
                            <a
                              href={project.youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center"
                            >
                              <Youtube className="h-3 w-3 mr-1" />
                              Video
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/projects`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/projects/edit/${project.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project.id, project.title)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No projects yet.</p>
            <Button asChild>
              <Link href="/admin/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

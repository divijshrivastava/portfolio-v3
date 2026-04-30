'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, ArrowUpDown, BarChart3, TrendingUp, ArrowRight } from 'lucide-react';
import { TableSkeleton } from '@/components/admin/loading-skeleton';

type SortField = 'created_at' | 'view_count' | 'title';
type SortOrder = 'asc' | 'desc';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Calculate analytics
  const totalViews = blogs.reduce((sum, blog) => sum + (blog.view_count || 0), 0);
  const publishedCount = blogs.filter(b => b.status === 'published').length;
  const topBlog = blogs
    .filter(b => b.status === 'published')
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))[0];

  const loadBlogs = async () => {
    const response = await fetch('/api/admin/blogs');
    const data = await response.json();
    const sortedBlogs = data.blogs || [];
    
    // Sort blogs
    sortedBlogs.sort((a: any, b: any) => {
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
    
    setBlogs(sortedBlogs);
    setLoading(false);
  };

  useEffect(() => {
    loadBlogs();
  }, [sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = async (blogId: string, blogTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${blogTitle}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    const response = await fetch(`/api/blogs/${blogId}/delete`, {
      method: 'POST',
    });

    if (response.ok) {
      loadBlogs();
    } else {
      alert('Failed to delete blog post');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Manage Blogs</h1>
          <p className="text-muted-foreground mt-2">
            {blogs.length} blog post{blogs.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blogs/new">
            <Plus className="mr-2 h-4 w-4" />
            New Blog Post
          </Link>
        </Button>
      </div>

      {blogs && blogs.length > 0 ? (
        <div className="space-y-6">
          {/* Analytics Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Blog Analytics
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/analytics">
                  View Full Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Published Posts</p>
                  <p className="text-2xl font-bold">{publishedCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Top Performer</p>
                  {topBlog ? (
                    <div>
                      <p className="text-lg font-semibold line-clamp-1">{topBlog.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {topBlog.view_count || 0} views
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No published posts yet</p>
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

          {blogs.map((blog) => (
            <Card key={blog.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{blog.title}</CardTitle>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span className={`px-2 py-1 rounded font-medium ${
                        blog.status === 'published'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-secondary/10 text-secondary border border-secondary/20'
                      }`}>
                        {blog.status}
                      </span>
                      <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                      {blog.view_count !== null && blog.view_count !== undefined && (
                        <span className="font-medium">{blog.view_count} {blog.view_count === 1 ? 'view' : 'views'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/blog/${blog.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/blogs/edit/${blog.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(blog.id, blog.title)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {blog.summary && (
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">{blog.summary}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No blog posts yet.</p>
            <Button asChild>
              <Link href="/admin/blogs/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Post
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

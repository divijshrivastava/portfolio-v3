import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Briefcase, Mail, MailPlus, Activity, Eye, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DataExport } from '@/components/admin/data-export';

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [
    { count: blogsCount },
    { count: projectsCount },
    { count: professionalProjectsCount },
    { count: messagesCount },
    { count: activityCount },
    { count: subscribersCount },
  ] = await Promise.all([
    supabase.from('blogs').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('project_type', 'professional'),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('user_activity').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
  ]);

  const { count: unreadMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  // Get total page views
  const [
    { data: blogsData },
    { data: projectsData }
  ] = await Promise.all([
    supabase.from('blogs').select('view_count'),
    supabase.from('projects').select('view_count'),
  ]);

  const totalBlogViews = blogsData?.reduce((sum, blog) => sum + (blog.view_count || 0), 0) || 0;
  const totalProjectViews = projectsData?.reduce((sum, project) => sum + (project.view_count || 0), 0) || 0;
  const totalPageViews = totalBlogViews + totalProjectViews;

  // Get recent activity (last 5)
  const { data: recentActivity } = await supabase
    .from('user_activity')
    .select('page_visited, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  // Get recent messages (last 3)
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('id, name, email, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  const stats = [
    { 
      name: 'Total Blogs', 
      value: blogsCount || 0, 
      icon: FileText, 
      href: '/admin/blogs',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      name: 'Professional Projects', 
      value: professionalProjectsCount || 0, 
      icon: Briefcase, 
      href: '/admin/projects',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    { 
      name: 'Total Projects', 
      value: projectsCount || 0, 
      icon: Briefcase, 
      href: '/admin/projects',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      name: 'Unread Messages', 
      value: unreadMessages || 0, 
      icon: Mail, 
      href: '/admin/messages',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      highlight: unreadMessages && unreadMessages > 0
    },
    { 
      name: 'Newsletter Subscribers', 
      value: subscribersCount || 0, 
      icon: MailPlus, 
      href: '/admin/newsletter',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    },
    { 
      name: 'Total Page Views', 
      value: totalPageViews.toLocaleString(), 
      icon: Eye, 
      href: '/admin/analytics',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your portfolio content and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const StatCard = (
            <Card className={cn(
              'transition-all duration-200 hover:shadow-md',
              stat.highlight && 'ring-2 ring-primary'
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('h-4 w-4', stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );

          return stat.href ? (
            <Link key={stat.name} href={stat.href} className="block">
              {StatCard}
            </Link>
          ) : (
            <div key={stat.name}>{StatCard}</div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <Link 
              href="/admin/activity" 
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-muted-foreground truncate max-w-[200px]">
                        {activity.page_visited}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Recent Messages
            </CardTitle>
            <Link 
              href="/admin/messages" 
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentMessages && recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <div key={message.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={cn(
                        'h-2 w-2 rounded-full flex-shrink-0',
                        !message.is_read ? 'bg-primary' : 'bg-muted-foreground'
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{message.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{message.email}</p>
                      </div>
                    </div>
                    {!message.is_read && (
                      <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full flex-shrink-0">
                        New
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No messages yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/blogs/new">
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">New Blog Post</p>
                    <p className="text-xs text-muted-foreground">Create article</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/projects/new">
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">New Project</p>
                    <p className="text-xs text-muted-foreground">Add project</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/analytics">
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">View Analytics</p>
                    <p className="text-xs text-muted-foreground">See insights</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/activity/analytics">
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Activity Analytics</p>
                    <p className="text-xs text-muted-foreground">Track visits</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Data Export & Backup */}
      <DataExport />
    </div>
  );
}

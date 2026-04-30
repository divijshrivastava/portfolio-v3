'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Globe, Users, Clock, MapPin } from 'lucide-react';

// Dynamically import charts to avoid SSR issues
const PageVisitsChart = dynamic(
  () => import('@/components/admin/activity-charts').then((mod) => mod.PageVisitsChart),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart...</div> }
);

const TimeSeriesChart = dynamic(
  () => import('@/components/admin/activity-charts').then((mod) => mod.TimeSeriesChart),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart...</div> }
);

const IPChart = dynamic(
  () => import('@/components/admin/activity-charts').then((mod) => mod.IPChart),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart...</div> }
);

const HourlyChart = dynamic(
  () => import('@/components/admin/activity-charts').then((mod) => mod.HourlyChart),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart...</div> }
);

interface UserActivity {
  id: string;
  page_visited: string;
  ip_address: string;
  user_agent: string;
  referrer: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
}

export default function ActivityAnalyticsPage() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalVisits, setTotalVisits] = useState(0);
  const [uniqueIPs, setUniqueIPs] = useState(0);
  const [uniquePages, setUniquePages] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);

  // Theme colors
  const primaryColor = '#06b6d4';
  const secondaryColor = '#64748b';

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading activities:', error);
      setIsLoading(false);
      return;
    }

    setActivities(data || []);
    setTotalVisits(data?.length || 0);

    // Calculate unique IPs
    const uniqueIPSet = new Set(data?.map(a => a.ip_address).filter(Boolean));
    setUniqueIPs(uniqueIPSet.size);

    // Calculate unique pages
    const uniquePageSet = new Set(data?.map(a => a.page_visited).filter(Boolean));
    setUniquePages(uniquePageSet.size);

    // Calculate today's visits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = data?.filter(a => new Date(a.created_at) >= today).length || 0;
    setTodayVisits(todayCount);

    setIsLoading(false);
  };

  // Prepare data for charts
  const getPageVisitData = () => {
    const pageCounts: Record<string, number> = {};
    activities.forEach(activity => {
      if (activity.page_visited) {
        pageCounts[activity.page_visited] = (pageCounts[activity.page_visited] || 0) + 1;
      }
    });

    return Object.entries(pageCounts)
      .map(([page, visits]) => ({ page, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
  };

  const getTimeSeriesData = () => {
    const dateCounts: Record<string, number> = {};
    activities.forEach(activity => {
      const date = new Date(activity.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    return Object.entries(dateCounts)
      .map(([date, visits]) => ({ date, visits }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days
  };

  const getTopIPs = () => {
    const ipCounts: Record<string, number> = {};
    activities.forEach(activity => {
      if (activity.ip_address) {
        ipCounts[activity.ip_address] = (ipCounts[activity.ip_address] || 0) + 1;
      }
    });

    return Object.entries(ipCounts)
      .map(([ip, visits]) => ({ ip, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
  };

  const getHourlyDistribution = () => {
    const hourCounts: Record<number, number> = {};
    activities.forEach(activity => {
      const hour = new Date(activity.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      visits: hourCounts[i] || 0,
    }));
  };

  const getCountryData = () => {
    const countryCounts: Record<string, number> = {};
    activities.forEach(activity => {
      if (activity.country) {
        countryCounts[activity.country] = (countryCounts[activity.country] || 0) + 1;
      }
    });

    return Object.entries(countryCounts)
      .map(([country, visits]) => ({ country, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  const pageVisitData = getPageVisitData();
  const timeSeriesData = getTimeSeriesData();
  const topIPs = getTopIPs();
  const hourlyData = getHourlyDistribution();
  const countryData = getCountryData();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Activity Analytics</h2>
        <p className="text-muted-foreground">
          Detailed analytics for user activity and page visits
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueIPs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique IP addresses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages Visited</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniquePages}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique pages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayVisits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Visits today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Most Visited Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top 10 Most Visited Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pageVisitData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No activity data yet.</p>
            ) : (
              <PageVisitsChart data={pageVisitData} primaryColor={primaryColor} />
            )}
          </CardContent>
        </Card>

        {/* Activity Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activity Over Time (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeSeriesData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No activity data yet.</p>
            ) : (
              <TimeSeriesChart data={timeSeriesData} primaryColor={primaryColor} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top IP Addresses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top 10 IP Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topIPs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No IP data yet.</p>
            ) : (
              <IPChart data={topIPs} secondaryColor={secondaryColor} />
            )}
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Visits by Hour of Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HourlyChart data={hourlyData} primaryColor={primaryColor} />
          </CardContent>
        </Card>
      </div>

      {/* Country Distribution (if available) */}
      {countryData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Top 10 Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {countryData.map((item, index) => (
                <div key={item.country} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      <span className="font-medium">{item.country}</span>
                    </div>
                    <span className="font-medium">{item.visits} visits</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(item.visits / countryData[0].visits) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            All Activity (Last 100)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Page</th>
                  <th className="text-left p-2 font-medium">IP Address</th>
                  <th className="text-left p-2 font-medium">Country</th>
                  <th className="text-left p-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {activities.slice(0, 100).map((activity) => (
                  <tr key={activity.id} className="border-b hover:bg-secondary/50">
                    <td className="p-2 font-medium">{activity.page_visited}</td>
                    <td className="p-2 text-muted-foreground">{activity.ip_address}</td>
                    <td className="p-2 text-muted-foreground">
                      {activity.country || 'Unknown'}
                    </td>
                    <td className="p-2 text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
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


'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ChartData {
  name: string;
  views: number;
  fullName: string;
}

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsChartsProps {
  blogChartData: ChartData[];
  projectChartData: ChartData[];
  pieChartData: PieData[];
  totalBlogViews: number;
  totalProjectViews: number;
  primaryColor: string;
  secondaryColor: string;
}

export function AnalyticsCharts({
  blogChartData,
  projectChartData,
  pieChartData,
  totalBlogViews,
  totalProjectViews,
  primaryColor,
  secondaryColor,
}: AnalyticsChartsProps) {
  // Render blogs bar chart
  if (blogChartData.length > 0) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={blogChartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            formatter={(value) => {
              if (value === undefined) return '';
              return `${value} views`;
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0] && payload[0].payload) {
                return payload[0].payload.fullName;
              }
              return label;
            }}
          />
          <Bar dataKey="views" fill={primaryColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Render projects bar chart
  if (projectChartData.length > 0) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={projectChartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            formatter={(value) => {
              if (value === undefined) return '';
              return `${value} views`;
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0] && payload[0].payload) {
                return payload[0].payload.fullName;
              }
              return label;
            }}
          />
          <Bar dataKey="views" fill={secondaryColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Render pie chart
  if (pieChartData.length > 0) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieChartData as Array<{ name: string; value: number }>}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => {
              if (percent === undefined) return name;
              return `${name}: ${(percent * 100).toFixed(0)}%`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            formatter={(value) => {
              if (value === undefined) return '';
              return `${Number(value).toLocaleString()} views`;
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Render comparison chart
  if (totalBlogViews > 0 || totalProjectViews > 0) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={[
            { name: 'Blogs', views: totalBlogViews },
            { name: 'Projects', views: totalProjectViews },
          ]}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            formatter={(value) => {
              if (value === undefined) return '';
              return `${Number(value).toLocaleString()} views`;
            }}
          />
          <Legend />
          <Bar dataKey="views" fill={primaryColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return null;
}


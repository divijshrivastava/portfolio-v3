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
  LineChart,
  Line,
} from 'recharts';

interface PageVisitData {
  page: string;
  visits: number;
}

interface TimeSeriesData {
  date: string;
  visits: number;
}

interface IPData {
  ip: string;
  visits: number;
}

interface PageVisitsChartProps {
  data: PageVisitData[];
  primaryColor: string;
}

export function PageVisitsChart({ data, primaryColor }: PageVisitsChartProps) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="page"
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
            return `${value} visits`;
          }}
        />
        <Bar dataKey="visits" fill={primaryColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  primaryColor: string;
}

export function TimeSeriesChart({ data, primaryColor }: TimeSeriesChartProps) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
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
            return `${value} visits`;
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="visits"
          stroke={primaryColor}
          strokeWidth={2}
          dot={{ fill: primaryColor, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface IPChartProps {
  data: IPData[];
  secondaryColor: string;
}

export function IPChart({ data, secondaryColor }: IPChartProps) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="ip"
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
            return `${value} visits`;
          }}
        />
        <Bar dataKey="visits" fill={secondaryColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface HourlyChartProps {
  data: Array<{ hour: string; visits: number }>;
  primaryColor: string;
}

export function HourlyChart({ data, primaryColor }: HourlyChartProps) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="hour"
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
            return `${value} visits`;
          }}
        />
        <Bar dataKey="visits" fill={primaryColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

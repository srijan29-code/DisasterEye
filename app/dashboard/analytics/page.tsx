'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Users, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, Incident, Volunteer } from '@/lib/supabase';
import { CardAnimation } from '@/components/animations';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { chartConfig } from '@/lib/chart-config';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, Area, AreaChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const categoryColors: Record<string, string> = {
  flood: '#3b82f6', fire: '#ef4444', earthquake: '#f59e0b', cyclone: '#8b5cf6',
  landslide: '#84cc16', building_collapse: '#ec4899', road_blockage: '#06b6d4', other: '#64748b',
};

const priorityColors: Record<string, string> = {
  low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
};

export default function AnalyticsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [incData, volData] = await Promise.all([
        supabase.from('incidents').select('*'),
        supabase.from('volunteers').select('*'),
      ]);
      setIncidents((incData.data || []) as Incident[]);
      setVolunteers((volData.data || []) as Volunteer[]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  const stats = {
    total: incidents.length,
    active: incidents.filter(i => i.status === 'active').length,
    pending: incidents.filter(i => i.status === 'pending').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    critical: incidents.filter(i => i.priority === 'critical').length,
    peopleAffected: incidents.reduce((sum, i) => sum + (i.people_affected || 0), 0),
  };

  // Last 14 days trend
  const last14Days = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - idx));
    const dayStr = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    const dayInc = incidents.filter(i => new Date(i.created_at).toDateString() === d.toDateString());
    return {
      day: dayStr,
      incidents: dayInc.length,
      resolved: dayInc.filter(i => i.status === 'resolved').length,
      pending: dayInc.filter(i => i.status === 'pending').length,
    };
  });

  // Category distribution
  const categoryData = Object.entries(
    incidents.reduce((acc: Record<string, number>, i: Incident) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value, fill: categoryColors[name] }));

  // Priority distribution
  const priorityData = Object.entries(
    incidents.reduce((acc: Record<string, number>, i: Incident) => { acc[i.priority] = (acc[i.priority] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value, fill: priorityColors[name] }));

  // Radar chart data
  const radarData = [
    { category: 'Flood', value: incidents.filter(i => i.category === 'flood').length },
    { category: 'Fire', value: incidents.filter(i => i.category === 'fire').length },
    { category: 'Quake', value: incidents.filter(i => i.category === 'earthquake').length },
    { category: 'Cyclone', value: incidents.filter(i => i.category === 'cyclone').length },
    { category: 'Landslide', value: incidents.filter(i => i.category === 'landslide').length },
    { category: 'Collapse', value: incidents.filter(i => i.category === 'building_collapse').length },
  ];

  // Status breakdown for bar chart
  const statusData = [
    { name: 'Pending', value: stats.pending, fill: priorityColors.medium },
    { name: 'Active', value: stats.active, fill: priorityColors.high },
    { name: 'Resolved', value: stats.resolved, fill: priorityColors.low },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary" /> Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive disaster management statistics</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Incidents', value: stats.total, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'People Affected', value: stats.peopleAffected, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Critical Priority', value: stats.critical, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map((stat, i) => (
          <CardAnimation key={stat.label} delay={i * 0.05}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardAnimation>
        ))}
      </div>

      {/* 14-day trend */}
      <CardAnimation>
        <Card>
          <CardHeader><CardTitle className="text-base">14-Day Incident Trend</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={last14Days}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="incidents" name="Incidents" stroke="hsl(var(--chart-1))" fill="url(#aGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </CardAnimation>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category pie */}
        <CardAnimation>
          <Card>
            <CardHeader><CardTitle className="text-base">Disaster Categories</CardTitle></CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} label>
                      {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ChartContainer>
              ) : <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">No data</div>}
            </CardContent>
          </Card>
        </CardAnimation>

        {/* Priority pie */}
        <CardAnimation delay={0.1}>
          <Card>
            <CardHeader><CardTitle className="text-base">Priority Distribution</CardTitle></CardHeader>
            <CardContent>
              {priorityData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <PieChart>
                    <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                      {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ChartContainer>
              ) : <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">No data</div>}
            </CardContent>
          </Card>
        </CardAnimation>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status bar */}
        <CardAnimation>
          <Card>
            <CardHeader><CardTitle className="text-base">Status Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </CardAnimation>

        {/* Radar */}
        <CardAnimation delay={0.1}>
          <Card>
            <CardHeader><CardTitle className="text-base">Disaster Type Radar</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Radar name="Incidents" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </CardAnimation>
      </div>

      {/* Volunteer stats */}
      <CardAnimation>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Volunteer Network Stats</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Total Volunteers</p>
                <p className="text-2xl font-bold">{volunteers.length}</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-500">{volunteers.filter(v => v.status === 'approved').length}</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{volunteers.filter(v => v.status === 'pending').length}</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">{volunteers.reduce((sum, v) => sum + v.completed_tasks, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardAnimation>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle, CheckCircle2, Clock, Users, TrendingUp, Activity, ArrowRight,
  Brain, FileWarning, Map as MapIcon, MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase, Incident } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { CardAnimation } from '@/components/animations';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import { chartConfig } from '@/lib/chart-config';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

const categoryColors: Record<string, string> = {
  flood: '#3b82f6', fire: '#ef4444', earthquake: '#f59e0b', cyclone: '#8b5cf6',
  landslide: '#84cc16', building_collapse: '#ec4899', road_blockage: '#06b6d4', other: '#64748b',
};

const priorityColors: Record<string, string> = {
  low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: incidents, isLoading } = useQuery<Incident[]>({
    queryKey: ['incidents-all'],
    queryFn: async () => {
      const { data } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
      return (data || []) as Incident[];
    },
    refetchInterval: 30000,
  });

  const stats = {
    total: incidents?.length || 0,
    active: incidents?.filter((i: Incident) => i.status === 'active').length || 0,
    pending: incidents?.filter((i: Incident) => i.status === 'pending').length || 0,
    resolved: incidents?.filter((i: Incident) => i.status === 'resolved').length || 0,
  };

  // Build chart data from incidents by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dayStr = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    const dayIncidents = incidents?.filter((i: Incident) => {
      const iDate = new Date(i.created_at);
      return iDate.toDateString() === d.toDateString();
    }) || [];
    return {
      day: dayStr,
      incidents: dayIncidents.length,
      resolved: dayIncidents.filter((i: Incident) => i.status === 'resolved').length,
    };
  });

  // Category distribution
  const categoryData = Object.entries(
    incidents?.reduce((acc: Record<string, number>, i: Incident) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc; }, {} as Record<string, number>) || {}
  ).map(([name, value]) => ({ name, value, fill: categoryColors[name] }));

  // Priority distribution
  const priorityData = Object.entries(
    incidents?.reduce((acc: Record<string, number>, i: Incident) => { acc[i.priority] = (acc[i.priority] || 0) + 1; return acc; }, {} as Record<string, number>) || {}
  ).map(([name, value]) => ({ name, value, fill: priorityColors[name] }));

  const recentIncidents: Incident[] = incidents?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time disaster management overview</p>
        </div>
        <Link href="/dashboard/report">
          <Button className="bg-gradient-to-r from-primary to-chart-5 text-white hover:opacity-90">
            <FileWarning className="w-4 h-4 mr-2" /> Report Incident
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Incidents', value: stats.total, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Active Disasters', value: stats.active, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Pending Reports', value: stats.pending, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map((stat, i) => (
          <CardAnimation key={stat.label} delay={i * 0.05}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{isLoading ? '—' : stat.value}</p>
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

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/dashboard/ai-detection', label: 'AI Image Analysis', icon: Brain, desc: 'Detect disasters from photos', color: 'from-blue-500 to-cyan-500' },
          { href: '/dashboard/chat', label: 'Emergency Chat', icon: MessageSquare, desc: 'Get AI safety guidance', color: 'from-green-500 to-emerald-500' },
          { href: '/dashboard/map', label: 'Live Map', icon: MapIcon, desc: 'View incidents on map', color: 'from-red-500 to-orange-500' },
          { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp, desc: 'Detailed statistics', color: 'from-purple-500 to-pink-500' },
        ].map((action, i) => (
          <CardAnimation key={action.href} delay={i * 0.05}>
            <Link href={action.href}>
              <Card className="hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1 duration-200">
                <CardContent className="pt-6">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                  <div className="flex items-center gap-1 text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </CardAnimation>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CardAnimation>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Incidents — Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={last7Days}>
                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="incidents" name="Incidents" stroke="hsl(var(--chart-1))" fill="url(#incGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="hsl(var(--chart-2))" fill="url(#resGrad)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </CardAnimation>

        <CardAnimation delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Disaster Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                      {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
              )}
            </CardContent>
          </Card>
        </CardAnimation>
      </div>

      {/* Recent incidents */}
      <CardAnimation>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Incidents</CardTitle>
            <Link href="/dashboard/map" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentIncidents.length === 0 ? (
              <div className="text-center py-8">
                <FileWarning className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No incidents reported yet</p>
                <Link href="/dashboard/report" className="text-sm text-primary hover:underline mt-2 inline-block">Report the first incident</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentIncidents.map((incident, i) => (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: priorityColors[incident.priority] }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{incident.title}</p>
                        <p className="text-xs text-muted-foreground">{incident.location_name || 'Unknown location'} · {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs capitalize">{incident.category.replace('_', ' ')}</Badge>
                      <Badge variant="secondary" className="text-xs capitalize">{incident.status}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </CardAnimation>
    </div>
  );
}

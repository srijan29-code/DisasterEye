'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Users, FileWarning, CheckCircle2, XCircle, Trash2, Loader2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { supabase, Profile, Incident, Volunteer } from '@/lib/supabase';
import { CardAnimation } from '@/components/animations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function AdminPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [volunteers, setVolunteers] = useState<(Volunteer & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && profile?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/dashboard');
    }
  }, [authLoading, profile, router]);

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    (async () => {
      const [userData, incData, volData] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('incidents').select('*').order('created_at', { ascending: false }),
        supabase.from('volunteers').select('*').order('created_at', { ascending: false }),
      ]);

      setUsers((userData.data || []) as Profile[]);
      setIncidents((incData.data || []) as Incident[]);

      const volList = (volData.data || []) as Volunteer[];
      if (volList.length > 0) {
        const userIds = volList.map(v => v.user_id);
        const { data: profilesData } = await supabase.from('profiles').select('*').in('id', userIds);
        const profilesMap = (profilesData || []) as Profile[];
        setVolunteers(volList.map(v => ({ ...v, profile: profilesMap.find(p => p.id === v.user_id) })));
      }

      setLoading(false);
    })();
  }, [profile]);

  const handleApproveVolunteer = async (vol: Volunteer & { profile?: Profile }) => {
    await supabase.from('volunteers').update({ status: 'approved' }).eq('id', vol.id);
    setVolunteers(prev => prev.map(v => v.id === vol.id ? { ...v, status: 'approved' } : v));
    toast.success(`${vol.profile?.display_name || 'Volunteer'} approved`);
  };

  const handleRejectVolunteer = async (vol: Volunteer & { profile?: Profile }) => {
    await supabase.from('volunteers').update({ status: 'rejected' }).eq('id', vol.id);
    setVolunteers(prev => prev.map(v => v.id === vol.id ? { ...v, status: 'rejected' } : v));
    toast.success(`${vol.profile?.display_name || 'Volunteer'} rejected`);
  };

  const handleUpdateIncidentStatus = async (inc: Incident, status: string) => {
    await supabase.from('incidents').update({ status }).eq('id', inc.id);
    setIncidents(prev => prev.map(i => i.id === inc.id ? { ...i, status } : i));
    toast.success(`Incident marked as ${status}`);
  };

  const handleDeleteIncident = async (inc: Incident) => {
    await supabase.from('incidents').delete().eq('id', inc.id);
    setIncidents(prev => prev.filter(i => i.id !== inc.id));
    toast.success('Fake/invalid report deleted');
  };

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  if (profile?.role !== 'admin') return null;

  const stats = {
    totalUsers: users.length,
    totalIncidents: incidents.length,
    pendingIncidents: incidents.filter(i => i.status === 'pending').length,
    pendingVolunteers: volunteers.filter(v => v.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <ShieldAlert className="w-7 h-7 text-primary" /> Admin Panel
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage users, volunteers, and incident reports</p>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Incidents', value: stats.totalIncidents, icon: FileWarning, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Pending Reports', value: stats.pendingIncidents, icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Pending Volunteers', value: stats.pendingVolunteers, icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
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

      <Tabs defaultValue="reports">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Incident Reports</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteer Approvals</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Reports management */}
        <TabsContent value="reports">
          <CardAnimation>
            <Card>
              <CardHeader><CardTitle className="text-base">Manage Incident Reports</CardTitle></CardHeader>
              <CardContent>
                {incidents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No incidents to manage</p>
                ) : (
                  <div className="space-y-3">
                    {incidents.map(inc => (
                      <div key={inc.id} className="flex items-start justify-between p-3 rounded-lg border border-border gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{inc.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{inc.description || 'No description'}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs capitalize">{inc.category.replace('_', ' ')}</Badge>
                            <Badge variant="secondary" className="text-xs capitalize">{inc.status}</Badge>
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(inc.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {inc.status === 'pending' && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateIncidentStatus(inc, 'active')}>
                              <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> Activate
                            </Button>
                          )}
                          {inc.status === 'active' && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateIncidentStatus(inc, 'resolved')}>
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Resolve
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteIncident(inc)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </CardAnimation>
        </TabsContent>

        {/* Volunteer approvals */}
        <TabsContent value="volunteers">
          <CardAnimation>
            <Card>
              <CardHeader><CardTitle className="text-base">Volunteer Approvals</CardTitle></CardHeader>
              <CardContent>
                {volunteers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No volunteers registered</p>
                ) : (
                  <div className="space-y-3">
                    {volunteers.map(vol => (
                      <div key={vol.id} className="flex items-center justify-between p-3 rounded-lg border border-border gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-chart-5 text-white text-xs">
                              {vol.profile?.display_name?.[0]?.toUpperCase() || 'V'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{vol.profile?.display_name || 'Volunteer'}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={cn('text-xs capitalize', vol.status === 'approved' ? 'bg-green-500' : vol.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500')}>
                                {vol.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{vol.experience_years} yrs exp</span>
                            </div>
                            {vol.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {vol.skills.slice(0, 3).map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                              </div>
                            )}
                          </div>
                        </div>
                        {vol.status === 'pending' && (
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" onClick={() => handleApproveVolunteer(vol)}>
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRejectVolunteer(vol)}>
                              <XCircle className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </CardAnimation>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <CardAnimation>
            <Card>
              <CardHeader><CardTitle className="text-base">All Users</CardTitle></CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No users registered</p>
                ) : (
                  <div className="space-y-3">
                    {users.map(u => (
                      <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-chart-5 text-white text-xs">
                            {u.display_name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{u.display_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                        <Badge className="capitalize">{u.role}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </CardAnimation>
        </TabsContent>
      </Tabs>
    </div>
  );
}

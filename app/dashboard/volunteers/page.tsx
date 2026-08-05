'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, CheckCircle2, Clock, Star, Loader2, UserPlus, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { supabase, Volunteer, Profile, Incident } from '@/lib/supabase';
import { CardAnimation } from '@/components/animations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const skillOptions = ['First Aid', 'Swimming', 'CPR', 'Search & Rescue', 'Medical', 'Logistics', 'Communications', 'Driving', 'Cooking', 'Counseling'];

export default function VolunteersPage() {
  const { user, profile } = useAuth();
  const [volunteers, setVolunteers] = useState<(Volunteer & { profile?: Profile })[]>([]);
  const [myVolunteer, setMyVolunteer] = useState<Volunteer | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState(0);
  const [location, setLocation] = useState('');
  const [certifications, setCertifications] = useState('');

  useEffect(() => {
    (async () => {
      if (!user) return;
      const [volData, incData, myVol] = await Promise.all([
        supabase.from('volunteers').select('*').eq('status', 'approved').order('completed_tasks', { ascending: false }),
        supabase.from('incidents').select('*').eq('status', 'active').limit(10),
        supabase.from('volunteers').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      // Fetch profiles for volunteers
      const volList = (volData.data || []) as Volunteer[];
      if (volList.length > 0) {
        const userIds = volList.map(v => v.user_id);
        const { data: profilesData } = await supabase.from('profiles').select('*').in('id', userIds);
        const profilesMap = (profilesData || []) as Profile[];
        const merged = volList.map(v => ({
          ...v, profile: profilesMap.find(p => p.id === v.user_id),
        }));
        setVolunteers(merged);
      }

      setIncidents((incData.data || []) as Incident[]);
      setMyVolunteer(myVol.data as Volunteer | null);
      setLoading(false);
    })();
  }, [user]);

  const handleRegister = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('volunteers').insert({
      user_id: user.id, status: 'pending', availability: 'available',
      skills, experience_years: experience, preferred_location: location,
      certifications: certifications ? certifications.split(',').map(c => c.trim()) : [],
    }).select().maybeSingle();

    if (error) { toast.error(error.message); return; }
    setMyVolunteer(data as Volunteer);
    setShowRegister(false);
    toast.success('Volunteer registration submitted! Pending approval.');
  };

  const toggleSkill = (skill: string) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleAcceptTask = async (incident: Incident) => {
    if (!myVolunteer || !user) return;
    await supabase.from('volunteers').update({
      active_tasks: myVolunteer.active_tasks + 1,
      availability: 'busy',
    }).eq('user_id', user.id);

    await supabase.from('notifications').insert({
      user_id: user.id, title: 'Task Accepted',
      message: `You accepted: ${incident.title}. Please proceed to the location safely.`,
      type: 'success',
    });

    setMyVolunteer({ ...myVolunteer, active_tasks: myVolunteer.active_tasks + 1, availability: 'busy' });
    toast.success('Task accepted! Check notifications for details.');
  };

  const handleCompleteTask = async () => {
    if (!myVolunteer || !user) return;
    await supabase.from('volunteers').update({
      completed_tasks: myVolunteer.completed_tasks + 1,
      active_tasks: Math.max(0, myVolunteer.active_tasks - 1),
      availability: 'available',
    }).eq('user_id', user.id);

    setMyVolunteer({
      ...myVolunteer,
      completed_tasks: myVolunteer.completed_tasks + 1,
      active_tasks: Math.max(0, myVolunteer.active_tasks - 1),
      availability: 'available',
    });
    toast.success('Task completed! Your rescue score increased.');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" /> Volunteers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Join the rescue network and help your community</p>
        </div>
        {profile?.role === 'volunteer' && !myVolunteer && !showRegister && (
          <Button onClick={() => setShowRegister(true)} className="bg-gradient-to-r from-primary to-chart-5 text-white">
            <UserPlus className="w-4 h-4 mr-2" /> Register as Volunteer
          </Button>
        )}
      </div>

      {/* My volunteer status */}
      {myVolunteer && (
        <CardAnimation>
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={cn('mt-1 capitalize', myVolunteer.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500')}>
                    {myVolunteer.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Availability</p>
                  <Badge variant="outline" className="mt-1 capitalize">{myVolunteer.availability}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completed Tasks</p>
                  <p className="text-xl font-bold">{myVolunteer.completed_tasks}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="text-xl font-bold flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {myVolunteer.rating.toFixed(1)}
                  </p>
                </div>
              </div>
              {myVolunteer.active_tasks > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button onClick={handleCompleteTask} variant="outline" size="sm">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> Mark Active Task Complete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </CardAnimation>
      )}

      {/* Registration form */}
      {showRegister && (
        <CardAnimation>
          <Card>
            <CardHeader><CardTitle className="text-base">Volunteer Registration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Your Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm border transition-all',
                        skills.includes(skill) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                      )}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exp">Years of Experience</Label>
                  <Input id="exp" type="number" min={0} value={experience} onChange={(e) => setExperience(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loc">Preferred Location</Label>
                  <Input id="loc" placeholder="e.g., Downtown" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert">Certifications (comma-separated)</Label>
                <Input id="cert" placeholder="e.g., CPR Certified, First Aid, Red Cross" value={certifications} onChange={(e) => setCertifications(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRegister} className="bg-gradient-to-r from-primary to-chart-5 text-white">Submit Registration</Button>
                <Button variant="outline" onClick={() => setShowRegister(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </CardAnimation>
      )}

      {/* Nearby tasks */}
      {myVolunteer?.status === 'approved' && incidents.length > 0 && (
        <CardAnimation>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /> Available Rescue Tasks</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents.map(inc => (
                  <div key={inc.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium">{inc.title}</p>
                      <p className="text-xs text-muted-foreground">{inc.location_name} · {inc.priority} priority</p>
                    </div>
                    <Button size="sm" onClick={() => handleAcceptTask(inc)}>Accept Task</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardAnimation>
      )}

      {/* Leaderboard */}
      <CardAnimation>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Award className="w-4 h-4 text-yellow-500" /> Volunteer Leaderboard</CardTitle></CardHeader>
          <CardContent>
            {volunteers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No approved volunteers yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {volunteers.slice(0, 10).map((vol, i) => (
                  <motion.div
                    key={vol.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                      i === 0 ? 'bg-yellow-500/20 text-yellow-500' : i === 1 ? 'bg-gray-400/20 text-gray-400' : i === 2 ? 'bg-orange-700/20 text-orange-700' : 'bg-muted text-muted-foreground'
                    )}>
                      {i + 1}
                    </div>
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-chart-5 text-white text-xs">
                        {vol.profile?.display_name?.[0]?.toUpperCase() || 'V'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{vol.profile?.display_name || 'Volunteer'}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{vol.completed_tasks} tasks</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {vol.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 max-w-[120px]">
                      {vol.skills.slice(0, 2).map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
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

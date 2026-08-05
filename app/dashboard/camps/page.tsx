'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tent, Bed, Apple, Droplets, Pill, Plus, Loader2, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { supabase, ReliefCamp } from '@/lib/supabase';
import { CardAnimation } from '@/components/animations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CampsPage() {
  const { profile } = useAuth();
  const [camps, setCamps] = useState<ReliefCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCamp, setNewCamp] = useState({ name: '', location: '', capacity: 100, manager: '', phone: '' });

  const canManage = profile?.role === 'admin' || profile?.role === 'rescue_team';

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('relief_camps').select('*').order('created_at', { ascending: false });
      setCamps((data || []) as ReliefCamp[]);
      setLoading(false);
    })();
  }, []);

  const handleAddCamp = async () => {
    if (!newCamp.name) { toast.error('Camp name required'); return; }
    const { data, error } = await supabase.from('relief_camps').insert({
      name: newCamp.name, location_name: newCamp.location,
      capacity: newCamp.capacity, manager_name: newCamp.manager,
      contact_phone: newCamp.phone, food_stock: 100, water_stock: 200, medicine_stock: 50,
    }).select().maybeSingle();

    if (error) { toast.error(error.message); return; }
    setCamps(prev => [data as ReliefCamp, ...prev]);
    setDialogOpen(false);
    setNewCamp({ name: '', location: '', capacity: 100, manager: '', phone: '' });
    toast.success('Relief camp created!');
  };

  const handleUpdateOccupancy = async (camp: ReliefCamp, delta: number) => {
    const newOcc = Math.max(0, Math.min(camp.capacity, camp.current_occupancy + delta));
    const newStatus = newOcc >= camp.capacity ? 'full' : 'open';
    await supabase.from('relief_camps').update({ current_occupancy: newOcc, status: newStatus }).eq('id', camp.id);
    setCamps(prev => prev.map(c => c.id === camp.id ? { ...c, current_occupancy: newOcc, status: newStatus } : c));
  };

  const handleUpdateStock = async (camp: ReliefCamp, field: 'food_stock' | 'water_stock' | 'medicine_stock', delta: number) => {
    const newVal = Math.max(0, camp[field] + delta);
    await supabase.from('relief_camps').update({ [field]: newVal }).eq('id', camp.id);
    setCamps(prev => prev.map(c => c.id === camp.id ? { ...c, [field]: newVal } : c));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Tent className="w-7 h-7 text-primary" /> Relief Camps
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track camp capacity and supplies in real time</p>
        </div>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-chart-5 text-white">
                <Plus className="w-4 h-4 mr-2" /> Add Camp
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Relief Camp</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cname">Camp Name</Label>
                  <Input id="cname" value={newCamp.name} onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cloc">Location</Label>
                  <Input id="cloc" value={newCamp.location} onChange={(e) => setNewCamp({ ...newCamp, location: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ccap">Capacity</Label>
                    <Input id="ccap" type="number" value={newCamp.capacity} onChange={(e) => setNewCamp({ ...newCamp, capacity: parseInt(e.target.value) || 100 })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cman">Manager</Label>
                    <Input id="cman" value={newCamp.manager} onChange={(e) => setNewCamp({ ...newCamp, manager: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cphone">Contact Phone</Label>
                  <Input id="cphone" value={newCamp.phone} onChange={(e) => setNewCamp({ ...newCamp, phone: e.target.value })} />
                </div>
                <Button onClick={handleAddCamp} className="w-full bg-gradient-to-r from-primary to-chart-5 text-white">Create Camp</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {camps.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tent className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No relief camps registered yet</p>
            {canManage && <p className="text-xs text-muted-foreground mt-1">Click "Add Camp" to create one</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {camps.map((camp, i) => {
            const occPct = (camp.current_occupancy / camp.capacity) * 100;
            return (
              <CardAnimation key={camp.id} delay={i * 0.05}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{camp.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{camp.location_name || 'No location'}</p>
                      </div>
                      <Badge className={cn(
                        'capitalize',
                        camp.status === 'open' ? 'bg-green-500' : camp.status === 'full' ? 'bg-red-500' : 'bg-gray-500'
                      )}>
                        {camp.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Occupancy */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium flex items-center gap-1"><Bed className="w-4 h-4 text-primary" /> Occupancy</span>
                        <span className="text-sm">{camp.current_occupancy}/{camp.capacity}</span>
                      </div>
                      <Progress value={occPct} className="h-2" />
                      {canManage && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => handleUpdateOccupancy(camp, -1)}>-1</Button>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateOccupancy(camp, 1)}>+1</Button>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateOccupancy(camp, 5)}>+5</Button>
                        </div>
                      )}
                    </div>

                    {/* Stock levels */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { field: 'food_stock' as const, label: 'Food', icon: Apple, color: 'text-orange-500' },
                        { field: 'water_stock' as const, label: 'Water', icon: Droplets, color: 'text-blue-500' },
                        { field: 'medicine_stock' as const, label: 'Meds', icon: Pill, color: 'text-green-500' },
                      ].map(stock => (
                        <div key={stock.field} className="p-3 rounded-lg border border-border text-center">
                          <stock.icon className={cn('w-5 h-5 mx-auto mb-1', stock.color)} />
                          <p className="text-lg font-bold">{camp[stock.field]}</p>
                          <p className="text-xs text-muted-foreground">{stock.label}</p>
                          {canManage && (
                            <div className="flex gap-1 justify-center mt-1">
                              <button onClick={() => handleUpdateStock(camp, stock.field, -10)} className="text-xs w-5 h-5 rounded bg-muted hover:bg-muted/70">-</button>
                              <button onClick={() => handleUpdateStock(camp, stock.field, 10)} className="text-xs w-5 h-5 rounded bg-muted hover:bg-muted/70">+</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Manager info */}
                    {camp.manager_name && (
                      <div className="pt-3 border-t border-border text-xs text-muted-foreground flex justify-between">
                        <span>Manager: {camp.manager_name}</span>
                        {camp.contact_phone && <span>📞 {camp.contact_phone}</span>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardAnimation>
            );
          })}
        </div>
      )}
    </div>
  );
}

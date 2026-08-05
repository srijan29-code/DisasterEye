'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileWarning, Upload, MapPin, Loader2, CheckCircle2, Crosshair } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { supabase, Incident } from '@/lib/supabase';
import { CardAnimation } from '@/components/animations';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const categories = [
  { value: 'flood', label: 'Flood' }, { value: 'fire', label: 'Fire' },
  { value: 'earthquake', label: 'Earthquake' }, { value: 'cyclone', label: 'Cyclone' },
  { value: 'landslide', label: 'Landslide' }, { value: 'building_collapse', label: 'Building Collapse' },
  { value: 'road_blockage', label: 'Road Blockage' }, { value: 'other', label: 'Other' },
];

const priorities = [
  { value: 'low', label: 'Low', color: 'text-green-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'critical', label: 'Critical', color: 'text-red-500' },
];

export default function ReportIncidentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [peopleAffected, setPeopleAffected] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    toast.info('Getting your location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        toast.success('Location captured!');
      },
      (err) => toast.error('Could not get location: ' + err.message)
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !user) { toast.error('Please fill in all required fields'); return; }
    setSubmitting(true);

    const { data, error } = await supabase.from('incidents').insert({
      user_id: user.id, title, description, category, priority,
      location_name: locationName, latitude, longitude, people_affected: peopleAffected,
      image_url: imageUrl, status: 'pending',
    }).select().maybeSingle();

    if (error) {
      toast.error('Failed to submit: ' + error.message);
      setSubmitting(false);
      return;
    }

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Incident Reported',
      message: `Your incident "${title}" has been submitted and is pending review.`,
      type: 'success',
    });

    setSubmitting(false);
    setSubmitted(true);
    toast.success('Incident reported successfully!');

    setTimeout(() => router.push('/dashboard'), 2000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Incident Reported!</h2>
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <FileWarning className="w-7 h-7 text-primary" /> Report Incident
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Report a disaster or emergency situation</p>
      </div>

      <CardAnimation>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Incident Title *</Label>
                <Input id="title" placeholder="e.g., Major flooding on Riverside Drive" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {priorities.map(p => <SelectItem key={p.value} value={p.value} className={p.color}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the situation in detail..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location Name</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="location" placeholder="e.g., Downtown Springfield" value={locationName} onChange={(e) => setLocationName(e.target.value)} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>GPS Coordinates</Label>
                <div className="flex gap-2">
                  <Input placeholder="Latitude" value={latitude ?? ''} readOnly className="flex-1" />
                  <Input placeholder="Longitude" value={longitude ?? ''} readOnly className="flex-1" />
                  <Button type="button" variant="outline" onClick={handleGetLocation}>
                    <Crosshair className="w-4 h-4 mr-1" /> Get Location
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="people">People Affected (estimated)</Label>
                  <Input id="people" type="number" min={0} value={peopleAffected} onChange={(e) => setPeopleAffected(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Image</Label>
                  <div className="flex gap-2">
                    <input type="file" accept="image/*" onChange={handleImageUpload} id="incident-image" className="hidden" />
                    <Button type="button" variant="outline" onClick={() => document.getElementById('incident-image')?.click()} className="flex-1">
                      <Upload className="w-4 h-4 mr-1" /> {imageUrl ? 'Change' : 'Upload'}
                    </Button>
                  </div>
                  {imageUrl && <img src={imageUrl} alt="Preview" className="max-h-32 rounded-lg" />}
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-primary to-chart-5 text-white hover:opacity-90">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Incident Report'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </CardAnimation>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, User, Lock, Bell, Globe, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { supabase } from '@/lib/supabase';
import { CardAnimation } from '@/components/animations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(profile?.display_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Notification prefs (localStorage-based demo)
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [language, setLanguage] = useState('en');

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      display_name: name, phone, location, bio,
    }).eq('id', user.id);
    if (error) { toast.error(error.message); setSaving(false); return; }
    await refreshProfile();
    setSaving(false);
    toast.success('Profile updated successfully');
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast.error(error.message); setUpdatingPassword(false); return; }
    setUpdatingPassword(false);
    setNewPassword('');
    toast.success('Password updated successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-primary" /> Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-1" /> Profile</TabsTrigger>
          <TabsTrigger value="appearance"><Sun className="w-4 h-4 mr-1" /> Appearance</TabsTrigger>
          <TabsTrigger value="security"><Lock className="w-4 h-4 mr-1" /> Security</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-1" /> Alerts</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <CardAnimation>
            <Card>
              <CardHeader><CardTitle className="text-base">Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-chart-5 text-white text-2xl">
                      {name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile?.email}</p>
                    <Badge className="mt-1 capitalize">{profile?.role || 'citizen'}</Badge>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loc">Location</Label>
                  <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
                </div>
                <Button onClick={handleSaveProfile} disabled={saving} className="bg-gradient-to-r from-primary to-chart-5 text-white">
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                </Button>
              </CardContent>
            </Card>
          </CardAnimation>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <CardAnimation>
            <Card>
              <CardHeader><CardTitle className="text-base">Theme & Appearance</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-3 block">Theme Mode</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['light', 'dark'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-lg border transition-all',
                          theme === t ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                        )}
                      >
                        {t === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        <span className="capitalize font-medium">{t} Mode</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <Label className="mb-2 block"><Globe className="w-4 h-4 inline mr-1" /> Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </CardAnimation>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <CardAnimation>
            <Card>
              <CardHeader><CardTitle className="text-base">Security</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newpass">New Password</Label>
                  <Input id="newpass" type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Min. 6 characters</p>
                </div>
                <Button onClick={handleUpdatePassword} disabled={updatingPassword} className="bg-gradient-to-r from-primary to-chart-5 text-white">
                  {updatingPassword ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : 'Update Password'}
                </Button>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Account email</p>
                  <p className="text-sm font-medium">{profile?.email}</p>
                </div>
              </CardContent>
            </Card>
          </CardAnimation>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <CardAnimation>
            <Card>
              <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Email Notifications', desc: 'Receive updates via email', value: emailNotifs, set: setEmailNotifs },
                  { label: 'Push Notifications', desc: 'In-app push alerts', value: pushNotifs, set: setPushNotifs },
                  { label: 'Emergency Alerts', desc: 'Critical disaster alerts in real time', value: emergencyAlerts, set: setEmergencyAlerts },
                ].map(pref => (
                  <div key={pref.label} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium">{pref.label}</p>
                      <p className="text-xs text-muted-foreground">{pref.desc}</p>
                    </div>
                    <Switch checked={pref.value} onCheckedChange={pref.set} />
                  </div>
                ))}
                <Button onClick={() => toast.success('Preferences saved')} className="bg-gradient-to-r from-primary to-chart-5 text-white">
                  <Save className="w-4 h-4 mr-2" /> Save Preferences
                </Button>
              </CardContent>
            </Card>
          </CardAnimation>
        </TabsContent>
      </Tabs>
    </div>
  );
}

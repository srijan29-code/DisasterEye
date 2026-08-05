'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Mail, Lock, User, ArrowRight, AlertCircle, Shield, Users, Ambulance } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { AnimatedBackground } from '@/components/animations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const roles = [
  { value: 'citizen', label: 'Citizen', icon: User, desc: 'Report incidents and get alerts' },
  { value: 'volunteer', label: 'Volunteer', icon: Users, desc: 'Join rescue and relief efforts' },
  { value: 'rescue_team', label: 'Rescue Team', icon: Ambulance, desc: 'Coordinate rescue operations' },
  { value: 'admin', label: 'Government Admin', icon: Shield, desc: 'Manage and oversee operations' },
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name, role } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        display_name: name,
        role,
      });

      if (role === 'volunteer') {
        await supabase.from('volunteers').insert({
          user_id: data.user.id,
          status: 'pending',
        });
      }

      toast.success('Account created! Please sign in.');
      router.push('/login');
    }
  };

  const handleGoogleLogin = async () => {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (oauthError) setError(oauthError.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 relative">
      <AnimatedBackground />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-chart-5 flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">DisasterEye <span className="gradient-text">AI</span></span>
        </Link>

        <Card className="glass">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <p className="text-sm text-muted-foreground">Join the emergency response network</p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Select your role</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={cn(
                        'flex flex-col items-start p-3 rounded-lg border text-left transition-all',
                        role === r.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                      )}
                    >
                      <r.icon className={cn('w-5 h-5 mb-1', role === r.value ? 'text-primary' : 'text-muted-foreground')} />
                      <span className="text-sm font-medium">{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-chart-5 text-white hover:opacity-90">
                {loading ? 'Creating account...' : 'Create Account'} {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <span className="relative bg-card px-2 text-xs text-muted-foreground">OR</span>
            </div>

            <Button variant="outline" onClick={handleGoogleLogin} className="w-full mb-4">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Satellite, Brain, MessageSquare, MapPin, BarChart3, Users, Shield, FileText,
  ArrowRight, Play, Zap, Eye, Activity, Heart, Building2, Sparkles, Menu, X,
  ChevronDown, Globe, Cpu, BellRing, TrendingUp, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedCounter } from '@/components/animated-counter';
import { AnimatedBackground, CardAnimation } from '@/components/animations';
import { useTheme } from '@/lib/theme-context';
import { Moon, Sun } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Image Analysis', desc: 'Upload disaster photos for instant AI-powered detection of disaster type, severity, and objects affected.', color: 'text-blue-500' },
  { icon: MessageSquare, title: 'Emergency Chatbot', desc: '24/7 AI assistant providing safety guidance, CPR instructions, and evacuation procedures.', color: 'text-green-500' },
  { icon: MapPin, title: 'Live Incident Map', desc: 'Real-time interactive map showing incidents, shelters, hospitals, and danger zones near you.', color: 'text-red-500' },
  { icon: Activity, title: 'AI Severity Engine', desc: 'Automatic severity scoring with damage estimates and rescue team recommendations.', color: 'text-orange-500' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Beautiful charts tracking incidents, resolved cases, active disasters, and relief metrics.', color: 'text-purple-500' },
  { icon: Users, title: 'Volunteer Network', desc: 'Coordinate volunteers with skill matching, task assignment, and a live leaderboard.', color: 'text-cyan-500' },
  { icon: Building2, title: 'Relief Camp Management', desc: 'Track camp capacity, occupancy, and food, water, and medicine stock in real time.', color: 'text-teal-500' },
  { icon: FileText, title: 'PDF Report Generation', desc: 'Generate professional incident reports with images, severity, and recommendations.', color: 'text-indigo-500' },
];

const howItWorks = [
  { step: '01', icon: Eye, title: 'Detect & Report', desc: 'Citizens and sensors detect disasters. Upload images or report incidents through the platform with GPS coordinates.' },
  { step: '02', icon: Cpu, title: 'AI Analysis', desc: 'Gemini-powered AI analyzes uploaded images and reports to determine disaster type, severity, and required response.' },
  { step: '03', icon: Shield, title: 'Coordinate Response', desc: 'Rescue teams, volunteers, and relief camps are coordinated based on AI recommendations and real-time priorities.' },
  { step: '04', icon: Heart, title: 'Provide Relief', desc: 'Citizens receive real-time alerts, shelter information, and emergency guidance. Track relief until resolution.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Emergency Director, Red Cross', avatar: '', text: 'DisasterEye AI reduced our incident response time by 60%. The AI image analysis gives us ground truth in seconds, not hours.' },
  { name: 'Rajesh Kumar', role: 'District Collector', avatar: '', text: 'During the monsoon floods, the live map and volunteer coordination saved over 200 lives. This is the future of disaster management.' },
  { name: 'Maria Rodriguez', role: 'NGO Field Coordinator', avatar: '', text: 'The relief camp tracking is a game changer. We always know exactly how many beds and supplies are available, in real time.' },
];

const faqs = [
  { q: 'How does DisasterEye AI detect disasters?', a: 'Our platform combines citizen reports, sensor data, and AI image analysis. When you upload a photo, our Gemini-powered engine identifies the disaster type, assesses severity, detects affected objects, and generates actionable recommendations — all in seconds.' },
  { q: 'Can I use DisasterEye AI without technical knowledge?', a: 'Absolutely. The platform is designed for citizens, volunteers, rescue teams, and government officials alike. If you can use a smartphone, you can report incidents, get AI guidance, and coordinate relief.' },
  { q: 'Is the emergency chatbot available 24/7?', a: 'Yes. The AI assistant is always available and provides structured safety guidance for floods, fires, earthquakes, cyclones, landslides, and medical emergencies including CPR instructions and first aid.' },
  { q: 'How does volunteer coordination work?', a: 'Volunteers register with their skills and availability. When incidents are reported nearby, the system matches tasks to qualified volunteers. Completed tasks build your rescue contribution score on the live leaderboard.' },
  { q: 'What data does the analytics dashboard show?', a: 'Real-time charts display total incidents, resolved vs. pending cases, active disasters, citizens assisted, volunteer activity, and disaster category breakdowns. Perfect for government reporting and resource allocation.' },
  { q: 'Can I generate official reports for my organization?', a: 'Yes. Any incident can be exported as a professional PDF report containing the summary, images, AI severity analysis, recommendations, timestamp, and GPS location — ready for government or NGO documentation.' },
];

const stats = [
  { label: 'Disasters Detected', value: 12483, suffix: '+' },
  { label: 'Lives Assisted', value: 47290, suffix: '+' },
  { label: 'Relief Camps', value: 342, suffix: '' },
  { label: 'AI Analyses', value: 89156, suffix: '+' },
];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-chart-5 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">DisasterEye <span className="gradient-text">AI</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
              <Link href="/#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</Link>
              <Link href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup" className="hidden sm:block">
                <Button size="sm" className="bg-gradient-to-r from-primary to-chart-5 text-white hover:opacity-90">
                  Start Free
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm hover:bg-muted rounded-md">Features</Link>
              <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm hover:bg-muted rounded-md">How it Works</Link>
              <Link href="/#testimonials" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm hover:bg-muted rounded-md">Testimonials</Link>
              <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm hover:bg-muted rounded-md">FAQ</Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm hover:bg-muted rounded-md">Sign In</Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm hover:bg-muted rounded-md">Start Free</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <AnimatedBackground />
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
              <Sparkles className="w-3 h-3 mr-1" /> AI-Powered Emergency Management
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              AI That <span className="gradient-text">Saves Lives</span><br />During Disasters
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Detect disasters, assess severity, coordinate rescue operations, and provide real-time assistance — powered by AI, built for governments, NGOs, rescue teams, and citizens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-primary to-chart-5 text-white hover:opacity-90 w-full sm:w-auto">
                  Start Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Play className="w-4 h-4 mr-2" /> Watch Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Earth / globe animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative mt-16 mx-auto max-w-md"
          >
            <div className="relative w-64 h-64 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-chart-5 animate-spin-slow opacity-20" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/30 to-chart-5/30 backdrop-blur-xl border border-primary/20" />
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-500/40 to-green-500/40 animate-spin-slow" style={{ animationDuration: '30s' }}>
                <Globe className="absolute inset-0 m-auto w-20 h-20 text-white/80" />
              </div>
              {/* Orbiting dots */}
              {[0, 1, 2, 4].map((i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-primary"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 0',
                    animation: `spin-slow ${10 + i * 2}s linear infinite`,
                    transform: `rotate(${i * 90}deg) translateX(120px)`,
                  }}
                />
              ))}
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse-ring" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-border/50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <CardAnimation key={stat.label} delay={i * 0.1}>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold gradient-text mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </CardAnimation>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20"><Zap className="w-3 h-3 mr-1" /> Features</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Everything you need to<br />manage any disaster</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">From AI-powered detection to real-time relief coordination, DisasterEye AI covers the entire emergency management lifecycle.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <CardAnimation key={feature.title} delay={i * 0.05}>
                <Card className="h-full hover:shadow-lg transition-shadow group cursor-default">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </CardAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20"><Activity className="w-3 h-3 mr-1" /> Process</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Four steps from disaster detection to relief delivery.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <CardAnimation key={step.step} delay={i * 0.1}>
                <div className="relative">
                  <div className="text-6xl font-bold text-primary/10 mb-2">{step.step}</div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-chart-5 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </CardAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20"><Heart className="w-3 h-3 mr-1" /> Testimonials</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Trusted by emergency<br />professionals worldwide</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <CardAnimation key={t.name} delay={i * 0.1}>
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <p className="text-sm leading-relaxed mb-6">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={t.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-chart-5 text-white">
                          {t.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20"><ChevronDown className="w-3 h-3 mr-1" /> FAQ</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Frequently asked questions</h2>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass rounded-lg px-6 border-border">
                <AccordionTrigger className="text-left text-base font-medium">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-chart-5 to-primary animate-gradient" />
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative px-8 py-16 text-center text-white">
            <BellRing className="w-12 h-12 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Ready to save lives?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">Join governments, NGOs, and rescue teams using DisasterEye AI to protect communities during disasters.</p>
            <Link href="/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-chart-5 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">DisasterEye AI</span>
              </Link>
              <p className="text-sm text-muted-foreground">AI-powered disaster detection, emergency coordination, and smart relief management.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-foreground">How it Works</Link></li>
                <li><Link href="/signup" className="hover:text-foreground">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-foreground">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
                <li><Link href="/dashboard/ai-detection" className="hover:text-foreground">AI Detection</Link></li>
                <li><Link href="/dashboard/chat" className="hover:text-foreground">Emergency Chat</Link></li>
                <li><Link href="/dashboard/map" className="hover:text-foreground">Live Map</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Emergency</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><TrendingUp className="w-3 h-3" /> 24/7 AI Assistant</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Real-time Alerts</li>
                <li className="flex items-center gap-2"><Satellite className="w-3 h-3" /> Satellite Detection</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2025 DisasterEye AI. All rights reserved.</p>
            <p className="text-sm text-muted-foreground">Built for a safer world.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

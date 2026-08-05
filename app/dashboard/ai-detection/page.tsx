'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Brain, Loader2, Image as ImageIcon, AlertTriangle, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { supabase, AiAnalysis } from '@/lib/supabase';
import { analyzeImage, AnalysisResult } from '@/lib/ai-engine';
import { CardAnimation } from '@/components/animations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const categories = [
  { value: 'flood', label: 'Flood' }, { value: 'fire', label: 'Fire' },
  { value: 'earthquake', label: 'Earthquake' }, { value: 'cyclone', label: 'Cyclone' },
  { value: 'landslide', label: 'Landslide' }, { value: 'building_collapse', label: 'Building Collapse' },
  { value: 'road_blockage', label: 'Road Blockage' }, { value: 'other', label: 'Other' },
];

const severityConfig: Record<string, { color: string; label: string }> = {
  low: { color: 'text-green-500', label: 'Low' },
  medium: { color: 'text-yellow-500', label: 'Medium' },
  high: { color: 'text-orange-500', label: 'High' },
  critical: { color: 'text-red-500', label: 'Critical' },
};

export default function AiDetectionPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedAnalysis, setSavedAnalysis] = useState<AiAnalysis | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      toast.error('Please upload an image first');
      return;
    }
    setAnalyzing(true);
    setResult(null);

    // Simulate AI processing time
    await new Promise(r => setTimeout(r, 2000));

    const analysis = analyzeImage(imagePreview, description, category || undefined);
    setResult(analysis);
    setAnalyzing(false);

    // Save to database
    if (user) {
      const { data } = await supabase.from('ai_analyses').insert({
        user_id: user.id,
        disaster_type: analysis.disaster_type,
        confidence_score: analysis.confidence_score,
        severity: analysis.severity,
        severity_score: analysis.severity_score,
        objects_detected: analysis.objects_detected,
        buildings_affected: analysis.buildings_affected,
        roads_blocked: analysis.roads_blocked,
        people_visible: analysis.people_visible,
        estimated_damage: analysis.estimated_damage,
        rescue_teams_required: analysis.rescue_teams_required,
        recommendations: analysis.recommendations,
        summary: analysis.summary,
        image_url: imagePreview,
      }).select().maybeSingle();

      if (data) {
        setSavedAnalysis(data as AiAnalysis);
        toast.success('AI analysis complete and saved!');
      } else {
        toast.success('AI analysis complete!');
      }
    } else {
      toast.success('AI analysis complete!');
    }
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(22); doc.setTextColor(30, 100, 200);
    doc.text('DisasterEye AI — Analysis Report', 20, y); y += 10;
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, y); y += 15;

    doc.setDrawColor(200); doc.line(20, y, 190, y); y += 10;

    doc.setFontSize(14); doc.setTextColor(0);
    doc.text('Disaster Summary', 20, y); y += 8;
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(result.summary, 170);
    doc.text(summaryLines, 20, y); y += summaryLines.length * 5 + 5;

    doc.setFontSize(12); doc.text(`Disaster Type: ${result.disaster_type.replace('_', ' ')}`, 20, y); y += 6;
    doc.text(`Severity: ${severityConfig[result.severity].label} (${result.severity_score}/100)`, 20, y); y += 6;
    doc.text(`Confidence Score: ${result.confidence_score}%`, 20, y); y += 10;

    doc.setFontSize(14); doc.text('Detected Objects', 20, y); y += 8;
    doc.setFontSize(10);
    result.objects_detected.forEach(obj => { doc.text(`• ${obj}`, 25, y); y += 5; });
    y += 5;

    doc.setFontSize(14); doc.text('Impact Assessment', 20, y); y += 8;
    doc.setFontSize(10);
    doc.text(`Buildings Affected: ${result.buildings_affected}`, 25, y); y += 5;
    doc.text(`Roads Blocked: ${result.roads_blocked}`, 25, y); y += 5;
    doc.text(`People Visible: ${result.people_visible}`, 25, y); y += 5;
    doc.text(`Rescue Teams Required: ${result.rescue_teams_required}`, 25, y); y += 5;
    doc.text(`Estimated Damage: ${result.estimated_damage}`, 25, y); y += 10;

    doc.setFontSize(14); doc.text('Recommendations', 20, y); y += 8;
    doc.setFontSize(10);
    result.recommendations.forEach(rec => {
      const lines = doc.splitTextToSize(`• ${rec}`, 170);
      doc.text(lines, 25, y); y += lines.length * 5 + 2;
    });

    doc.save(`disastereye-report-${Date.now()}.pdf`);
    toast.success('PDF report downloaded!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary" /> AI Image Analysis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Upload a disaster photo for instant AI-powered analysis</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload section */}
        <CardAnimation>
          <Card>
            <CardHeader><CardTitle className="text-base">Upload Disaster Image</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary/50',
                  imagePreview ? 'border-primary/30' : 'border-border'
                )}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    <p className="text-xs text-muted-foreground mt-2">Click to change image</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Disaster Category (optional)</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Auto-detect or select manually" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description" placeholder="Describe what you see in the image..."
                  value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                />
              </div>

              <Button onClick={handleAnalyze} disabled={!imagePreview || analyzing} className="w-full bg-gradient-to-r from-primary to-chart-5 text-white hover:opacity-90">
                {analyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing with AI...</> : <><Brain className="w-4 h-4 mr-2" /> Analyze Image</>}
              </Button>
            </CardContent>
          </Card>
        </CardAnimation>

        {/* Results section */}
        <CardAnimation delay={0.1}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">AI Analysis Result</CardTitle>
              {result && (
                <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                  <Download className="w-3 h-3 mr-1" /> PDF
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {analyzing ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 py-8">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">AI is analyzing the image...</p>
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </motion.div>
                ) : result ? (
                  <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Disaster type + confidence */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-xs text-muted-foreground">Disaster Type</p>
                        <p className="font-semibold capitalize">{result.disaster_type.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="font-semibold text-primary">{result.confidence_score}%</p>
                      </div>
                    </div>

                    {/* Severity */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Severity Score</span>
                        <Badge className={cn('capitalize', severityConfig[result.severity].color)}>
                          {severityConfig[result.severity].label}
                        </Badge>
                      </div>
                      <Progress value={result.severity_score} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{result.severity_score}/100</p>
                    </div>

                    {/* Objects detected */}
                    <div>
                      <p className="text-sm font-medium mb-2">Objects Detected</p>
                      <div className="flex flex-wrap gap-2">
                        {result.objects_detected.map((obj, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{obj}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Impact metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Buildings Affected', value: result.buildings_affected },
                        { label: 'Roads Blocked', value: result.roads_blocked },
                        { label: 'People Visible', value: result.people_visible },
                        { label: 'Rescue Teams Needed', value: result.rescue_teams_required },
                      ].map(metric => (
                        <div key={metric.label} className="p-3 rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground">{metric.label}</p>
                          <p className="text-xl font-bold">{metric.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div>
                      <p className="text-sm font-medium mb-1">AI Summary</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
                    </div>

                    {/* Estimated damage */}
                    <div>
                      <p className="text-sm font-medium mb-1">Estimated Damage</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.estimated_damage}</p>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-orange-500" /> Recommendations
                      </p>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">→</span> {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mb-3 opacity-40" />
                    <p className="text-sm text-muted-foreground">Upload an image and click Analyze to see AI results</p>
                    <p className="text-xs text-muted-foreground mt-1">Detects floods, fires, earthquakes, and more</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </CardAnimation>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}

'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, Loader2, Tent, Hospital, Shield, AlertTriangle, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase, Incident, ReliefCamp } from '@/lib/supabase';
import { CardAnimation } from '@/components/animations';
import { cn } from '@/lib/utils';

const categoryColors: Record<string, string> = {
  flood: '#3b82f6', fire: '#ef4444', earthquake: '#f59e0b', cyclone: '#8b5cf6',
  landslide: '#84cc16', building_collapse: '#ec4899', road_blockage: '#06b6d4', other: '#64748b',
};

// Static map points for shelters, hospitals, police
const staticPoints = [
  { type: 'shelter', name: 'Community Shelter A', lat: 28.6139, lng: 77.2090, icon: Tent, color: '#22c55e' },
  { type: 'shelter', name: 'Relief Center B', lat: 28.7041, lng: 77.1025, icon: Tent, color: '#22c55e' },
  { type: 'hospital', name: 'City Hospital', lat: 28.5535, lng: 77.2588, icon: Hospital, color: '#ef4444' },
  { type: 'hospital', name: 'General Hospital', lat: 28.6692, lng: 77.4538, icon: Hospital, color: '#ef4444' },
  { type: 'police', name: 'Central Police Station', lat: 28.6280, lng: 77.2210, icon: Shield, color: '#3b82f6' },
];

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [camps, setCamps] = useState<ReliefCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      const [incData, campData] = await Promise.all([
        supabase.from('incidents').select('*').order('created_at', { ascending: false }),
        supabase.from('relief_camps').select('*'),
      ]);
      setIncidents((incData.data || []) as Incident[]);
      setCamps((campData.data || []) as ReliefCamp[]);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    (async () => {
      const L = (await import('leaflet')).default;

      const map = L.map(mapRef.current!, { zoomControl: true }).setView([28.6139, 77.2090], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);
      mapInstanceRef.current = map;
      updateMarkers();
    })();
  }, []);

  useEffect(() => {
    updateMarkers();
  }, [incidents, camps, filter]);

  const updateMarkers = async () => {
    if (!mapInstanceRef.current) return;
    const L = (await import('leaflet')).default;

    markersRef.current.forEach(m => mapInstanceRef.current.removeLayer(m));
    markersRef.current = [];

    const filteredIncidents = filter === 'all' || filter === 'incidents'
      ? incidents.filter(i => i.latitude && i.longitude)
      : [];
    const showShelters = filter === 'all' || filter === 'shelters';
    const showCamps = filter === 'all' || filter === 'camps';

    filteredIncidents.forEach(incident => {
      const color = categoryColors[incident.category] || '#64748b';
      const marker = L.circleMarker([incident.latitude!, incident.longitude!], {
        radius: 12, fillColor: color, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.8,
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <strong>${incident.title}</strong><br/>
          <span style="text-transform:capitalize;font-size:11px;opacity:0.7">${incident.category.replace('_', ' ')} · ${incident.priority} priority · ${incident.status}</span>
          ${incident.description ? `<p style="margin-top:4px;font-size:12px;opacity:0.8">${incident.description}</p>` : ''}
        </div>
      `);
      marker.on('click', () => setSelectedIncident(incident));
      markersRef.current.push(marker);
    });

    if (showCamps) {
      camps.forEach(camp => {
        if (!camp.latitude || !camp.longitude) return;
        const marker = L.marker([camp.latitude, camp.longitude], {
          icon: L.divIcon({ html: `<div style="font-size:24px">⛺</div>`, iconSize: [30, 30], className: '' }),
        }).addTo(mapInstanceRef.current);
        marker.bindPopup(`<strong>${camp.name}</strong><br/>Capacity: ${camp.current_occupancy}/${camp.capacity}<br/>Status: ${camp.status}`);
        markersRef.current.push(marker);
      });
    }

    if (showShelters) {
      staticPoints.forEach(pt => {
        const marker = L.marker([pt.lat, pt.lng], {
          icon: L.divIcon({ html: `<div style="font-size:20px">${pt.type === 'shelter' ? '🏠' : pt.type === 'hospital' ? '🏥' : '🚓'}</div>`, iconSize: [26, 26], className: '' }),
        }).addTo(mapInstanceRef.current);
        marker.bindPopup(`<strong>${pt.name}</strong><br/>Type: ${pt.type}`);
        markersRef.current.push(marker);
      });
    }
  };

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'incidents', label: 'Incidents' },
    { value: 'camps', label: 'Relief Camps' },
    { value: 'shelters', label: 'Shelters & Services' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <MapIcon className="w-7 h-7 text-primary" /> Live Map
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time incidents, shelters, and relief camps</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={filter === f.value ? 'bg-gradient-to-r from-primary to-chart-5 text-white' : ''}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <CardAnimation>
        <Card>
          <CardContent className="p-0">
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              )}
              <div ref={mapRef} className="w-full h-[600px] rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </CardAnimation>

      {/* Legend */}
      <CardAnimation delay={0.1}>
        <Card>
          <CardHeader><CardTitle className="text-base">Map Legend</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(categoryColors).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-sm capitalize">{cat.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2"><span className="text-lg">⛺</span> <span className="text-sm">Relief Camp</span></div>
              <div className="flex items-center gap-2"><span className="text-lg">🏥</span> <span className="text-sm">Hospital</span></div>
              <div className="flex items-center gap-2"><span className="text-lg">🚓</span> <span className="text-sm">Police</span></div>
            </div>
          </CardContent>
        </Card>
      </CardAnimation>

      {/* Selected incident details */}
      {selectedIncident && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30">
            <CardHeader><CardTitle className="text-base">Selected Incident</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{selectedIncident.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedIncident.description || 'No description'}</p>
                  <p className="text-xs text-muted-foreground mt-2">{selectedIncident.location_name || 'Unknown location'}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Badge className="capitalize text-xs">{selectedIncident.category.replace('_', ' ')}</Badge>
                  <Badge variant="secondary" className="capitalize text-xs">{selectedIncident.priority}</Badge>
                  <Badge variant="outline" className="capitalize text-xs">{selectedIncident.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

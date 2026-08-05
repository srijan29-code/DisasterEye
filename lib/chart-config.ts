import type { ChartConfig } from '@/components/ui/chart';

export const chartConfig: ChartConfig = {
  incidents: { label: 'Incidents', color: 'hsl(var(--chart-1))' },
  resolved: { label: 'Resolved', color: 'hsl(var(--chart-2))' },
  pending: { label: 'Pending', color: 'hsl(var(--chart-3))' },
  active: { label: 'Active', color: 'hsl(var(--chart-4))' },
  critical: { label: 'Critical', color: 'hsl(var(--destructive))' },
  volunteers: { label: 'Volunteers', color: 'hsl(var(--chart-5))' },
  citizens: { label: 'Citizens Helped', color: 'hsl(var(--chart-2))' },
  flood: { label: 'Flood', color: '#3b82f6' },
  fire: { label: 'Fire', color: '#ef4444' },
  earthquake: { label: 'Earthquake', color: '#f59e0b' },
  cyclone: { label: 'Cyclone', color: '#8b5cf6' },
  landslide: { label: 'Landslide', color: '#84cc16' },
  building_collapse: { label: 'Building Collapse', color: '#ec4899' },
  road_blockage: { label: 'Road Blockage', color: '#06b6d4' },
  other: { label: 'Other', color: '#64748b' },
};

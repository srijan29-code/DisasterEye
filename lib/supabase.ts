'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  role: 'citizen' | 'volunteer' | 'rescue_team' | 'admin';
  avatar_url: string;
  phone: string;
  skills: string[];
  location: string;
  bio: string;
  created_at: string;
  updated_at: string;
};

export type Incident = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string;
  image_url: string;
  people_affected: number;
  created_at: string;
  updated_at: string;
};

export type AiAnalysis = {
  id: string;
  incident_id: string | null;
  user_id: string;
  disaster_type: string;
  confidence_score: number;
  severity: string;
  severity_score: number;
  objects_detected: string[];
  buildings_affected: number;
  roads_blocked: number;
  people_visible: number;
  estimated_damage: string;
  rescue_teams_required: number;
  recommendations: string[];
  summary: string;
  image_url: string;
  created_at: string;
};

export type Volunteer = {
  id: string;
  user_id: string;
  status: string;
  availability: string;
  skills: string[];
  experience_years: number;
  completed_tasks: number;
  active_tasks: number;
  rating: number;
  certifications: string[];
  preferred_location: string;
  created_at: string;
  updated_at: string;
};

export type ReliefCamp = {
  id: string;
  name: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number;
  current_occupancy: number;
  food_stock: number;
  water_stock: number;
  medicine_stock: number;
  status: string;
  manager_name: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
};

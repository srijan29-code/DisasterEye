/*
# DisasterEye AI - Core Schema

## Overview
Multi-tenant disaster management platform. Authenticated users (citizens, volunteers, rescue teams, admins) report incidents, get AI analysis, coordinate relief, and track analytics.

## Tables
1. profiles - extends auth.users with role, display name, avatar, phone, skills
2. incidents - disaster reports with location, category, priority, status, images
3. ai_analyses - AI-generated analysis linked to incidents
4. volunteers - volunteer profiles with availability, skills, rating
5. relief_camps - camp management with capacity, occupancy, stock levels
6. chat_messages - emergency chatbot conversation history
7. notifications - user notifications/alerts

## Security
- All tables RLS-enabled, scoped to authenticated users
- profiles: users manage own profile; admins read all
- incidents: all authenticated read; owner/admin update/delete
- ai_analyses: readable by all; insert by owner
- volunteers: all read; owner/admin update
- relief_camps: all read; admin/rescue_team manage
- chat_messages + notifications: owner-only
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen','volunteer','rescue_team','admin')),
  avatar_url text DEFAULT '',
  phone text DEFAULT '',
  skills text[] DEFAULT '{}',
  location text DEFAULT '',
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (category IN ('flood','fire','earthquake','cyclone','landslide','building_collapse','road_blockage','other')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','resolved','rejected')),
  latitude double precision,
  longitude double precision,
  location_name text DEFAULT '',
  image_url text DEFAULT '',
  people_affected integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON incidents(created_at DESC);

DROP POLICY IF EXISTS "incidents_select_all" ON incidents;
CREATE POLICY "incidents_select_all" ON incidents FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "incidents_insert_own" ON incidents;
CREATE POLICY "incidents_insert_own" ON incidents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "incidents_update_own_or_admin" ON incidents;
CREATE POLICY "incidents_update_own_or_admin" ON incidents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "incidents_delete_own_or_admin" ON incidents;
CREATE POLICY "incidents_delete_own_or_admin" ON incidents FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE TABLE IF NOT EXISTS ai_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES incidents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  disaster_type text NOT NULL DEFAULT 'unknown',
  confidence_score numeric DEFAULT 0,
  severity text DEFAULT 'low' CHECK (severity IN ('low','medium','high','critical')),
  severity_score integer DEFAULT 0,
  objects_detected jsonb DEFAULT '[]',
  buildings_affected integer DEFAULT 0,
  roads_blocked integer DEFAULT 0,
  people_visible integer DEFAULT 0,
  estimated_damage text DEFAULT '',
  rescue_teams_required integer DEFAULT 0,
  recommendations jsonb DEFAULT '[]',
  summary text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ai_analyses_incident ON ai_analyses(incident_id);

DROP POLICY IF EXISTS "ai_analyses_select_all" ON ai_analyses;
CREATE POLICY "ai_analyses_select_all" ON ai_analyses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "ai_analyses_insert_own" ON ai_analyses;
CREATE POLICY "ai_analyses_insert_own" ON ai_analyses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended')),
  availability text DEFAULT 'available' CHECK (availability IN ('available','busy','offline')),
  skills text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  completed_tasks integer DEFAULT 0,
  active_tasks integer DEFAULT 0,
  rating numeric DEFAULT 5.0,
  certifications text[] DEFAULT '{}',
  preferred_location text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "volunteers_select_all" ON volunteers;
CREATE POLICY "volunteers_select_all" ON volunteers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "volunteers_insert_own" ON volunteers;
CREATE POLICY "volunteers_insert_own" ON volunteers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "volunteers_update_own_or_admin" ON volunteers;
CREATE POLICY "volunteers_update_own_or_admin" ON volunteers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE TABLE IF NOT EXISTS relief_camps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location_name text DEFAULT '',
  latitude double precision,
  longitude double precision,
  capacity integer NOT NULL DEFAULT 100,
  current_occupancy integer DEFAULT 0,
  food_stock integer DEFAULT 0,
  water_stock integer DEFAULT 0,
  medicine_stock integer DEFAULT 0,
  status text DEFAULT 'open' CHECK (status IN ('open','full','closed')),
  manager_name text DEFAULT '',
  contact_phone text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE relief_camps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "camps_select_all" ON relief_camps;
CREATE POLICY "camps_select_all" ON relief_camps FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "camps_insert_admin" ON relief_camps;
CREATE POLICY "camps_insert_admin" ON relief_camps FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','rescue_team')));

DROP POLICY IF EXISTS "camps_update_admin" ON relief_camps;
CREATE POLICY "camps_update_admin" ON relief_camps FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','rescue_team')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','rescue_team')));

DROP POLICY IF EXISTS "camps_delete_admin" ON relief_camps;
CREATE POLICY "camps_delete_admin" ON relief_camps FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id, created_at);

DROP POLICY IF EXISTS "chat_select_own" ON chat_messages;
CREATE POLICY "chat_select_own" ON chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_insert_own" ON chat_messages;
CREATE POLICY "chat_insert_own" ON chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_delete_own" ON chat_messages;
CREATE POLICY "chat_delete_own" ON chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info','warning','critical','success')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

DROP POLICY IF EXISTS "notif_select_own" ON notifications;
CREATE POLICY "notif_select_own" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_insert_own" ON notifications;
CREATE POLICY "notif_insert_own" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_update_own" ON notifications;
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_delete_own" ON notifications;
CREATE POLICY "notif_delete_own" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated ON profiles;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS incidents_updated ON incidents;
CREATE TRIGGER incidents_updated BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS volunteers_updated ON volunteers;
CREATE TRIGGER volunteers_updated BEFORE UPDATE ON volunteers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS camps_updated ON relief_camps;
CREATE TRIGGER camps_updated BEFORE UPDATE ON relief_camps FOR EACH ROW EXECUTE FUNCTION update_updated_at();

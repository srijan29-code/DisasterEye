# DisasterEye AI

> **AI-Powered Disaster Detection, Emergency Coordination & Smart Relief Management**

A production-ready AI-powered emergency management platform that helps governments, NGOs, rescue teams, and citizens detect disasters, assess severity, coordinate rescue operations, and provide real-time assistance.

## Features

### Landing Page
- Animated hero section with earth/globe animation and floating blobs
- Animated statistics counters
- Feature cards with hover effects
- How-it-works process steps
- Testimonials from emergency professionals
- FAQ accordion
- Footer with navigation

### Authentication
- Email/password sign-up and sign-in
- Google OAuth login
- Forgot password flow
- Role selection: Citizen, Volunteer, Rescue Team, Government Admin
- Automatic profile creation on signup

### Dashboard
- Premium sidebar navigation with smooth animations
- Dark/light mode toggle
- Real-time notification badge
- Responsive mobile drawer

### Feature 1: AI Image Analysis
- Upload disaster photos (flood, fire, earthquake, etc.)
- AI detects: disaster type, confidence score, severity, objects detected
- Estimates: buildings affected, roads blocked, people visible, rescue teams required
- Generates detailed AI report with recommendations
- Export analysis as professional PDF report

### Feature 2: Emergency Chatbot
- 24/7 AI assistant with structured emergency knowledge base
- Covers: flood, fire, earthquake, cyclone, landslide, CPR, first aid, shelters, water purification, food safety, volunteer guidance
- Quick-prompt buttons for common questions
- Chat history persisted to database

### Feature 3: Report Incident
- Form with title, description, category, priority, location
- GPS coordinate capture via browser geolocation
- Image upload
- People affected count
- Stores in Supabase database

### Feature 4: Live Map
- Interactive Leaflet map with OpenStreetMap tiles
- Color-coded incident markers by category
- Relief camp, shelter, hospital, and police markers
- Filter by type (incidents, camps, shelters)
- Click markers for popup details

### Feature 5: AI Severity Engine
- Integrated into image analysis
- Generates severity score (Low/Medium/High/Critical)
- Estimated damage assessment
- Rescue team recommendations

### Feature 6: Analytics
- 14-day incident trend (area chart)
- Disaster category distribution (pie chart)
- Priority distribution (pie chart)
- Status breakdown (bar chart)
- Disaster type radar chart
- Volunteer network statistics

### Feature 7: Volunteer System
- Volunteer registration with skills, experience, certifications
- Nearby rescue task browsing and acceptance
- Task completion tracking
- Live leaderboard with ratings
- Status management (pending/approved/busy/available)

### Feature 8: Relief Camp Management
- Camp details: capacity, occupancy, stock levels
- Food, water, medicine stock tracking
- Live occupancy updates
- Status management (open/full/closed)
- Manager and contact info

### Feature 9: Notification System
- Toast notifications (sonner)
- In-app notification center
- Emergency alerts
- Mark as read / delete

### Feature 10: PDF Report Generation
- Professional incident reports
- Includes: summary, disaster type, severity, detected objects, impact metrics, recommendations
- Downloadable PDF format

### Feature 11: Admin Panel
- User management and overview
- Approve/reject volunteer applications
- Manage incident reports (activate, resolve, delete fake reports)
- Admin-only access control

### Feature 12: Settings
- Profile management (name, phone, location, bio)
- Theme toggle (dark/light)
- Password update
- Notification preferences
- Language selection

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 13 (App Router), React 18, TypeScript |
| Styling | TailwindCSS, shadcn/ui |
| Animations | Framer Motion |
| Data Fetching | TanStack React Query |
| Forms | React Hook Form |
| Icons | Lucide React |
| Maps | Leaflet + OpenStreetMap |
| Charts | Recharts |
| PDF | jsPDF |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| AI | Mock AI engine (structured for Gemini API integration) |

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The Supabase instance is pre-provisioned with the full database schema including:
- `profiles` — user profiles with roles
- `incidents` — disaster reports
- `ai_analyses` — AI-generated analysis records
- `volunteers` — volunteer registrations
- `relief_camps` — camp management
- `chat_messages` — chatbot history
- `notifications` — user notifications

All tables have Row Level Security (RLS) enabled with appropriate policies.

## Database Schema

The schema is multi-tenant with owner-scoped policies:

| Table | Purpose | RLS |
|-------|---------|-----|
| profiles | User data, role, avatar | Owner-scoped, admin read-all |
| incidents | Disaster reports | All-authenticated read, owner/admin write |
| ai_analyses | AI analysis results | All-authenticated read, owner insert |
| volunteers | Volunteer profiles | All read, owner/admin update |
| relief_camps | Camp management | All read, admin/rescue_team manage |
| chat_messages | Chat history | Owner-only |
| notifications | User alerts | Owner-only |

## Deployment

### Vercel (Frontend)
The Next.js app deploys directly to Vercel. Connect your repo and set environment variables.

### Docker
```bash
docker build -t disastereye-ai .
docker run -p 3000:3000 disastereye-ai
```

## AI Integration

The AI analysis engine (`lib/ai-engine.ts`) and chatbot (`lib/chat-engine.ts`) are structured as mock implementations that mimic real AI behavior. To integrate with Gemini API:

1. Deploy a Supabase Edge Function that proxies requests to Gemini
2. Replace the mock `analyzeImage()` call with a fetch to the edge function
3. Replace `getChatResponse()` with a streaming chat completion call

The edge function pattern ensures API keys stay server-side.

## API Documentation

### Database Tables (via Supabase client)

```
profiles:
  - id (uuid, PK, references auth.users)
  - email, display_name, role, avatar_url, phone, skills[], location, bio

incidents:
  - id, user_id, title, description, category, priority, status
  - latitude, longitude, location_name, image_url, people_affected

ai_analyses:
  - id, incident_id, user_id, disaster_type, confidence_score
  - severity, severity_score, objects_detected[], buildings_affected
  - roads_blocked, people_visible, estimated_damage, rescue_teams_required
  - recommendations[], summary

volunteers:
  - id, user_id, status, availability, skills[], experience_years
  - completed_tasks, active_tasks, rating, certifications[]

relief_camps:
  - id, name, location_name, latitude, longitude, capacity
  - current_occupancy, food_stock, water_stock, medicine_stock, status

chat_messages:
  - id, user_id, role, content, created_at

notifications:
  - id, user_id, title, message, type, read, created_at
```

## License

Built for hackathon demonstration. All rights reserved.

---

**DisasterEye AI** — *AI That Saves Lives During Disasters*
# DisasterEye

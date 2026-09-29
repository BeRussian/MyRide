-- =========================================================================
-- MyRide - Supabase Database Schema & Initial Seed
-- העתק והדבק את הקוד הזה ב-SQL Editor של פרויקט ה-Supabase שלך ולחץ Run!
-- =========================================================================

-- 1. טבלת משתמשים / פרופילים (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  bike TEXT,
  bike_model TEXT,
  bike_brand TEXT,
  role TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  friends TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. טבלת נסיעות ומסלולים (Trips)
CREATE TABLE IF NOT EXISTS public.trips (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  original_prompt TEXT,
  date TEXT,
  start_time TEXT,
  weather JSONB,
  creator_id TEXT,
  creator_name TEXT,
  creator_avatar TEXT,
  participants TEXT[] DEFAULT ARRAY[]::TEXT[],
  pending_invites TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_km NUMERIC,
  duration_hours NUMERIC,
  waypoints JSONB,
  reviews JSONB DEFAULT '[]'::JSONB,
  photos JSONB DEFAULT '[]'::JSONB,
  voice_notes JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. טבלת בקשות חברות (Friend Requests)
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id TEXT PRIMARY KEY,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- אפשור גישה פומבית (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- יצירת מדיניות קריאה וכתיבה פתוחה ל-Anon Key עבור הפרויקט
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert profiles" ON public.profiles;
CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update profiles" ON public.profiles;
CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete profiles" ON public.profiles;
CREATE POLICY "Public delete profiles" ON public.profiles FOR DELETE USING (true);


DROP POLICY IF EXISTS "Public read trips" ON public.trips;
CREATE POLICY "Public read trips" ON public.trips FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert trips" ON public.trips;
CREATE POLICY "Public insert trips" ON public.trips FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update trips" ON public.trips;
CREATE POLICY "Public update trips" ON public.trips FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete trips" ON public.trips;
CREATE POLICY "Public delete trips" ON public.trips FOR DELETE USING (true);


DROP POLICY IF EXISTS "Public read friend_requests" ON public.friend_requests;
CREATE POLICY "Public read friend_requests" ON public.friend_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert friend_requests" ON public.friend_requests;
CREATE POLICY "Public insert friend_requests" ON public.friend_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update friend_requests" ON public.friend_requests;
CREATE POLICY "Public update friend_requests" ON public.friend_requests FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete friend_requests" ON public.friend_requests;
CREATE POLICY "Public delete friend_requests" ON public.friend_requests FOR DELETE USING (true);

-- =========================================================================
-- נתוני פתיחה ראשוניים (Initial Seed Data)
-- =========================================================================

INSERT INTO public.profiles (id, name, avatar, bike, bike_model, bike_brand, role, phone, is_admin, friends)
VALUES 
  ('nik', 'ניק', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', 'Kawasaki Ninja 400 (Black)', 'Ninja 400', 'Kawasaki', 'רוכב ספורט', '050-8881234', false, ARRAY['yuval']),
  ('yuval', 'יובל', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', 'Yamaha MT-07', 'MT-07', 'Yamaha', 'רוכב נייקד', '052-4445678', false, ARRAY['nik']),
  ('kfir', 'כפיר', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'KTM 890 Adventure R', '890 Adventure R', 'KTM', 'רוכב אדוונצ''ר', '054-3339012', false, ARRAY[]::TEXT[]),
  ('admin', 'מנהל מערכת (Admin)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'ניהול פלטפורמה', 'Admin', 'System', 'ניהול משתמשים ומערכת', '050-0000000', true, ARRAY['nik', 'yuval', 'kfir'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  avatar = EXCLUDED.avatar,
  bike = EXCLUDED.bike,
  bike_model = EXCLUDED.bike_model,
  bike_brand = EXCLUDED.bike_brand,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  is_admin = EXCLUDED.is_admin,
  friends = EXCLUDED.friends;

-- נסיעת שישי לדוגמה
INSERT INTO public.trips (
  id, title, original_prompt, date, start_time, weather, creator_id, creator_name, creator_avatar,
  participants, pending_invites, total_km, duration_hours, waypoints, reviews, photos, voice_notes
)
VALUES (
  'trip-nik-friday-1',
  'רכיבת שישי: הרי יהודה ובית זית',
  'יום שישי 12/9 רכיבה, יצאנו ב6 בבוקר מקריית אונו, נסענו עד לבית שמש ומשם לנס הרים, עברנו את כל נס הרים עד ירושלים, משם המשכנו לבית זית לקפה דרך הגפן, חזרנו דרך נס הרים והביתה.',
  'יום שישי, 12 בספטמבר 2026',
  '06:00',
  '{"condition": "sunny", "temp": 24, "label": "שמש נעימה וראות מעולה (24°C)"}'::JSONB,
  'nik',
  'ניק',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  ARRAY['nik', 'yuval', 'kfir'],
  ARRAY[]::TEXT[],
  144,
  3.6,
  '[
    {"id": "wp-1", "name": "קריית אונו (נקודת יציאה)", "category": "start", "lat": 32.0298, "lng": 34.8580, "time": "06:00", "stopDurationMinutes": 0, "description": "יציאה ב-06:00 מקריית אונו עם מיכלים מלאים"},
    {"id": "wp-2", "name": "בית שמש", "category": "poi", "lat": 31.7486, "lng": 34.9892, "time": "06:25", "stopDurationMinutes": 0, "description": "מעבר צומת שמשון לכיוון העליות"},
    {"id": "wp-3", "name": "נס הרים (עלייה מפותלת)", "category": "twisties", "lat": 31.7242, "lng": 35.0345, "time": "06:40", "stopDurationMinutes": 0, "description": "כביש 3866 המפותל - מקטע רכיבה טכני ומהנה"},
    {"id": "wp-4", "name": "בר בהר (עצירה ומנוחה)", "category": "poi", "lat": 31.7212, "lng": 35.0567, "time": "06:55", "stopDurationMinutes": 15, "description": "עצירה קצרה למים ומפגש רוכבים בצומת נס הרים"},
    {"id": "wp-5", "name": "ירושלים (עין כרם)", "category": "poi", "lat": 31.7656, "lng": 35.1582, "time": "07:25", "stopDurationMinutes": 0, "description": "חצייה דרך כביש 386 ונוף הרי יהודה"},
    {"id": "wp-6", "name": "בית זית - קפה דרך הגפן", "category": "cafe", "lat": 31.7915, "lng": 35.1524, "time": "07:45", "stopDurationMinutes": 45, "description": "ארוחת בוקר, קפה משובח ומנוחה בגינה הפסטורלית", "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=31.7915,35.1524"},
    {"id": "wp-7", "name": "חזרה דרך נס הרים", "category": "twisties", "lat": 31.7242, "lng": 35.0345, "time": "08:50", "stopDurationMinutes": 0, "description": "ירידה קצבית ומהנה חזרה מערבה"},
    {"id": "wp-8", "name": "קריית אונו (סיום)", "category": "end", "lat": 32.0298, "lng": 34.8580, "time": "09:35", "stopDurationMinutes": 0, "description": "חזרה הביתה בשלום"}
  ]'::JSONB,
  '[]'::JSONB,
  '[]'::JSONB,
  '[]'::JSONB
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  waypoints = EXCLUDED.waypoints,
  participants = EXCLUDED.participants;

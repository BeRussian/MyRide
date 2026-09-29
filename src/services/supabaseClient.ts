import { createClient } from '@supabase/supabase-js';
import type { User, Trip } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ytjnyhqbbbclidtpqzor.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0am55aHFiYmJjbGlkdHBxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NjE1MDUsImV4cCI6MjEwNjIzNzUwNX0.m71TQvODDYINO7VQRLfvxx0ioEB_FbLn06uxwb9gJQs';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('your_anon'));
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database interfaces
export interface DbProfile {
  id: string;
  name: string;
  avatar: string | null;
  bike: string | null;
  bike_model: string | null;
  bike_brand: string | null;
  role: string | null;
  phone: string | null;
  is_admin: boolean;
  friends: string[];
}

export interface DbTrip {
  id: string;
  title: string;
  original_prompt: string | null;
  date: string;
  start_time: string | null;
  weather: any;
  creator_id: string;
  creator_name: string;
  creator_avatar: string | null;
  participants: string[];
  pending_invites: string[];
  total_km: number;
  duration_hours: number;
  waypoints: any;
  route_coordinates?: any;
  reviews: any[];
  photos: any[];
  status?: string;
}

export const mapDbProfileToUser = (p: DbProfile): User => ({
  id: p.id,
  name: p.name,
  avatar: p.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  bike: p.bike || '',
  bikeModel: p.bike_model || undefined,
  bikeBrand: p.bike_brand || undefined,
  role: p.role || 'רוכב',
  phone: p.phone || '',
  isAdmin: Boolean(p.is_admin),
  friends: p.friends || [],
});

export const mapUserToDbProfile = (u: User): DbProfile => ({
  id: u.id,
  name: u.name,
  avatar: u.avatar,
  bike: u.bike,
  bike_model: u.bikeModel || null,
  bike_brand: u.bikeBrand || null,
  role: u.role,
  phone: u.phone,
  is_admin: Boolean(u.isAdmin),
  friends: u.friends || [],
});

export const mapDbTripToTrip = (t: DbTrip): Trip => {
  const waypoints = Array.isArray(t.waypoints) ? t.waypoints : [];
  let routeCoordinates: [number, number][] = [];

  if (Array.isArray(t.route_coordinates) && t.route_coordinates.length > 1) {
    routeCoordinates = t.route_coordinates;
  } else if (t.id === 'trip-nik-friday-1') {
    routeCoordinates = [
      [32.0298, 34.8580],
      [31.9000, 34.9000],
      [31.7486, 34.9892],
      [31.7450, 35.0500],
      [31.7683, 35.2137],
      [31.7918, 35.1588],
      [31.7450, 35.0500],
      [31.8500, 34.9000],
      [32.0298, 34.8580]
    ];
  } else if (waypoints.length > 1) {
    routeCoordinates = waypoints.map((w: any) => [Number(w.lat), Number(w.lng)]);
  }

  return {
    id: t.id,
    title: t.title,
    originalPrompt: t.original_prompt || 'רכיבת אופנוע',
    date: t.date,
    startTime: t.start_time || undefined,
    weather: t.weather,
    creatorId: t.creator_id,
    creatorName: t.creator_name,
    creatorAvatar: t.creator_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    participants: t.participants || [],
    pendingInvites: t.pending_invites || [],
    totalKm: Number(t.total_km) || 0,
    durationHours: Number(t.duration_hours) || 0,
    waypoints,
    routeCoordinates,
    reviews: Array.isArray(t.reviews) ? t.reviews : [],
    photos: Array.isArray(t.photos) ? t.photos : [],
    status: (t.status === 'draft' ? 'draft' : 'published') as 'published' | 'draft',
  };
};

export const mapTripToDbTrip = (t: Trip): DbTrip => ({
  id: t.id,
  title: t.title,
  original_prompt: t.originalPrompt || null,
  date: t.date,
  start_time: t.startTime || null,
  weather: t.weather,
  creator_id: t.creatorId,
  creator_name: t.creatorName,
  creator_avatar: t.creatorAvatar || null,
  participants: t.participants || [],
  pending_invites: t.pendingInvites || [],
  total_km: t.totalKm,
  duration_hours: t.durationHours,
  waypoints: t.waypoints,
  route_coordinates: t.routeCoordinates || [],
  reviews: t.reviews || [],
  photos: t.photos || [],
  status: t.status,
});

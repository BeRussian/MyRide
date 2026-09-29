export interface User {
  id: string;
  name: string;
  avatar: string;
  bike: string;
  bikeModel?: string; // e.g., 'Ninja 400', 'MT-07', '890 Adventure R'
  bikeBrand?: string; // e.g., 'Kawasaki', 'Yamaha', 'KTM'
  role: string;
  phone: string;
  isAdmin?: boolean;
  friends: string[]; // User IDs of confirmed friends
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export type StopCategory = 'start' | 'poi' | 'twisties' | 'cafe' | 'wash' | 'viewpoint' | 'gas' | 'end';

export interface StopReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  stars: number;
  comment: string;
  createdAt: string;
}

export interface Waypoint {
  id: string;
  name: string;
  category: StopCategory;
  lat: number;
  lng: number;
  time?: string;
  stopDurationMinutes?: number; // How long we stayed at this stop
  description?: string;
  highlight?: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  reviews?: StopReview[];
  photos?: string[];
}

export interface TripPhoto {
  id: string;
  url: string;
  caption?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  stopId?: string;
}

export interface TripReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  stars: number;
  comment: string;
  createdAt: string;
}

export interface TripWeather {
  condition: 'sunny' | 'partly-cloudy' | 'hot' | 'windy' | 'rainy';
  temp: number;
  label: string;
}

export interface Trip {
  id: string;
  title: string;
  originalPrompt: string;
  date: string;
  startTime?: string;
  endTime?: string;
  weather?: TripWeather;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  participants: string[]; // User IDs who have this trip in their active trips
  pendingInvites: string[]; // User IDs invited but not yet approved
  totalKm: number;
  durationHours: number;
  waypoints: Waypoint[];
  routeCoordinates: [number, number][]; // [lat, lng] array for polyline
  reviews: TripReview[];
  photos: TripPhoto[];
  status: 'published' | 'draft';
  updatedAt?: string;
}

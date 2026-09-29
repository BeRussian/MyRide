import type { User, Trip, TripReview, StopReview, TripPhoto, FriendRequest } from '../types';
import { SupabaseService } from './supabaseService';

export const INITIAL_USERS: User[] = [
  {
    id: 'nik',
    name: 'ניק',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bike: 'Kawasaki Ninja 400 (Black)',
    bikeModel: 'Ninja 400',
    bikeBrand: 'Kawasaki',
    role: 'רוכב ספורט',
    phone: '050-8881234',
    isAdmin: false,
    friends: ['yuval']
  },
  {
    id: 'yuval',
    name: 'יובל',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    bike: 'Yamaha MT-07',
    bikeModel: 'MT-07',
    bikeBrand: 'Yamaha',
    role: 'רוכב נייקד',
    phone: '052-4445678',
    isAdmin: false,
    friends: ['nik']
  },
  {
    id: 'kfir',
    name: 'כפיר',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bike: 'KTM 890 Adventure R',
    bikeModel: '890 Adventure R',
    bikeBrand: 'KTM',
    role: 'רוכב אדוונצ\'ר',
    phone: '054-3339012',
    isAdmin: false,
    friends: []
  },
  {
    id: 'admin',
    name: 'מנהל מערכת (Admin)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bike: 'ניהול פלטפורמה',
    bikeModel: 'Admin',
    bikeBrand: 'System',
    role: 'ניהול משתמשים ומערכת',
    phone: '050-0000000',
    isAdmin: true,
    friends: ['nik', 'yuval', 'kfir']
  }
];

// Clean storage key v4 with friends, profile editing and voice notes support
const STORAGE_KEYS = {
  CURRENT_USER_ID: 'myride_active_user_id_v4',
  TRIPS: 'myride_trips_data_v4',
  USERS: 'myride_users_data_v4',
  FRIEND_REQUESTS: 'myride_friend_requests_v4',
};

// Initial sample Friday ride between Nik, Yuval and Kfir
const SAMPLE_RIDE: Trip = {
  id: 'trip-nik-friday-1',
  title: 'רכיבת שישי: הרי יהודה ובית זית',
  originalPrompt: 'יום שישי 12/9 רכיבה, יצאנו ב6 בבוקר מקריית אונו, נסענו עד לבית שמש ומשם לנס הרים, עברנו את כל נס הרים עד ירושלים, משם המשכנו לבית זית לקפה דרך הגפן, חזרנו דרך נס הרים והביתה.',
  date: 'יום שישי, 12 בספטמבר 2026',
  startTime: '06:00',
  weather: {
    condition: 'sunny',
    temp: 24,
    label: 'שמש נעימה וראות מעולה (24°C)'
  },
  creatorId: 'nik',
  creatorName: 'ניק',
  creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  participants: ['nik', 'yuval', 'kfir'],
  pendingInvites: [],
  totalKm: 144,
  durationHours: 3.6,
  waypoints: [
    {
      id: 'wp-sample-1',
      name: 'קריית אונו (נקודת יציאה)',
      category: 'start',
      lat: 32.0298,
      lng: 34.8580,
      time: '06:00',
      stopDurationMinutes: 0,
      description: 'יציאה ב-06:00 מקריית אונו עם מיכלים מלאים'
    },
    {
      id: 'wp-sample-2',
      name: 'בית שמש',
      category: 'poi',
      lat: 31.7486,
      lng: 34.9892,
      time: '06:25',
      stopDurationMinutes: 0,
      description: 'מעבר צומת שמשון לכיוון העליות'
    },
    {
      id: 'wp-sample-3',
      name: 'כביש נס הרים (כביש 386)',
      category: 'twisties',
      lat: 31.7450,
      lng: 35.0500,
      time: '06:50',
      stopDurationMinutes: 10,
      description: 'רכיבה טכנית ועיקולים',
      googleMapsUrl: 'https://maps.google.com/?q=Bar+Bahar+Nes+Harim',
      websiteUrl: 'https://www.facebook.com/barbaharisrael/'
    },
    {
      id: 'wp-sample-4',
      name: 'ירושלים (הרי יהודה)',
      category: 'poi',
      lat: 31.7683,
      lng: 35.2137,
      time: '07:25',
      stopDurationMinutes: 0,
      description: 'מעבר נופי מעל עין כרם',
      googleMapsUrl: 'https://maps.google.com/?q=Jerusalem'
    },
    {
      id: 'wp-sample-5',
      name: 'קפה דרך הגפן (בית זית)',
      category: 'cafe',
      lat: 31.7918,
      lng: 35.1588,
      time: '07:50',
      stopDurationMinutes: 45,
      description: 'עצירת קפה וארוחת בוקר בבוסתן',
      googleMapsUrl: 'https://maps.google.com/?q=Derech+Hagefen+Cafe+Beit+Zayit',
      websiteUrl: 'https://www.derech-hagefen.co.il/',
      reviews: [
        {
          id: 'rev-sample-1',
          userId: 'nik',
          userName: 'ניק',
          userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          stars: 5,
          comment: 'קפה משובח ומאפים חמים, חניה נוחה לאופנועים.',
          createdAt: '12/09/2026'
        },
        {
          id: 'rev-sample-2',
          userId: 'yuval',
          userName: 'יובל',
          userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
          stars: 5,
          comment: 'מקום מושלם לעצירה בשישי בבוקר.',
          createdAt: '12/09/2026'
        }
      ]
    },
    {
      id: 'wp-sample-6',
      name: 'כביש נס הרים (חזרה)',
      category: 'twisties',
      lat: 31.7450,
      lng: 35.0500,
      time: '09:00',
      stopDurationMinutes: 10,
      description: 'ירידות נס הרים לכיוון בית שמש והשפלה'
    },
    {
      id: 'wp-sample-7',
      name: 'קריית אונו (חזרה הביתה)',
      category: 'end',
      lat: 32.0298,
      lng: 34.8580,
      time: '09:35',
      stopDurationMinutes: 0,
      description: 'סיום מוצלח של הרכיבה וחזרה הביתה'
    }
  ],
  routeCoordinates: [
    [32.0298, 34.8580],
    [31.9000, 34.9000],
    [31.7486, 34.9892],
    [31.7450, 35.0500],
    [31.7683, 35.2137],
    [31.7918, 35.1588],
    [31.7450, 35.0500],
    [31.8500, 34.9000],
    [32.0298, 34.8580]
  ],
  reviews: [
    {
      id: 'trev-nik-1',
      userId: 'nik',
      userName: 'ניק',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      stars: 5,
      comment: 'רכיבה מעולה! הקצב היה פנטסטי והנינג\'ה הרגישה מצוין בפיתולים.',
      createdAt: '12/09/2026'
    }
  ],
  photos: [
    {
      id: 'photo-nik-1',
      url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
      caption: 'האופנועים של ניק, יובל וכפיר בבוקר שישי',
      uploadedBy: 'nik',
      uploadedByName: 'ניק',
      uploadedAt: '12/09/2026'
    }
  ],
  status: 'published'
};

export class StorageService {
  static getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  }

  static getActiveUserId(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'nik';
  }

  static setActiveUserId(userId: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  static getActiveUser(): User {
    const users = this.getUsers();
    const activeId = this.getActiveUserId();
    return users.find(u => u.id === activeId) || users[0];
  }

  static getUserById(userId: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.id === userId);
  }

  static updateUser(updated: User): void {
    const users = this.getUsers().map(u => u.id === updated.id ? updated : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    SupabaseService.syncProfile(updated).catch(() => {});
  }

  static getFriends(userId: string): User[] {
    const user = this.getUserById(userId);
    if (!user || !user.friends) return [];
    const allUsers = this.getUsers();
    return allUsers.filter(u => user.friends.includes(u.id));
  }

  static areFriends(userId1: string, userId2: string): boolean {
    const u1 = this.getUserById(userId1);
    return !!(u1 && u1.friends && u1.friends.includes(userId2));
  }

  static getFriendRequests(): FriendRequest[] {
    const data = localStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveFriendRequests(requests: FriendRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
  }

  static getUserFriendRequests(userId: string): { incoming: FriendRequest[]; outgoing: FriendRequest[] } {
    const all = this.getFriendRequests();
    return {
      incoming: all.filter(r => r.toUserId === userId && r.status === 'pending'),
      outgoing: all.filter(r => r.fromUserId === userId && r.status === 'pending'),
    };
  }

  static sendFriendRequest(fromUserId: string, toUserId: string): boolean {
    if (fromUserId === toUserId) return false;
    const requests = this.getFriendRequests();
    const existing = requests.find(r => 
      ((r.fromUserId === fromUserId && r.toUserId === toUserId) ||
       (r.fromUserId === toUserId && r.toUserId === fromUserId)) &&
      r.status === 'pending'
    );
    if (existing) return false;
    if (this.areFriends(fromUserId, toUserId)) return false;

    const newRequest: FriendRequest = {
      id: `freq-${Date.now()}`,
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('he-IL')
    };

    requests.push(newRequest);
    this.saveFriendRequests(requests);
    SupabaseService.syncFriendRequest(newRequest).catch(() => {});
    return true;
  }

  static acceptFriendRequest(requestId: string): void {
    const requests = this.getFriendRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    req.status = 'accepted';
    this.saveFriendRequests(requests);
    SupabaseService.syncFriendRequest(req).catch(() => {});

    const users = this.getUsers();
    const fromUser = users.find(u => u.id === req.fromUserId);
    const toUser = users.find(u => u.id === req.toUserId);

    if (fromUser && toUser) {
      if (!fromUser.friends) fromUser.friends = [];
      if (!toUser.friends) toUser.friends = [];

      if (!fromUser.friends.includes(toUser.id)) fromUser.friends.push(toUser.id);
      if (!toUser.friends.includes(fromUser.id)) toUser.friends.push(fromUser.id);

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      SupabaseService.syncProfile(fromUser).catch(() => {});
      SupabaseService.syncProfile(toUser).catch(() => {});
    }
  }

  static rejectFriendRequest(requestId: string): void {
    const requests = this.getFriendRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    req.status = 'declined';
    this.saveFriendRequests(requests);
  }

  static getUserTrips(userId: string): Trip[] {
    const trips = this.getTrips();
    return trips.filter(t => t.participants && t.participants.includes(userId));
  }

  static addUser(name: string, bike: string, role: string, phone: string): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      avatar: `https://images.unsplash.com/photo-1535713875002?w=150&auto=format&fit=crop&q=80`,
      bike,
      bikeModel: bike,
      role: role || 'רוכב מועדון',
      phone: phone || '050-0000000',
      isAdmin: false,
      friends: []
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    SupabaseService.syncProfile(newUser).catch(() => {});
    return newUser;
  }

  static deleteUser(userId: string): void {
    let users = this.getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    SupabaseService.deleteProfile(userId).catch(() => {});

    const trips = this.getTrips();
    trips.forEach(trip => {
      if (trip.participants) {
        trip.participants = trip.participants.filter(id => id !== userId);
      }
      if (trip.pendingInvites) {
        trip.pendingInvites = trip.pendingInvites.filter(id => id !== userId);
      }
    });
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));

    if (this.getActiveUserId() === userId) {
      this.setActiveUserId('nik');
    }
  }

  static getTrips(): Trip[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRIPS);
    let trips: Trip[] = [];
    if (!data) {
      trips = [SAMPLE_RIDE];
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } else {
      try {
        trips = JSON.parse(data);
      } catch {
        trips = [SAMPLE_RIDE];
      }
    }

    let changed = false;

    // Check legacy storage keys to auto-recover any previous trip
    const legacyKeys = ['myride_trips_backup', 'myride_trips_data_v3', 'myride_trips_data_v2', 'myride_trips_data_v1', 'myride_trips_data'];
    for (const key of legacyKeys) {
      const oldData = localStorage.getItem(key);
      if (oldData) {
        try {
          const oldTrips: Trip[] = JSON.parse(oldData);
          if (Array.isArray(oldTrips)) {
            for (const ot of oldTrips) {
              if (ot && ot.id && !trips.some(t => t.id === ot.id)) {
                trips.push(ot);
                changed = true;
              }
            }
          }
        } catch {}
      }
    }

    trips.forEach(trip => {
      // Ensure route coordinates are always populated for map polyline
      if (!trip.routeCoordinates || trip.routeCoordinates.length <= 1) {
        if (trip.id === 'trip-nik-friday-1') {
          trip.routeCoordinates = [
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
        } else if (trip.waypoints && trip.waypoints.length > 1) {
          trip.routeCoordinates = trip.waypoints.map(wp => [wp.lat, wp.lng]);
        }
        changed = true;
      }

      trip.waypoints?.forEach(wp => {
        if (!wp.googleMapsUrl) {
          wp.googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(wp.name.split('(')[0].trim())}`;
          changed = true;
        }
        if (wp.name.includes('דרך הגפן') && !wp.websiteUrl) {
          wp.websiteUrl = 'https://www.derech-hagefen.co.il/';
          changed = true;
        }
        if (wp.name.includes('נס הרים') && !wp.websiteUrl) {
          wp.websiteUrl = 'https://www.facebook.com/barbaharisrael/';
          changed = true;
        }
      });
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
      localStorage.setItem('myride_trips_backup', JSON.stringify(trips));
    }
    return trips;
  }

  static updateWaypointDescription(tripId: string, waypointId: string, newDescription: string): Trip | undefined {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return undefined;
    const wp = trip.waypoints?.find(w => w.id === waypointId);
    if (wp) {
      wp.description = newDescription;
      this.updateTrip(trip);
      return trip;
    }
    return undefined;
  }

  static saveTrip(trip: Trip): void {
    const trips = this.getTrips();
    const existingIndex = trips.findIndex(t => t.id === trip.id);
    if (existingIndex >= 0) {
      trips[existingIndex] = trip;
    } else {
      trips.unshift(trip);
    }
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    SupabaseService.syncTrip(trip).catch(() => {});
  }

  static updateTrip(updatedTrip: Trip): void {
    const trips = this.getTrips();
    const index = trips.findIndex(t => t.id === updatedTrip.id);
    if (index >= 0) {
      const refreshedTrip = { ...updatedTrip, updatedAt: new Date().toLocaleDateString('he-IL') };
      trips[index] = refreshedTrip;
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
      SupabaseService.syncTrip(refreshedTrip).catch(() => {});
    }
  }

  static addParticipantToTrip(tripId: string, userId: string): Trip | undefined {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return undefined;
    if (!trip.participants) trip.participants = [];
    if (!trip.participants.includes(userId)) {
      trip.participants.push(userId);
      this.updateTrip(trip);
    }
    return trip;
  }

  static removeParticipantFromTrip(tripId: string, userId: string): Trip | undefined {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return undefined;
    trip.participants = (trip.participants || []).filter(id => id !== userId);
    this.updateTrip(trip);
    return trip;
  }

  static removeTripForUser(tripId: string, userId: string): void {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    trip.participants = (trip.participants || []).filter(id => id !== userId);
    trip.pendingInvites = (trip.pendingInvites || []).filter(id => id !== userId);

    if (trip.participants.length === 0) {
      const filtered = trips.filter(t => t.id !== tripId);
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(filtered));
      SupabaseService.deleteTrip(tripId).catch(() => {});
    } else {
      this.saveTrip(trip);
    }
  }

  static deleteTripCompletely(tripId: string): void {
    let trips = this.getTrips();
    trips = trips.filter(t => t.id !== tripId);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    SupabaseService.deleteTrip(tripId).catch(() => {});
  }

  static getTripById(tripId: string): Trip | undefined {
    return this.getTrips().find(t => t.id === tripId);
  }

  static getUserApprovedTrips(userId: string): Trip[] {
    const trips = this.getTrips();
    return trips.filter(t => t.participants && t.participants.includes(userId));
  }

  static getUserPendingInvites(userId: string): Trip[] {
    const trips = this.getTrips();
    return trips.filter(t => t.pendingInvites && t.pendingInvites.includes(userId));
  }

  static approveTripInvite(tripId: string, userId: string): Trip | null {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return null;

    if (!trip.participants) trip.participants = [trip.creatorId];
    if (!trip.participants.includes(userId)) {
      trip.participants.push(userId);
    }
    if (trip.pendingInvites) {
      trip.pendingInvites = trip.pendingInvites.filter(id => id !== userId);
    }

    this.saveTrip(trip);
    return trip;
  }

  static rejectTripInvite(tripId: string, userId: string): void {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    if (trip.pendingInvites) {
      trip.pendingInvites = trip.pendingInvites.filter(id => id !== userId);
    }
    this.saveTrip(trip);
  }

  static addReviewToTrip(tripId: string, review: TripReview): void {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    if (!trip.reviews) trip.reviews = [];
    trip.reviews = trip.reviews.filter(r => r.userId !== review.userId);
    trip.reviews.push(review);
    this.saveTrip(trip);
  }

  static addReviewToStop(tripId: string, stopId: string, review: StopReview): void {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const stop = trip.waypoints.find(w => w.id === stopId);
    if (!stop) return;

    if (!stop.reviews) stop.reviews = [];
    stop.reviews = stop.reviews.filter(r => r.userId !== review.userId);
    stop.reviews.push(review);
    this.saveTrip(trip);
  }

  static addPhotoToTrip(tripId: string, photo: TripPhoto): void {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    if (!trip.photos) trip.photos = [];
    trip.photos.unshift(photo);

    if (photo.stopId) {
      const stop = trip.waypoints.find(w => w.id === photo.stopId);
      if (stop) {
        if (!stop.photos) stop.photos = [];
        stop.photos.unshift(photo.url);
      }
    }

    this.saveTrip(trip);
  }
}

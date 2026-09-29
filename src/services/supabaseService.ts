import {
  supabase,
  isSupabaseConfigured,
  mapDbProfileToUser,
  mapUserToDbProfile,
  mapDbTripToTrip,
  mapTripToDbTrip,
  type DbProfile,
  type DbTrip
} from './supabaseClient';
import type { User, Trip, FriendRequest } from '../types';

export class SupabaseService {
  private static isSyncing = false;
  private static realtimeSubscribed = false;

  /**
   * Initializes sync between local cache and Supabase cloud.
   * If remote data exists, merges it. If remote table is empty, seeds it.
   */
  static async initAndSync(callbacks?: { onDataChanged?: () => void }): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.log('ℹ️ Supabase credentials not set, operating in local-first mode.');
      return;
    }

    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // 1. Check Profiles table
      const { data: dbProfiles, error: profileErr } = await supabase
        .from('profiles')
        .select('*');

      if (!profileErr && dbProfiles && dbProfiles.length > 0) {
        const remoteUsers = dbProfiles.map(p => mapDbProfileToUser(p as DbProfile));
        let localUsers: User[] = [];
        try {
          const raw = localStorage.getItem('myride_users_data_v4');
          if (raw) localUsers = JSON.parse(raw);
        } catch {}

        const usersMap = new Map<string, User>();
        remoteUsers.forEach(ru => usersMap.set(ru.id, ru));
        localUsers.forEach(lu => {
          if (!usersMap.has(lu.id)) {
            usersMap.set(lu.id, lu);
            this.syncProfile(lu).catch(() => {});
          }
        });

        const finalUsers = Array.from(usersMap.values());
        localStorage.setItem('myride_users_data_v4', JSON.stringify(finalUsers));
      }

      // 2. Check Trips table - Safe non-destructive merge + legacy recovery
      const { data: dbTrips, error: tripsErr } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (!tripsErr && dbTrips) {
        const remoteTrips = dbTrips.map(t => mapDbTripToTrip(t as DbTrip));

        let localTrips: Trip[] = [];
        try {
          const raw = localStorage.getItem('myride_trips_data_v4');
          if (raw) localTrips = JSON.parse(raw);
        } catch {}

        // Scan all legacy keys for accidental wiped trips
        const legacyKeys = ['myride_trips_backup', 'myride_trips_data_v3', 'myride_trips_data_v2', 'myride_trips_data_v1', 'myride_trips_data'];
        for (const k of legacyKeys) {
          const old = localStorage.getItem(k);
          if (old) {
            try {
              const parsed: Trip[] = JSON.parse(old);
              if (Array.isArray(parsed)) {
                parsed.forEach(pt => {
                  if (pt && pt.id && !localTrips.some(lt => lt.id === pt.id)) {
                    localTrips.push(pt);
                    console.log('🔄 Restored trip from legacy key:', pt.title);
                  }
                });
              }
            } catch {}
          }
        }

        const tripsMap = new Map<string, Trip>();
        // Add remote trips
        remoteTrips.forEach(rt => tripsMap.set(rt.id, rt));

        // Add local trips - if missing remotely, preserve & push to Supabase!
        localTrips.forEach(lt => {
          if (!tripsMap.has(lt.id)) {
            tripsMap.set(lt.id, lt);
            this.syncTrip(lt).catch(() => {});
          }
        });

        const finalTrips = Array.from(tripsMap.values());
        localStorage.setItem('myride_trips_data_v4', JSON.stringify(finalTrips));
        localStorage.setItem('myride_trips_backup', JSON.stringify(finalTrips));
        console.log(`✅ Loaded & safely merged ${finalTrips.length} trips.`);
      }

      // 3. Check Friend requests table
      const { data: dbFreqs, error: freqErr } = await supabase
        .from('friend_requests')
        .select('*');

      if (!freqErr && dbFreqs && dbFreqs.length > 0) {
        const freqs: FriendRequest[] = dbFreqs.map((r: any) => ({
          id: r.id,
          fromUserId: r.from_user_id,
          toUserId: r.to_user_id,
          status: r.status,
          createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString('he-IL') : 'היום'
        }));
        localStorage.setItem('myride_friend_requests_v4', JSON.stringify(freqs));
      }

      callbacks?.onDataChanged?.();

      // 4. Setup Realtime listener once
      if (!this.realtimeSubscribed) {
        this.setupRealtimeListeners(callbacks?.onDataChanged);
      }
    } catch (err) {
      console.warn('⚠️ Supabase sync note (tables may need creation in SQL editor):', err);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sets up real-time subscriptions for trips and profiles
   */
  private static setupRealtimeListeners(onDataChanged?: () => void) {
    this.realtimeSubscribed = true;

    try {
      supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'trips' },
          async () => {
            console.log('⚡ Realtime trip change detected from Supabase');
            const { data } = await supabase.from('trips').select('*').order('created_at', { ascending: false });
            if (data) {
              const trips = data.map(t => mapDbTripToTrip(t as DbTrip));
              localStorage.setItem('myride_trips_data_v4', JSON.stringify(trips));
              onDataChanged?.();
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          async () => {
            console.log('⚡ Realtime profile change detected from Supabase');
            const { data } = await supabase.from('profiles').select('*');
            if (data) {
              const users = data.map(p => mapDbProfileToUser(p as DbProfile));
              localStorage.setItem('myride_users_data_v4', JSON.stringify(users));
              onDataChanged?.();
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription skipped:', e);
    }
  }

  /**
   * Upserts a trip to Supabase
   */
  static async syncTrip(trip: Trip): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      const dbTrip = mapTripToDbTrip(trip);
      const { error } = await supabase
        .from('trips')
        .upsert(dbTrip, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase syncTrip warning:', error.message);
      } else {
        console.log('☁️ Trip synced to Supabase:', trip.id);
      }
    } catch (err) {
      console.warn('Supabase syncTrip error:', err);
    }
  }

  /**
   * Deletes a trip from Supabase
   */
  static async deleteTrip(tripId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);
      if (error) {
        console.warn('Supabase deleteTrip warning:', error.message);
      } else {
        console.log('☁️ Trip deleted from Supabase:', tripId);
      }
    } catch (err) {
      console.warn('Supabase deleteTrip error:', err);
    }
  }

  /**
   * Upserts a profile to Supabase
   */
  static async syncProfile(user: User): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      const dbProfile = mapUserToDbProfile(user);
      const { error } = await supabase
        .from('profiles')
        .upsert(dbProfile, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase syncProfile warning:', error.message);
      } else {
        console.log('☁️ Profile synced to Supabase:', user.id);
      }
    } catch (err) {
      console.warn('Supabase syncProfile error:', err);
    }
  }

  /**
   * Deletes a profile from Supabase
   */
  static async deleteProfile(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (error) {
        console.warn('Supabase deleteProfile warning:', error.message);
      } else {
        console.log('☁️ Profile deleted from Supabase:', userId);
      }
    } catch (err) {
      console.warn('Supabase deleteProfile error:', err);
    }
  }

  /**
   * Syncs a friend request to Supabase
   */
  static async syncFriendRequest(req: FriendRequest): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      const { error } = await supabase
        .from('friend_requests')
        .upsert({
          id: req.id,
          from_user_id: req.fromUserId,
          to_user_id: req.toUserId,
          status: req.status
        }, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase syncFriendRequest warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase syncFriendRequest error:', err);
    }
  }
}

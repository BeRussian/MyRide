import React, { useState } from 'react';
import type { User, Trip, Waypoint } from './types';
import { StorageService } from './services/storage';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { RideStudio } from './components/Studio/RideStudio';
import { RideList } from './components/Rides/RideList';
import { RideDetailPanel } from './components/Rides/RideDetailPanel';
import { PendingInvitesModal } from './components/Invites/PendingInvitesModal';
import { AdminPanelModal } from './components/Admin/AdminPanelModal';
import { UserSwitcher } from './components/Navbar/UserSwitcher';
import { EditProfileModal } from './components/Profile/EditProfileModal';
import { FriendsModal } from './components/Friends/FriendsModal';
import { UserProfileModal } from './components/Friends/UserProfileModal';
import { LiveRideModal } from './components/LiveRide/LiveRideModal';
import {
  Plus,
  Bell,
  Shield,
  Users
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(StorageService.getActiveUser());
  const [allTrips, setAllTrips] = useState<Trip[]>(StorageService.getTrips());
  
  // Navigation & View Modes: 'list' | 'detail' | 'studio'
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'studio'>('list');
  const [activeTab, setActiveTab] = useState<'my-trips' | 'feed'>('my-trips');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(allTrips[0] || null);

  // Active Map Waypoints & Route Coordinates
  const [mapWaypoints, setMapWaypoints] = useState<Waypoint[]>(
    allTrips[0]?.waypoints || []
  );
  const [mapCoordinates, setMapCoordinates] = useState<[number, number][]>(
    allTrips[0]?.routeCoordinates || []
  );

  // Modals
  const [isInvitesModalOpen, setIsInvitesModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isLiveRideOpen, setIsLiveRideOpen] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);

  const refreshData = () => {
    const updatedTrips = StorageService.getTrips();
    setAllTrips(updatedTrips);
    setCurrentUser(StorageService.getActiveUser());

    if (selectedTrip) {
      const refreshed = StorageService.getTripById(selectedTrip.id);
      if (refreshed) {
        setSelectedTrip(refreshed);
        setMapWaypoints(refreshed.waypoints);
        setMapCoordinates(refreshed.routeCoordinates);
      }
    }
  };

  const handleUserSwitch = (userId: string) => {
    StorageService.setActiveUserId(userId);
    const u = StorageService.getUsers().find((usr) => usr.id === userId);
    if (u) setCurrentUser(u);
    refreshData();
  };

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setMapWaypoints(trip.waypoints);
    setMapCoordinates(trip.routeCoordinates);
    setViewMode('detail');
  };

  const handleDeleteTripFromUser = (tripId: string) => {
    StorageService.removeTripForUser(tripId, currentUser.id);
    const updatedTrips = StorageService.getTrips();
    setAllTrips(updatedTrips);
    if (selectedTrip?.id === tripId) {
      const fallback = updatedTrips[0] || null;
      setSelectedTrip(fallback);
      if (fallback) {
        setMapWaypoints(fallback.waypoints);
        setMapCoordinates(fallback.routeCoordinates);
      }
      setViewMode('list');
    }
  };

  const handleTripCreated = (newTrip: Trip) => {
    refreshData();
    setSelectedTrip(newTrip);
    setMapWaypoints(newTrip.waypoints);
    setMapCoordinates(newTrip.routeCoordinates);
    setViewMode('detail');
  };

  const pendingInvites = StorageService.getUserPendingInvites(currentUser.id);
  const friendRequests = StorageService.getUserFriendRequests(currentUser.id);
  const pendingFriendRequests = friendRequests.incoming;
  const myApprovedTrips = StorageService.getUserApprovedTrips(currentUser.id);
  const visibleTrips = activeTab === 'my-trips' ? myApprovedTrips : allTrips;
  const allRegisteredUsers = StorageService.getUsers();

  return (
    <div className="h-screen w-screen bg-[#070a12] text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Studio Top Navigation Bar */}
      <header className="h-14 bg-[#0a0e1a] border-b border-slate-800/90 px-4 flex items-center justify-between z-30 shrink-0">
        
        {/* Brand & Studio Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30">
            🏍️
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-tight text-white">
              My<span className="text-blue-500">Ride</span>
            </span>
            <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-sky-400 border border-slate-700">
              STUDIO
            </span>
          </div>
        </div>

        {/* Right: Actions, Invites, User Switcher */}
        <div className="flex items-center gap-2.5">
          
          {/* Admin console button */}
          {currentUser.isAdmin && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>ניהול אדמין</span>
            </button>
          )}

          {/* Friends Hub Button */}
          <button
            onClick={() => setIsFriendsOpen(true)}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition text-xs font-semibold ${
              pendingFriendRequests.length > 0
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="חברים ושותפי רכיבה"
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">חברים</span>
            {pendingFriendRequests.length > 0 && (
              <span className="bg-blue-600 text-white text-[9px] font-bold rounded-full px-1.5 py-0.2">
                {pendingFriendRequests.length}
              </span>
            )}
          </button>

          {/* Pending Invites Bell */}
          <button
            onClick={() => setIsInvitesModalOpen(true)}
            className={`relative p-2 rounded-xl border transition ${
              pendingInvites.length > 0
                ? 'bg-blue-600/20 border-blue-500 text-blue-400 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="הזמנות רכיבה"
          >
            <Bell className="w-4 h-4" />
            {pendingInvites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {pendingInvites.length}
              </span>
            )}
          </button>

          {/* Custom Sleek User Switcher */}
          <UserSwitcher
            currentUser={currentUser}
            allUsers={allRegisteredUsers}
            onSelectUser={handleUserSwitch}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onOpenFriends={() => setIsFriendsOpen(true)}
          />

          {/* Live GPS Tracking Trigger (Strava Motorcycle Mode) */}
          <button
            onClick={() => setIsLiveRideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/30 transition active:scale-95"
            title="הקלטת רכיבה חיה ב-GPS (בסגנון Strava)"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
            <span>רכיבה חיה</span>
          </button>

          {/* Start New Trip Studio Trigger */}
          <button
            onClick={() => setViewMode(viewMode === 'studio' ? 'list' : 'studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-md ${
              viewMode === 'studio'
                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {viewMode === 'studio' ? (
              <span>סגור סטודיו</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>נסיעה חדשה</span>
              </>
            )}
          </button>

        </div>

      </header>

      {/* Main Split-Screen Studio Workspace */}
      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-56px)] overflow-hidden">
        
        {/* SIDEBAR PANEL (Right in RTL - 38% width) */}
        <aside className="w-full md:w-[420px] lg:w-[460px] h-full shrink-0 flex flex-col z-20 shadow-2xl">
          
          {viewMode === 'studio' ? (
            /* Mode 1: Ride Studio (Prompt & Route Creator) */
            <RideStudio
              currentUser={currentUser}
              onTripCreated={handleTripCreated}
              onCancel={() => setViewMode('list')}
              onRouteChange={(wp, coords) => {
                setMapWaypoints(wp);
                setMapCoordinates(coords);
              }}
            />
          ) : viewMode === 'detail' && selectedTrip ? (
            /* Mode 2: Detailed Ride View & Timeline */
            <RideDetailPanel
              trip={selectedTrip}
              currentUser={currentUser}
              onTripUpdated={(updated) => {
                refreshData();
                setSelectedTrip(updated);
                setMapWaypoints(updated.waypoints);
                setMapCoordinates(updated.routeCoordinates);
              }}
              onClose={() => setViewMode('list')}
              onDeleteTrip={handleDeleteTripFromUser}
            />
          ) : (
            /* Mode 3: Rides List & Navigation Feed */
            <div className="h-full flex flex-col bg-[#0b0f19] border-r border-slate-800/80">
              
              {/* Filter Tabs Header */}
              <div className="p-3.5 border-b border-slate-800 bg-[#0b0f19]/95 flex items-center justify-between">
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveTab('my-trips')}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${
                      activeTab === 'my-trips' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    הנסיעות שלי ({myApprovedTrips.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('feed')}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${
                      activeTab === 'feed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    פיד קהילה ({allTrips.length})
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5" dir="rtl">
                  <span className="text-white font-semibold">{currentUser.name}</span>
                  <span className="text-slate-600">•</span>
                  <span dir="ltr" className="text-sky-400 font-mono text-[10px]">{currentUser.bike}</span>
                </div>
              </div>

              {/* Scrollable Rides List */}
              <div className="flex-1 overflow-y-auto">
                <RideList
                  trips={visibleTrips}
                  activeTripId={selectedTrip?.id || null}
                  currentUser={currentUser}
                  onSelectTrip={handleSelectTrip}
                  onDeleteTrip={handleDeleteTripFromUser}
                />
              </div>

            </div>
          )}

        </aside>

        {/* MAIN STAGE: THE PERSISTENT LIVE INTERACTIVE MAP (Left in RTL - Remaining width) */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#070a12]">
          <InteractiveMap
            waypoints={mapWaypoints}
            routeCoordinates={mapCoordinates}
            height="100%"
            className="w-full h-full rounded-none border-none"
          />

          {/* Floating Trip Info Badge on Map */}
          {selectedTrip && viewMode !== 'studio' && (
            <div className="absolute bottom-5 left-5 z-[400] hidden sm:flex items-center gap-3 bg-[#0a0e1a]/90 backdrop-blur-md border border-slate-800 px-4 py-2.5 rounded-2xl shadow-2xl">
              <div>
                <div className="text-xs font-bold text-white">{selectedTrip.title}</div>
                <div className="text-[10px] text-slate-400">{selectedTrip.date} • {selectedTrip.totalKm} ק"מ</div>
              </div>
              <button
                onClick={() => setViewMode(viewMode === 'detail' ? 'list' : 'detail')}
                className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 hover:text-white rounded-lg text-xs font-semibold transition"
              >
                {viewMode === 'detail' ? 'חזרה לרשימה' : 'ציר עצירות'}
              </button>
            </div>
          )}
        </main>

      </div>

      {/* Invites Modal */}
      <PendingInvitesModal
        isOpen={isInvitesModalOpen}
        onClose={() => setIsInvitesModalOpen(false)}
        currentUser={currentUser}
        onInviteAccepted={(accepted) => {
          refreshData();
          handleSelectTrip(accepted);
          setIsInvitesModalOpen(false);
        }}
        onInviteRejected={() => refreshData()}
      />

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onDataChanged={refreshData}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        key={currentUser.id}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={(updated) => {
          setCurrentUser(updated);
          refreshData();
        }}
      />

      {/* Friends & Riders Modal */}
      <FriendsModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        currentUser={currentUser}
        onViewUserProfile={(user) => {
          setSelectedUserForProfile(user);
        }}
        onSelectTripPreview={(trip) => {
          handleSelectTrip(trip);
          setViewMode('detail');
        }}
        onDataChanged={refreshData}
      />

      {/* User Profile View Modal */}
      <UserProfileModal
        isOpen={!!selectedUserForProfile}
        onClose={() => setSelectedUserForProfile(null)}
        targetUser={selectedUserForProfile}
        currentUser={currentUser}
        onSelectTripPreview={(trip) => {
          handleSelectTrip(trip);
          setViewMode('detail');
          setSelectedUserForProfile(null);
        }}
        onFriendshipChanged={refreshData}
      />

      {/* Live GPS Ride Cockpit Modal */}
      <LiveRideModal
        isOpen={isLiveRideOpen}
        onClose={() => setIsLiveRideOpen(false)}
        currentUser={currentUser}
        onTripFinished={handleTripCreated}
      />

    </div>
  );
};

export default App;

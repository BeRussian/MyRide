import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Waypoint, StopCategory } from '../../types';
import { ExternalLink, Navigation, ZoomIn, ZoomOut } from 'lucide-react';

interface InteractiveMapProps {
  waypoints: Waypoint[];
  routeCoordinates: [number, number][];
  onStopClick?: (stop: Waypoint) => void;
  className?: string;
  height?: number | string;
  interactive?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  waypoints,
  routeCoordinates,
  onStopClick,
  className = '',
  height = 360,
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing map instance to prevent leaks
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter: [number, number] = waypoints.length > 0
      ? [waypoints[0].lat, waypoints[0].lng]
      : [31.85, 35.10];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 10,
      zoomControl: false,
      dragging: interactive,
      scrollWheelZoom: interactive,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Standard OpenStreetMap tiles - 100% free, zero watermark, crystal clear across Israel
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    // Glowing motorcycle GPS polyline (Cobalt / Electric Blue)
    if (routeCoordinates && routeCoordinates.length > 1) {
      // Glow underlayer
      L.polyline(routeCoordinates, {
        color: '#2563eb',
        weight: 9,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Core crisp line
      L.polyline(routeCoordinates, {
        color: '#38bdf8',
        weight: 4.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    }

    // Category marker generator
    const getMarkerHtml = (cat: StopCategory, index: number) => {
      let icon = '📍';
      let bgColor = 'bg-blue-600';
      let ringColor = 'ring-blue-500/40';

      if (cat === 'start') {
        icon = '🏁';
        bgColor = 'bg-emerald-600';
        ringColor = 'ring-emerald-500/50';
      } else if (cat === 'cafe') {
        icon = '☕';
        bgColor = 'bg-amber-500';
        ringColor = 'ring-amber-500/50';
      } else if (cat === 'wash') {
        icon = '🚿';
        bgColor = 'bg-cyan-500';
        ringColor = 'ring-cyan-500/50';
      } else if (cat === 'twisties') {
        icon = '🏍️';
        bgColor = 'bg-indigo-600';
        ringColor = 'ring-indigo-500/50';
      } else if (cat === 'viewpoint') {
        icon = '🌄';
        bgColor = 'bg-violet-600';
        ringColor = 'ring-violet-500/50';
      } else if (cat === 'gas') {
        icon = '⛽';
        bgColor = 'bg-slate-700';
        ringColor = 'ring-slate-500/50';
      } else if (cat === 'end') {
        icon = '🏠';
        bgColor = 'bg-rose-600';
        ringColor = 'ring-rose-500/50';
      }

      return `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-8 h-8 rounded-full ${bgColor} text-white flex items-center justify-center text-sm shadow-xl border-2 border-slate-900 ring-4 ${ringColor} transition-transform transform hover:scale-125">
            ${icon}
          </div>
          <span class="absolute -top-1 -right-1 w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-700">
            ${index + 1}
          </span>
        </div>
      `;
    };

    const markers: L.Marker[] = [];
    waypoints.forEach((wp, index) => {
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: getMarkerHtml(wp.category, index),
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: customIcon }).addTo(map);

      const reviewCount = wp.reviews?.length || 0;
      const reviewBadge = reviewCount > 0 ? `⭐ דירוג חברים: ${reviewCount} ביקורות` : '';
      const gmapsLink = wp.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(wp.name.split('(')[0].trim())}`;
      const websiteLinkHtml = wp.websiteUrl
        ? `<a href="${wp.websiteUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 4px 8px; background: #78350f; color: #fde68a; font-size: 10px; font-weight: bold; border-radius: 6px; text-decoration: none;">☕ לאתר המקום</a>`
        : '';
      const gmapsLinkHtml = `<a href="${gmapsLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 4px 8px; background: #0f172a; color: #38bdf8; font-size: 10px; font-weight: bold; border-radius: 6px; text-decoration: none; border: 1px solid #0284c7;">📍 פתח ב-Google Maps</a>`;

      marker.bindPopup(`
        <div style="direction: rtl; text-align: right; min-width: 190px; padding: 4px;">
          <div style="font-weight: 800; font-size: 13px; color: #f8fafc; margin-bottom: 2px;">
            ${wp.name}
          </div>
          <div style="font-size: 11px; color: #38bdf8; font-weight: 600; margin-bottom: 4px;">
            הגעה: ${wp.time || 'לא הוגדר'} ${wp.stopDurationMinutes ? `(עצירה: ${wp.stopDurationMinutes} דק')` : ''}
          </div>
          ${wp.description ? `<div style="font-size: 11px; color: #cbd5e1; margin-bottom: 5px; line-height: 1.4;">${wp.description}</div>` : ''}
          ${reviewBadge ? `<div style="font-size: 10px; color: #f59e0b; margin-bottom: 6px;">${reviewBadge}</div>` : ''}
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; padding-top: 6px; border-top: 1px solid #334155;">
            ${gmapsLinkHtml}
            ${websiteLinkHtml}
          </div>
        </div>
      `);

      if (onStopClick) {
        marker.on('click', () => onStopClick(wp));
      }

      markers.push(marker);
    });

    // Auto-fit bounds with padding
    if (waypoints.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds(), {
        padding: [50, 50],
        maxZoom: 14,
        animate: false,
      });
    }

    // Refresh layout to guarantee rendering
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 200);
    const t3 = setTimeout(() => map.invalidateSize(), 500);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [waypoints, routeCoordinates, height, interactive, onStopClick]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const openInGoogleMaps = () => {
    if (waypoints.length === 0) return;
    const origin = `${waypoints[0].lat},${waypoints[0].lng}`;
    const destination = `${waypoints[waypoints.length - 1].lat},${waypoints[waypoints.length - 1].lng}`;
    const intermediateWaypoints = waypoints
      .slice(1, -1)
      .map((w) => `${w.lat},${w.lng}`)
      .join('|');

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${
      intermediateWaypoints ? `&waypoints=${intermediateWaypoints}` : ''
    }&travelmode=driving`;
    window.open(url, '_blank');
  };

  const containerHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 ${className}`}>
      {/* Actual Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height: containerHeight, minHeight: containerHeight, width: '100%' }}
        className="w-full z-10"
      />

      {/* Floating Controls */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2">
        <button
          type="button"
          onClick={openInGoogleMaps}
          title="פתח מסלול ישירות ב-Google Maps"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-sky-400 border border-sky-500/30 rounded-xl shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5 text-sky-400" />
          <span>פתח ב-Google Maps</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </button>

        {interactive && (
          <div className="flex items-center bg-slate-900/90 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="התקרב"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-700" />
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="התרחק"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Category Legend */}
      <div className="absolute bottom-3 right-3 z-[400] flex flex-wrap items-center gap-2 px-3 py-1.5 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-800 text-[11px] font-semibold text-slate-300 shadow-xl">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> יציאה
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> קפה
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500" /> פיתולים
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-500" /> שטיפה
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-600" /> סיום
        </span>
      </div>
    </div>
  );
};

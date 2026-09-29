import type { Waypoint, StopCategory } from '../types';

interface KnownLocation {
  aliases: string[];
  name: string;
  category: StopCategory;
  lat: number;
  lng: number;
  highlight?: string;
  defaultStopDuration?: number; // minutes
  googleMapsUrl?: string;
  websiteUrl?: string;
}

export const ISRAELI_HOTSPOTS: KnownLocation[] = [
  {
    aliases: ['קריית אונו', 'קרית אונו', 'אונו'],
    name: 'קריית אונו (נקודת יציאה)',
    category: 'start',
    lat: 32.0298,
    lng: 34.8580,
    highlight: 'נקודת התכנסות ויציאה',
    googleMapsUrl: 'https://maps.google.com/?q=Kiryat+Ono'
  },
  {
    aliases: ['בית שמש', 'בית-שמש', 'שמשון', 'צומת שמשון'],
    name: 'בית שמש',
    category: 'poi',
    lat: 31.7486,
    lng: 34.9892,
    highlight: 'שער הכניסה להרי יהודה ולפיתולים',
    googleMapsUrl: 'https://maps.google.com/?q=Beit+Shemesh'
  },
  {
    aliases: ['נס הרים', 'כביש 386', '386', 'ברבהר', 'בר בהר', 'צומת נס הרים'],
    name: 'כביש נס הרים (כביש 386)',
    category: 'twisties',
    lat: 31.7450,
    lng: 35.0500,
    highlight: 'כביש הפיתולים המפורסם בישראל (הטיות ושיפועים)',
    defaultStopDuration: 15,
    googleMapsUrl: 'https://maps.google.com/?q=Bar+Bahar+Nes+Harim',
    websiteUrl: 'https://www.facebook.com/barbaharisrael/'
  },
  {
    aliases: ['ירושלים', 'ירושליים', 'עיר הקודש', 'י-ם', 'כניסה לירושלים'],
    name: 'ירושלים (הרי יהודה)',
    category: 'poi',
    lat: 31.7683,
    lng: 35.2137,
    highlight: 'מעבר נופי והרים',
    googleMapsUrl: 'https://maps.google.com/?q=Jerusalem'
  },
  {
    aliases: ['בית זית', 'בית-זית', 'מאגר בית זית'],
    name: 'בית זית',
    category: 'poi',
    lat: 31.7915,
    lng: 35.1585,
    highlight: 'עמק ירוק וציורי בהרי יהודה',
    googleMapsUrl: 'https://maps.google.com/?q=Beit+Zayit'
  },
  {
    // Fuzzy matching for "דרך הגפן" including common typo "דרן הגפן"
    aliases: ['דרן הגפן', 'דרך הגפן', 'דרך-הגפן', 'קפה דרך הגפן', 'קפה בית זית'],
    name: 'קפה דרך הגפן (בית זית)',
    category: 'cafe',
    lat: 31.7918,
    lng: 35.1588,
    highlight: 'בית קפה פסטורלי מומלץ בלב בוסתן וגפנים',
    defaultStopDuration: 50,
    googleMapsUrl: 'https://maps.google.com/?q=Derech+Hagefen+Cafe+Beit+Zayit',
    websiteUrl: 'https://www.derech-hagefen.co.il/'
  },
  {
    aliases: ['מבשרת', 'מבשרת ציון', 'קסטל', 'הקסטל'],
    name: 'מבשרת ציון',
    category: 'cafe',
    lat: 31.7985,
    lng: 35.1512,
    highlight: 'עצירת קפה ותצפית עמק איילון',
    defaultStopDuration: 30
  },
  {
    aliases: ['צומת תפוח', 'תפוח', 'מחסום תפוח'],
    name: 'צומת תפוח',
    category: 'poi',
    lat: 32.1186,
    lng: 35.2447,
    highlight: 'צומת מפתח בשומרון'
  },
  {
    aliases: ['כביש 60', 'דרך האבות', '60'],
    name: 'כביש 60 (ציר האבות)',
    category: 'twisties',
    lat: 31.9500,
    lng: 35.2400,
    highlight: 'נופים הרריים ורכיבה רצופה'
  },
  {
    aliases: ['רחובות', 'שטיפת רכבים', 'שטיפה ברחובות', 'שטיפה'],
    name: 'רחובות (שטיפת אופנועים)',
    category: 'wash',
    lat: 31.8928,
    lng: 34.8113,
    highlight: 'שטיפה יסודית והסרת חרקים בסיום הרכיבה',
    defaultStopDuration: 25
  },
  {
    aliases: ['צומת האלה', 'עמק האלה', 'האלה'],
    name: 'צומת עמק האלה',
    category: 'poi',
    lat: 31.6842,
    lng: 34.9865,
    highlight: 'מעבר בין הרי יהודה לשפלה'
  },
  {
    aliases: ['בית גוברין', 'כביש 35'],
    name: 'בית גוברין',
    category: 'twisties',
    lat: 31.6053,
    lng: 34.8967,
    highlight: 'כביש רחב ומהיר עם עיקולים פתוחים'
  },
  {
    aliases: ['ים המלח', 'עין גדי', 'מצוקי דרגות', 'כביש 90'],
    name: 'ים המלח (כביש 90)',
    category: 'twisties',
    lat: 31.4550,
    lng: 35.3900,
    highlight: 'רכיבה נמוכה בעולם ונוף מדברי מרהיב'
  },
  {
    aliases: ['גלבוע', 'דרך נוף גלבוע', 'כביש 667'],
    name: 'דרך נוף גלבוע (כביש 667)',
    category: 'twisties',
    lat: 32.5020,
    lng: 35.4180,
    highlight: 'פיתולים חדים ותצפית על עמק יזרעאל'
  },
  {
    aliases: ['תל אביב', 'ת"א', 'תל-אביב'],
    name: 'תל אביב',
    category: 'start',
    lat: 32.0853,
    lng: 34.7818,
    highlight: 'יציאה / הגעה חוף הים'
  }
];

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateCurvingRoute(start: [number, number], end: [number, number], steps = 9): [number, number][] {
  const points: [number, number][] = [start];
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  for (let i = 1; i < steps; i++) {
    const fraction = i / steps;
    const baseLat = lat1 + (lat2 - lat1) * fraction;
    const baseLng = lng1 + (lng2 - lng1) * fraction;
    
    // Natural curve based on topography
    const offset = Math.sin(fraction * Math.PI) * 0.012 * (i % 2 === 0 ? 1 : -0.8);
    const perpLat = baseLat - (lng2 - lng1) * offset;
    const perpLng = baseLng + (lat2 - lat1) * offset;
    
    points.push([perpLat, perpLng]);
  }
  points.push(end);
  return points;
}

export interface ParsedRouteResult {
  title: string;
  date: string;
  startTime: string;
  waypoints: Waypoint[];
  routeCoordinates: [number, number][];
  totalKm: number;
  durationHours: number;
}

export function parsePromptToRoute(promptText: string): ParsedRouteResult {
  const lowerPrompt = promptText.toLowerCase();

  // 1. Extract Date
  let dateStr = 'יום שישי, 12 בספטמבר 2026';
  const dateMatch = promptText.match(/(\d{1,2})[\/\.](\d{1,2})/);
  if (dateMatch) {
    const day = dateMatch[1];
    const month = dateMatch[2];
    const monthNames: Record<string, string> = {
      '1': 'ינואר', '2': 'פברואר', '3': 'מרץ', '4': 'אפריל', '5': 'מאי', '6': 'יוני',
      '7': 'יולי', '8': 'אוגוסט', '9': 'ספטמבר', '10': 'אוקטובר', '11': 'נובמבר', '12': 'דצמבר'
    };
    dateStr = `יום שישי, ${day} ב${monthNames[month] || 'ספטמבר'} 2026`;
  }

  // 2. Extract Start Time (e.g. "ב6 בבוקר", "ב-6:00", "בשעה 6")
  let startTime = '06:00';
  const timeMatch = promptText.match(/ב(?:שעה\s*)?(\d{1,2})(?::(\d{2}))?\s*(?:בבוקר)?/i);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    if (hours >= 0 && hours <= 24) {
      startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }

  // 3. Sequential match scanning:
  // Instead of scanning per location, we find ALL occurrences in their exact chronological order!
  interface MatchOccurrence {
    loc: KnownLocation;
    index: number;
    matchText: string;
  }

  const occurrences: MatchOccurrence[] = [];

  for (const loc of ISRAELI_HOTSPOTS) {
    for (const alias of loc.aliases) {
      const aliasLower = alias.toLowerCase();
      let startIndex = 0;
      while (startIndex < lowerPrompt.length) {
        const foundIdx = lowerPrompt.indexOf(aliasLower, startIndex);
        if (foundIdx === -1) break;

        // Check if already captured overlapping or immediate alias
        const isDuplicateNearby = occurrences.some(
          o => Math.abs(o.index - foundIdx) < 16 && (o.loc.name === loc.name || o.matchText.includes(alias) || alias.includes(o.matchText))
        );

        if (!isDuplicateNearby) {
          occurrences.push({
            loc,
            index: foundIdx,
            matchText: alias
          });
        }
        startIndex = foundIdx + aliasLower.length;
      }
    }
  }

  // Sort strictly by the order they appeared in the user's sentence!
  occurrences.sort((a, b) => a.index - b.index);

  // If user says "חזרנו הביתה" or "הביתה" at the end, make sure to add return
  const returnsHome =
    lowerPrompt.includes('חזרנו הביתה') ||
    lowerPrompt.includes('הביתה') ||
    lowerPrompt.includes('וחזרנו הביתה לקריית אונו');

  // Filter consecutive duplicates unless far apart in sentence (e.g. return leg)
  const filteredOccurrences: MatchOccurrence[] = [];
  for (let i = 0; i < occurrences.length; i++) {
    const curr = occurrences[i];
    const prev = filteredOccurrences[filteredOccurrences.length - 1];

    if (prev && prev.loc.name === curr.loc.name && Math.abs(curr.index - prev.index) < 55) {
      // Skip immediate mention repeat like "לנס הרים, עברו את כל נס הרים"
      continue;
    }
    // Also if prev is בית זית and curr is דרך הגפן, prefer דרך הגפן
    if (prev && prev.loc.name.includes('בית זית') && curr.loc.name.includes('דרך הגפן')) {
      filteredOccurrences[filteredOccurrences.length - 1] = curr;
      continue;
    }
    filteredOccurrences.push(curr);
  }

  const orderedLocations: KnownLocation[] = filteredOccurrences.map(o => o.loc);

  // Fallback if nothing matched
  if (orderedLocations.length === 0) {
    orderedLocations.push(
      ISRAELI_HOTSPOTS[0], // קריית אונו
      ISRAELI_HOTSPOTS[1], // בית שמש
      ISRAELI_HOTSPOTS[2], // נס הרים
      ISRAELI_HOTSPOTS[5]  // דרך הגפן
    );
  }

  const filteredLocations: KnownLocation[] = orderedLocations;

  // Calculate realistic rolling arrival times starting from user's extracted startTime
  const [startH, startM] = startTime.split(':').map(Number);
  let currentClockMinutes = startH * 60 + startM;

  const waypoints: Waypoint[] = filteredLocations.map((loc, idx) => {
    let category = loc.category;
    let desc = loc.highlight || '';
    let duration = loc.defaultStopDuration || 0;

    if (idx === 0) {
      category = 'start';
      desc = 'נקודת יציאה והתכנסות';
      duration = 0;
    } else if (loc.name.includes('דרך הגפן') || loc.name.includes('בית קפה')) {
      category = 'cafe';
      desc = 'עצירת קפה וארוחה מומלצת';
      duration = 45;
    } else if (loc.name.includes('שטיפה') || loc.name.includes('רחובות')) {
      category = 'wash';
      desc = 'שטיפת אופנועים';
      duration = 25;
    } else if (loc.name.includes('נס הרים')) {
      category = 'twisties';
      desc = 'מקטע פיתולים והטיות (כביש 386)';
      duration = 10;
    }

    // Add travel time from previous stop (approx 25-35 mins between towns)
    if (idx > 0) {
      currentClockMinutes += 25;
    }

    const arrivalH = Math.floor(currentClockMinutes / 60) % 24;
    const arrivalM = currentClockMinutes % 60;
    const timeFormatted = `${arrivalH.toString().padStart(2, '0')}:${arrivalM.toString().padStart(2, '0')}`;

    // Add stop duration to clock
    currentClockMinutes += duration;

    const gmaps = loc.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name.split('(')[0].trim())}`;

    return {
      id: `wp-${idx}-${Date.now()}`,
      name: loc.name,
      category,
      lat: loc.lat,
      lng: loc.lng,
      time: timeFormatted,
      stopDurationMinutes: duration,
      description: desc,
      highlight: loc.highlight,
      googleMapsUrl: gmaps,
      websiteUrl: loc.websiteUrl,
      reviews: [],
      photos: []
    };
  });

  // If returns home and not already the last stop
  const firstPoint = waypoints[0];
  const lastPoint = waypoints[waypoints.length - 1];

  if (waypoints.length > 1 && lastPoint.lat === firstPoint.lat && lastPoint !== firstPoint) {
    lastPoint.name = `${firstPoint.name.split(' ')[0]} (חזרה הביתה)`;
    lastPoint.category = 'end';
    lastPoint.description = 'חזרה בטוחה הביתה וסיום הנסיעה';
    lastPoint.highlight = 'חניה וכיבוי מנועים';
  } else if (returnsHome && waypoints.length > 1 && !lastPoint.name.includes('הביתה')) {
    currentClockMinutes += 30; // 30 min ride back
    const endH = Math.floor(currentClockMinutes / 60) % 24;
    const endM = currentClockMinutes % 60;

    waypoints.push({
      id: `wp-end-${Date.now()}`,
      name: `${firstPoint.name.split(' ')[0]} (חזרה הביתה)`,
      category: 'end',
      lat: firstPoint.lat,
      lng: firstPoint.lng,
      time: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
      stopDurationMinutes: 0,
      description: 'חזרה בטוחה הביתה וסיום הנסיעה',
      highlight: 'חניה וסיכום רכיבה'
    });
  }

  // Generate continuous curving route
  const routeCoordinates: [number, number][] = [];
  let totalKm = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];

    const seg = generateCurvingRoute([p1.lat, p1.lng], [p2.lat, p2.lng], 9);
    const directDist = calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    totalKm += Math.round(directDist * 1.32);

    if (seg.length > 0) {
      if (i > 0) seg.shift();
      routeCoordinates.push(...seg);
    }
  }

  const durationHours = Math.round(((currentClockMinutes - (startH * 60 + startM)) / 60) * 10) / 10;

  // Title
  const keyStops = waypoints
    .filter(w => w.category !== 'start' && w.category !== 'end')
    .slice(0, 3)
    .map(w => w.name.split(' ')[0]);

  const title = keyStops.length > 0
    ? `רכיבת שישי: ${keyStops.join(' ➔ ')}`
    : 'רכיבת שישי בהרי יהודה';

  return {
    title,
    date: dateStr,
    startTime,
    waypoints,
    routeCoordinates,
    totalKm: Math.max(50, totalKm),
    durationHours: Math.max(1.5, durationHours)
  };
}

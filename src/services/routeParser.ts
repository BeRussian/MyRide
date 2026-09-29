import type { Waypoint, StopCategory } from '../types';

export interface KnownLocation {
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
  // 1. מחלף מסובים / בקעת אונו / מרכז
  {
    aliases: ['מחלף מסובים', 'מסובים', 'צומת מסובים'],
    name: 'מחלף מסובים (נקודת יציאה)',
    category: 'start',
    lat: 32.0322,
    lng: 34.8252,
    highlight: 'מפגש ועלייה לציר 461/כביש 4',
    googleMapsUrl: 'https://maps.google.com/?q=Mesubim+Interchange'
  },
  {
    aliases: ['קריית אונו', 'קרית אונו', 'אונו', 'בית של יובל', 'הבית של יובל'],
    name: 'קריית אונו (בית של יובל)',
    category: 'poi',
    lat: 32.0298,
    lng: 34.8580,
    highlight: 'עצירת איסוף והתארגנות לרכיבה',
    defaultStopDuration: 10,
    googleMapsUrl: 'https://maps.google.com/?q=Kiryat+Ono'
  },
  {
    aliases: ['תל אביב', 'ת"א', 'תל-אביב'],
    name: 'תל אביב',
    category: 'start',
    lat: 32.0853,
    lng: 34.7818,
    highlight: 'יציאה / הגעה חוף הים'
  },
  {
    aliases: ['חולון', 'שטיפת אופנועים בחולון', 'שטיפה בחולון', 'שטיפת האופנועים בחולון'],
    name: 'חולון (שטיפת אופנועים וסיום)',
    category: 'wash',
    lat: 32.0158,
    lng: 34.7874,
    highlight: 'שטיפה יסודית, קירור מנועים וסיום הרכיבה',
    defaultStopDuration: 30,
    googleMapsUrl: 'https://maps.google.com/?q=Holon+Motorcycle+Wash'
  },
  {
    aliases: ['ראשון לציון', 'ראשל"צ'],
    name: 'ראשון לציון',
    category: 'poi',
    lat: 31.9730,
    lng: 34.7925,
    highlight: 'מפגש שפלה ומישור החוף'
  },
  {
    aliases: ['בת ים', 'טיילת בת ים'],
    name: 'בת ים',
    category: 'poi',
    lat: 32.0171,
    lng: 34.7454,
    highlight: 'רכיבת טיילת וחוף'
  },
  {
    aliases: ['פתח תקווה', 'פ"ת'],
    name: 'פתח תקווה',
    category: 'poi',
    lat: 32.0840,
    lng: 34.8878,
    highlight: 'יציאה לכיוון כביש 5 ומזרח'
  },
  {
    aliases: ['רמת גן', 'גבעתיים'],
    name: 'רמת גן',
    category: 'poi',
    lat: 32.0684,
    lng: 34.8248,
    highlight: 'מרכז גוש דן'
  },

  // 2. השומרון, כביש 5, צומת תפוח, כביש 60, מיכמש
  {
    aliases: ['אריאל', 'מחלף אריאל', 'כביש 5'],
    name: 'אריאל (כביש 5 חוצה שומרון)',
    category: 'poi',
    lat: 32.1042,
    lng: 35.1744,
    highlight: 'כביש 5 המהיר, עלייה לרכס השומרון',
    googleMapsUrl: 'https://maps.google.com/?q=Ariel+Israel'
  },
  {
    aliases: ['צומת תפוח', 'תפוח', 'מחסום תפוח'],
    name: 'צומת תפוח',
    category: 'poi',
    lat: 32.1186,
    lng: 35.2447,
    highlight: 'צומת מפתח בשומרון ופנייה ימינה לכביש 60',
    googleMapsUrl: 'https://maps.google.com/?q=Tapuach+Junction'
  },
  {
    aliases: ['כביש 60', 'דרך האבות', '60'],
    name: 'כביש 60 (ציר האבות)',
    category: 'twisties',
    lat: 31.9500,
    lng: 35.2400,
    highlight: 'נופים הרריים פתוחים, עיקולים רחבים ורכיבה רצופה',
    defaultStopDuration: 10,
    googleMapsUrl: 'https://maps.google.com/?q=Route+60+Israel'
  },
  {
    aliases: ['מיכמש', 'מכמש', 'מעלה מכמש', 'כביש 457'],
    name: 'מעלה מכמש (כביש 457)',
    category: 'twisties',
    lat: 31.8788,
    lng: 35.2974,
    highlight: 'ירידות מפותלות ותצפית מדבר בנימין לכיוון ירושלים',
    defaultStopDuration: 10,
    googleMapsUrl: 'https://maps.google.com/?q=Maale+Mikhmas'
  },

  // 3. ירושלים, הרי יהודה, מבשרת, קריית ענבים
  {
    aliases: ['ירושלים', 'ירושליים', 'עיר הקודש', 'י-ם', 'כניסה לירושלים'],
    name: 'ירושלים (הרי יהודה)',
    category: 'poi',
    lat: 31.7683,
    lng: 35.2137,
    highlight: 'מעבר נופי מעל הרי ירושלים',
    googleMapsUrl: 'https://maps.google.com/?q=Jerusalem'
  },
  {
    aliases: ['מבשרת', 'מבשרת ציון', 'קסטל', 'הקסטל'],
    name: 'מבשרת ציון (הקסטל)',
    category: 'poi',
    lat: 31.7985,
    lng: 35.1512,
    highlight: 'מעבר הקסטל ונוף פתוח להרי ירושלים',
    googleMapsUrl: 'https://maps.google.com/?q=Mevaseret+Zion'
  },
  {
    aliases: ['קריית ענבים', 'קרית ענבים', 'קפה הרים', 'ענבים', 'קפה הרים קריית ענבים'],
    name: 'קריית ענבים - קפה הרים',
    category: 'cafe',
    lat: 31.8105,
    lng: 35.1172,
    highlight: 'קפה הרים הפסטורלי בקיבוץ קריית ענבים - קפה משובח ומנוחה',
    defaultStopDuration: 60,
    googleMapsUrl: 'https://maps.google.com/?q=Harim+Bakery+Cafe+Kiryat+Anavim',
    websiteUrl: 'https://www.facebook.com/harimcafe/'
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
    aliases: ['עין כרם', 'עין-כרם'],
    name: 'עין כרם',
    category: 'cafe',
    lat: 31.7656,
    lng: 35.1582,
    highlight: 'סמטאות ציוריות, כנסיות ובתי קפה אותנטיים'
  },
  {
    aliases: ['נס הרים', 'כביש 386', 'כביש 3866', '386', '3866', 'ברבהר', 'בר בהר', 'צומת נס הרים', 'כביש שני שרים'],
    name: 'כביש נס הרים (כביש 3866)',
    category: 'twisties',
    lat: 31.7450,
    lng: 35.0500,
    highlight: 'כביש הפיתולים המפורסם בישראל (הטיות ושיפועים)',
    defaultStopDuration: 15,
    googleMapsUrl: 'https://maps.google.com/?q=Bar+Bahar+Nes+Harim',
    websiteUrl: 'https://www.facebook.com/barbaharisrael/'
  },
  {
    aliases: ['כביש 1', 'כביש אחד', 'שער הגיא', 'לטרון', 'מחלף שער הגיא'],
    name: 'כביש 1 (שער הגיא ולטרון)',
    category: 'poi',
    lat: 31.8150,
    lng: 34.9800,
    highlight: 'ציר מהיר ויפהפה היורד מהרי ירושלים לשפלה ולמרכז',
    googleMapsUrl: 'https://maps.google.com/?q=Shaar+Hagai'
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
    aliases: ['צור הדסה', 'כביש 375'],
    name: 'צור הדסה (כביש 375)',
    category: 'twisties',
    lat: 31.7167,
    lng: 35.1167,
    highlight: 'עיקולים חדים ביערות עדולם'
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
    name: 'בית גוברין (כביש 35)',
    category: 'twisties',
    lat: 31.6053,
    lng: 34.8967,
    highlight: 'כביש רחב ומהיר עם עיקולים פתוחים'
  },

  // 4. צפון ודרום
  {
    aliases: ['גלבוע', 'דרך נוף גלבוע', 'כביש 667'],
    name: 'דרך נוף גלבוע (כביש 667)',
    category: 'twisties',
    lat: 32.5020,
    lng: 35.4180,
    highlight: 'פיתולים חדים ותצפית על עמק יזרעאל'
  },
  {
    aliases: ['חיפה', 'כרמל', 'בית אורן'],
    name: 'רכס הכרמל (בית אורן)',
    category: 'twisties',
    lat: 32.7400,
    lng: 35.0100,
    highlight: 'פיתולי בית אורן וכביש 721'
  },
  {
    aliases: ['רמת הגולן', 'מבוא חמה', 'כביש 98'],
    name: 'דרום רמת הגולן (כביש 98)',
    category: 'twisties',
    lat: 32.7300,
    lng: 35.6600,
    highlight: 'סרפנטינות חמת גדר ונוף הכנרת'
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
    aliases: ['מצפה רמון', 'מכתש רמון', 'כביש 40'],
    name: 'מכתש רמון (כביש 40)',
    category: 'twisties',
    lat: 30.6100,
    lng: 34.8000,
    highlight: 'סרפנטינות המכתש ואוויר מדברי צלול'
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

export function generateCurvingRoute(start: [number, number], end: [number, number], steps = 9): [number, number][] {
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

/**
 * Recalculates route coordinates and distances when waypoints change
 */
export function recalculateRouteCoordinates(waypoints: Waypoint[]): {
  routeCoordinates: [number, number][];
  totalKm: number;
  durationHours: number;
} {
  if (!waypoints || waypoints.length === 0) {
    return { routeCoordinates: [], totalKm: 0, durationHours: 0 };
  }
  if (waypoints.length === 1) {
    return { routeCoordinates: [[waypoints[0].lat, waypoints[0].lng]], totalKm: 0, durationHours: 0 };
  }

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

  const totalStopMinutes = waypoints.reduce((acc, wp) => acc + (wp.stopDurationMinutes || 0), 0);
  const ridingMinutes = Math.round((totalKm / 68) * 60);
  const durationHours = Number(((ridingMinutes + totalStopMinutes) / 60).toFixed(1));

  return { routeCoordinates, totalKm, durationHours };
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

  // 1. Extract Date (supports "26 לספטמבר", "26 בספטמבר", "12/9", "26.9")
  let dateStr = 'יום שישי, 26 בספטמבר 2026';
  const monthNames: Record<string, string> = {
    '1': 'ינואר', '2': 'פברואר', '3': 'מרץ', '4': 'אפריל', '5': 'מאי', '6': 'יוני',
    '7': 'יולי', '8': 'אוגוסט', '9': 'ספטמבר', '10': 'אוקטובר', '11': 'נובמבר', '12': 'דצמבר',
    'ינואר': 'ינואר', 'פברואר': 'פברואר', 'מרץ': 'מרץ', 'אפריל': 'אפריל', 'מאי': 'מאי', 'יוני': 'יוני',
    'יולי': 'יולי', 'אוגוסט': 'אוגוסט', 'ספטמבר': 'ספטמבר', 'אוקטובר': 'אוקטובר', 'נובמבר': 'נובמבר', 'דצמבר': 'דצמבר'
  };

  const hebrewDateMatch = promptText.match(/(\d{1,2})\s*(?:ל|ב)?([א-ת]+)/);
  const numDateMatch = promptText.match(/(\d{1,2})[\/\.](\d{1,2})/);

  if (hebrewDateMatch && monthNames[hebrewDateMatch[2]]) {
    const day = hebrewDateMatch[1];
    const month = monthNames[hebrewDateMatch[2]];
    dateStr = `יום שישי, ${day} ב${month} 2026`;
  } else if (numDateMatch) {
    const day = numDateMatch[1];
    const month = numDateMatch[2];
    dateStr = `יום שישי, ${day} ב${monthNames[month] || 'ספטמבר'} 2026`;
  }

  // 2. Extract Start Time (e.g. "ב6 בבוקר", "בשעה 6 בבוקר", "ב-6:00")
  let startTime = '06:00';
  const timeMatch = promptText.match(/(?:בשעה\s*|ב-?|ב)(\d{1,2})(?::(\d{2}))?\s*(?:בבוקר)?/i);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    if (hours >= 0 && hours <= 24) {
      startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }

  // 3. Sequential match scanning
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

        // Prevent immediate overlapping duplicate matches
        const isDuplicateNearby = occurrences.some(
          o => Math.abs(o.index - foundIdx) < 18 && (o.loc.name === loc.name || o.matchText.includes(alias) || alias.includes(o.matchText))
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

  // Filter consecutive duplicates unless far apart in sentence (e.g. return leg)
  const filteredOccurrences: MatchOccurrence[] = [];
  for (let i = 0; i < occurrences.length; i++) {
    const curr = occurrences[i];
    const prev = filteredOccurrences[filteredOccurrences.length - 1];

    if (prev && prev.loc.name === curr.loc.name && Math.abs(curr.index - prev.index) < 55) {
      continue;
    }
    // If prev is מבשרת and curr is קריית ענבים / קפה הרים, keep both or order them
    filteredOccurrences.push(curr);
  }

  let orderedLocations: KnownLocation[] = filteredOccurrences.map(o => o.loc);

  // Fallback if nothing matched
  if (orderedLocations.length === 0) {
    orderedLocations.push(
      ISRAELI_HOTSPOTS[0], // מחלף מסובים
      ISRAELI_HOTSPOTS[1], // קריית אונו
      ISRAELI_HOTSPOTS[8], // אריאל
      ISRAELI_HOTSPOTS[9], // צומת תפוח
      ISRAELI_HOTSPOTS[16], // נס הרים
      ISRAELI_HOTSPOTS[3]   // חולון
    );
  }

  // Calculate realistic rolling arrival times starting from user's extracted startTime
  const [startH, startM] = startTime.split(':').map(Number);
  let currentClockMinutes = startH * 60 + startM;

  const waypoints: Waypoint[] = orderedLocations.map((loc, idx) => {
    let category = loc.category;
    let desc = loc.highlight || '';
    let duration = loc.defaultStopDuration || 0;

    if (idx === 0) {
      category = 'start';
      desc = 'נקודת יציאה והתכנסות';
      duration = 0;
    } else if (idx === orderedLocations.length - 1) {
      category = loc.category === 'wash' ? 'wash' : 'end';
      if (loc.name.includes('חולון')) {
        desc = 'שטיפת אופנועים וסיום הנסיעה בחולון';
        duration = 30;
      }
    } else if (loc.name.includes('נס הרים')) {
      category = 'twisties';
      desc = 'כביש 3866 המפותל - מקטע רכיבה טכני ומהנה';
      duration = 10;
    } else if (loc.name.includes('קפה הרים') || (loc.name.includes('קפה') && !loc.name.includes('נס הרים'))) {
      category = 'cafe';
      desc = loc.highlight || 'עצירת קפה ומנוחה בקריית ענבים';
      duration = 60;
    }

    // Add travel time from previous stop
    if (idx > 0) {
      currentClockMinutes += 25;
    }

    const arrivalH = Math.floor(currentClockMinutes / 60) % 24;
    const arrivalM = currentClockMinutes % 60;
    const timeFormatted = `${arrivalH.toString().padStart(2, '0')}:${arrivalM.toString().padStart(2, '0')}`;

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

  const { routeCoordinates, totalKm, durationHours } = recalculateRouteCoordinates(waypoints);

  // Dynamic Title
  const keyStops = waypoints
    .filter(w => w.category !== 'start')
    .slice(0, 3)
    .map(w => w.name.split(' ')[0]);

  const title = keyStops.length > 0
    ? `רכיבה: ${waypoints[0].name.split(' ')[0]} ➔ ${keyStops.join(' ➔ ')}`
    : 'רכיבת שישי מותאמת אישית';

  return {
    title,
    date: dateStr,
    startTime,
    waypoints,
    routeCoordinates,
    totalKm,
    durationHours
  };
}

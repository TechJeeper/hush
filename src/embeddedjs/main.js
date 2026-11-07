import Poco from "commodetto/Poco";
import Message from "pebble/message";
import Location from "embedded:sensor/Location";
import Battery from "embedded:sensor/Battery";
import Accelerometer from "embedded:sensor/Accelerometer";
import Health from "pebble/health";
import Vibes from "pebble/vibes";

const render = new Poco(screen);
const IS_ROUND = render.width === render.height;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MAX_PIPS = 4;
const DETAIL_MS = 5000;
const SECONDS_MS = 8000;
const WEATHER_INTERVAL_MS = 30 * 60 * 1000;
const LOW_BATTERY_PCT = 15;

/* ── Settings ─────────────────────────────────────────────────────────────── */

const DEFAULT_SETTINGS = {
  preset: "custom",
  theme: "ink",
  customBg: { r: 0, g: 0, b: 0 },
  customFg: { r: 255, g: 255, b: 255 },
  customAccent: { r: 85, g: 170, b: 170 },
  fontScale: "display",
  alwaysOn: "date",
  use24Hour: true,
  leadingZero: true,
  peekMode: false,
  secondsOnFlick: false,
  hapticSignals: true,
  calEnabled: true,
  calMinutes: 15,
  icsUrl: "",
  wxEnabled: true,
  wxRainMin: 30,
  wxUv: 6,
  wxTempLow: 5,
  wxTempHigh: 30,
  useFahrenheit: false,
  healthEnabled: true,
  stepGoal: 8000,
  paceBehindPct: 20,
  sysEnabled: true,
  batThreshold: 20,
  sunEnabled: false,
  sunMinutes: 20,
  worldEnabled: false,
  worldOffset: -5,
  worldStart: 18,
  worldEnd: 22
};

const PRESETS = {
  commuter: {
    theme: "ink",
    alwaysOn: "date",
    calEnabled: true,
    calMinutes: 20,
    wxEnabled: true,
    wxRainMin: 30,
    wxUv: 6,
    healthEnabled: false,
    sysEnabled: true,
    batThreshold: 20,
    sunEnabled: false,
    worldEnabled: false,
    hapticSignals: true
  },
  parent: {
    theme: "coral",
    alwaysOn: "weekday",
    calEnabled: true,
    calMinutes: 30,
    wxEnabled: true,
    wxRainMin: 45,
    healthEnabled: true,
    paceBehindPct: 25,
    sysEnabled: true,
    sunEnabled: true,
    sunMinutes: 15,
    worldEnabled: false,
    hapticSignals: true
  },
  deepwork: {
    theme: "night",
    alwaysOn: "off",
    calEnabled: true,
    calMinutes: 10,
    wxEnabled: false,
    healthEnabled: false,
    sysEnabled: true,
    batThreshold: 15,
    sunEnabled: false,
    worldEnabled: false,
    hapticSignals: false,
    peekMode: false
  },
  weekend: {
    theme: "paper",
    alwaysOn: "steps",
    calEnabled: false,
    wxEnabled: true,
    wxRainMin: 60,
    wxUv: 5,
    healthEnabled: true,
    paceBehindPct: 30,
    sysEnabled: true,
    sunEnabled: true,
    sunMinutes: 30,
    worldEnabled: false,
    hapticSignals: false
  }
};

function loadSettings() {
  const out = {};
  const keys = Object.keys(DEFAULT_SETTINGS);
  for (let i = 0; i < keys.length; i++) out[keys[i]] = DEFAULT_SETTINGS[keys[i]];
  const stored = localStorage.getItem("settings");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const pk = Object.keys(parsed);
      for (let i = 0; i < pk.length; i++) out[pk[i]] = parsed[pk[i]];
    } catch (e) {
      console.log("settings parse fail");
    }
  }
  return out;
}

function saveSettings() {
  localStorage.setItem("settings", JSON.stringify(settings));
}

let settings = loadSettings();

/* ── Theme / fonts ────────────────────────────────────────────────────────── */

const THEMES = {
  ink: {
    bg: { r: 0, g: 0, b: 0 },
    fg: { r: 245, g: 245, b: 240 },
    dim: { r: 90, g: 90, b: 88 },
    accent: { r: 85, g: 170, b: 170 },
    rail: { r: 40, g: 40, b: 40 }
  },
  paper: {
    bg: { r: 236, g: 232, b: 220 },
    fg: { r: 28, g: 28, b: 26 },
    dim: { r: 140, g: 136, b: 128 },
    accent: { r: 180, g: 70, b: 50 },
    rail: { r: 200, g: 196, b: 184 }
  },
  night: {
    bg: { r: 8, g: 10, b: 18 },
    fg: { r: 200, g: 210, b: 230 },
    dim: { r: 70, g: 78, b: 96 },
    accent: { r: 100, g: 140, b: 220 },
    rail: { r: 24, g: 28, b: 40 }
  },
  phosphor: {
    bg: { r: 4, g: 16, b: 8 },
    fg: { r: 120, g: 230, b: 140 },
    dim: { r: 40, g: 90, b: 55 },
    accent: { r: 180, g: 255, b: 120 },
    rail: { r: 12, g: 40, b: 22 }
  },
  coral: {
    bg: { r: 28, g: 18, b: 22 },
    fg: { r: 255, g: 236, b: 228 },
    dim: { r: 110, g: 80, b: 85 },
    accent: { r: 255, g: 110, b: 90 },
    rail: { r: 50, g: 32, b: 36 }
  }
};

const PIP_COLORS = {
  calendar: { r: 85, g: 170, b: 255 },
  weather: { r: 90, g: 190, b: 120 },
  health: { r: 255, g: 140, b: 70 },
  system: { r: 255, g: 80, b: 80 },
  sun: { r: 255, g: 200, b: 60 },
  world: { r: 180, g: 120, b: 255 }
};

let bg, fg, dim, accent, railBg;
let pipPalette = {};

function rgb(c) {
  return render.makeColor(c.r, c.g, c.b);
}

function updateColors() {
  let t;
  if (settings.theme === "custom") {
    t = {
      bg: settings.customBg,
      fg: settings.customFg,
      dim: {
        r: (settings.customFg.r * 0.4) | 0,
        g: (settings.customFg.g * 0.4) | 0,
        b: (settings.customFg.b * 0.4) | 0
      },
      accent: settings.customAccent,
      rail: {
        r: (settings.customBg.r + 36) & 0xFF,
        g: (settings.customBg.g + 36) & 0xFF,
        b: (settings.customBg.b + 36) & 0xFF
      }
    };
  } else {
    t = THEMES[settings.theme] || THEMES.ink;
  }
  bg = rgb(t.bg);
  fg = rgb(t.fg);
  dim = rgb(t.dim);
  accent = rgb(t.accent);
  railBg = rgb(t.rail);
  if (!pipPalette.calendar) {
    pipPalette = {
      calendar: rgb(PIP_COLORS.calendar),
      weather: rgb(PIP_COLORS.weather),
      health: rgb(PIP_COLORS.health),
      system: rgb(PIP_COLORS.system),
      sun: rgb(PIP_COLORS.sun),
      world: rgb(PIP_COLORS.world)
    };
  }
}

/* Alloy fonts must match firmware sizes exactly or throw "font not found". */
function pickTimeFont() {
  if (settings.fontScale === "condensed")
    return new render.Font("Bitham-Bold", 42);
  if (settings.fontScale === "bold")
    return new render.Font("Bitham-Black", 30);
  /* display — largest available numeric-friendly face */
  return new render.Font("Roboto-Bold", 49);
}

let timeFont = pickTimeFont();
const detailFont = new render.Font("Gothic-Bold", 18);
const smallFont = new render.Font("Gothic-Regular", 14);

updateColors();

/* ── Runtime state ────────────────────────────────────────────────────────── */

let lastDate = new Date();
let batteryPercent = 100;
let isConnected = true;
let quietTime = false;
let stepCount = 0;
let appReady = false;
let lowPower = false;

let weather = null; /* { temp, code, uv, rainInMin, sunriseMs, sunsetMs } */
let calendar = null; /* { title, startMs } */
let lastLat = null;
let lastLon = null;
let locationSensor = null;
let fetchingWeather = false;
let fetchingCalendar = false;
let lastWeatherFetch = 0;
let lastCalendarFetch = 0;

let activeSignals = []; /* { id, title, detail, priority } */
let knownSignalIds = {};
let detailIndex = -1;
let detailTimer = null;
let showingSeconds = false;
let secondsTimer = null;
let onSecondHandler = null;

const battery = new Battery({
  onSample() {
    batteryPercent = this.sample().percent;
    updateLowPower();
    if (appReady) {
      evaluateSignals(lastDate);
      drawScreen();
    }
  }
});
batteryPercent = battery.sample().percent;

function checkConnection() {
  isConnected = watch.connected.app;
  if (appReady) {
    evaluateSignals(lastDate);
    drawScreen();
  }
}
watch.addEventListener("connected", checkConnection);
checkConnection();

function updateQuietTime() {
  if (typeof watch.quietTimeActive === "boolean")
    quietTime = watch.quietTimeActive;
  else if (typeof watch.quietTime === "boolean")
    quietTime = watch.quietTime;
}

function updateLowPower() {
  lowPower = batteryPercent <= LOW_BATTERY_PCT;
}

function readSteps() {
  try {
    const now = Date.now();
    if (Health.metric.accessible) {
      const access = Health.metric.accessible({
        metric: "step count",
        start: now,
        end: now
      });
      const ok = Health.access ? (access & Health.access.available) : access;
      if (!ok) return;
    }
    stepCount = Health.metric.get("step count") | 0;
  } catch (e) {
    /* health unavailable */
  }
}

/* ── Cache helpers ────────────────────────────────────────────────────────── */

function loadCachedWeather() {
  const cached = localStorage.getItem("weather");
  const cachedTime = localStorage.getItem("weatherTime");
  if (cached && cachedTime) {
    const age = Date.now() - Number(cachedTime);
    if (age < 60 * 60 * 1000) {
      try {
        weather = JSON.parse(cached);
        lastWeatherFetch = Number(cachedTime);
        return true;
      } catch (e) {}
    }
  }
  return false;
}

function saveWeatherCache() {
  if (weather) {
    localStorage.setItem("weather", JSON.stringify(weather));
    localStorage.setItem("weatherTime", String(Date.now()));
  }
}

function loadCachedCalendar() {
  const cached = localStorage.getItem("calendar");
  const cachedTime = localStorage.getItem("calendarTime");
  if (cached && cachedTime) {
    const age = Date.now() - Number(cachedTime);
    if (age < 60 * 60 * 1000) {
      try {
        calendar = JSON.parse(cached);
        lastCalendarFetch = Number(cachedTime);
        return true;
      } catch (e) {}
    }
  }
  return false;
}

function saveCalendarCache() {
  if (calendar) {
    localStorage.setItem("calendar", JSON.stringify(calendar));
    localStorage.setItem("calendarTime", String(Date.now()));
  } else {
    localStorage.removeItem("calendar");
    localStorage.setItem("calendarTime", String(Date.now()));
  }
}

loadCachedWeather();
loadCachedCalendar();
readSteps();
updateQuietTime();
updateLowPower();

/* ── Formatting ───────────────────────────────────────────────────────────── */

function formatAlwaysOn(now) {
  switch (settings.alwaysOn) {
    case "date":
      return `${MONTHS[now.getMonth()]} ${now.getDate()}`;
    case "weekday":
      return DAYS[now.getDay()];
    case "battery":
      return `${batteryPercent}%`;
    case "steps":
      return String(stepCount);
    default:
      return "";
  }
}

function minutesUntil(ms, now) {
  return Math.round((ms - now.getTime()) / 60000);
}

/* ── Signal engine ────────────────────────────────────────────────────────── */

function expectedSteps(now) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = 7 * 60;
  const end = 22 * 60;
  if (minutes <= start) return 0;
  if (minutes >= end) return settings.stepGoal;
  const progress = (minutes - start) / (end - start);
  return (settings.stepGoal * progress) | 0;
}

function otherLocalHour(now) {
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  let h = utcHours + settings.worldOffset;
  while (h < 0) h += 24;
  while (h >= 24) h -= 24;
  return h;
}

function buildSignals(now) {
  const list = [];
  const peek = settings.peekMode;

  if (settings.calEnabled && calendar && calendar.startMs) {
    const mins = minutesUntil(calendar.startMs, now);
    if (mins >= 0 && (peek || mins <= settings.calMinutes)) {
      list.push({
        id: "calendar",
        title: calendar.title || "Event",
        detail: mins === 0 ? "starting now" : `in ${mins}m`,
        priority: 10
      });
    }
  }

  if (settings.wxEnabled && weather) {
    if (weather.rainInMin != null && weather.rainInMin >= 0 &&
        (peek || weather.rainInMin <= settings.wxRainMin)) {
      list.push({
        id: "weather",
        title: "Rain soon",
        detail: `in ~${weather.rainInMin}m`,
        priority: 20
      });
    } else if (weather.uv != null && (peek || weather.uv >= settings.wxUv)) {
      list.push({
        id: "weather",
        title: `UV ${weather.uv}`,
        detail: "sun protection",
        priority: 22
      });
    } else if (weather.temp != null &&
        (peek || weather.temp <= settings.wxTempLow || weather.temp >= settings.wxTempHigh)) {
      const unit = settings.useFahrenheit ? "F" : "C";
      list.push({
        id: "weather",
        title: `${weather.temp}°${unit}`,
        detail: weather.temp <= settings.wxTempLow ? "below comfort" : "above comfort",
        priority: 24
      });
    }
  }

  if (settings.healthEnabled) {
    const expected = expectedSteps(now);
    if (expected > 0) {
      const behind = expected - stepCount;
      const pctBehind = (behind / expected) * 100;
      if (peek || pctBehind >= settings.paceBehindPct) {
        list.push({
          id: "health",
          title: "Behind pace",
          detail: `${stepCount} / ~${expected}`,
          priority: 30
        });
      }
    }
  }

  if (settings.sysEnabled) {
    if (!isConnected) {
      list.push({
        id: "system",
        title: "Phone away",
        detail: "Bluetooth disconnected",
        priority: 5
      });
    } else if (quietTime) {
      list.push({
        id: "system",
        title: "Quiet Time",
        detail: "haptics muted",
        priority: 40
      });
    } else if (batteryPercent <= settings.batThreshold) {
      list.push({
        id: "system",
        title: `Battery ${batteryPercent}%`,
        detail: "charge soon",
        priority: 8
      });
    }
  }

  if (settings.sunEnabled && weather) {
    const events = [];
    if (weather.sunriseMs) events.push({ label: "Sunrise", ms: weather.sunriseMs });
    if (weather.sunsetMs) events.push({ label: "Sunset", ms: weather.sunsetMs });
    for (const ev of events) {
      const mins = minutesUntil(ev.ms, now);
      if (mins >= 0 && (peek || mins <= settings.sunMinutes)) {
        list.push({
          id: "sun",
          title: ev.label,
          detail: mins === 0 ? "now" : `in ${mins}m`,
          priority: 35
        });
        break;
      }
    }
  }

  if (settings.worldEnabled) {
    const h = otherLocalHour(now);
    const start = settings.worldStart;
    const end = settings.worldEnd;
    const inWindow = start <= end
      ? (h >= start && h < end)
      : (h >= start || h < end);
    if (peek || inWindow) {
      const theirH = h | 0;
      const theirM = ((h % 1) * 60) | 0;
      list.push({
        id: "world",
        title: "Overlap window",
        detail: `theirs ${String(theirH).padStart(2, "0")}:${String(theirM).padStart(2, "0")}`,
        priority: 45
      });
    }
  }

  list.sort((a, b) => a.priority - b.priority);
  return list.slice(0, MAX_PIPS);
}

function evaluateSignals(now) {
  updateQuietTime();
  const next = buildSignals(now);
  let newHigh = false;
  for (const s of next) {
    if (!knownSignalIds[s.id + ":" + s.title]) {
      if (s.priority <= 20) newHigh = true;
    }
  }
  const map = {};
  for (const s of next) map[s.id + ":" + s.title] = true;
  knownSignalIds = map;
  activeSignals = next;

  if (newHigh && settings.hapticSignals && !quietTime && !lowPower) {
    try { Vibes.shortPulse(); } catch (e) {}
  }
}

/* ── Layout / drawing ─────────────────────────────────────────────────────── */

function contentHeight() {
  return render.unobstructed.height;
}

function contentWidth() {
  return render.unobstructed.width;
}

function railGeometry() {
  const w = contentWidth();
  const h = contentHeight();
  const railH = 12;
  const margin = IS_ROUND ? 36 : 14;
  const y = h - railH - (IS_ROUND ? 24 : 12);
  return { x: margin, y, width: w - margin * 2, height: railH };
}

function timeParts(now, withSeconds) {
  let hours = now.getHours();
  if (!settings.use24Hour) hours = hours % 12 || 12;
  const h = settings.leadingZero ? String(hours).padStart(2, "0") : String(hours);
  const m = String(now.getMinutes()).padStart(2, "0");
  if (withSeconds) {
    return { hours: h, minutes: m + ":" + String(now.getSeconds()).padStart(2, "0") };
  }
  return { hours: h, minutes: m };
}

/* Accent shifts through the day so the face changes character every few hours. */
function livingAccentRGB(now) {
  const hr = now.getHours();
  if (hr < 6) return { r: 110, g: 130, b: 220 };
  if (hr < 9) return { r: 255, g: 150, b: 70 };
  if (hr < 12) return { r: 70, g: 200, b: 170 };
  if (hr < 15) return { r: 70, g: 170, b: 230 };
  if (hr < 18) return { r: 255, g: 120, b: 90 };
  if (hr < 21) return { r: 200, g: 110, b: 220 };
  return { r: 120, g: 140, b: 230 };
}

function momentWord(now) {
  const hr = now.getHours();
  if (hr < 5) return "LATE";
  if (hr < 7) return "DAWN";
  if (hr < 11) return "MORNING";
  if (hr < 13) return "MIDDAY";
  if (hr < 17) return "AFTERNOON";
  if (hr < 19) return "GOLDEN";
  if (hr < 22) return "EVENING";
  return "NIGHT";
}

function drawPoster(now, withSeconds) {
  const w = contentWidth();
  const h = contentHeight();
  const parts = timeParts(now, withSeconds);
  const live = rgb(livingAccentRGB(now));
  const always = lowPower ? `${batteryPercent}%` : formatAlwaysOn(now);
  const moment = momentWord(now);
  const dayPct = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
  const g = railGeometry();
  const pad = IS_ROUND ? 22 : 6;

  /* Thin day stripe */
  const stripeW = 4;
  const stripeTop = IS_ROUND ? 34 : 26;
  const stripeBot = g.y - 8;
  const stripeSpan = stripeBot - stripeTop;
  const stripeH = Math.max(16, (stripeSpan * dayPct) | 0);
  render.fillRectangle(railBg, pad, stripeTop, stripeW, stripeSpan);
  render.fillRectangle(live, pad, stripeBot - stripeH, stripeW, stripeH);

  /* Compact header */
  const headerY = IS_ROUND ? 18 : 4;
  const day = DAYS[now.getDay()].toUpperCase();
  render.drawText(day, smallFont, dim, pad + stripeW + 5, headerY);
  const momW = render.getTextWidth(moment, smallFont);
  render.drawText(moment, smallFont, live, w - pad - momW, headerY);

  /*
   * Stacked hero time. Digits alone can't fill 200px width, so the
   * minute plate goes nearly full-bleed — that's the visual mass.
   */
  const chipPadY = 4;
  const hourW = render.getTextWidth(parts.hours, timeFont);
  const minW = render.getTextWidth(parts.minutes, timeFont);
  const chipW = w - pad * 2 - stripeW - 4;
  const chipH = timeFont.height + chipPadY * 2;
  const stackGap = -6; /* nest hours slightly into the plate */
  const metaH = always ? smallFont.height + 2 : 0;
  const blockH = timeFont.height + stackGap + chipH + metaH;

  const topBound = headerY + smallFont.height + 2;
  const botBound = g.y - 6;
  let hourY = topBound + (((botBound - topBound - blockH) / 2) | 0);
  if (hourY < topBound) hourY = topBound;

  const chipX = pad + stripeW + 2;
  const chipY = hourY + timeFont.height + stackGap;
  render.fillRectangle(live, chipX, chipY, chipW, chipH);
  render.drawText(parts.hours, timeFont, fg, ((w - hourW) / 2) | 0, hourY);
  render.drawText(parts.minutes, timeFont, bg, ((w - minW) / 2) | 0, chipY + chipPadY);

  if (always) {
    const aw = render.getTextWidth(always, smallFont);
    render.drawText(always, smallFont, dim, ((w - aw) / 2) | 0, chipY + chipH + 1);
  }
}

function drawSignalRail(now) {
  if (lowPower) return;
  const g = railGeometry();
  const live = rgb(livingAccentRGB(now));
  render.fillRectangle(railBg, g.x, g.y, g.width, g.height);

  const count = activeSignals.length;
  if (!count) {
    const fill = Math.max(3, ((g.width * now.getMinutes()) / 60) | 0);
    render.fillRectangle(live, g.x, g.y, fill, g.height);
    render.fillRectangle(fg, g.x + fill - 2, g.y - 2, 3, g.height + 4);
    return;
  }

  const gap = 3;
  const pipW = Math.max(14, ((g.width - gap * (MAX_PIPS - 1)) / MAX_PIPS) | 0);
  let x = g.x;
  for (let i = 0; i < count; i++) {
    const s = activeSignals[i];
    const color = pipPalette[s.id] || live;
    render.fillRectangle(color, x, g.y, pipW, g.height);
    if (detailIndex === i) {
      render.fillRectangle(fg, x, g.y - 4, pipW, 3);
    }
    x += pipW + gap;
  }
}

function drawDetailCard() {
  if (detailIndex < 0 || detailIndex >= activeSignals.length) return;
  const s = activeSignals[detailIndex];
  const w = contentWidth();
  const h = contentHeight();
  const cardH = detailFont.height + smallFont.height + 12;
  const y = (IS_ROUND ? h * 0.58 : h * 0.55) | 0;
  const live = rgb(livingAccentRGB(lastDate));

  render.fillRectangle(bg, 10, y - 2, w - 20, cardH + 4);
  render.fillRectangle(live, 10, y - 2, w - 20, 3);
  render.drawText(s.title, detailFont, fg, 16, y + 6);
  render.drawText(s.detail, smallFont, dim, 16, y + 6 + detailFont.height + 2);
}

function drawScreen(event) {
  const now = event?.date ?? lastDate;
  if (event?.date) lastDate = event.date;

  render.begin();
  render.fillRectangle(bg, 0, 0, render.width, render.height);
  drawPoster(now, showingSeconds);
  if (!lowPower) {
    drawSignalRail(now);
    if (detailIndex >= 0) drawDetailCard();
  }
  render.end();
}

/* Full redraw on the minute — stacked time + atmosphere share the frame. */
function drawTimeOnly(now) {
  drawScreen({ date: now });
}

function drawRailOnly() {
  drawScreen({ date: lastDate });
}

/* ── Detail / seconds interaction ─────────────────────────────────────────── */

function clearDetailTimer() {
  if (detailTimer) {
    clearTimeout(detailTimer);
    detailTimer = null;
  }
}

function clearSecondsTimer() {
  if (secondsTimer) {
    clearTimeout(secondsTimer);
    secondsTimer = null;
  }
}

function hideDetail() {
  detailIndex = -1;
  clearDetailTimer();
  drawScreen();
}

function showDetail(index) {
  if (!activeSignals.length) {
    hideDetail();
    return;
  }
  detailIndex = ((index % activeSignals.length) + activeSignals.length) % activeSignals.length;
  clearDetailTimer();
  detailTimer = setTimeout(() => {
    detailTimer = null;
    hideDetail();
  }, DETAIL_MS);
  drawScreen();
}

function stopSeconds() {
  showingSeconds = false;
  clearSecondsTimer();
}

function startSecondsBriefly() {
  if (!settings.secondsOnFlick || lowPower) return;
  showingSeconds = true;
  clearSecondsTimer();
  if (!onSecondHandler) {
    onSecondHandler = (e) => {
      if (!showingSeconds) return;
      lastDate = e.date;
      drawTimeOnly(e.date);
    };
    watch.addEventListener("secondchange", onSecondHandler);
  }
  secondsTimer = setTimeout(() => {
    secondsTimer = null;
    stopSeconds();
    drawScreen();
  }, SECONDS_MS);
}

function onTap() {
  if (lowPower) {
    drawScreen();
    return;
  }
  if (activeSignals.length) {
    if (detailIndex < 0) showDetail(0);
    else showDetail(detailIndex + 1);
  }
  startSecondsBriefly();
}

const accel = new Accelerometer({
  onTap() { onTap(); }
});

/* ── Weather + calendar data ──────────────────────────────────────────────── */

function parseIcsDate(value) {
  if (!value) return null;
  const v = value.trim();
  /* YYYYMMDDTHHMMSS or with Z */
  const m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/);
  if (!m) return null;
  if (v.endsWith("Z")) {
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  }
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime();
}

function parseNextEvent(icsText, nowMs) {
  if (!icsText) return null;
  const blocks = icsText.split("BEGIN:VEVENT");
  let best = null;
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split("END:VEVENT")[0];
    let summary = "Event";
    let startMs = null;
    const lines = block.replace(/\r\n /g, "").split(/\r?\n/);
    for (const line of lines) {
      if (line.indexOf("SUMMARY") === 0) {
        const idx = line.indexOf(":");
        if (idx >= 0) summary = line.slice(idx + 1).trim() || "Event";
      } else if (line.indexOf("DTSTART") === 0) {
        const idx = line.indexOf(":");
        if (idx >= 0) startMs = parseIcsDate(line.slice(idx + 1));
      }
    }
    if (startMs != null && startMs >= nowMs - 60000) {
      if (!best || startMs < best.startMs) {
        best = { title: summary.slice(0, 28), startMs };
      }
    }
  }
  return best;
}

function findRainMinutes(hourly, now) {
  if (!hourly || !hourly.time || !hourly.precipitation_probability) return null;
  const horizon = settings.wxRainMin;
  for (let i = 0; i < hourly.time.length; i++) {
    const t = Date.parse(hourly.time[i]);
    if (!Number.isFinite(t)) continue;
    const mins = Math.round((t - now.getTime()) / 60000);
    if (mins < 0 || mins > horizon + 30) continue;
    const prob = hourly.precipitation_probability[i];
    if (prob >= 50) return Math.max(0, mins);
  }
  return null;
}

async function fetchWeather(lat, lon) {
  if (fetchingWeather) return;
  fetchingWeather = true;
  try {
    const unit = settings.useFahrenheit ? "fahrenheit" : "celsius";
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code,uv_index` +
      `&hourly=precipitation_probability` +
      `&daily=sunrise,sunset&forecast_days=1` +
      `&temperature_unit=${unit}&timezone=auto`;
    const response = await fetch(url, { headers: [] });
    const data = await response.json();
    const now = new Date();
    const rainInMin = findRainMinutes(data.hourly, now);
    let sunriseMs = null;
    let sunsetMs = null;
    if (data.daily && data.daily.sunrise && data.daily.sunrise[0])
      sunriseMs = Date.parse(data.daily.sunrise[0]);
    if (data.daily && data.daily.sunset && data.daily.sunset[0])
      sunsetMs = Date.parse(data.daily.sunset[0]);

    weather = {
      temp: Math.round(data.current.temperature_2m),
      code: data.current.weather_code | 0,
      uv: data.current.uv_index != null ? Math.round(data.current.uv_index) : null,
      rainInMin,
      sunriseMs: Number.isFinite(sunriseMs) ? sunriseMs : null,
      sunsetMs: Number.isFinite(sunsetMs) ? sunsetMs : null
    };
    lastWeatherFetch = Date.now();
    saveWeatherCache();
    evaluateSignals(lastDate);
    drawScreen();
  } catch (e) {
    console.log("weather error: " + e);
  } finally {
    fetchingWeather = false;
  }
}

function requestLocation() {
  if (!settings.wxEnabled && !settings.sunEnabled) return;
  if (locationSensor) {
    try { locationSensor.close(); } catch (e) {}
    locationSensor = null;
  }
  try {
    locationSensor = new Location({
      onSample() {
        const sample = this.sample();
        this.close();
        locationSensor = null;
        lastLat = sample.latitude;
        lastLon = sample.longitude;
        fetchWeather(sample.latitude, sample.longitude);
      }
    });
  } catch (e) {
    console.log("location error: " + e);
  }
}

async function fetchCalendar() {
  if (!settings.calEnabled || !settings.icsUrl) {
    calendar = null;
    return;
  }
  if (fetchingCalendar) return;
  fetchingCalendar = true;
  try {
    const response = await fetch(settings.icsUrl, { headers: [] });
    const text = await response.text();
    calendar = parseNextEvent(text, Date.now());
    lastCalendarFetch = Date.now();
    saveCalendarCache();
    evaluateSignals(lastDate);
    drawScreen();
  } catch (e) {
    console.log("calendar error: " + e);
  } finally {
    fetchingCalendar = false;
  }
}

function maybeRefreshData(force) {
  const now = Date.now();
  if (force || now - lastWeatherFetch > WEATHER_INTERVAL_MS) {
    if (lastLat != null && lastLon != null) fetchWeather(lastLat, lastLon);
    else requestLocation();
  }
  if (force || now - lastCalendarFetch > WEATHER_INTERVAL_MS) {
    fetchCalendar();
  }
}

/* ── Minute tick ──────────────────────────────────────────────────────────── */

function onMinute(e) {
  lastDate = e.date;
  readSteps();
  updateQuietTime();
  updateLowPower();
  evaluateSignals(e.date);

  if (showingSeconds || detailIndex >= 0) {
    drawScreen(e);
  } else {
    drawTimeOnly(e.date);
    drawRailOnly();
  }

  if (e.date.getMinutes() % 30 === 0) {
    maybeRefreshData(false);
  }
}

watch.addEventListener("minutechange", onMinute);
watch.addEventListener("resize", () => drawScreen());
watch.addEventListener("health", (what) => {
  if (what === "movement" || what === "significant") {
    readSteps();
    evaluateSignals(lastDate);
    if (settings.alwaysOn === "steps" || settings.healthEnabled) {
      drawScreen();
    }
  }
});

/* ── Clay / AppMessage ────────────────────────────────────────────────────── */

function colorFromInt(v) {
  return {
    r: (v >> 16) & 0xFF,
    g: (v >> 8) & 0xFF,
    b: v & 0xFF
  };
}

function asBool(v, fallback) {
  if (v === undefined) return fallback;
  if (v === true || v === 1 || v === "1" || v === "true") return true;
  if (v === false || v === 0 || v === "0" || v === "false") return false;
  return fallback;
}

function asNumber(v, fallback) {
  if (v === undefined || v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asString(v, fallback) {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

function applyPreset(name) {
  const p = PRESETS[name];
  if (!p) return;
  const keys = Object.keys(p);
  for (let i = 0; i < keys.length; i++) {
    settings[keys[i]] = p[keys[i]];
  }
  settings.preset = name;
}

const MESSAGE_KEYS = [
  "Preset", "Theme", "CustomBg", "CustomFg", "CustomAccent",
  "FontScale", "AlwaysOn", "Use24Hour", "LeadingZero",
  "PeekMode", "SecondsOnFlick", "HapticSignals",
  "CalEnabled", "CalMinutes", "IcsUrl",
  "WxEnabled", "WxRainMin", "WxUv", "WxTempLow", "WxTempHigh", "UseFahrenheit",
  "HealthEnabled", "StepGoal", "PaceBehindPct",
  "SysEnabled", "BatThreshold",
  "SunEnabled", "SunMinutes",
  "WorldEnabled", "WorldOffset", "WorldStart", "WorldEnd"
];

const message = new Message({
  /* Keep AppMessage buffers small — large inboxes burn chunk/slot heap. */
  input: 512,
  output: 256,
  keys: MESSAGE_KEYS,
  onReadable() {
    try {
      const msg = this.read();
      const get = (key) => {
        let v;
        if (msg && typeof msg.get === "function") v = msg.get(key);
        else if (msg && (key in msg)) v = msg[key];
        if (v && typeof v === "object" && ("value" in v)) v = v.value;
        return v;
      };

      const preset = asString(get("Preset"), settings.preset);
      const ics = get("IcsUrl");

      /* Shared prefs always applied */
      settings.use24Hour = asBool(get("Use24Hour"), settings.use24Hour);
      settings.leadingZero = asBool(get("LeadingZero"), settings.leadingZero);
      settings.useFahrenheit = asBool(get("UseFahrenheit"), settings.useFahrenheit);
      if (ics !== undefined) settings.icsUrl = asString(ics, settings.icsUrl);

      if (preset && preset !== "custom" && PRESETS[preset]) {
        /* Preset wins over the rest of the form so one-tap setups stick. */
        applyPreset(preset);
      } else {
        settings.preset = "custom";

        const theme = get("Theme");
        if (theme !== undefined) settings.theme = asString(theme, settings.theme);

        const cbg = get("CustomBg");
        if (cbg !== undefined) settings.customBg = colorFromInt(cbg);
        const cfg = get("CustomFg");
        if (cfg !== undefined) settings.customFg = colorFromInt(cfg);
        const cac = get("CustomAccent");
        if (cac !== undefined) settings.customAccent = colorFromInt(cac);

        const fs = get("FontScale");
        if (fs !== undefined) settings.fontScale = asString(fs, settings.fontScale);
        const ao = get("AlwaysOn");
        if (ao !== undefined) settings.alwaysOn = asString(ao, settings.alwaysOn);

        settings.peekMode = asBool(get("PeekMode"), settings.peekMode);
        settings.secondsOnFlick = asBool(get("SecondsOnFlick"), settings.secondsOnFlick);
        settings.hapticSignals = asBool(get("HapticSignals"), settings.hapticSignals);

        settings.calEnabled = asBool(get("CalEnabled"), settings.calEnabled);
        settings.calMinutes = asNumber(get("CalMinutes"), settings.calMinutes);

        settings.wxEnabled = asBool(get("WxEnabled"), settings.wxEnabled);
        settings.wxRainMin = asNumber(get("WxRainMin"), settings.wxRainMin);
        settings.wxUv = asNumber(get("WxUv"), settings.wxUv);
        settings.wxTempLow = asNumber(get("WxTempLow"), settings.wxTempLow);
        settings.wxTempHigh = asNumber(get("WxTempHigh"), settings.wxTempHigh);

        settings.healthEnabled = asBool(get("HealthEnabled"), settings.healthEnabled);
        settings.stepGoal = asNumber(get("StepGoal"), settings.stepGoal);
        settings.paceBehindPct = asNumber(get("PaceBehindPct"), settings.paceBehindPct);

        settings.sysEnabled = asBool(get("SysEnabled"), settings.sysEnabled);
        settings.batThreshold = asNumber(get("BatThreshold"), settings.batThreshold);

        settings.sunEnabled = asBool(get("SunEnabled"), settings.sunEnabled);
        settings.sunMinutes = asNumber(get("SunMinutes"), settings.sunMinutes);

        settings.worldEnabled = asBool(get("WorldEnabled"), settings.worldEnabled);
        settings.worldOffset = asNumber(get("WorldOffset"), settings.worldOffset);
        settings.worldStart = asNumber(get("WorldStart"), settings.worldStart);
        settings.worldEnd = asNumber(get("WorldEnd"), settings.worldEnd);
      }

      timeFont = pickTimeFont();
      saveSettings();
      updateColors();
      evaluateSignals(lastDate);
      drawScreen();
      maybeRefreshData(true);
    } catch (e) {
      console.log("settings error: " + e);
    }
  }
});

/* ── Boot ─────────────────────────────────────────────────────────────────── */

evaluateSignals(lastDate);
appReady = true;
drawScreen();
/* Defer network work so startup fits in the slot heap. */
setTimeout(() => {
  maybeRefreshData(true);
}, 2500);

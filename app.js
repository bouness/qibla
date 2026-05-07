/**
 * Qibla PWA — app.js
 * Pure vanilla JS — zero external dependencies.
 */
'use strict';

/* ── Constants ───────────────────────────────────────────── */
const KAABA   = { lat: 21.4225, lng: 39.8262 };
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

const PRAYERS = [
  { key: 'fajr',    nameEn: 'Fajr',    nameAr: 'الفجر',   icon: 'ti-moon-stars' },
  { key: 'sunrise', nameEn: 'Sunrise', nameAr: 'الشروق',  icon: 'ti-sunrise' },
  { key: 'dhuhr',   nameEn: 'Dhuhr',   nameAr: 'الظهر',   icon: 'ti-sun',
    fridayEn: "Jumu'ah", fridayAr: 'الجمعة', fridayIcon: 'ti-building-mosque' },
  { key: 'asr',     nameEn: 'Asr',     nameAr: 'العصر',   icon: 'ti-sun-low' },
  { key: 'maghrib', nameEn: 'Maghrib', nameAr: 'المغرب',  icon: 'ti-sunset' },
  { key: 'isha',    nameEn: 'Isha',    nameAr: 'العشاء',  icon: 'ti-stars' },
];

const CARDINAL = [
  [0,   22.5,  'N',  'ش'],  [22.5, 67.5,  'NE', 'ش.ق'],
  [67.5,112.5, 'E',  'ق'],  [112.5,157.5, 'SE', 'ج.ق'],
  [157.5,202.5,'S',  'ج'],  [202.5,247.5, 'SW', 'ج.غ'],
  [247.5,292.5,'W',  'غ'],  [292.5,337.5, 'NW', 'ش.غ'],
  [337.5,360,  'N',  'ش'],
];

const I18N = {
  en: {
    location: 'Location', searchPlaceholder: 'City, address or ZIP…',
    calcMethod: 'Calculation method', search: 'Search',
    darkMode: 'Dark mode', emptyTitle: 'Find your Qibla & prayer times',
    emptySub: 'Enter a city, address, or ZIP code in the panel on the left to get started.',
    emptyBtn: 'Enter location', prayerTimes: 'Prayer times',
    qiblaDirection: 'Qibla direction', installPrompt: 'Add to home screen for offline use',
    install: 'Install', loading: 'Finding your location…',
    errorNotFound: 'Location not found. Try a city name or ZIP code.',
    errorNetwork: 'Network error. Check your connection.',
    faceHint: 'Face towards', kmToMecca: 'km to Mecca',
    nowBadge: 'Now', nextBadge: 'Next',
  },
  ar: {
    location: 'الموقع', searchPlaceholder: 'المدينة أو العنوان أو الرمز البريدي…',
    calcMethod: 'طريقة الحساب', search: 'بحث',
    darkMode: 'الوضع الداكن', emptyTitle: 'اعثر على القبلة ومواقيت الصلاة',
    emptySub: 'أدخل اسم مدينة أو عنواناً أو رمزاً بريدياً في اللوحة للبدء.',
    emptyBtn: 'أدخل الموقع', prayerTimes: 'مواقيت الصلاة',
    qiblaDirection: 'اتجاه القبلة', installPrompt: 'أضف التطبيق إلى الشاشة الرئيسية',
    install: 'تثبيت', loading: 'جارٍ تحديد موقعك…',
    errorNotFound: 'الموقع غير موجود. جرّب اسم المدينة أو الرمز البريدي.',
    errorNetwork: 'خطأ في الشبكة. تحقق من الاتصال.',
    faceHint: 'اتجه نحو', kmToMecca: 'كم إلى مكة',
    nowBadge: 'الآن', nextBadge: 'التالية',
  },
};

/* ── Prayer calculation methods ──────────────────────────── */
const METHODS = {
  MuslimWorldLeague: { fajr: 18,   isha: 17 },
  NorthAmerica:      { fajr: 15,   isha: 15 },
  Egyptian:          { fajr: 19.5, isha: 17.5 },
  UmmAlQura:         { fajr: 18.5, isha: 90,  ishaMin: true },
  Dubai:             { fajr: 18.2, isha: 18.2 },
  Kuwait:            { fajr: 18,   isha: 17.5 },
  Qatar:             { fajr: 18,   isha: 90,  ishaMin: true },
  Singapore:         { fajr: 20,   isha: 18 },
  Turkey:            { fajr: 18,   isha: 17 },
  Tehran:            { fajr: 17.7, isha: 14 },
  Karachi:           { fajr: 18,   isha: 18 },
};

/* ── Solar math helpers ───────────────────────────────────── */
const fixAngle = a => a - 360 * Math.floor(a / 360);
const fixA180  = a => a - 360 * Math.floor((a + 180) / 360);
const sinD  = d => Math.sin(d * DEG2RAD);
const cosD  = d => Math.cos(d * DEG2RAD);
const tanD  = d => Math.tan(d * DEG2RAD);
const asinD = r => Math.asin(r) * RAD2DEG;
const acosD = r => Math.acos(r) * RAD2DEG;
const atan2D = (y, x) => Math.atan2(y, x) * RAD2DEG;

function julianDay(date) {
  const Y = date.getFullYear(), M = date.getMonth() + 1, D = date.getDate();
  const A = Math.floor((14 - M) / 12), y = Y + 4800 - A, m = M + 12 * A - 3;
  return D + Math.floor((153*m+2)/5) + 365*y + Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400) - 32045;
}

function sunPosition(jd) {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * sinD(g) + 0.020 * sinD(2 * g));
  const e = 23.439 - 0.00000036 * D;
  const RA = atan2D(cosD(e) * sinD(L), cosD(L)) / 15;
  const dec = asinD(sinD(e) * sinD(L));
  const EqT = q / 15 - fixA180(RA);
  return { dec, EqT };
}

function hourAngle(lat, dec, alt) {
  const cosH = (sinD(alt) - sinD(lat) * sinD(dec)) / (cosD(lat) * cosD(dec));
  return acosD(Math.max(-1, Math.min(1, cosH))) / 15;
}

function calcPrayerTimes(lat, lng) {
  const now    = new Date();
  const method = METHODS[state.method] || METHODS.NorthAmerica;
  const jd     = julianDay(now);
  const tz     = -now.getTimezoneOffset() / 60;
  const { dec, EqT } = sunPosition(jd);

  const noon    = 12 - lng / 15 - EqT + tz;
  const riseSet = hourAngle(lat, dec, -0.833);
  const sunrise = noon - riseSet;
  const sunset  = noon + riseSet;
  const fajr    = noon - hourAngle(lat, dec, -method.fajr);
  const isha    = method.ishaMin
    ? sunset + method.isha / 60
    : noon + hourAngle(lat, dec, -method.isha);
  const asrAlt  = Math.atan(1 / (1 + tanD(Math.abs(lat - dec)))) * RAD2DEG;
  const asr     = noon + hourAngle(lat, dec, asrAlt);

  const toDate = h => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setTime(d.getTime() + h * 3600000);
    return d;
  };
  return { fajr: toDate(fajr), sunrise: toDate(sunrise), dhuhr: toDate(noon), asr: toDate(asr), maghrib: toDate(sunset), isha: toDate(isha) };
}

/* ── Qibla + distance ─────────────────────────────────────── */
function calcQibla(lat, lng) {
  const φ1 = lat * DEG2RAD, φ2 = KAABA.lat * DEG2RAD;
  const Δλ = (KAABA.lng - lng) * DEG2RAD;
  const y = Math.sin(Δλ) * cosD(KAABA.lat);
  const x = cosD(lat) * sinD(KAABA.lat) - sinD(lat) * cosD(KAABA.lat) * Math.cos(Δλ);
  return (Math.atan2(y, x) * RAD2DEG + 360) % 360;
}

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371, dL = (lat2-lat1)*DEG2RAD, dG = (lng2-lng1)*DEG2RAD;
  const a = Math.sin(dL/2)**2 + cosD(lat1)*cosD(lat2)*Math.sin(dG/2)**2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function getCardinal(deg) {
  const e = CARDINAL.find(c => deg >= c[0] && deg < c[1]) || CARDINAL[0];
  return state.lang === 'ar' ? e[3] : e[2];
}

/* ── State ───────────────────────────────────────────────── */
let state = { lang: 'en', theme: 'dark', method: 'NorthAmerica', lastLocation: null };

/* ── DOM refs ─────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const locationInput = $('locationInput'), searchBtn = $('searchBtn'),
      clearBtn = $('clearBtn'), methodSelect = $('methodSelect'),
      statusMsg = $('statusMsg'), emptyState = $('emptyState'),
      results = $('results'), locName = $('locName'),
      locCoords = $('locCoords'), locDist = $('locDist'),
      locationChip = $('locationChip'), chipName = $('chipName'),
      chipCoords = $('chipCoords'), chipDistance = $('chipDistance'),
      needleRing = $('needleRing'), qiblaDeg = $('qiblaDeg'),
      qiblaDegreesSmall = $('qiblaDegreesSmall'),
      qiblaCardinal = $('qiblaCardinal'), qiblaHint = $('qiblaHint'),
      prayerList = $('prayerList'), prayerDate = $('prayerDate'),
      hijriDate = $('hijriDate'), installBanner = $('installBanner'),
      installBtn = $('installBtn'), dismissInstall = $('dismissInstall'),
      langToggle = $('langToggle'), darkToggle = $('darkToggle'),
      compassTicks = $('compassTicks'), sidebar = $('sidebar'),
      sidebarOverlay = $('sidebarOverlay'), mobMenuBtn = $('mobMenuBtn'),
      mobDark = $('mobDark'), emptyCta = $('emptyCta');

/* ── Init ────────────────────────────────────────────────── */
function init() {
  loadSettings();
  applyTheme();
  applyLang();
  buildCompassTicks();
  restoreLastLocation();
  bindEvents();
  registerSW();
}

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('qibla_settings') || '{}');
    state.lang  = s.lang  || 'en';
    state.theme = s.theme || 'dark';
    state.method = s.method || 'NorthAmerica';
    state.lastLocation = s.lastLocation || null;
  } catch {}
  methodSelect.value = state.method;
}

function saveSettings() {
  localStorage.setItem('qibla_settings', JSON.stringify(state));
}

function restoreLastLocation() {
  if (state.lastLocation) {
    locationInput.value = state.lastLocation.rawInput || state.lastLocation.displayName;
    clearBtn.hidden = false;
    renderResults(state.lastLocation);
  }
}

/* ── Events ─────────────────────────────────────────────── */
function bindEvents() {
  searchBtn.addEventListener('click', handleSearch);
  locationInput.addEventListener('keydown', e => e.key === 'Enter' && handleSearch());
  locationInput.addEventListener('input', () => { clearBtn.hidden = !locationInput.value; });
  clearBtn.addEventListener('click', () => { locationInput.value = ''; clearBtn.hidden = true; locationInput.focus(); });
  methodSelect.addEventListener('change', () => {
    state.method = methodSelect.value; saveSettings();
    if (state.lastLocation) renderPrayerTimes(state.lastLocation);
  });
  langToggle.addEventListener('click', toggleLang);
  darkToggle.addEventListener('click', toggleTheme);
  mobDark.addEventListener('click', toggleTheme);
  dismissInstall.addEventListener('click', () => { installBanner.hidden = true; });
  emptyCta.addEventListener('click', openSidebar);
  mobMenuBtn.addEventListener('click', openSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);
}

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('open');
  sidebarOverlay.removeAttribute('aria-hidden');
  locationInput.focus();
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
  sidebarOverlay.setAttribute('aria-hidden', 'true');
}

/* ── Geocoding ───────────────────────────────────────────── */
async function handleSearch() {
  const query = locationInput.value.trim();
  if (!query) { openSidebar(); locationInput.focus(); return; }
  setStatus('loading');
  searchBtn.disabled = true;
  try {
    const loc = await geocode(query);
    loc.rawInput = query;
    state.lastLocation = loc;
    saveSettings();
    clearStatus();
    closeSidebar();
    renderResults(loc);
  } catch (err) {
    const t = I18N[state.lang];
    setStatus('error', err.networkError ? t.errorNetwork : t.errorNotFound);
  } finally {
    searchBtn.disabled = false;
  }
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`;
  let res;
  try { res = await fetch(url, { headers: { 'Accept-Language': state.lang } }); }
  catch { const e = new Error('net'); e.networkError = true; throw e; }
  if (!res.ok) { const e = new Error('http'); e.networkError = true; throw e; }
  const data = await res.json();
  if (!data?.length) throw new Error('not found');
  const r = data[0], addr = r.address || {};
  return {
    lat: parseFloat(r.lat), lng: parseFloat(r.lon),
    displayName: r.display_name,
    city:   addr.city || addr.town || addr.village || addr.county || '',
    road:   addr.road || addr.pedestrian || addr.street || '',
    suburb: addr.suburb || addr.neighbourhood || '',
  };
}

/* ── Render ──────────────────────────────────────────────── */
function renderResults(loc) {
  emptyState.hidden = true;
  results.hidden = false;

  const t = I18N[state.lang];
  const shortName = loc.city
    ? [loc.city, loc.suburb].filter(Boolean).join(', ')
    : loc.displayName.split(',').slice(0, 2).join(',').trim();
  const distKm = Math.round(calcDistance(loc.lat, loc.lng, KAABA.lat, KAABA.lng));

  // Location banner
  locName.textContent   = shortName;
  locCoords.textContent = `${loc.lat.toFixed(4)}° N, ${loc.lng.toFixed(4)}° E`;
  locDist.textContent   = `${distKm.toLocaleString()} ${t.kmToMecca}`;

  // Sidebar chip
  chipName.textContent     = shortName;
  chipCoords.textContent   = `${loc.lat.toFixed(4)}°, ${loc.lng.toFixed(4)}°`;
  chipDistance.textContent = `${distKm.toLocaleString()} ${t.kmToMecca}`;
  locationChip.hidden = false;

  // Compass
  const bearing = calcQibla(loc.lat, loc.lng);
  renderCompass(bearing, loc);

  // Prayer times
  renderPrayerTimes(loc);
}

function renderCompass(bearing, loc) {
  const t = I18N[state.lang];
  needleRing.style.transform = `rotate(${bearing}deg)`;
  const degStr = `${Math.round(bearing)}°`;
  qiblaDeg.textContent           = degStr;
  qiblaDegreesSmall.textContent  = `${degStr} ${getCardinal(bearing)}`;
  qiblaCardinal.textContent      = getCardinal(bearing);

  const landmark = loc.road || loc.suburb || loc.city || '';
  if (landmark) {
    qiblaHint.textContent = `${t.faceHint} ${landmark}`;
    qiblaHint.hidden = false;
  } else {
    qiblaHint.hidden = true;
  }
}

function renderPrayerTimes(loc) {
  const times  = calcPrayerTimes(loc.lat, loc.lng);
  const now    = new Date();
  const t      = I18N[state.lang];
  const isFriday = now.getDay() === 5;

  // Date header
  prayerDate.textContent = now.toLocaleDateString(state.lang === 'ar' ? 'ar-MA' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  hijriDate.textContent = getHijriDate();

  // Determine current / next
  let currentKey = null, nextKey = null;
  for (const p of PRAYERS) { if (times[p.key] <= now) currentKey = p.key; }
  let foundCurrent = false;
  for (const p of PRAYERS) {
    if (p.key === currentKey) { foundCurrent = true; continue; }
    if (foundCurrent && !nextKey) { nextKey = p.key; break; }
  }

  prayerList.innerHTML = '';
  for (const p of PRAYERS) {
    const isJummah = isFriday && p.key === 'dhuhr';
    const isCurrent = p.key === currentKey, isNext = p.key === nextKey;

    const nameMain  = state.lang === 'ar'
      ? (isJummah ? p.fridayAr  : p.nameAr)
      : (isJummah ? p.fridayEn  : p.nameEn);
    const nameSub   = state.lang === 'ar'
      ? (isJummah ? p.fridayEn  : p.nameEn)
      : (isJummah ? p.fridayAr  : p.nameAr);
    const icon = isJummah ? (p.fridayIcon || p.icon) : p.icon;
    const badge = isCurrent
      ? `<span class="pr-badge now">${t.nowBadge}</span>`
      : isNext ? `<span class="pr-badge next">${t.nextBadge}</span>` : '';

    const li = document.createElement('li');
    li.className = 'prayer-item' + (isCurrent ? ' active' : '') + (isNext ? ' upcoming' : '');
    li.setAttribute('role', 'listitem');
    li.innerHTML = `
      <div class="pr-name-wrap">
        <i class="ti ${icon} pr-icon" aria-hidden="true"></i>
        <div>
          <div class="pr-name">${nameMain}</div>
          <div class="pr-name-ar">${nameSub}</div>
        </div>
      </div>
      <div class="pr-right">
        ${badge}
        <span class="pr-time">${formatTime(times[p.key])}</span>
      </div>`;
    prayerList.appendChild(li);
  }
}

function formatTime(date) {
  if (!date || isNaN(date)) return '—';
  return date.toLocaleTimeString(state.lang === 'ar' ? 'ar-MA' : 'en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function getHijriDate() {
  try {
    return new Date().toLocaleDateString('ar-MA-u-ca-islamic', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return ''; }
}

/* ── Compass ticks ───────────────────────────────────────── */
function buildCompassTicks() {
  const cx = 130, cy = 130, r = 124;
  let html = '';
  for (let deg = 0; deg < 360; deg += 5) {
    const angle = (deg - 90) * DEG2RAD;
    const isMajor = deg % 45 === 0, isMid = deg % 15 === 0;
    const len = isMajor ? 10 : isMid ? 6 : 4;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + (r - len) * Math.cos(angle), y2 = cy + (r - len) * Math.sin(angle);
    const color = isMajor ? 'var(--c-gold)' : 'var(--c-border)';
    const w = isMajor ? 1.5 : 0.8;
    html += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${w}"/>`;
  }
  compassTicks.innerHTML = html;
}

/* ── Status ──────────────────────────────────────────────── */
function setStatus(type, message) {
  statusMsg.hidden = false;
  statusMsg.className = `sb-status ${type}`;
  statusMsg.innerHTML = type === 'loading'
    ? `<div class="spinner" aria-hidden="true"></div> ${message || I18N[state.lang].loading}`
    : message;
}
function clearStatus() { statusMsg.hidden = true; statusMsg.className = 'sb-status'; }

/* ── Theme ───────────────────────────────────────────────── */
function applyTheme() { document.documentElement.setAttribute('data-theme', state.theme); }
function toggleTheme() { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); saveSettings(); }

/* ── Language ────────────────────────────────────────────── */
function applyLang() {
  const isAr = state.lang === 'ar';
  document.documentElement.lang = state.lang;
  document.documentElement.dir  = isAr ? 'rtl' : 'ltr';
  langToggle.querySelector('.lang-label').textContent = isAr ? 'EN' : 'AR';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = I18N[state.lang][el.dataset.i18n]; if (v) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const v = I18N[state.lang][el.dataset.i18nPlaceholder]; if (v) el.placeholder = v;
  });
}
function toggleLang() {
  state.lang = state.lang === 'en' ? 'ar' : 'en';
  applyLang(); saveSettings();
  if (state.lastLocation) renderResults(state.lastLocation);
}

/* ── PWA ─────────────────────────────────────────────────── */
function registerSW() {
  if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
}
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredPrompt = e;
  setTimeout(() => { installBanner.hidden = false; }, 4000);
});
installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') installBanner.hidden = true;
  deferredPrompt = null;
});
window.addEventListener('appinstalled', () => { installBanner.hidden = true; });

/* ── Auto-refresh prayer highlight ───────────────────────── */
setInterval(() => { if (state.lastLocation) renderPrayerTimes(state.lastLocation); }, 60_000);

/* ── Start ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);

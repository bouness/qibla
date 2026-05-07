# 🕋 Qibla PWA — Setup & Deployment Guide

A fully static Progressive Web App (PWA) to find **Qibla direction** and **daily prayer times** for any location in the world — without requiring GPS or device location permissions.

---

## 📁 File Structure

```
qibla-pwa/
├── index.html          # App shell & markup
├── styles.css          # Islamic geometric themed styles
├── app.js              # Core logic (geocoding, Qibla, prayer times)
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline caching strategy
├── icons/
│   ├── icon-192.png    # PWA icon
│   └── icon-512.png    # PWA icon (large)
└── README.md           # This file
```

---

## ✨ Features

| Feature | Details |
|---|---|
| **Qibla Calculation** | Great-circle bearing to Kaaba (21.4225°N, 39.8262°E) |
| **Geocoding** | Nominatim (OpenStreetMap) — free, no API key needed |
| **Prayer Times** | Adhan.js — 11 calculation methods |
| **No GPS** | Everything based on manual text input |
| **Offline** | Service worker caches all assets after first load |
| **PWA** | Installable on Android, iOS, and desktop |
| **Languages** | English + Arabic (RTL layout) |
| **Dark/Light** | Toggle in header |
| **Persistence** | Last location saved in localStorage |
| **Distance** | Shows km distance to Mecca |

---

## 🚀 Deployment to GitHub Pages

1. Create a GitHub repository (e.g., `qibla-pwa`)
2. Upload all files maintaining the folder structure
3. Go to **Settings → Pages**
4. Set source to `main` branch, root folder `/`
5. Your app will be live at `https://yourusername.github.io/qibla-pwa/`

> **Note**: Service workers require HTTPS. GitHub Pages provides this automatically.

---

## 🔧 Local Development

```bash
# Option 1: Python simple server
python3 -m http.server 8080

# Option 2: Node.js
npx serve .

# Option 3: VS Code Live Server extension
```

Then open `http://localhost:8080` in your browser.

> ⚠️ Service workers do NOT work on `file://` URLs — always use a local server.

---

## 🙏 Prayer Calculation Methods

The app supports these methods via Adhan.js:

| Key | Method |
|---|---|
| `MuslimWorldLeague` | Muslim World League |
| `NorthAmerica` | ISNA (North America) |
| `Egyptian` | Egyptian General Authority |
| `UmmAlQura` | Umm al-Qura University (Mecca) |
| `Dubai` | Dubai |
| `Kuwait` | Kuwait |
| `Qatar` | Qatar |
| `Singapore` | Singapore |
| `Turkey` | Turkey |
| `Tehran` | Tehran |
| `Karachi` | University of Islamic Sciences, Karachi |

---

## 🌐 APIs Used

- **Nominatim (OSM)**: `https://nominatim.openstreetmap.org/search`  
  Free geocoding — no API key required. Please respect their [usage policy](https://operations.osmfoundation.org/policies/nominatim/).

- **Adhan.js** (CDN): `https://cdn.jsdelivr.net/npm/adhan@4.4.3/`  
  Open-source prayer times library by Batoul Apps.

---

## 📱 PWA Installation

### Android (Chrome)
- Open the app → tap the "Install" banner or browser menu → "Add to Home Screen"

### iOS (Safari)
- Open the app → tap Share icon → "Add to Home Screen"

### Desktop (Chrome/Edge)
- Click the install icon in the address bar

---

## 🧮 Qibla Formula

```javascript
// Great-circle bearing from user location to Kaaba
const φ1 = userLat  * (π/180);
const φ2 = kaabaLat * (π/180);
const Δλ = (kaabaLng - userLng) * (π/180);

const y = sin(Δλ) * cos(φ2);
const x = cos(φ1) * sin(φ2) − sin(φ1) * cos(φ2) * cos(Δλ);
const bearing = atan2(y, x) * (180/π);
const qibla = (bearing + 360) % 360;  // Normalize to [0, 360)
```

---

## 📄 License

Open source — free to use and modify. Please credit OpenStreetMap/Nominatim and Adhan.js.

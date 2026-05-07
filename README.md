# 🕋 Qibla PWA

A fully static Progressive Web App to find **Qibla direction** and **daily prayer times** for any location worldwide — no GPS, no backend, no external JS dependencies.

---

## 📁 File Structure

```
qibla-pwa/
├── index.html          # App shell & markup
├── styles.css          # Islamic geometric theme, sidebar layout
├── app.js              # All logic — geocoding, Qibla, prayer times, i18n
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline caching (cache-first strategy)
├── icons/
│   ├── icon-192.png    # PWA icon
│   └── icon-512.png    # PWA icon (large)
└── README.md           # This file
```

---

## ✨ Features

| Feature | Details |
|---|---|
| **Qibla calculation** | Great-circle bearing to Kaaba (21.4225°N, 39.8262°E) |
| **Geocoding** | Nominatim (OpenStreetMap) — free, no API key needed |
| **Prayer times** | Self-contained astronomical engine — no library required |
| **Jumu'ah** | Dhuhr automatically becomes Jumu'ah on Fridays |
| **No GPS** | Everything based on manual text input |
| **Offline** | Service worker caches all assets after first load |
| **PWA** | Installable on Android, iOS, and desktop |
| **Languages** | English + Arabic with full RTL layout |
| **Dark / Light mode** | Toggle in the sidebar footer |
| **Persistence** | Last location and settings saved in localStorage |
| **Distance** | Shows km distance to Mecca |
| **Sidebar layout** | Inputs live in a fixed sidebar, never blocking results |
| **Mobile drawer** | Sidebar slides in as a drawer on small screens |

---

## 🚀 Deployment to GitHub Pages

1. Create a GitHub repository (e.g., `qibla-pwa`)
2. Upload all files, keeping the `icons/` folder
3. Go to **Settings → Pages**
4. Set source to `main` branch, root folder `/`
5. Your app is live at `https://yourusername.github.io/qibla-pwa/`

> **Note**: Service workers require HTTPS. GitHub Pages provides this automatically.

---

## 🔧 Local Development

```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# VS Code
# Use the Live Server extension
```

Then open `http://localhost:8080`.

> ⚠️ Service workers do NOT work on `file://` URLs — always use a local server.

---

## 🙏 Prayer Calculation Methods

Prayer times are computed with a self-contained astronomical engine (Jean Meeus solar algorithms) — no third-party library is loaded. The following methods are supported:

| Key | Method |
|---|---|
| `MuslimWorldLeague` | Muslim World League |
| `NorthAmerica` | ISNA (North America) — default |
| `Egyptian` | Egyptian General Authority |
| `UmmAlQura` | Umm al-Qura University (Mecca) |
| `Dubai` | Dubai |
| `Kuwait` | Kuwait |
| `Qatar` | Qatar |
| `Singapore` | Singapore |
| `Turkey` | Turkey |
| `Tehran` | Tehran |
| `Karachi` | University of Islamic Sciences, Karachi |

Umm al-Qura and Qatar use a fixed Isha offset (minutes after Maghrib) rather than an angle.

---

## 🌐 External Resources

- **Nominatim (OSM)** — `https://nominatim.openstreetmap.org/search`
  Free geocoding, no API key. Please respect their [usage policy](https://operations.osmfoundation.org/policies/nominatim/).

- **Tabler Icons** — loaded from jsDelivr CDN, cached by the service worker after first load.

- **Google Fonts** — DM Sans + Scheherazade New, cached by the service worker after first load.

No prayer time library, no maps SDK, no analytics.

---

## 📱 PWA Installation

**Android (Chrome):** Open the app → tap the Install banner or browser menu → "Add to Home Screen"

**iOS (Safari):** Open the app → tap the Share icon → "Add to Home Screen"

**Desktop (Chrome / Edge):** Click the install icon in the address bar

---

## 🧮 Qibla Formula

```javascript
// Great-circle bearing from user location to Kaaba
const y = sin(Δλ) * cos(φ₂);
const x = cos(φ₁) * sin(φ₂) - sin(φ₁) * cos(φ₂) * cos(Δλ);
const qibla = (atan2(y, x) * (180/π) + 360) % 360;
```

---

## 📄 License

Open source — free to use and modify. Please credit OpenStreetMap/Nominatim.

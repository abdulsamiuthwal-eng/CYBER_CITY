# CyberCity 2050 — Comprehensive File-by-File Catalog
**Author:** Senior IT Specialist & Enterprise Architect  
**Scope:** Exhaustive inventory and technical description of every file and folder in the project.

---

## 📂 Root Directory

### 1. `index.html`
* **Type:** Primary Web Entry Point (English)
* **Size:** ~29 KB | **Lines:** 531
* **Responsibilities:**
  * Embeds `#cc-icons` SVG sprite symbols (`icon-leaf`, `icon-bolt`, `icon-robot`, `icon-train`, `icon-shield`, `icon-city`, `icon-globe`, `icon-seedling`, `icon-check`, `icon-play`).
  * Features the Hero Section with live operational status badge and trailer trigger.
  * Hosts `#city-video-section` featuring dual cross-fading HTML5 `<video>` loops.
  * Displays the Live Telemetry KPI grid with animated number counters.
  * Presents 6 modular City Infrastructure cards linking to deep-dive subpages.
  * Renders AI Core Services showcase, City News grid, and Citizenship Call-to-Action (CTA).
  * Embeds `assets/js/app.js` and `assets/js/geo-engine.js`.

### 2. `Open-Admin-Dashboard.bat`
* **Type:** Windows Shell Launcher Script
* **Responsibilities:**
  * Cleans command prompt terminal and launches `http://localhost:5500/CyberCity2050/admin/index.html` in default system browser.

### 3. `.gitignore`
* **Type:** Git configuration
* **Responsibilities:** Prevents temporary build files, IDE settings, and logs from contaminating the version control repository.

---

## 📂 `admin/` Directory

### 4. `admin/index.html`
* **Type:** Protected Administrator Telemetry Portal
* **Size:** ~31.7 KB | **Lines:** 955
* **Key Components:**
  * **Localhost Gate:** Prevents remote execution on cloud platforms like Vercel.
  * **Auth Screen:** Password and username validation against SHA-256 hashes (`samiuthwal` / `admin5911`). Features interactive eye toggle.
  * **Live Telemetry Stream:** SSE socket listener on Firebase RTDB endpoint (`.../access_logs.json`) with a 1-second fallback poll.
  * **Data Table:** Renders 12 metrics per log (S.No, Timestamp, IP, Country/City, Device Type, Status, Target Page, Time Spent, Device Specs, Browser & OS, Fingerprint ID, Battery & Screen).
  * **Interactive Operations:** Instant CSV export, Clear all logs, and Right-click Custom Context Menu for single-log deletion.

---

## 📂 `assets/` Directory

### 5. `assets/js/geo-engine.js`
* **Type:** Core Client Security, Geo-Routing & Telemetry Engine
* **Size:** ~13 KB | **Lines:** 348
* **Responsibilities:**
  * Multi-provider IP lookups (`ipwho.is` -> `ipapi.co` -> `ip-api.com`).
  * Enforces Task 1 (Country block for AU/CA) & Task 2 (Mobile only for PK, Desktop blocked).
  * Collects device fingerprint, battery telemetry, screen resolution, CPU cores, RAM, and touch points.
  * Manages live heartbeat timer that tracks `time_spent_seconds` every 4s and syncs on `beforeunload`/`visibilitychange`.
  * Persists records to Firebase RTDB and Google Apps Script backend.

### 6. `assets/js/app.js`
* **Type:** UI Micro-Interactions & Animation Controller
* **Size:** ~6.3 KB | **Lines:** 198
* **Responsibilities:**
  * Handles loading screen auto-hide on `window.load` (2400ms fallback).
  * Smart glassmorphic navbar show/hide and active link highlight on scroll.
  * IntersectionObserver reveal animations for sections and cards.
  * `animateCounter` with easeOutCubic physics for smooth number increments.
  * Dual-video seamless looping controller for hero background and showcase reel.
  * Watch Trailer modal popup open/close with `Escape` key and backdrop event listeners.

### 7. `assets/js/scroll-video.js`
* **Type:** Canvas-Based Scroll Frame Engine
* **Size:** ~4 KB | **Lines:** 93
* **Responsibilities:**
  * Preloads 7 image frames (`frame01.png` to `frame07.png`).
  * Calculates scroll progress within `#scroll-video-section`.
  * Dynamically renders frames with aspect-ratio cover scaling to `#scroll-canvas` while updating dynamic captions.

### 8. `assets/css/main.css`
* **Type:** Master Design System Stylesheet
* **Size:** ~28.3 KB
* **Responsibilities:**
  * Defines CSS custom property tokens (`--color-primary`, `--bg-primary`, `--font-heading`, `--shadow-card`).
  * Implements glassmorphism, responsive grid layouts, card hover physics, and dark Solarpunk emerald theme.

### 9. `assets/icons/icons.svg`
* **Type:** SVG Vector Assets Sprite

### 10. `assets/images/` & `assets/videos/`
* **Type:** High-definition visual assets (Skyline renderings, video reels, system icons, and frame animations).

---

## 📂 `config/` Directory

### 11. `config/gas-backend.js`
* **Type:** Google Apps Script Serverless Backend
* **Responsibilities:**
  * Bridges telemetry events directly into Google Spreadsheets ("CyberCity2050 Access Logs").
  * `doGet()`: Returns serialized JSON array of access logs.
  * `doPost()`: Inserts new visitor entries, updates session duration, or clears records on command.

---

## 📂 `pages/` Directory

### 12. `pages/blocked/index.html`
* **Type:** Access Restricted Error View
* **Responsibilities:** Displays dynamic rejection notice based on query parameters (`reason=country_blocked` or `reason=device_restricted`), showing visitor IP and the exact policy violated.

### 13. `pages/ur/index.html` & `pages/ar/index.html`
* **Type:** Localized RTL Views
* **Responsibilities:** Complete Urdu (`dir="rtl"`) and Arabic (`dir="rtl"`) translations of the main portal for Pakistan mobile and Middle-East visitors respectively.

### 14. `pages/en/index.html`
* **Type:** English Localized Fallback View

### 15. Subpages:
* `pages/ai-core.html`: Detailed overview of Quantum AI neural management.
* `pages/virtual-tour.html`: 360-degree tour scheduling and interactive district previews.
* `pages/join-future.html`: Citizenship application portal with validation forms.
* `pages/system-transport.html`, `system-security.html`, `system-energy.html`, `system-environment.html`, `system-buildings.html`, `system-network.html`: Dedicated pages for each city subsystem.
* `pages/news-drone-corridor.html`, `news-solar-array.html`, `news-zero-crime.html`: Dedicated news release articles.

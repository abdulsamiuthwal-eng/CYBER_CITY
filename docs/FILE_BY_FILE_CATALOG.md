# CyberCity 2050 — Comprehensive File-by-File Catalog
**Author:** Senior IT Specialist & Enterprise Architect  
**Scope:** Exhaustive inventory and technical description of every file and folder in the project.

---

## 📂 Root Directory

### 1. `index.html`
* **Type:** Primary Web Entry Point (English)
* **Responsibilities:**
  * Loads `assets/js/geo-engine.js?v=2050.5` in `<head>` for immediate pre-render regional routing and device checks.
  * Embeds `#cc-icons` SVG sprite symbols (`icon-leaf`, `icon-bolt`, `icon-robot`, `icon-train`, `icon-shield`, `icon-city`, `icon-globe`, `icon-seedling`, `icon-check`, `icon-play`).
  * Features the Hero Section with live operational status badge and trailer trigger.
  * Hosts `#city-video-section` featuring dual cross-fading HTML5 `<video>` loops.
  * Displays the Live Telemetry KPI grid with animated number counters.
  * Presents 6 modular City Infrastructure cards linking to deep-dive subpages.
  * Renders AI Core Services showcase, City News grid, and Citizenship Call-to-Action (CTA).

### 2. `Open-Admin-Dashboard.bat`
* **Type:** Windows Shell Launcher Script
* **Responsibilities:**
  * Verifies if local port 5500 is active; if not, automatically boots the zero-dependency `config/server.js` Node.js server in the background and opens the Admin Telemetry Portal in the default web browser.

### 3. `vercel.json`
* **Type:** Vercel Production Header Configuration
* **Responsibilities:**
  * Injects `Cache-Control: public, max-age=0, must-revalidate` across all routes, preventing mobile browsers from caching outdated regional or JS files.

### 4. `.gitignore`
* **Type:** Git configuration
* **Responsibilities:** Prevents temporary build files, IDE settings, and logs from contaminating the version control repository.

---

## 📂 `admin/` Directory

### 5. `admin/index.html`
* **Type:** Protected Administrator Telemetry Portal
* **Key Components:**
  * **Localhost Gate:** Prevents remote execution on cloud platforms like Vercel.
  * **Auth & RBAC Screen:** Validates Master Super Admin (`samiuthwal` / `admin5911`) and registered operators against SHA-256 hashes. Features password visibility eye toggle.
  * **Role-Based User Management Modal:** Pinned Master Super Admin badge (`👑 Master Key / System Owner`), operator self-deletion (`🗑️ Delete My Account`), and approve/reject workflows.
  * **Live Telemetry Stream:** SSE socket listener on Firebase RTDB endpoint (`.../access_logs.json`) with silent zero-flicker background refreshing.
  * **Dual-Axis Table Pan Physics:** Interactive Click-and-Drag horizontal momentum scrolling, Shift + Wheel support, and 12 telemetry columns.
  * **Operations:** Instant CSV export, Clear all logs, and Right-click Custom Context Menu for single-log deletion.

---

## 📂 `assets/` Directory

### 6. `assets/js/geo-engine.js`
* **Type:** Core Client Security, Geo-Routing & Telemetry Engine
* **Responsibilities:**
  * Fast parallel multi-provider IP lookups (`ipwho.is`, `geojs.io`, `api.country.is`) with `Promise.any` (<200ms latency).
  * Handles both Object and Array payloads for IPv6 mobile networks (Jazz/Mobilink).
  * Enforces Task 1 (Country block for AU/CA) & Task 2 (Mobile only for PK, Desktop blocked) using root-relative paths and instant `window.location.replace()`.
  * Collects device fingerprint, battery telemetry, screen resolution, CPU cores, RAM, and touch points.
  * Manages live heartbeat timer that tracks `time_spent_seconds` every 4s and syncs on `beforeunload`/`visibilitychange` via HTTP `PATCH`.
  * Persists records to Firebase RTDB and Google Apps Script backend.

### 7. `assets/js/app.js`
* **Type:** UI Micro-Interactions & Animation Controller
* **Responsibilities:**
  * Handles loading screen auto-hide on `window.load`.
  * Smart glassmorphic navbar show/hide and active link highlight on scroll.
  * IntersectionObserver reveal animations for sections and cards.
  * `animateCounter` with easeOutCubic physics for smooth number increments.
  * Dual-video seamless looping controller for hero background and showcase reel.

### 8. `assets/css/main.css`
* **Type:** Master Design System Stylesheet
* **Responsibilities:**
  * Defines CSS custom property tokens (`--color-primary`, `--bg-primary`, `--font-heading`, `--shadow-card`).
  * Implements glassmorphism, responsive grid layouts, card hover physics, and dark Solarpunk emerald theme.

---

## 📂 `config/` Directory

### 9. `config/server.js`
* **Type:** Zero-Dependency Native Node.js Static Server
* **Responsibilities:** Serves static files on port 5500 for local dashboard operation without external npm packages.

### 10. `config/gas-backend.js`
* **Type:** Google Apps Script Serverless Backend
* **Responsibilities:** Bridges telemetry events and email notifications into Google Spreadsheets ("CyberCity2050 Access Logs").

---

## 📂 `pages/` Directory

### 11. `pages/ur/index.html`
* **Type:** Full Urdu Localized Portal (Task 1 & Task 2 Destination for Pakistan Mobile)
* **Responsibilities:**
  * Complete Right-to-Left (RTL) layout with Noto Sans Arabic typography.
  * Protected with `<meta name="google" content="notranslate" />` to block Android Chrome auto-translation.

### 12. `pages/ar/index.html`
* **Type:** Full Arabic Localized Portal (Destination for Saudi Arabia & UAE)
* **Responsibilities:** Complete RTL layout for Gulf region visitors.

### 13. `pages/blocked/index.html`
* **Type:** Security Geo-Fencing & Device Restriction Screen
* **Responsibilities:** Displays restriction reasons (Country Blocked or Desktop Restricted in Pakistan) with live user telemetry profile.

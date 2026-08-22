# CyberCity 2050 — Master Documentation Hub
**Document Version:** 1.0.0  
**Author / System Architect:** Senior IT Specialist & Enterprise Architect (25+ Years Experience)  
**Project Name:** CyberCity 2050 — Smart City & Telemetry Access Control System  
**Repository Path:** `CyberCity2050`  

---

## 🌟 Executive Summary

**CyberCity 2050** is a state-of-the-art Web Engineering and Cyber-Physical Smart City showcase platform. It combines a high-performance, Solarpunk-themed interactive frontend with a resilient **Client-Side Geo-Fencing, Device-Fingerprinting, Hardware Telemetry Tracking Engine, and Protected Admin Telemetry Portal**.

This documentation folder serves as the **Single Source of Truth (SSOT)** for this codebase. Any engineer, developer, or AI assistant opening a new session can read this hub to achieve a complete, 360-degree understanding of the project's architecture, security rules, data pipelines, credentials, and development history.

---

## 📚 Documentation Index

| Document | Description |
| :--- | :--- |
| **[SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)** | High-level system architecture, client-serverless topology, real-time data flows, and design tokens. |
| **[FILE_BY_FILE_CATALOG.md](./FILE_BY_FILE_CATALOG.md)** | Deep-dive audit of every single file, script, stylesheet, HTML view, and asset in the repository. |
| **[GEO_SECURITY_AND_ROUTING.md](./GEO_SECURITY_AND_ROUTING.md)** | Rules specification for Task 1 & Task 2 geo-fencing, multi-provider IP resolution, and hardware telemetry. |
| **[ADMIN_TELEMETRY_PORTAL.md](./ADMIN_TELEMETRY_PORTAL.md)** | Complete specification of the Admin Dashboard, SHA-256 authentication, credentials, SSE sockets, and DB sync. |
| **[FUTURE_CHANGELOG_AND_WORKLOG.md](./FUTURE_CHANGELOG_AND_WORKLOG.md)** | Standardized developer worklog for tracking all ongoing and future modifications, features, and fixes. |

---

## 🚀 Quick Reference Cheat Sheet

### 🔑 Admin Credentials
* **Admin Portal Location:** `admin/index.html` (Accessible strictly via `http://localhost:5500/CyberCity2050/admin/index.html` or `localhost`)
* **Username:** `samiuthwal` *(SHA-256: `7c7ac264784810f49ce6f6e924f03a65d39b407936d7dd8b356a4944fb629b6f`)*
* **Password:** `admin5911` *(SHA-256: `acb11dcf0d13342d2738c6f88452db36cf1ce34276693b8b2d2e16f9d00f6ff0`)*
* **One-Click Launcher:** Run [`Open-Admin-Dashboard.bat`](../Open-Admin-Dashboard.bat)

### 🌍 Core Geo-Routing & Restriction Matrix
* **Australia (AU) & Canada (CA):** Blocked completely (Desktop & Mobile) $\rightarrow$ Redirects to `pages/blocked/index.html`.
* **Pakistan (PK):** Mobile Allowed $\rightarrow$ Redirects to Urdu RTL (`pages/ur/index.html`). Desktop Blocked $\rightarrow$ Redirects to `pages/blocked/index.html`.
* **Saudi Arabia (SA) & UAE (AE):** Allowed $\rightarrow$ Redirects to Arabic RTL (`pages/ar/index.html`).
* **United Kingdom (GB) & Global:** Allowed $\rightarrow$ Standard English (`index.html` / `pages/en/index.html`).

### ☁️ Cloud Endpoints
* **Firebase Realtime Database:** `https://cybercity2050-logs-4cf99-default-rtdb.firebaseio.com/access_logs.json`
* **Google Apps Script Backend URL:** `https://script.google.com/macros/s/AKfycbwpr8qrPBOH_NwPfYE2tyrmYT-pe2-QZdwL03DNmxC5zXq7YwBd1D8fY7SBtj32rLw/exec`
* **Google Apps Script Backend Code:** Located at [`config/gas-backend.js`](../config/gas-backend.js).

---

## 🛠️ Instructions for Future AI Agents & Developers
1. **Never break existing Geo-Routing logic** in [`assets/js/geo-engine.js`](../assets/js/geo-engine.js).
2. **Never expose plaintext admin credentials** in the source files. Always preserve SHA-256 hash validation in [`admin/index.html`](../admin/index.html).
3. **Always log new work** in [`docs/FUTURE_CHANGELOG_AND_WORKLOG.md`](./FUTURE_CHANGELOG_AND_WORKLOG.md) whenever new features or fixes are introduced.

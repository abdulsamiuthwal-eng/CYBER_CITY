# CyberCity 2050 — Smart City & Telemetry Access Control System

![CyberCity 2050](assets/images/hero-skyline.png)

## 🌐 Overview
**CyberCity 2050** is an interactive, high-performance Smart City web application engineered with a Solarpunk aesthetic and integrated with an enterprise-grade **Client-Side Geo-Fencing, Hardware Telemetry Profiling, and Protected Admin Telemetry Portal**.

---

## 📖 Complete Documentation Hub
All comprehensive architecture diagrams, file breakdowns, security matrices, admin credentials, and future development worklogs are centralized in the **[`docs/`](./docs/README.md)** directory:

1. **[System Architecture & Data Flows](./docs/SYSTEM_ARCHITECTURE.md)**
2. **[Complete File-by-File Catalog](./docs/FILE_BY_FILE_CATALOG.md)**
3. **[Geo-Security, Rules & Telemetry Engine](./docs/GEO_SECURITY_AND_ROUTING.md)**
4. **[Admin Telemetry Portal & Credentials](./docs/ADMIN_TELEMETRY_PORTAL.md)**
5. **[Future Worklog & Changelog](./docs/FUTURE_CHANGELOG_AND_WORKLOG.md)**

---

## ⚡ Quick Start & Admin Portal

* **Website Entry Point:** Open [`index.html`](./index.html) in your browser or local server (`Live Server` at `http://localhost:5500`).
* **Admin Launcher:** Double-click [`Open-Admin-Dashboard.bat`](./Open-Admin-Dashboard.bat) to open the Admin Telemetry Portal.
* **Admin Login Credentials:**
  * **Username:** `samiuthwal`
  * **Password:** `admin5911`
  *(Note: Admin portal access is strictly restricted to `localhost` environments for security).*

---

## 🛡️ Geo-Routing Summary
* **Australia & Canada:** Access Blocked $\rightarrow$ [`pages/blocked/index.html`](./pages/blocked/index.html).
* **Pakistan:** Mobile Only Allowed (Urdu RTL) $\rightarrow$ [`pages/ur/index.html`](./pages/ur/index.html); Desktop Blocked.
* **Saudi Arabia & UAE:** Allowed (Arabic RTL) $\rightarrow$ [`pages/ar/index.html`](./pages/ar/index.html).
* **UK & International:** Allowed (English) $\rightarrow$ [`index.html`](./index.html).

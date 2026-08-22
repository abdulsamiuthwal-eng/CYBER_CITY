# CyberCity 2050 — Geo-Security & Routing Specification
**Author:** Senior IT Specialist & Enterprise Architect  
**Scope:** Geolocation Detection, Geo-Fencing Business Rules, Client Profiling & Telemetry Extraction  

---

## 1. Geolocation Multi-Provider Resolution

To eliminate single point of failure (SPOF) and circumvent strict VPN rate-limiting (such as HTTP 403 blocks), `geo-engine.js` implements a Promise-race fallback mechanism:

```
Provider Priority:
1. https://ipwho.is/      (Fast, 100% VPN friendly, returns country, code, city, IP)
2. https://ipapi.co/json/ (Fallback provider)
3. http://ip-api.com/json/(Tertiary fallback)
```

If all external APIs fail or timeout exceeds 1500ms, the system gracefully defaults to `"Unknown"` region attributes without halting UI rendering.

---

## 2. Geo-Fencing & Policy Rules Matrix

| Region / Country | Target Device | Access Decision | Policy Reason Code | Destination Route |
| :--- | :--- | :--- | :--- | :--- |
| **Australia (AU)** | Mobile & Desktop | 🔴 **BLOCKED** | `Country Restricted (Australia)` | `pages/blocked/index.html?reason=country_blocked` |
| **Canada (CA)** | Mobile & Desktop | 🔴 **BLOCKED** | `Country Restricted (Canada)` | `pages/blocked/index.html?reason=country_blocked` |
| **Pakistan (PK)** | **Mobile** | 🟢 **ALLOWED** | `N/A` | `pages/ur/index.html` (Urdu RTL) |
| **Pakistan (PK)** | **Desktop** | 🔴 **BLOCKED** | `Device Restricted (PK requires Mobile)` | `pages/blocked/index.html?reason=device_restricted` |
| **Saudi Arabia (SA)** | Mobile & Desktop | 🟢 **ALLOWED** | `N/A` | `pages/ar/index.html` (Arabic RTL) |
| **UAE (AE)** | Mobile & Desktop | 🟢 **ALLOWED** | `N/A` | `pages/ar/index.html` (Arabic RTL) |
| **UK (GB) & Others** | Mobile & Desktop | 🟢 **ALLOWED** | `N/A` | `index.html` / `pages/en/index.html` |

---

## 3. Hardware & Telemetry Extraction Details

For every session, `geo-engine.js` extracts deep telemetry parameters:

1. **Fingerprint ID:**
   * Combines `navigator.userAgent`, `screen.width`, `screen.height`, `screen.colorDepth`, `navigator.language`, and `navigator.hardwareConcurrency` into a lightweight 32-bit integer hash prefixed with `FP-`.
2. **Device Specs String:**
   * Formatted as: `[Device Model]   [N] CPU Cores   [N]GB RAM   [N] Touch Points / Mouse Input`.
3. **Battery & Screen String:**
   * Formatted as: `[Level]% [Charging/Battery]   [Width]x[Height] ([InnerWidth]x[InnerHeight])`.
4. **Session Duration Heartbeat:**
   * A timer calculates `Math.floor((Date.now() - sessionStartTime) / 1000)` every 4000ms.
   * On page exit (`beforeunload` / `visibilitychange: hidden`), `fetch` with `keepalive: true` updates the cloud database with final elapsed seconds.

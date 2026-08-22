# CyberCity 2050 — Geo-Security & Routing Specification
**Author:** Senior IT Specialist & Enterprise Architect  
**Scope:** Geolocation Detection, Geo-Fencing Business Rules, Client Profiling & Telemetry Extraction  

---

## 1. Geolocation Multi-Provider Concurrent Resolution

To eliminate Single Points of Failure (SPOF), prevent rate-limiting/Cloudflare blocks, and guarantee sub-200ms detection across all cellular networks (Jazz, Zong, Telenor, Nayatel, etc.) and IPv4/IPv6 stacks:

```
Concurrent Fast Providers (Promise.any):
1. https://ipwho.is/               (Fast, 100% VPN friendly, returns country, code, city, IP)
2. https://get.geojs.io/v1/ip/geo.json (Global CDN, ultra-fast, handles IPv4 & IPv6 array payloads)
3. https://api.country.is           (Ultra-lightweight 20ms direct country code resolver)
```

### Key Reliability Mechanisms:
* **Pre-Render `<head>` Execution:** `geo-engine.js` is loaded directly inside `<head>` and checks `document.readyState` immediately, executing before DOM paint.
* **Instant URL Replacement:** Uses `window.location.replace('/pages/ur/index.html')` with zero delay, ensuring clean browser history without back-button loops.
* **IPv6 Array Normalization:** Transparently parses both Object `{}` and Array `[{}]` payloads returned by IPv6 mobile operators.
* **Google Translate Guard:** Contains `<meta name="google" content="notranslate" />` on Urdu pages to prevent mobile Chrome from auto-translating Urdu RTL text into English.
* **Session Cache Optimization:** Session storage cache prevents duplicate API queries on internal page navigations.

---

## 2. Geo-Fencing & Policy Rules Matrix (PDF Task 1 & 2)

| Region / Country | Target Device | Access Decision | Policy Reason Code | Destination Route |
| :--- | :--- | :--- | :--- | :--- |
| **Australia (AU)** | Mobile & Desktop | 🔴 **BLOCKED** | `Country Restricted (Australia)` | `/pages/blocked/index.html?reason=country_blocked` |
| **Canada (CA)** | Mobile & Desktop | 🔴 **BLOCKED** | `Country Restricted (Canada)` | `/pages/blocked/index.html?reason=country_blocked` |
| **Pakistan (PK)** | **Mobile** | 🟢 **ALLOWED** | `N/A` | `/pages/ur/index.html` (Urdu RTL) |
| **Pakistan (PK)** | **Desktop** | 🔴 **BLOCKED** | `Device Restricted (PK requires Mobile)` | `/pages/blocked/index.html?reason=device_restricted` |
| **Saudi Arabia (SA)** | Mobile & Desktop | 🟢 **ALLOWED** | `N/A` | `/pages/ar/index.html` (Arabic RTL) |
| **UAE (AE)** | Mobile & Desktop | 🟢 **ALLOWED** | `N/A` | `/pages/ar/index.html` (Arabic RTL) |
| **UK (GB) & Others** | Mobile & Desktop | 🟢 **ALLOWED** | `N/A` | `/index.html` (English) |

---

## 3. Hardware & Telemetry Extraction Details (PDF Task 3)

For every session, `geo-engine.js` extracts deep telemetry parameters:

1. **Fingerprint ID:**
   * Combines `navigator.userAgent`, `screen.width`, `screen.height`, `screen.colorDepth`, `navigator.language`, and `navigator.hardwareConcurrency` into a lightweight 32-bit integer hash prefixed with `fp_`.
2. **Device Specs String:**
   * Formatted as: `[Device Model] • [N] CPU Cores • [N]GB RAM • [N] Touch Points / Mouse Input`.
3. **Battery & Screen String:**
   * Formatted as: `[Level]% [Charging/Battery] • [Width]x[Height] ([InnerWidth]x[InnerHeight])`.
4. **Session Duration Heartbeat:**
   * A timer calculates `Math.floor((Date.now() - sessionStartTime) / 1000)` every 4000ms.
   * On page exit (`beforeunload` / `visibilitychange: hidden`), `fetch` with `keepalive: true` updates the cloud database with final elapsed seconds using HTTP `PATCH`.

# CyberCity 2050 — System Architecture & Data Flow Specification
**Author:** Senior IT Specialist & Enterprise Architect  
**Scope:** Frontend Architecture, Telemetry Pipeline, Security Boundary & Cloud Integration  

---

## 1. High-Level Architectural Topology

CyberCity 2050 employs a **Hybrid Client-Edge Serverless Architecture**. It combines high-speed static asset delivery with client-side telemetry harvesting, edge geo-fencing, and dual-redundant serverless cloud persistence (Firebase Realtime Database + Google Apps Script / Google Sheets).

```mermaid
graph TD
    User([Visitor Device / Browser]) -->|Loads Page| CDN[Vercel Edge / Localhost]
    CDN --> Head[Pre-Render Head geo-engine.js]
    
    subgraph Client-Side Geo & Telemetry Engine
        Head --> IPCheck[High-Speed Parallel Geo Check<br/>ipwho.is / geojs.io / api.country.is]
        Head --> Specs[Hardware & Battery Profiler<br/>Cores, RAM, GPU, Screen, Fingerprint]
        Head --> RuleEngine{Compliance Rule Evaluator}
    end
    
    RuleEngine -->|AU / CA| BlockPage[/pages/blocked/index.html]
    RuleEngine -->|PK + Desktop| BlockPage
    RuleEngine -->|PK + Mobile| UrduPage[/pages/ur/index.html]
    RuleEngine -->|SA / AE| ArabPage[/pages/ar/index.html]
    RuleEngine -->|UK / Global| EngPage[/index.html]
    
    subgraph Telemetry Persistence Pipeline
        Head -->|Keep-Alive REST PUT| CloudDB[(Firebase RTDB)]
        Head -->|Live Duration PATCH| CloudDB
        Head -->|Local Session Cache| LocalStorage[(Browser LocalStorage)]
    end
    
    subgraph Administrator Telemetry Portal
        AdminUser([Admin Workstation]) -->|Localhost Only| AdminUI[admin/index.html]
        AdminUI -->|SHA-256 Check| AuthPass{Role Check}
        AuthPass -->|Master / Operator| Stream[SSE Real-time EventSource Stream]
        CloudDB -.->|Live Push Event| Stream
        Stream --> AdminTable[Admin Telemetry Grid + Live KPIs]
    end
```

---

## 2. Technology Stack

| Layer | Technologies Used | Key Purpose |
| :--- | :--- | :--- |
| **Core Structure** | Semantic HTML5, SVG Symbol Sprites, Urdu RTL | Clean markup, high accessibility, zero layout shifts. |
| **Styling & Theme** | Vanilla CSS3, CSS Custom Properties, Noto Sans Arabic | Solarpunk dark/emerald palette, responsive grids, native Urdu fonts. |
| **Motion & Graphics** | HTML5 Canvas 2D, Dual Video Controller, Click Drag Physics | Seamless background video cross-fading, interactive horizontal table pan. |
| **Security & Routing** | Multi-Provider IP Geolocation, Web Crypto API, Google Translate Guard | Geo-fencing, client profiling, SHA-256 admin password verification. |
| **Persistence** | Firebase Realtime Database (REST API), Google Apps Script, LocalStorage | Zero-cost serverless logging with real-time SSE streaming. |
| **Edge Hosting** | Vercel Edge Network, `vercel.json` Cache Headers | Zero-cache edge headers ensuring fresh mobile evaluations. |

---

## 3. Security Boundary & Hardening

1. **Localhost-Only Admin Enforcement:**
   * `admin/index.html` inspects `window.location.hostname`.
   * If the host is not `localhost`, `127.0.0.1`, or `::1`, the admin portal displays `#admin-public-blocked` overlay and disables all dashboard scripts.
2. **SHA-256 Cryptographic Authentication & RBAC:**
   * Passwords and usernames are evaluated securely via `crypto.subtle.digest("SHA-256", ...)`.
   * Pinned Master Super Admin (`samiuthwal`) holds immutable owner rights; standard operators have restricted access.
3. **Resilient Geolocation Fallback Hierarchy:**
   * Parallel resolution with `Promise.any`: `https://ipwho.is/`, `https://get.geojs.io/v1/ip/geo.json`, `https://api.country.is`.
   * Immediate pre-render `<head>` execution handles `document.readyState` (interactive / complete).

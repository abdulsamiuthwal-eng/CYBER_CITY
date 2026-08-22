# CyberCity 2050 — Admin Telemetry Portal Specification
**Author:** Senior IT Specialist & Enterprise Architect  
**Scope:** Admin Security Model, Authentication Architecture, Real-Time Ingestion & Management APIs  

---

## 1. Security Architecture & Access Control

### 1.1 Localhost Workstation Lock
The Admin Portal (`admin/index.html`) contains a strict perimeter check:
```javascript
function isLocalhostWorkstation() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "";
}
```
If executed on any public hosting environment (such as Vercel, Netlify, or AWS S3), the interface locks automatically and displays the `#admin-public-blocked` overlay.

### 1.2 Cryptographic Authentication
Credentials are validated using native `crypto.subtle.digest("SHA-256")`:
* **Admin Username:** `samiuthwal`
  * SHA-256 Hash: `7c7ac264784810f49ce6f6e924f03a65d39b407936d7dd8b356a4944fb629b6f`
* **Admin Password:** `admin5911`
  * SHA-256 Hash: `acb11dcf0d13342d2738c6f88452db36cf1ce34276693b8b2d2e16f9d00f6ff0`

---

## 2. Real-Time Telemetry Pipeline

### 2.1 Server-Sent Events (SSE) Stream
The dashboard subscribes directly to the Firebase Realtime Database SSE stream:
```javascript
liveEventSource = new EventSource("https://cybercity2050-logs-4cf99-default-rtdb.firebaseio.com/access_logs.json");
```
When any client logs a visit or updates duration, Firebase broadcasts a `put` / `patch` socket event (<100ms latency), triggering `fetchAndRenderLogs()` automatically without requiring page reloads.

### 2.2 Fallback Polling
A 1000ms background interval acts as a safety heartbeat to guarantee consistency even if the SSE socket drops.

---

## 3. Administrative Actions & Capabilities

1. **Live Filter & Full-Text Search:**
   * Instant filtering across IP addresses, Country names, City names, Device types, Status, and Fingerprint hashes.
2. **CSV Export (`exportLogsCSV`):**
   * Downloads a sanitized, timestamped CSV report (`cybercity_access_logs_[timestamp].csv`) formatted for Excel and business intelligence tools.
3. **Right-Click Single-Log Deletion:**
   * Right-clicking any row opens a custom context menu (`#custom-context-menu`).
   * Selecting "Delete This Log" prompts a confirmation modal (`#delete-confirm-modal`).
   * On confirmation, the entry is deleted from memory, `localStorage`, and via HTTP `DELETE` from Firebase REST API (`.../access_logs/[LOG_ID].json`).
4. **Global Log Purge (`clearLogs`):**
   * Empties `localStorage` and issues an HTTP `DELETE` to wipe the cloud logs node.

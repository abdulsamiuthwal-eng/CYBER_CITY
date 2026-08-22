# CyberCity 2050 — Admin Telemetry Portal Specification
**Author:** Senior IT Specialist & Enterprise Architect  
**Scope:** Admin Security Model, Authentication Architecture, Role-Based Access Control (RBAC), Real-Time Ingestion & Management APIs  

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

### 1.2 Multi-Role Hierarchy & User Management
The portal implements a strict Role-Based Access Control (RBAC) engine:

1. **👑 Master Super Admin (`samiuthwal`):**
   * Pinned immutably at the top of the user list with a `👑 Master Key / System Owner` badge.
   * Possesses full system-wide permissions: approve new operator registrations, reject pending accounts, and delete any operator account.
   * Master Admin credentials:
     * **Username:** `samiuthwal`
     * **Password:** `admin5911`
     * **Recovery Email:** `abdulsamiuthwal@gmail.com`
2. **🛡️ Operators / Standard Admins (Registered Users):**
   * Can log in and view live telemetry data, search, filter, and export CSV reports.
   * Other accounts are locked with a `🔒 Protected` badge.
   * Operators can only delete their own account (`🗑️ Delete My Account`), which triggers an automatic secure logout.

---

## 2. Real-Time Telemetry Pipeline & UI Engineering

### 2.1 Server-Sent Events (SSE) Stream
The dashboard subscribes directly to the Firebase Realtime Database SSE stream:
```javascript
liveEventSource = new EventSource("https://cybercity2050-logs-4cf99-default-rtdb.firebaseio.com/access_logs.json");
```
When any client logs a visit or updates duration, Firebase broadcasts a `put` / `patch` socket event (<100ms latency), triggering a completely silent, zero-flicker live table refresh.

### 2.2 Dual-Axis Natural Scrolling & Pan Physics
* Full vertical natural scrolling restored across main dashboard and user modals.
* Interactive **Click-and-Drag horizontal pan with smooth momentum physics** on the telemetry table card.
* Supported Shift + Wheel and touch trackpad gestures for wide multi-column log inspections.
* Dynamic canvas pause/resume loop saving 100% GPU/CPU overhead when the admin dashboard is active.

---

## 3. Administrative Actions & Capabilities

1. **Live Filter & Full-Text Search:**
   * Instant filtering across IP addresses, Country names, City names, Device types, Status, and Fingerprint hashes.
2. **CSV Export (`exportLogsCSV`):**
   * Downloads a sanitized, timestamped CSV report (`cybercity_access_logs_[timestamp].csv`) with serial numbers and formatted metadata for Excel/BI tools.
3. **Right-Click Single-Log Deletion:**
   * Right-clicking any row opens a custom context menu (`#custom-context-menu`).
   * Selecting "Delete This Log" prompts a centered confirmation modal (`#delete-confirm-modal`).
   * On confirmation, the entry is deleted from memory, `localStorage`, and via HTTP `DELETE` from Firebase REST API (`.../access_logs/[LOG_ID].json`).
4. **Global Log Purge (`clearLogs`):**
   * Empties `localStorage` and issues an HTTP `DELETE` to wipe the cloud logs node.
5. **Zero-Dependency Launcher (`Open-Admin-Dashboard.bat` & `config/server.js`):**
   * Automatically verifies if local port 5500 is online; if not, starts the native Node.js HTTP server in background and opens the default browser.

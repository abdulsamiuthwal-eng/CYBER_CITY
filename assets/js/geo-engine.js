/* =========================================================
   CYBERCITY 2050 — GEOLOCATION, DEVICE, LOGGING & CLOUD SYNC
   Tasks 1, 2, 3 + Live Duration Tracker + Global Cloud Database
   ========================================================= */

(function () {
  const STORAGE_KEY = "cc_access_logs";
  const SIMULATION_KEY = "cc_geo_simulation";
  const SESSION_LOGGED_KEY = "cc_logged_session_id";
  
  // Active Firebase Realtime Database
  const CLOUD_DB_URL = "https://cybercity2050-logs-4cf99-default-rtdb.firebaseio.com/access_logs";

  // --- 1. HELPERS: LOCAL & CLOUD DB LOGGING ---
  function getLogs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveLogs(logs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {}
  }

  function syncToCloudDB(entry) {
    try {
      // keepalive: true prevents browser from cancelling fetch during page redirect
      fetch(`${CLOUD_DB_URL}/${entry.id}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
        keepalive: true
      });
    } catch (e) {
      console.log("Cloud DB sync fallback:", e);
    }
  }

  function saveLog(entry) {
    const logs = getLogs();
    // Update existing entry if same ID, otherwise prepend
    const idx = logs.findIndex(l => l.id === entry.id);
    if (idx !== -1) {
      logs[idx] = entry;
    } else {
      logs.unshift(entry);
    }
    if (logs.length > 500) logs.pop();
    saveLogs(logs);
    syncToCloudDB(entry);
  }

  function updateSessionDuration(logId, seconds) {
    if (!logId) return;
    const logs = getLogs();
    const index = logs.findIndex(l => l.id === logId);
    if (index !== -1) {
      logs[index].time_spent_seconds = seconds;
      saveLogs(logs);
      syncToCloudDB(logs[index]);
    } else {
      syncToCloudDB({ id: logId, time_spent_seconds: seconds, last_updated: new Date().toLocaleString() });
    }
  }

  // --- 2. ADVANCED HARDWARE FINGERPRINTING & TELEMETRY ---
  function generateFingerprint() {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("CyberCity2050, <canvas> 1.0", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("CyberCity2050, <canvas> 1.0", 4, 17);
      
      const str = [
        canvas.toDataURL(),
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        screen.width + "x" + screen.height,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 4,
        navigator.maxTouchPoints || 0
      ].join("~~~");

      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      return "fp_" + Math.abs(hash).toString(16);
    } catch (e) {
      return "fp_standard_" + Math.floor(Math.random() * 100000);
    }
  }

  function parseUserAgent() {
    const ua = navigator.userAgent;
    let browser = "Browser";
    let os = "OS";
    let deviceModel = "Desktop PC / Laptop";

    if (/Windows NT 10.0/i.test(ua)) os = "Windows 11 / 10";
    else if (/Windows NT 6.1/i.test(ua)) os = "Windows 7";
    else if (/Mac OS X/i.test(ua)) os = "macOS";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
    else if (/Linux/i.test(ua)) os = "Linux";

    if (/Edg/i.test(ua)) browser = "MS Edge";
    else if (/Chrome/i.test(ua)) browser = "Chrome";
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
    else if (/Firefox/i.test(ua)) browser = "Firefox";

    if (/iPhone/i.test(ua)) deviceModel = "iPhone";
    else if (/iPad/i.test(ua)) deviceModel = "iPad";
    else if (/Samsung|SM-|GT-/i.test(ua)) deviceModel = "Samsung Galaxy";
    else if (/Pixel/i.test(ua)) deviceModel = "Google Pixel";
    else if (/Xiaomi|Redmi|Mi /i.test(ua)) deviceModel = "Xiaomi";
    else if (/Android/i.test(ua)) deviceModel = "Android Mobile";
    else if (/Macintosh/i.test(ua)) deviceModel = "MacBook / iMac";

    return {
      fullUA: ua,
      browserOS: browser + " on " + os,
      model: deviceModel
    };
  }

  function getDeviceType() {
    const ua = navigator.userAgent;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isMobileWidth = window.innerWidth <= 768;
    return isMobileUA || isMobileWidth ? "Mobile" : "Desktop";
  }

  // --- 3. SIMULATION SUPPORT ---
  function getSimulation() {
    try {
      return JSON.parse(localStorage.getItem(SIMULATION_KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  window.setGeoSimulation = function (simConfig) {
    if (simConfig) {
      localStorage.setItem(SIMULATION_KEY, JSON.stringify(simConfig));
    } else {
      localStorage.removeItem(SIMULATION_KEY);
    }
    window.location.reload();
  };

  // --- 4. MAIN GEOLOCATION & LOGGING ENGINE ---
  async function runGeoEngine() {
    const currentPath = window.location.pathname;

    // Do NOT run engine if on Admin portal
    if (currentPath.includes("/admin/")) {
      return;
    }

    const sim = getSimulation();
    const device = sim && sim.device ? sim.device : getDeviceType();
    const uaSpecs = parseUserAgent();
    const fingerprint = generateFingerprint();

    // ⚡ FAST IP DETECTION: Race real fetch (800ms max) vs session cache
    let geoData = { ip: "Unknown", country_name: "Unknown", country_code: "XX", city: "Unknown" };

    if (sim && sim.enabled) {
      // Simulation mode — use preset values instantly
      geoData = {
        ip: sim.ip || "127.0.0.1",
        country_name: sim.country_name || "Pakistan",
        country_code: sim.country_code || "PK",
        city: sim.city || "Simulated"
      };
    } else {
      // Check session cache first (instant, max 5 min old)
      try {
        const cached = JSON.parse(sessionStorage.getItem("cc_geo_cache") || "null");
        if (cached && cached.ts > Date.now() - 300000) {
          geoData = cached.data;
        } else {
          // Race: real IP fetch vs 800ms timeout
          const ipResult = await Promise.race([
            fetch("https://ipapi.co/json/").then(r => r.json()),
            new Promise(resolve => setTimeout(() => resolve(null), 800))
          ]);
          if (ipResult && ipResult.country_code) {
            geoData = {
              ip: ipResult.ip || "Unknown",
              country_name: ipResult.country_name || "Unknown",
              country_code: ipResult.country_code || "XX",
              city: ipResult.city || "Unknown"
            };
            // Cache for this session — next page will be instant
            sessionStorage.setItem("cc_geo_cache", JSON.stringify({ ts: Date.now(), data: geoData }));
          }
        }
      } catch (err) {
        console.log("Geo API fallback:", err);
      }
    }

    const code = (geoData.country_code || "").toUpperCase();
    const country = geoData.country_name || "Unknown";

    let redirectUrl = null;
    let accessStatus = "Allowed";
    let blockReason = "";

    if (code === "AU" || code === "CA" || country === "Australia" || country === "Canada") {
      accessStatus = "Blocked";
      blockReason = "Country Restricted (" + country + ")";
      if (!currentPath.includes("/pages/blocked/")) {
        redirectUrl = "pages/blocked/index.html?reason=country_blocked&country=" + encodeURIComponent(country);
      }
    } else if (code === "PK" || country === "Pakistan") {
      if (device === "Mobile") {
        accessStatus = "Allowed";
        if (!currentPath.includes("/pages/ur/")) {
          redirectUrl = "pages/ur/index.html";
        }
      } else {
        accessStatus = "Blocked";
        blockReason = "Device Restricted (Pakistan requires Mobile Device)";
        if (!currentPath.includes("/pages/blocked/")) {
          redirectUrl = "pages/blocked/index.html?reason=device_restricted&country=Pakistan&device=" + device;
        }
      }
    } else if (code === "SA" || code === "AE" || country === "Saudi Arabia" || country === "United Arab Emirates") {
      accessStatus = "Allowed";
      if (!currentPath.includes("/pages/ar/")) {
        redirectUrl = "pages/ar/index.html";
      }
    } else {
      accessStatus = "Allowed";
    }

    // Deduplication: skip if same session already logged this path
    let logId = sessionStorage.getItem(SESSION_LOGGED_KEY + "_" + currentPath);

    if (!logId) {
      logId = "LOG-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      sessionStorage.setItem(SESSION_LOGGED_KEY + "_" + currentPath, logId);

      let batteryInfo = "N/A";
      try {
        if (navigator.getBattery) {
          const bat = await navigator.getBattery();
          batteryInfo = Math.round(bat.level * 100) + "% " + (bat.charging ? "Charging" : "Battery");
        }
      } catch (e) {}

      const deviceSpecs = [
        uaSpecs.model,
        (navigator.hardwareConcurrency || 4) + " CPU Cores",
        (navigator.deviceMemory ? navigator.deviceMemory + "GB RAM" : "Standard RAM"),
        (navigator.maxTouchPoints > 0 ? navigator.maxTouchPoints + " Touch Points" : "Mouse Input")
      ].join(" • ");

      const batteryScreen = batteryInfo + " • " + screen.width + "x" + screen.height + " (" + window.innerWidth + "x" + window.innerHeight + ")";

      const logEntry = {
        id: logId,
        timestamp: new Date().toLocaleString(),
        ip: geoData.ip,
        country: country + " (" + code + ")",
        city: geoData.city,
        device: device,
        status: accessStatus,
        reason: blockReason || "N/A",
        requested_page: currentPath || "/",
        time_spent_seconds: 0,
        device_specs: deviceSpecs,
        browser_os: uaSpecs.browserOS,
        fingerprint_id: fingerprint,
        battery_screen: batteryScreen
      };

      // ⚡ SYNC TO FIREBASE — keepalive ensures it survives any page redirect
      saveLog(logEntry);
    }

    // Live duration tracker
    const sessionStartTime = Date.now();
    let durationSeconds = 0;
    const interval = setInterval(() => {
      durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
      updateSessionDuration(logId, durationSeconds);
    }, 4000);

    const updateFinalDuration = () => {
      clearInterval(interval);
      const finalSecs = Math.floor((Date.now() - sessionStartTime) / 1000);
      updateSessionDuration(logId, finalSecs);
    };

    window.addEventListener("beforeunload", updateFinalDuration);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        updateFinalDuration();
      }
    });

    // Perform redirect if required
    if (redirectUrl) {
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 300);
    }
  }

  document.addEventListener("DOMContentLoaded", runGeoEngine);
})();
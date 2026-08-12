/* =========================================================
   CYBERCITY 2050 — GEOLOCATION, DEVICE & LOGGING ENGINE
   Assignment Tasks 1, 2, & 3 + Telemetry & Duration Tracker
   ========================================================= */

(function () {
  const STORAGE_KEY = "cc_access_logs";
  const SIMULATION_KEY = "cc_geo_simulation";
  const CURRENT_SESSION_ID_KEY = "cc_active_session_id";

  // --- 1. HELPERS: LOGS DATABASE ---
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

  function saveLog(entry) {
    const logs = getLogs();
    logs.unshift(entry); // newest first
    if (logs.length > 500) logs.pop(); // keep last 500
    saveLogs(logs);
  }

  function updateSessionDuration(logId, seconds) {
    const logs = getLogs();
    const index = logs.findIndex(l => l.id === logId);
    if (index !== -1) {
      logs[index].time_spent_seconds = seconds;
      saveLogs(logs);
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

    // Detect OS
    if (/Windows NT 10.0/i.test(ua)) os = "Windows 11 / 10";
    else if (/Windows NT 6.1/i.test(ua)) os = "Windows 7";
    else if (/Mac OS X/i.test(ua)) os = "macOS";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
    else if (/Linux/i.test(ua)) os = "Linux";

    // Detect Browser
    if (/Edg/i.test(ua)) browser = "MS Edge";
    else if (/Chrome/i.test(ua)) browser = "Chrome";
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
    else if (/Firefox/i.test(ua)) browser = "Firefox";

    // Detect Device Model
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

    // Prevent redirect loop if already on a target page or admin dashboard
    if (
      currentPath.includes("/pages/ur/") ||
      currentPath.includes("/pages/ar/") ||
      currentPath.includes("/pages/blocked/") ||
      currentPath.includes("/pages/en/") ||
      currentPath.includes("/admin/")
    ) {
      return;
    }

    let geoData = {
      ip: "182.185.120.4",
      country_name: "Pakistan",
      country_code: "PK",
      city: "Lahore"
    };

    const sim = getSimulation();
    if (sim && sim.enabled) {
      geoData = {
        ip: sim.ip || "127.0.0.1",
        country_name: sim.country_name || "Pakistan",
        country_code: sim.country_code || "PK",
        city: sim.city || "Simulated City"
      };
    } else {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          if (data.country_code) {
            geoData = {
              ip: data.ip || "Unknown IP",
              country_name: data.country_name || "Unknown",
              country_code: data.country_code || "XX",
              city: data.city || "Unknown City"
            };
          }
        }
      } catch (err) {
        console.log("Geo API fallback engaged:", err);
      }
    }

    const device = sim && sim.device ? sim.device : getDeviceType();
    const code = (geoData.country_code || "").toUpperCase();
    const country = geoData.country_name || "Unknown";

    let redirectUrl = null;
    let accessStatus = "Allowed";
    let blockReason = "";

    // === TASK 1 & 2 ASSIGNMENT RULES ===
    if (code === "AU" || code === "CA" || country === "Australia" || country === "Canada") {
      accessStatus = "Blocked";
      blockReason = "Country Restricted (" + country + ")";
      redirectUrl = "pages/blocked/index.html?reason=country_blocked&country=" + encodeURIComponent(country);
    } else if (code === "PK" || country === "Pakistan") {
      if (device === "Mobile") {
        accessStatus = "Allowed";
        redirectUrl = "pages/ur/index.html";
      } else {
        accessStatus = "Blocked";
        blockReason = "Device Restricted (Pakistan requires Mobile Device)";
        redirectUrl = "pages/blocked/index.html?reason=device_restricted&country=Pakistan&device=" + device;
      }
    } else if (code === "SA" || code === "AE" || country === "Saudi Arabia" || country === "United Arab Emirates") {
      accessStatus = "Allowed";
      redirectUrl = "pages/ar/index.html";
    } else {
      accessStatus = "Allowed";
    }

    // Capture telemetry specs
    const uaSpecs = parseUserAgent();
    const fingerprint = generateFingerprint();
    const logId = "LOG-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    const sessionStartTime = Date.now();

    // Battery level (async check)
    let batteryInfo = "N/A";
    try {
      if (navigator.getBattery) {
        const bat = await navigator.getBattery();
        batteryInfo = Math.round(bat.level * 100) + "% " + (bat.charging ? "⚡" : "🔋");
      }
    } catch (e) {}

    const deviceSpecs = [
      uaSpecs.model,
      (navigator.hardwareConcurrency || 4) + " CPU Cores",
      (navigator.deviceMemory ? navigator.deviceMemory + "GB RAM" : "Standard RAM"),
      (navigator.maxTouchPoints > 0 ? navigator.maxTouchPoints + " Touch Points" : "Mouse Input")
    ].join(" • ");

    const batteryScreen = batteryInfo + " • " + screen.width + "x" + screen.height + " (" + window.innerWidth + "x" + window.innerHeight + ")";

    // === TASK 3: SAVE COMPREHENSIVE ACCESS LOG ===
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

    saveLog(logEntry);
    sessionStorage.setItem(CURRENT_SESSION_ID_KEY, logId);

    // --- LIVE SESSION DURATION TRACKER ---
    let durationSeconds = 0;
    const interval = setInterval(() => {
      durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
      updateSessionDuration(logId, durationSeconds);
    }, 5000);

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
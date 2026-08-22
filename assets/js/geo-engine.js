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
    }
    // Use PATCH so duration updates merge into Firebase without erasing IP, country, or status
    try {
      fetch(`${CLOUD_DB_URL}/${logId}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time_spent_seconds: seconds }),
        keepalive: true
      });
    } catch (e) {}
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

  // --- 3. GEOLOCATION & LOGGING ENGINE ---
  async function runGeoEngine() {
    // Purge any lingering simulation keys to ensure 100% real IP detection
    try { localStorage.removeItem("cc_geo_simulation"); } catch(e) {}

    const currentPath = window.location.pathname;

    // Do NOT run engine if on Admin portal
    if (currentPath.includes("/admin/")) {
      return;
    }

    const device = getDeviceType();
    const uaSpecs = parseUserAgent();
    const fingerprint = generateFingerprint();

    // ⚡ PROFESSIONAL MULTI-PROVIDER GEO-IP ENGINE — Sequential + Verified field names
    let geoData = { ip: "Unknown", country_name: "Unknown", country_code: "XX", city: "Unknown" };

    // Always clear stale session cache on fresh page load — prevents "XX" stuck-state bug
    try { sessionStorage.removeItem("cc_session_geo_data"); } catch (e) {}

    // Each provider individually with VERIFIED correct field mapping
    const fetchFromIpwhoIs = async () => {
      const r = await fetch("https://ipwho.is/", { cache: "no-store" });
      const d = await r.json();
      // ipwho.is: { success, ip, country_code:"PK", country:"Pakistan", city:"Lahore" }
      if (d && d.success === true && d.country_code && d.country_code !== "") {
        return {
          ip: d.ip || "Unknown",
          country_name: d.country || "Unknown",
          country_code: d.country_code.toUpperCase(),
          city: d.city || "Unknown"
        };
      }
      throw new Error("ipwho.is failed");
    };

    const fetchFromGeojs = async () => {
      const r = await fetch("https://get.geojs.io/v1/ip/geo.json", { cache: "no-store" });
      const d = await r.json();
      // geojs.io: { ip, country_code:"PK", country:"Pakistan", city:"Lahore" }
      if (d && d.country_code && d.country_code !== "") {
        return {
          ip: d.ip || "Unknown",
          country_name: d.country || "Unknown",
          country_code: d.country_code.toUpperCase(),
          city: d.city || "Unknown"
        };
      }
      throw new Error("geojs.io failed");
    };

    const fetchFromIpapi = async () => {
      const r = await fetch("https://ipapi.co/json/", { cache: "no-store" });
      const d = await r.json();
      // ipapi.co: { ip, country_code:"PK", country_name:"Pakistan", city:"Lahore" }
      if (d && d.country_code && !d.error) {
        return {
          ip: d.ip || "Unknown",
          country_name: d.country_name || "Unknown",
          country_code: d.country_code.toUpperCase(),
          city: d.city || "Unknown"
        };
      }
      throw new Error("ipapi.co failed");
    };

    const fetchFromFreeipapi = async () => {
      const r = await fetch("https://freeipapi.com/api/json", { cache: "no-store" });
      const d = await r.json();
      // freeipapi.com: { ipAddress, countryCode:"PK", countryName:"Pakistan", cityName:"Lahore" }
      if (d && d.countryCode && d.countryCode !== "") {
        return {
          ip: d.ipAddress || "Unknown",
          country_name: d.countryName || "Unknown",
          country_code: d.countryCode.toUpperCase(),
          city: d.cityName || "Unknown"
        };
      }
      throw new Error("freeipapi.com failed");
    };

    // Run all 4 providers in parallel — first valid result wins
    const fetchGeoFromProviders = () => {
      return Promise.any([
        fetchFromIpwhoIs(),
        fetchFromGeojs(),
        fetchFromIpapi(),
        fetchFromFreeipapi()
      ]);
    };

    try {
      // 5 second timeout — enough for even the slowest mobile 4G/LTE network
      const geoResult = await Promise.race([
        fetchGeoFromProviders(),
        new Promise(resolve => setTimeout(() => resolve(null), 5000))
      ]);

      if (geoResult && geoResult.country_code !== "XX") {
        geoData = geoResult;
        // Cache for this page session only (not cross-page, to prevent stale routing)
        try {
          sessionStorage.setItem("cc_session_geo_data", JSON.stringify(geoResult));
        } catch (e) {}
      }
    } catch (err) {
      console.warn("[GeoEngine] All providers failed:", err);
    }

    const code = (geoData.country_code || "").toUpperCase();
    const country = geoData.country_name || "Unknown";

    // Helper to build correct relative paths depending on current location
    const getPagePath = (target) => {
      const isSubFolder = currentPath.includes("/pages/");
      if (target === "blocked") {
        return isSubFolder ? "../blocked/index.html" : "pages/blocked/index.html";
      }
      if (target === "ur") {
        return isSubFolder ? "../ur/index.html" : "pages/ur/index.html";
      }
      if (target === "ar") {
        return isSubFolder ? "../ar/index.html" : "pages/ar/index.html";
      }
      if (target === "en") {
        return isSubFolder ? "../../index.html" : "index.html";
      }
      return target;
    };

    let redirectUrl = null;
    let accessStatus = "Allowed";
    let blockReason = "";

    // --- TASK 1 & TASK 2 RULES ---
    // 1. Australia & Canada -> Access Block (All Devices)
    if (code === "AU" || code === "CA" || country === "Australia" || country === "Canada") {
      accessStatus = "Blocked";
      blockReason = "Country Restricted (" + country + ")";
      if (!currentPath.includes("/pages/blocked/")) {
        redirectUrl = getPagePath("blocked") + "?reason=country_blocked&country=" + encodeURIComponent(country);
      }
    } 
    // 2. Pakistan -> Mobile Only Allowed (Urdu), Desktop Blocked
    else if (code === "PK" || country === "Pakistan") {
      if (device === "Mobile") {
        accessStatus = "Allowed";
        if (!currentPath.includes("/pages/ur/")) {
          redirectUrl = getPagePath("ur");
        }
      } else {
        accessStatus = "Blocked";
        blockReason = "Device Restricted (Pakistan requires Mobile Device)";
        if (!currentPath.includes("/pages/blocked/")) {
          redirectUrl = getPagePath("blocked") + "?reason=device_restricted&country=Pakistan&device=" + device;
        }
      }
    } 
    // 3. Saudi Arabia & UAE -> Arabic Version
    else if (code === "SA" || code === "AE" || country === "Saudi Arabia" || country === "United Arab Emirates") {
      accessStatus = "Allowed";
      if (!currentPath.includes("/pages/ar/")) {
        redirectUrl = getPagePath("ar");
      }
    } 
    // 4. UK & All Other Countries -> English Version (Both Mobile & Desktop Allowed)
    else {
      accessStatus = "Allowed";
      if (currentPath.includes("/pages/ur/") || currentPath.includes("/pages/ar/") || currentPath.includes("/pages/blocked/")) {
        redirectUrl = getPagePath("en");
      }
    }

    // Log entry creation logic (Logs on new path OR whenever IP changes e.g. VPN connected)
    let logId = sessionStorage.getItem(SESSION_LOGGED_KEY + "_" + currentPath);
    const lastLoggedIP = sessionStorage.getItem("cc_last_logged_ip");
    const ipChanged = geoData.ip && geoData.ip !== "Unknown" && lastLoggedIP !== geoData.ip;

    if (!logId || ipChanged) {
      logId = "LOG-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      sessionStorage.setItem(SESSION_LOGGED_KEY + "_" + currentPath, logId);
      if (geoData.ip && geoData.ip !== "Unknown") {
        sessionStorage.setItem("cc_last_logged_ip", geoData.ip);
      }

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
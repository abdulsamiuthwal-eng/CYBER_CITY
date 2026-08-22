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
    const ua = (navigator.userAgent || navigator.vendor || window.opera || "").toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|crios|samsungbrowser/i.test(ua);
    const isTouch = (navigator.maxTouchPoints || 0) > 0;
    const isSmall = (window.innerWidth && window.innerWidth <= 900) || (screen.width && screen.width <= 900);
    return (isMobileUA || (isTouch && isSmall)) ? "Mobile" : "Desktop";
  }

  // --- 3. GEOLOCATION & LOGGING ENGINE ---
  async function runGeoEngine() {
    // Purge any lingering simulation keys to ensure 100% real IP detection
    try { localStorage.removeItem("cc_geo_simulation"); } catch(e) {}

    const currentPath = window.location.pathname.toLowerCase();

    // Do NOT run engine if on Admin portal
    if (currentPath.includes("/admin/")) {
      return;
    }

    const device = getDeviceType();
    const uaSpecs = parseUserAgent();
    const fingerprint = generateFingerprint();

    // ⚡ PROFESSIONAL MULTI-PROVIDER GEO-IP ENGINE — Fast Parallel Fetch
    let geoData = { ip: "Unknown", country_name: "Unknown", country_code: "XX", city: "Unknown" };

    // Provider 1: ipwho.is
    const fetchFromIpwhoIs = async () => {
      const r = await fetch("https://ipwho.is/", { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      if (d && d.success === true && d.country_code) {
        return {
          ip: d.ip || "Unknown",
          country_name: d.country || "Pakistan",
          country_code: d.country_code.toUpperCase(),
          city: d.city || "Unknown"
        };
      }
      throw new Error("ipwho.is invalid");
    };

    // Provider 2: geojs.io (Fast global CDN)
    const fetchFromGeojs = async () => {
      const r = await fetch("https://get.geojs.io/v1/ip/geo.json", { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const raw = await r.json();
      const d = Array.isArray(raw) ? raw[0] : raw;
      if (d && (d.country_code || d.country)) {
        const cCode = (d.country_code || d.country || "").toUpperCase();
        return {
          ip: d.ip || "Unknown",
          country_name: d.country || (cCode === "PK" ? "Pakistan" : cCode),
          country_code: cCode,
          city: d.city || "Unknown"
        };
      }
      throw new Error("geojs.io invalid");
    };

    // Provider 3: api.country.is (Ultra fast 20ms lookup)
    const fetchFromCountryIs = async () => {
      const r = await fetch("https://api.country.is", { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      if (d && d.country) {
        return {
          ip: d.ip || "Unknown",
          country_name: d.country === "PK" ? "Pakistan" : d.country,
          country_code: d.country.toUpperCase(),
          city: "Unknown"
        };
      }
      throw new Error("api.country.is invalid");
    };

    // Run all 3 reliable providers in parallel — fastest one wins (<200ms)
    try {
      const geoResult = await Promise.race([
        Promise.any([
          fetchFromIpwhoIs(),
          fetchFromGeojs(),
          fetchFromCountryIs()
        ]),
        new Promise(resolve => setTimeout(() => resolve(null), 5000))
      ]);

      if (geoResult && geoResult.country_code && geoResult.country_code !== "XX") {
        geoData = geoResult;
      }
    } catch (err) {
      console.warn("[GeoEngine] Geo fetch error:", err);
    }

    const code = (geoData.country_code || "").toUpperCase();
    const country = geoData.country_name || "Unknown";

    // Build bulletproof root-relative URLs
    let redirectUrl = null;
    let accessStatus = "Allowed";
    let blockReason = "";

    // Normalize path check
    const isBlockedPage = currentPath.includes("/pages/blocked");
    const isUrduPage = currentPath.includes("/pages/ur");
    const isArabicPage = currentPath.includes("/pages/ar");
    const isMainPage = !isBlockedPage && !isUrduPage && !isArabicPage;

    // --- TASK 1 & TASK 2 RULES ---
    // 1. Australia & Canada -> Access Block (All Devices)
    if (code === "AU" || code === "CA" || country === "Australia" || country === "Canada") {
      accessStatus = "Blocked";
      blockReason = "Country Restricted (" + country + ")";
      if (!isBlockedPage) {
        redirectUrl = "/pages/blocked/index.html?reason=country_blocked&country=" + encodeURIComponent(country);
      }
    } 
    // 2. Pakistan -> Mobile Only Allowed (Urdu), Desktop Blocked
    else if (code === "PK" || country === "Pakistan") {
      if (device === "Mobile") {
        accessStatus = "Allowed";
        if (!isUrduPage) {
          redirectUrl = "/pages/ur/index.html";
        }
      } else {
        accessStatus = "Blocked";
        blockReason = "Device Restricted (Pakistan requires Mobile Device)";
        if (!isBlockedPage) {
          redirectUrl = "/pages/blocked/index.html?reason=device_restricted&country=Pakistan&device=" + device;
        }
      }
    } 
    // 3. Saudi Arabia & UAE -> Arabic Version
    else if (code === "SA" || code === "AE" || country === "Saudi Arabia" || country === "United Arab Emirates") {
      accessStatus = "Allowed";
      if (!isArabicPage) {
        redirectUrl = "/pages/ar/index.html";
      }
    } 
    // 4. UK & All Other Countries -> English Version (Both Mobile & Desktop Allowed)
    else if (code !== "XX" && country !== "Unknown") {
      accessStatus = "Allowed";
      if (!isMainPage) {
        redirectUrl = "/index.html";
      }
    }

    // Log entry creation logic
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

    // ⚡ Perform INSTANT redirect if required
    if (redirectUrl) {
      window.location.replace(redirectUrl);
    }
  }

  // ⚡ Guaranteed immediate execution (doesn't get stuck waiting if DOM is already ready)
  if (document.readyState === "complete" || document.readyState === "interactive") {
    runGeoEngine();
  } else {
    document.addEventListener("DOMContentLoaded", runGeoEngine);
  }
})();
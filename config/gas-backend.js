/**
 * CyberCity 2050 — Google Apps Script Backend (v2.0 Enterprise)
 * Supports: 
 * 1. Access Telemetry Logging & Retrieval
 * 2. Automated Super Admin Email Notifications on New Operator Registrations
 * 3. 1-Click Approval / Rejection Endpoints from Gmail
 * 4. Password Recovery Notifications
 *
 * Instructions:
 * 1. Paste this ENTIRE file into script.google.com → New Project
 * 2. Click Deploy → New deployment → Web App → Execute as: Me → Who has access: Anyone → Deploy
 * 3. Copy the Web App URL and update CLOUD_GAS_URL in admin/index.html if needed!
 */

const SHEET_NAME_LOGS = "AccessLogs";
const SHEET_NAME_USERS = "RegisteredUsers";
const SUPER_ADMIN_EMAIL = "abdulsamiuthwal@gmail.com";
const FIREBASE_USERS_URL = "https://cybercity2050-logs-4cf99-default-rtdb.firebaseio.com/registered_users";

/**
 * Run this function ONCE in script.google.com editor:
 * Select 'sendTestApprovalEmail' -> Click 'Run' -> Allow Permissions.
 * This instantly authorizes Gmail and sends a test Approve/Reject email to your inbox!
 */
function sendTestApprovalEmail() {
  const sampleUser = {
    name: "Test Operator",
    username: "test_operator",
    email: "test@cybercity.org",
    role: "Admin Operator",
    id: "USER-SAMPLE-123"
  };
  
  const scriptUrl = ScriptApp.getService().getUrl() || "https://script.google.com/macros/s/AKfycbwIpSiynUPrdKfYVM1-pWYEnt4h0IqyfSwWceTkBrK7qI7LH3qRZ4qGBDN1yo1ZPtLm/exec";
  const approveUrl = scriptUrl + "?action=approve_user&username=" + encodeURIComponent(sampleUser.username) + "&id=" + encodeURIComponent(sampleUser.id);
  const rejectUrl = scriptUrl + "?action=reject_user&username=" + encodeURIComponent(sampleUser.username) + "&id=" + encodeURIComponent(sampleUser.id);

  MailApp.sendEmail({
    to: SUPER_ADMIN_EMAIL,
    subject: "🚨 [Action Required] New Admin Access Request: " + sampleUser.username + " (" + sampleUser.name + ")",
    htmlBody: `
      <div style="font-family:system-ui, -apple-system, sans-serif; background:#08150a; color:#e2f1e5; padding:32px; border-radius:16px; border:1.5px solid #22c55e; max-width:620px;">
        <div style="font-size:1.4rem; font-weight:800; color:#4ade80; letter-spacing:1px; margin-bottom:4px;">CYBERCITY 2050</div>
        <div style="font-size:0.85rem; color:#9ca3af; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:20px;">Super Admin Authorization Request</div>
        <p style="font-size:1rem; line-height:1.6; color:#d1fae5;">A new user has submitted a registration request to access the Protected Admin Telemetry Portal:</p>
        <table style="width:100%; border-collapse:collapse; margin:20px 0; background:rgba(0,0,0,0.4); border-radius:10px; overflow:hidden;">
          <tr><td style="padding:10px 14px; border-bottom:1px solid #1f2937; color:#9ca3af; width:140px;">Full Name</td><td style="padding:10px 14px; border-bottom:1px solid #1f2937; font-weight:700; color:#fff;">${sampleUser.name}</td></tr>
          <tr><td style="padding:10px 14px; border-bottom:1px solid #1f2937; color:#9ca3af;">Username</td><td style="padding:10px 14px; border-bottom:1px solid #1f2937; font-weight:700; color:#86efac; font-family:monospace;">${sampleUser.username}</td></tr>
          <tr><td style="padding:10px 14px; border-bottom:1px solid #1f2937; color:#9ca3af;">Email</td><td style="padding:10px 14px; border-bottom:1px solid #1f2937; color:#60a5fa;">${sampleUser.email}</td></tr>
          <tr><td style="padding:10px 14px; border-bottom:1px solid #1f2937; color:#9ca3af;">Assigned Role</td><td style="padding:10px 14px; border-bottom:1px solid #1f2937; color:#fbbf24;">${sampleUser.role}</td></tr>
          <tr><td style="padding:10px 14px; color:#9ca3af;">Request Time</td><td style="padding:10px 14px; color:#e2f1e5;">${new Date().toLocaleString()}</td></tr>
        </table>
        <div style="margin-top:28px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1);">
          <a href="${approveUrl}" style="display:inline-block; padding:14px 26px; background:#16a34a; color:#fff; text-decoration:none; border-radius:10px; font-weight:800; letter-spacing:0.5px;">
            ✅ Approve & Activate Access
          </a>
          &nbsp;&nbsp;
          <a href="${rejectUrl}" style="display:inline-block; padding:14px 22px; background:#dc2626; color:#fff; text-decoration:none; border-radius:10px; font-weight:700;">
            ❌ Reject
          </a>
        </div>
      </div>
    `
  });
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "";
    
    // --- 1-CLICK APPROVAL / REJECTION FROM EMAIL ---
    if (action === "approve_user" || action === "reject_user") {
      const username = e.parameter.username || "";
      const userId = e.parameter.id || "";
      const newStatus = action === "approve_user" ? "approved" : "rejected";
      
      // Update in Google Sheet
      const sheet = getOrCreateUserSheet();
      const data = sheet.getDataRange().getValues();
      let userFound = false;
      let userEmail = "";
      let userName = "";

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userId || data[i][2] === username) {
          sheet.getRange(i + 1, 6).setValue(newStatus); // Status Column
          sheet.getRange(i + 1, 7).setValue(new Date().toLocaleString()); // Updated At
          userFound = true;
          userName = data[i][1];
          userEmail = data[i][3];
          break;
        }
      }

      // Update in Firebase Realtime DB via REST API
      try {
        if (userId) {
          const patchPayload = { status: newStatus, updated_at: new Date().toISOString() };
          UrlFetchApp.fetch(FIREBASE_USERS_URL + "/" + encodeURIComponent(userId) + ".json", {
            method: "PATCH",
            contentType: "application/json",
            payload: JSON.stringify(patchPayload),
            muteHttpExceptions: true
          });
        }
      } catch (err) {}

      // Send confirmation email to applicant if approved
      if (action === "approve_user" && userEmail) {
        try {
          MailApp.sendEmail({
            to: userEmail,
            subject: "✅ Access Approved — CyberCity 2050 Admin Portal",
            htmlBody: `
              <div style="font-family:sans-serif; background:#08150a; color:#e2f1e5; padding:30px; border-radius:12px; border:1px solid #22c55e; max-width:600px;">
                <h2 style="color:#4ade80; margin-top:0;">CyberCity 2050 — Access Authorized</h2>
                <p>Hello <strong>${userName || username}</strong>,</p>
                <p>Your request for access to the <strong>CyberCity 2050 Admin Telemetry Portal</strong> has been approved by the Super Admin.</p>
                <p>You can now log in using your registered username: <code style="color:#86efac; background:rgba(0,0,0,0.4); padding:3px 8px; border-radius:4px;">${username}</code></p>
                <div style="margin-top:20px; font-size:0.85rem; color:#9ca3af;">
                  &copy; 2050 CyberCity Municipal Authority. Security & Telemetry Operations.
                </div>
              </div>
            `
          });
        } catch (mailErr) {}
      }

      const statusColor = newStatus === "approved" ? "#22c55e" : "#ef4444";
      const statusIcon = newStatus === "approved" ? "✅" : "❌";
      const statusTitle = newStatus === "approved" ? "OPERATOR ACCESS AUTHORIZED" : "OPERATOR ACCESS REJECTED";

      return HtmlService.createHtmlOutput(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${statusTitle} — CyberCity 2050</title>
          <style>
            body { background: #08150a; color: #e2f1e5; font-family: system-ui, -apple-system, sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }
            .card { background: rgba(4, 30, 10, 0.85); border: 1.5px solid ${statusColor}; border-radius: 16px; padding: 40px; text-align: center; max-width: 500px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
            h1 { color: ${statusColor}; font-size: 1.6rem; margin-bottom: 12px; }
            p { color: #d1fae5; line-height: 1.6; font-size: 1rem; }
            .badge { display:inline-block; padding: 6px 14px; background: rgba(0,0,0,0.5); border: 1px solid ${statusColor}; border-radius: 8px; font-family: monospace; margin: 15px 0; color:#fff; font-size:1.1rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <div style="font-size:3rem; margin-bottom:10px;">${statusIcon}</div>
            <h1>${statusTitle}</h1>
            <div class="badge">Username: ${username}</div>
            <p>The operator's status has been successfully updated to <strong>${newStatus.toUpperCase()}</strong> in the Central Database.</p>
            <p style="font-size:0.85rem; color:#9ca3af; margin-top:20px;">You may safely close this window.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Default: Return logs JSON
    const sheet = getOrCreateLogsSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return jsonResponse({ logs: [] });
    }
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
    rows.reverse();
    return jsonResponse({ logs: rows });
  } catch (e) {
    return jsonResponse({ error: e.message });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    
    // --- 1. HANDLE REGISTRATION REQUEST & AUTO EMAIL NOTIFICATION ---
    if (payload.action === "registration_request") {
      const userSheet = getOrCreateUserSheet();
      const headers = ["id", "name", "username", "email", "role", "status", "created_at"];
      
      const newRow = [
        payload.id || ("USER-" + Date.now()),
        payload.name || "N/A",
        payload.username || "N/A",
        payload.email || "N/A",
        payload.role || "Admin Operator",
        "pending",
        new Date().toLocaleString()
      ];
      userSheet.appendRow(newRow);

      // Generate 1-Click Web App Action URLs
      const serviceUrl = ScriptApp.getService().getUrl();
      const approveUrl = serviceUrl + "?action=approve_user&username=" + encodeURIComponent(payload.username) + "&id=" + encodeURIComponent(payload.id);
      const rejectUrl = serviceUrl + "?action=reject_user&username=" + encodeURIComponent(payload.username) + "&id=" + encodeURIComponent(payload.id);

      // Send Instant Super Admin Email
      try {
        MailApp.sendEmail({
          to: SUPER_ADMIN_EMAIL,
          subject: `🚨 [Action Required] New Admin Access Request: ${payload.username} (${payload.name})`,
          htmlBody: `
            <div style="font-family:system-ui, -apple-system, sans-serif; background:#08150a; color:#e2f1e5; padding:32px; border-radius:16px; border:1.5px solid #22c55e; max-width:620px;">
              <div style="font-size:1.4rem; font-weight:800; color:#4ade80; letter-spacing:1px; margin-bottom:4px;">CYBERCITY 2050</div>
              <div style="font-size:0.85rem; color:#9ca3af; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:20px;">Super Admin Authorization Request</div>
              
              <p style="font-size:1rem; line-height:1.6; color:#d1fae5;">A new user has submitted a registration request to access the Protected Admin Telemetry Portal:</p>
              
              <table style="width:100%; border-collapse:collapse; margin:20px 0; background:rgba(0,0,0,0.4); border-radius:10px; overflow:hidden;">
                <tr><td style="padding:10px 14px; border-bottom:1px solid #1f2937; color:#9ca3af; width:140px;">Full Name</td><td style="padding:10px 14px; border-bottom:1px solid #1f2937; font-weight:700; color:#fff;">${payload.name}</td></tr>
                <tr><td style="padding:10px 14px; border-bottom:1px solid #1f2937; color:#9ca3af;">Username</td><td style="padding:10px 14px; border-bottom:1px solid #1f2937; font-weight:700; color:#86efac; font-family:monospace;">${payload.username}</td></tr>
                <tr><td style="padding:10px 14px; border-bottom:1px solid #1f2937; color:#9ca3af;">Email</td><td style="padding:10px 14px; border-bottom:1px solid #1f2937; color:#60a5fa;">${payload.email}</td></tr>
                <tr><td style="padding:10px 14px; border-bottom:1px solid #1f2937; color:#9ca3af;">Assigned Role</td><td style="padding:10px 14px; border-bottom:1px solid #1f2937; color:#fbbf24;">${payload.role || 'Admin Operator'}</td></tr>
                <tr><td style="padding:10px 14px; color:#9ca3af;">Request Time</td><td style="padding:10px 14px; color:#e2f1e5;">${new Date().toLocaleString()}</td></tr>
              </table>

              <div style="margin-top:28px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1); display:flex; gap:12px;">
                <a href="${approveUrl}" style="display:inline-block; padding:14px 26px; background:#16a34a; color:#fff; text-decoration:none; border-radius:10px; font-weight:800; letter-spacing:0.5px; box-shadow:0 4px 14px rgba(22,163,74,0.4);">
                  ✅ Approve & Activate Access
                </a>
                &nbsp;&nbsp;
                <a href="${rejectUrl}" style="display:inline-block; padding:14px 22px; background:#dc2626; color:#fff; text-decoration:none; border-radius:10px; font-weight:700;">
                  ❌ Reject
                </a>
              </div>
              
              <div style="margin-top:28px; font-size:0.78rem; color:#6b7280; line-height:1.4;">
                This request was generated by CyberCity 2050 Access Control Guard. Until approved, this operator cannot access the system.
              </div>
            </div>
          `
        });
      } catch (err) {
        console.log("Email dispatch fallback:", err);
      }

      return jsonResponse({ success: true, message: "Registration recorded & Super Admin notified via email." });
    }

    // --- 2. HANDLE FORGOT PASSWORD NOTIFICATION ---
    if (payload.action === "forgot_password") {
      try {
        MailApp.sendEmail({
          to: SUPER_ADMIN_EMAIL,
          subject: `🔑 Password Recovery Request: ${payload.identifier}`,
          htmlBody: `
            <div style="font-family:sans-serif; background:#08150a; color:#e2f1e5; padding:24px; border-radius:10px; border:1px solid #fbbf24;">
              <h3 style="color:#fbbf24; margin-top:0;">CyberCity 2050 — Password Recovery Request</h3>
              <p>A password reset/recovery request was submitted for Identifier: <strong>${payload.identifier}</strong> at ${new Date().toLocaleString()}.</p>
              <p>Please review user permissions in your Admin Dashboard.</p>
            </div>
          `
        });
      } catch (e) {}
      return jsonResponse({ success: true, message: "Recovery request dispatched to Super Admin." });
    }

    // --- 3. HANDLE CLEAR ALL LOGS ---
    if (payload.action === "clear") {
      const sheet = getOrCreateLogsSheet();
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      return jsonResponse({ success: true, action: "cleared" });
    }
    
    // --- 4. HANDLE TELEMETRY LOG ENTRY ---
    if (payload.id) {
      const sheet = getOrCreateLogsSheet();
      const headers = getLogsHeaders(sheet);
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const idCol = headers.indexOf("id");
        if (data[i][idCol] === payload.id) {
          const timeCol = headers.indexOf("time_spent_seconds");
          if (timeCol !== -1 && payload.time_spent_seconds) {
            sheet.getRange(i + 1, timeCol + 1).setValue(payload.time_spent_seconds);
          }
          return jsonResponse({ success: true, action: "updated" });
        }
      }
      
      const row = headers.map(h => payload[h] !== undefined ? payload[h] : "");
      sheet.appendRow(row);
      return jsonResponse({ success: true, action: "created" });
    }
    
    return jsonResponse({ error: "Invalid payload" });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function getOrCreateLogsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create("CyberCity2050 Access Logs");
  let sheet = ss.getSheetByName(SHEET_NAME_LOGS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_LOGS);
    const headers = [
      "id", "timestamp", "ip", "country", "city", "device",
      "status", "reason", "requested_page", "time_spent_seconds",
      "device_specs", "browser_os", "fingerprint_id", "battery_screen"
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sheet;
}

function getOrCreateUserSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create("CyberCity2050 Access Logs");
  let sheet = ss.getSheetByName(SHEET_NAME_USERS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_USERS);
    const headers = ["id", "name", "username", "email", "role", "status", "created_at"];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sheet;
}

function getLogsHeaders(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (firstRow.filter(Boolean).length === 0) {
    const headers = [
      "id", "timestamp", "ip", "country", "city", "device",
      "status", "reason", "requested_page", "time_spent_seconds",
      "device_specs", "browser_os", "fingerprint_id", "battery_screen"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return headers;
  }
  return firstRow;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

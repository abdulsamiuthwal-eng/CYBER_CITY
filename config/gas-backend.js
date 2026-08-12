/**
 * CyberCity 2050 — Google Apps Script Backend
 * Paste this ENTIRE file into script.google.com → New Project
 * Then Deploy → New deployment → Web App → Anyone → Deploy
 * Copy the URL and give it to me!
 */

const SHEET_NAME = "AccessLogs";

function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
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
    // Return latest first
    rows.reverse();
    return jsonResponse({ logs: rows });
  } catch (e) {
    return jsonResponse({ error: e.message });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    
    // Handle DELETE all logs
    if (payload.action === "clear") {
      const sheet = getOrCreateSheet();
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      return jsonResponse({ success: true, action: "cleared" });
    }
    
    // Handle single log entry
    if (payload.id) {
      const sheet = getOrCreateSheet();
      const headers = getHeaders(sheet);
      
      // Check if this ID already exists (update duration)
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const idCol = headers.indexOf("id");
        if (data[i][idCol] === payload.id) {
          // Update time_spent_seconds
          const timeCol = headers.indexOf("time_spent_seconds");
          if (timeCol !== -1 && payload.time_spent_seconds) {
            sheet.getRange(i + 1, timeCol + 1).setValue(payload.time_spent_seconds);
          }
          return jsonResponse({ success: true, action: "updated" });
        }
      }
      
      // New entry — append row
      const row = headers.map(h => payload[h] !== undefined ? payload[h] : "");
      sheet.appendRow(row);
      return jsonResponse({ success: true, action: "created" });
    }
    
    return jsonResponse({ error: "Invalid payload" });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create("CyberCity2050 Access Logs");
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Create headers
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

function getHeaders(sheet) {
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

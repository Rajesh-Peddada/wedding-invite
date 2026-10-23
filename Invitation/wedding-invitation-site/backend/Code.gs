/**
 * Private wedding RSVP register.
 * Stores one row per submitted guest name and assigns a sequential response number.
 * The public endpoint accepts submissions only; it never returns guest names or counts.
 */
const SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const TAB_NAME = 'RSVPs';
const HEADERS = ['Response #', 'Timestamp (UTC)', 'Guest Name'];

function doPost(e) {
  const body = parseBody_(e);

  // Honeypot field: bots that fill this hidden field are silently ignored.
  if (body.website) return output_({ ok: true, ignored: true });

  const guestName = String(body.guestName || '').trim().slice(0, 100);
  if (!guestName) return output_({ ok: false, error: 'name_required' });
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE') {
    return output_({ ok: false, error: 'not_configured' });
  }

  const lock = LockService.getScriptLock();
  try {
    // Prevent two near-simultaneous submissions from receiving the same response number.
    lock.waitLock(15000);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(TAB_NAME);
    if (!sheet) sheet = spreadsheet.insertSheet(TAB_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.setFrozenRows(1);
    }

    const responseNumber = Math.max(0, sheet.getLastRow() - 1) + 1;
    sheet.appendRow([responseNumber, new Date(), guestName]);
    SpreadsheetApp.flush();
    return output_({ ok: true, responseNumber: responseNumber });
  } catch (error) {
    console.error(error);
    return output_({ ok: false, error: 'save_failed' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function doGet() {
  // Health message only; guest names and the response count stay private.
  return output_({ ok: true, message: 'Wedding RSVP endpoint is active.' });
}

function parseBody_(e) {
  try {
    return JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (_) {
    return {};
  }
}

function output_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

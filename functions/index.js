/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const Papa = require("papaparse");
const { parse, isValid } = require("date-fns");

admin.initializeApp();
const db = admin.firestore();

// Hardcoded Sheet URL from client .env for simplicity (better via defineSecret/defineString in prod)
const SHEET_CSV_URL = "https://script.google.com/macros/s/AKfycbx9UZBOfgKbXPIn_WFK8U35t2t9bd1G4VDVJ6vOcyjKPLz2If9ABgb-NjxBMB9LdD3Z/exec";

const ACCEPTED_DATE_FORMATS = [
  'd/M/yyyy',
  'yyyy-MM-dd',
  'dd/MM/yy',
  'dd/MM/yyyy',
];

const parseDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const cleanStr = dateStr.trim();
  if (cleanStr === '') return null;

  const referenceDate = new Date();
  for (const formatStr of ACCEPTED_DATE_FORMATS) {
    // date-fns v2 parse requires format string
    const parsedDate = parse(cleanStr, formatStr, referenceDate);
    if (isValid(parsedDate)) return parsedDate.toISOString();
  }
  return null;
};

/**
 * Scheduled function to sync tickets from Google Sheet every day at 08:00 (Asia/Bangkok)
 */
exports.scheduledTicketSync = onSchedule({
  schedule: "every day 08:00",
  timeZone: "Asia/Bangkok",
  timeoutSeconds: 300,
  memory: "512MiB",
}, async (event) => {
  console.log("Starting scheduled ticket sync...");

  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) throw new Error("Failed to fetch CSV");
    const csvText = await response.text();

    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (results.errors.length > 0) {
      console.warn("CSV Parse errors:", results.errors);
    }

    const sheetData = results.data.map(item => {
      const parsedDate = parseDate(item['Date']);
      const safeDate = parsedDate || new Date().toISOString();

      return {
        ticketNumber: item['Ticket Number'] || item['Ticket No'] || '',
        shortDesc: item['Short Description & Detail'] || item['Detail'] || item['Description'] || '',
        status: item['Status'] || 'Open',
        type: item['Ticket Type'] || 'Incident',
        assign: item['Assign'] || 'Unassigned',
        details: item['Detail'] || '',
        action: item['Ation'] || item['Action'] || '',
        resolvedDetail: item['Resolved detail'] || '',
        remark: item['Remark'] || '',
        date: safeDate,
        createdAt: safeDate,
        importedAt: new Date().toISOString()
      };
    }).filter(item => item.ticketNumber);

    console.log(`Parsed ${sheetData.length} tickets from Sheet.`);

    // Batch write to Firestore
    const batchSize = 500;
    let updatedCount = 0;

    // Process in chunks
    for (let i = 0; i < sheetData.length; i += batchSize) {
      const chunk = sheetData.slice(i, i + batchSize);
      const batch = db.batch();

      chunk.forEach(log => {
        const docRef = db.collection('ticket_logs').doc(String(log.ticketNumber));
        // Use set with merge: true to update existing or create new
        batch.set(docRef, log, { merge: true });
      });

      await batch.commit();
      updatedCount += chunk.length;
      console.log(`Committed batch of ${chunk.length} tickets.`);
    }

    console.log(`Sync complete. Processed ${updatedCount} tickets.`);
    return null;

  } catch (error) {
    console.error("Error in scheduledTicketSync:", error);
    return null;
  }
});

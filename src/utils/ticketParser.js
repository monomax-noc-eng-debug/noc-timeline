/**
 * Utility for parsing Ticket Log CSV data
 * Uses PapaParse for robust CSV parsing with proper comma handling
 * Supports 15 columns based on Ticket Log.xlsx structure
 */
import Papa from 'papaparse';

/**
 * Parse CSV text into ticket objects
 * @param {string} csvText - Raw CSV text to parse
 * @returns {Array} Array of ticket objects or empty array on error
 */
export const parseTicketCSV = (csvText) => {
  // Error Handling: Empty or invalid input
  if (!csvText || typeof csvText !== 'string') {
    console.warn('[ticketParser] Invalid input: CSV text is empty or not a string');
    return [];
  }

  const trimmedText = csvText.trim();
  if (trimmedText === '') {
    console.warn('[ticketParser] Invalid input: CSV text is empty after trimming');
    return [];
  }

  try {
    // Parse CSV using PapaParse (synchronous mode)
    const parseResult = Papa.parse(trimmedText, {
      header: false,        // เราจะ map fields เอง
      skipEmptyLines: true, // ข้ามบรรทัดว่าง
      delimiter: ',',       // ใช้ comma เป็น delimiter
      quoteChar: '"',       // รองรับ double quotes สำหรับ escape comma
    });

    // Error Handling: Parse errors
    if (parseResult.errors && parseResult.errors.length > 0) {
      console.warn('[ticketParser] Parse warnings:', parseResult.errors);
      // Continue processing even with warnings (non-fatal errors)
    }

    const rows = parseResult.data;

    // Error Handling: Not enough data (need header + at least 1 data row)
    if (!rows || rows.length < 2) {
      console.warn('[ticketParser] Invalid format: CSV must have header and at least one data row');
      return [];
    }

    // Skip header row (index 0) and map data rows
    const tickets = rows.slice(1).map((values, index) => {
      // Validate row has minimum required columns (at least 5 columns)
      if (!Array.isArray(values) || values.length < 5) {
        console.warn(`[ticketParser] Skipping row ${index + 2}: insufficient columns (${values?.length || 0})`);
        return null;
      }

      // Clean values - trim whitespace from each field
      const cleanValues = values.map(v =>
        (v !== null && v !== undefined) ? String(v).trim() : ''
      );

      // Map fields to ticket structure
      // Index mapping based on Ticket Log.xlsx structure:
      // [0]: Empty/Index, [1]: No, [2]: Date, [3]: Ticket Number, [4]: Type, 
      // [5]: Status, [6]: Severity, [7]: Category, [8]: Sub-Category, 
      // [9]: Short Description, [10]: Detail, [11]: Action, 
      // [12]: Resolved Detail, [13]: Assign, [14]: Remark
      return {
        no: cleanValues[1] || '',
        date: cleanValues[2] || '',
        ticketNumber: cleanValues[3] || '',
        type: cleanValues[4] || 'Incident',
        status: cleanValues[5] || 'Open',
        severity: cleanValues[6] || '',
        category: cleanValues[7] || '',
        subCategory: cleanValues[8] || '',
        shortDesc: cleanValues[9] || '',
        detail: cleanValues[10] || '',
        action: cleanValues[11] || '',
        resolvedDetail: cleanValues[12] || '',
        assign: cleanValues[13] || '',
        remark: cleanValues[14] || ''
      };
    }).filter(Boolean); // Remove null entries from skipped rows

    return tickets;

  } catch (error) {
    // Error Handling: Unexpected parsing errors
    console.error('[ticketParser] Failed to parse CSV:', error);
    return [];
  }
};

/**
 * Validate if a string is valid CSV format
 * @param {string} csvText - CSV text to validate
 * @returns {{isValid: boolean, message: string, rowCount: number}} Validation result
 */
export const validateCSV = (csvText) => {
  if (!csvText || typeof csvText !== 'string') {
    return { isValid: false, message: 'CSV text is empty or invalid', rowCount: 0 };
  }

  try {
    const parseResult = Papa.parse(csvText.trim(), {
      header: false,
      skipEmptyLines: true,
    });

    const rows = parseResult.data;

    if (!rows || rows.length === 0) {
      return { isValid: false, message: 'CSV contains no data', rowCount: 0 };
    }

    if (rows.length < 2) {
      return { isValid: false, message: 'CSV must have header and at least one data row', rowCount: rows.length };
    }

    // Check for critical parse errors
    const criticalErrors = parseResult.errors?.filter(e => e.type === 'critical') || [];
    if (criticalErrors.length > 0) {
      return {
        isValid: false,
        message: `CSV parse error: ${criticalErrors[0].message}`,
        rowCount: rows.length
      };
    }

    return {
      isValid: true,
      message: 'CSV is valid',
      rowCount: rows.length - 1 // Exclude header row
    };

  } catch (error) {
    return { isValid: false, message: `Unexpected error: ${error.message}`, rowCount: 0 };
  }
};
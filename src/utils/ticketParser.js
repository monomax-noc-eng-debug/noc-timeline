/**
 * Utility for parsing Ticket Log CSV data
 * Supports 15 columns based on Ticket Log.xlsx structure 
 */
export const parseTicketCSV = (csvText) => {
  if (!csvText) return [];

  // แยกบรรทัดและกรองบรรทัดว่างออก
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  return lines.slice(1).map((line) => {
    // ใช้ Regex เพื่อจัดการกรณีข้อมูลมีเครื่องหมาย comma ภายใน double quotes (เช่น ในช่อง Detail) 
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];

    // ทำความสะอาดข้อมูล (เอาเครื่องหมาย " ออก)
    const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());

    if (cleanValues.length < 5) return null;

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
  }).filter(Boolean);
};
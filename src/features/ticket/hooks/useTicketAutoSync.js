// file: src/features/ticket/hooks/useTicketAutoSync.js
import { useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { parse, isValid, addYears } from 'date-fns';
import { useStore } from '../../../store/useStore';
import { ticketLogService } from '../../../services/ticketLogService';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';

const SHEET_CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

// Utility (Duplicated from Modal - could be extracted to utils)
const parseDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString();
  const cleanStr = dateStr.trim();
  let parsedDate = parse(cleanStr, 'd/M/yy', new Date());
  if (isValid(parsedDate)) {
    if (parsedDate.getFullYear() < 2000) {
      parsedDate = addYears(parsedDate, 100);
      if (parsedDate.getFullYear() < 2000) {
        parsedDate.setFullYear(2000 + parseInt(cleanStr.split(/[-/]/)[2]));
      }
    }
    return parsedDate.toISOString();
  }
  parsedDate = parse(cleanStr, 'd/M/yyyy', new Date());
  if (isValid(parsedDate)) return parsedDate.toISOString();
  const stdDate = new Date(cleanStr);
  if (!isNaN(stdDate.getTime())) return stdDate.toISOString();
  return new Date().toISOString();
};

export const useTicketAutoSync = (currentLogs) => {
  const { ticketConfig, setTicketConfig } = useStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!ticketConfig?.autoSync || !SHEET_CSV_URL || !currentLogs || currentLogs.length === 0) return;

    const checkAndSync = async () => {
      // Prevent concurrent syncs
      if (isSyncingRef.current) return;

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      // 1. Check if already synced today
      if (ticketConfig.lastSync === todayStr) return;

      // 2. Check Time
      const [hours, minutes] = ticketConfig.syncTime.split(':');
      const targetTime = new Date();
      targetTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // If current time is past target time
      if (now >= targetTime) {
        console.log("Adding Auto-Sync to Queue...");
        isSyncingRef.current = true;

        try {
          // Perform Sync
          const response = await fetch(SHEET_CSV_URL);
          if (!response.ok) throw new Error("Failed to fetch CSV");
          const csvText = await response.text();

          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(),
            complete: async (results) => {
              try {
                const sheetData = results.data.map(item => ({
                  ticketNumber: item['Ticket Number'] || item['Ticket No'] || '',
                  shortDesc: item['Short Description & Detail'] || item['Detail'] || item['Description'] || '',
                  status: item['Status'] || 'Open',
                  type: item['Ticket Type'] || 'Incident',
                  assign: item['Assign'] || 'Unassigned',
                  details: item['Detail'] || '',
                  action: item['Ation'] || item['Action'] || '',
                  resolvedDetail: item['Resolved detail'] || '',
                  remark: item['Remark'] || '',
                  date: parseDate(item['Date']),
                  createdAt: parseDate(item['Date'])
                })).filter(item => item.ticketNumber);

                // Diff Logic
                const dataToUpdate = sheetData.filter(newItem => {
                  const oldItem = currentLogs.find(l => l.ticketNumber === newItem.ticketNumber);
                  if (!oldItem) return true; // New Item

                  // Check changes
                  return (
                    oldItem.status !== newItem.status ||
                    oldItem.shortDesc !== newItem.shortDesc ||
                    oldItem.assign !== newItem.assign ||
                    oldItem.action !== newItem.action ||
                    (oldItem.details || '') !== newItem.details ||
                    (oldItem.remark || '') !== newItem.remark ||
                    (oldItem.type || 'Incident') !== newItem.type ||
                    (oldItem.resolvedDetail || '') !== newItem.resolvedDetail
                  );
                });

                if (dataToUpdate.length > 0) {
                  await ticketLogService.importLogsFromSheet(dataToUpdate);
                  queryClient.invalidateQueries({ queryKey: ['ticketLogs'] });
                  toast({
                    title: "Auto Sync Completed",
                    description: `Synced ${dataToUpdate.length} updates from Sheet.`
                  });
                } else {
                  // No updates, but we still mark as synced
                  console.log("Auto Sync: No updates found.");
                }

                // Update Last Sync
                setTicketConfig({ ...ticketConfig, lastSync: todayStr });

              } catch (err) {
                console.error("Auto Sync Parse Error:", err);
              } finally {
                isSyncingRef.current = false;
              }
            },
            error: (err) => {
              console.error("Auto Sync CSV Error:", err);
              isSyncingRef.current = false;
            }
          });

        } catch (error) {
          console.error("Auto Sync Fetch Error:", error);
          isSyncingRef.current = false;
        }
      }
    };

    // Check every minute
    const timer = setInterval(checkAndSync, 60000);
    // Initial check
    checkAndSync();

    return () => clearInterval(timer);
  }, [ticketConfig, currentLogs, queryClient, setTicketConfig, toast]);

};

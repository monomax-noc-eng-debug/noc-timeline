import React, { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format, parse, differenceInMinutes, addHours, addDays, subDays, isSameDay, startOfMinute, isSameMinute, addMinutes } from 'date-fns';
import { useMatches } from '../../../features/matches/hooks/useMatches';
import { matchService } from '../../../services/matchService';
import { MATCH_THRESHOLDS } from '../../../config/constants';
import { useToast } from "@/hooks/use-toast";

export const useTodayMatches = (initialDate = new Date()) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = isSameDay(selectedDate, new Date());

  const nextDate = addDays(selectedDate, 1);
  const dateRange = useMemo(() => ({
    start: format(selectedDate, 'yyyy-MM-dd'),
    end: format(nextDate, 'yyyy-MM-dd')
  }), [selectedDate, nextDate]);

  // Fetch matches for Today + Tomorrow (to capture late night / early morning matches)
  const { matches: fetchedMatches, loading } = useMatches(null, dateRange, isToday);

  const rawMatches = useMemo(() => {
    if (!fetchedMatches.length) return [];

    // Filter logic:
    // 1. All matches from selectedDate
    // 2. Matches from nextDate ONLY if they are early morning (e.g. before 09:00 AM)
    //    This simulates a "Broadcast Day" (06:00 - 06:00 or similar)
    const targetDateStr = format(selectedDate, 'yyyy-MM-dd');
    const nextDateStr = format(nextDate, 'yyyy-MM-dd');

    return fetchedMatches.filter(m => {
      if (m.startDate === targetDateStr) return true;
      if (m.startDate === nextDateStr) {
        // Check hour
        const [hour] = m.startTime.split(':');
        return parseInt(hour, 10) < 9; // Show matches until 09:00 AM next day
      }
      return false;
    });
  }, [fetchedMatches, selectedDate, nextDate]);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // --- Modal & UI States ---
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [isDataPreviewOpen, setIsDataPreviewOpen] = useState(false);

  // --- Filter States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // --- Time Management ---
  const [now, setNow] = useState(startOfMinute(new Date()));
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const notifiedMatches = useRef(new Set());

  useEffect(() => {
    const tick = () => {
      const current = new Date();
      setNow(prev => {
        if (!isSameMinute(prev, current)) {
          return startOfMinute(current);
        }
        return prev;
      });
    };
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Notification Logic ---
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationEnabled(true);
    }
  }, []);

  const requestNotifyPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") setNotificationEnabled(true);
  };

  useEffect(() => {
    if (!notificationEnabled || !isToday || rawMatches.length === 0) return;

    rawMatches.forEach(match => {
      if (!match.startTime || match.hasStartStat || notifiedMatches.current.has(match.id)) return;

      // Use correct date for notification calculation
      const baseDate = match.startDate ? parse(match.startDate, 'yyyy-MM-dd', new Date()) : selectedDate;
      const matchStart = parse(match.startTime, 'HH:mm', baseDate);
      const diffMinutes = differenceInMinutes(matchStart, now);

      if (diffMinutes <= 15 && diffMinutes >= 0) {
        new Notification("Match Alert", {
          body: `${match.teamA} vs ${match.teamB} starts in ${diffMinutes} mins!`,
          icon: '/vite.svg'
        });
        notifiedMatches.current.add(match.id);
      }
    });
  }, [rawMatches, notificationEnabled, now, selectedDate, isToday]);

  // --- Navigation Handlers ---
  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const handleGoToday = () => setSelectedDate(new Date());

  // --- CRUD Handlers ---
  const handleSaveMatch = async (data) => {
    setSaving(true);
    try {
      if (editingMatch) {
        await matchService.updateMatch(editingMatch.id, data);
        // ✅ English Toast
        toast({ title: "Success", description: "Match updated successfully." });
      } else {
        await matchService.createMatch({ ...data, startDate: dateStr });
        // ✅ English Toast
        toast({ title: "Success", description: "Match created successfully." });
      }
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      setIsManualModalOpen(false);
      setEditingMatch(null);
    } catch (error) {
      // ✅ English Toast
      toast({ variant: "destructive", title: "Error", description: error.message || "Something went wrong." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMatch = async () => {
    if (!deleteConfirm.id) return;
    try {
      await matchService.deleteMatch(deleteConfirm.id);
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      // ✅ English Toast
      toast({ title: "Success", description: "Match deleted successfully." });
    } catch (error) {
      // ✅ English Toast
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete match." });
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  // --- Deferred Search for Performance ---
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // --- Process Data (Separated steps) ---

  // 1. Calculate Status & Time (Depends on: rawMatches, now, selectedDate)
  // This is heavier but only runs once per minute (due to 'now') or when data changes.
  const derivedMatches = useMemo(() => {
    return rawMatches.map(match => {
      let statusDisplay = 'Upcoming';
      let countdown = null;
      let isLiveTime = false;
      let isFinished = false;

      if (match.startTime) {
        let matchStart;
        try {
          // ✅ FIX: Use match.startDate to parse time correctly (handles cross-day)
          const baseDate = match.startDate ? parse(match.startDate, 'yyyy-MM-dd', new Date()) : selectedDate;
          matchStart = parse(match.startTime, 'HH:mm', baseDate);
        } catch (e) {
          matchStart = new Date('Invalid');
        }

        if (!isNaN(matchStart)) {
          // Use config for duration (default 2.5 hours)
          const durationMins = (MATCH_THRESHOLDS.MATCH_DURATION_HOURS || 2.5) * 60;
          const matchEnd = addMinutes(matchStart, durationMins);
          const diffMins = differenceInMinutes(matchStart, now);

          if (match.hasEndStat) {
            statusDisplay = 'Finished';
            isFinished = true;
          } else if (match.hasStartStat) {
            statusDisplay = 'Live';
            isLiveTime = true;
          } else {
            if (now >= matchStart && now <= matchEnd) {
              statusDisplay = 'Live (Time)';
              isLiveTime = true;
            } else if (now > matchEnd) {
              statusDisplay = 'Finished (Time)';
              isFinished = true;
            } else {
              if (diffMins <= 60 && diffMins > 0) countdown = `${diffMins}m`;
              else countdown = format(matchStart, 'HH:mm');
            }
          }
        }
      }
      return { ...match, statusDisplay, countdown, isLiveTime, isFinished };
    });
  }, [rawMatches, now, selectedDate]); // ✅ Removed searchQuery/filterType from here

  // 2. Compute Stats (Depends on derivedMatches)
  const stats = useMemo(() => ({
    total: derivedMatches.length,
    live: derivedMatches.filter(m => m.isLiveTime).length,
    finished: derivedMatches.filter(m => m.isFinished).length,
    pending: derivedMatches.filter(m => !m.isLiveTime && !m.isFinished).length
  }), [derivedMatches]);

  // 3. Filter Matches (Depends on derivedMatches, deferredSearchQuery, filterType)
  // This is fast and follows the deferred input.
  const matches = useMemo(() => {
    return derivedMatches.filter(match => {
      const searchLower = deferredSearchQuery.toLowerCase().trim();
      const matchesSearch = !searchLower || (match._searchString || '').includes(searchLower);

      let matchesTab = true;
      if (filterType === 'LIVE') matchesTab = match.isLiveTime;
      else if (filterType === 'FINISHED') matchesTab = match.isFinished;
      else if (filterType === 'UPCOMING') matchesTab = !match.isLiveTime && !match.isFinished;

      return matchesSearch && matchesTab;
    });
  }, [derivedMatches, deferredSearchQuery, filterType]);

  return {
    selectedDate, setSelectedDate, dateStr,
    matches, // Result
    allMatches: rawMatches,
    stats,
    loading,
    searchQuery, setSearchQuery, // Bind input to immediate state

    filterType, setFilterType,
    selectedMatch, setSelectedMatch,
    isManualModalOpen, setIsManualModalOpen,
    editingMatch, setEditingMatch,
    saving,
    deleteConfirm, setDeleteConfirm,
    isDataPreviewOpen, setIsDataPreviewOpen,
    notificationEnabled,
    handlePrevDay, handleNextDay, handleGoToday,
    handleSaveMatch, handleDeleteMatch, requestNotifyPermission
  };
};
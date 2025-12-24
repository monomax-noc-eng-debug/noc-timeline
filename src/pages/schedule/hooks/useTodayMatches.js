import { useState, useEffect, useMemo, useRef } from 'react';
import { format, parse, differenceInMinutes, addHours, addDays, subDays } from 'date-fns';
// ✅ Import Hook ที่เราเพิ่งแก้ไป
import { useMatches } from '../../../features/matches/hooks/useMatches';
import { matchService } from '../../../services/matchService';
import { useToast } from "@/hooks/use-toast";

export const useTodayMatches = (initialDate = new Date()) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // ✅ เรียกใช้ useMatches (Version React Query)
  const { matches, loading } = useMatches(selectedDate);

  const { toast } = useToast();

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [isDataPreviewOpen, setIsDataPreviewOpen] = useState(false);

  // Time State
  const [now, setNow] = useState(new Date());

  // Notification State
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const notifiedMatches = useRef(new Set());

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationEnabled(true);
    }
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const requestNotifyPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") setNotificationEnabled(true);
  };

  // Notification Logic
  useEffect(() => {
    if (!notificationEnabled || matches.length === 0) return;
    matches.forEach(match => {
      if (!match.startTime || match.hasStartStat || notifiedMatches.current.has(match.id)) return;
      const matchDate = parse(match.startTime, 'HH:mm', selectedDate);
      const diffMinutes = differenceInMinutes(matchDate, now);
      if (diffMinutes <= 15 && diffMinutes >= 0) {
        new Notification("Match Alert", {
          body: `${match.teamA} vs ${match.teamB} starts in ${diffMinutes} mins!`
        });
        notifiedMatches.current.add(match.id);
      }
    });
  }, [matches, notificationEnabled, now, selectedDate]);

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const handleGoToday = () => setSelectedDate(new Date());

  const handleSaveMatch = async (data) => {
    setSaving(true);
    try {
      if (editingMatch) {
        await matchService.updateMatch(editingMatch.id, data);
        toast({ title: "Updated", description: "Match updated successfully" });
      } else {
        await matchService.createMatch(data);
        toast({ title: "Created", description: "Match created successfully" });
      }
      setIsManualModalOpen(false);
      setEditingMatch(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMatch = async () => {
    try {
      if (deleteConfirm.id) {
        await matchService.deleteMatch(deleteConfirm.id);
        toast({ title: "Deleted", description: "Match removed" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  // Process Matches Logic
  const processedMatches = useMemo(() => {
    return matches.map(match => {
      let statusDisplay = 'Upcoming';
      let countdown = null;
      let isLiveTime = false;

      if (match.startTime) {
        const matchStart = parse(match.startTime, 'HH:mm', selectedDate);
        const matchEnd = addHours(matchStart, 2);
        const diffMins = differenceInMinutes(matchStart, now);

        if (match.hasEndStat) statusDisplay = 'Finished';
        else if (match.hasStartStat) { statusDisplay = 'Live'; isLiveTime = true; }
        else {
          if (now >= matchStart && now <= matchEnd) { statusDisplay = 'Live (Time)'; isLiveTime = true; }
          else if (now > matchEnd) statusDisplay = 'Finished (Time)';
          else {
            if (diffMins <= 60) countdown = `${diffMins}m`;
            else countdown = format(matchStart, 'HH:mm');
          }
        }
      }
      return { ...match, statusDisplay, countdown, isLiveTime };
    });
  }, [matches, now, selectedDate]);

  const stats = useMemo(() => ({
    total: processedMatches.length,
    live: processedMatches.filter(m => m.isLiveTime).length,
    finished: processedMatches.filter(m => m.statusDisplay.includes('Finished')).length,
    pending: processedMatches.filter(m => m.statusDisplay === 'Upcoming').length
  }), [processedMatches]);

  return {
    selectedDate, setSelectedDate, dateStr,
    matches: processedMatches,
    loading,
    stats,
    searchQuery, setSearchQuery,
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
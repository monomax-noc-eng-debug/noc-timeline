/**
 * useMatchStats - Main orchestration hook for match statistics
 * Composes useMatchDataFetcher and useMatchForm hooks
 * Provides unified API for the UI layer
 */
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { convertToGB, parseAbbrev, formatNumber, formatPercent } from '../../../utils/formatters';
import { getFirebaseErrorMessage } from '../../../utils/firebaseErrorHandler';
import { useStore } from '../../../store/useStore';

// Import sub-hooks
import { useMatchDataFetcher } from './useMatchDataFetcher';
import { useMatchForm } from './useMatchForm';

const COLLECTION_NAME = 'schedules';

/**
 * Main hook for match statistics management
 * @param {Object} matchData - Match metadata
 * @param {() => void} onClose - Callback when modal closes
 * @returns {Object} State and actions for UI
 */
export function useMatchStats(matchData, onClose) {
  // ========================
  // Local UI State
  // ========================
  const [statType, setStatType] = useState('START');
  const [saving, setSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [preview, setPreview] = useState({ show: false, data: [] });
  const [importModal, setImportModal] = useState({ isOpen: false, data: [] });

  // ========================
  // External Dependencies
  // ========================
  const queryClient = useQueryClient();
  const { currentUser } = useStore();
  const { toast } = useToast();

  const showToast = useCallback((message, type = 'success') => {
    if (!message) return;
    toast({ description: message, variant: type });
  }, [toast]);

  // ========================
  // Composed Sub-Hooks
  // ========================

  // Data Fetching Hook
  const {
    loading,
    fetching,
    reporterName,
    currentLoadedId,
    DRAFT_KEY,
    fetchMatchData,
    saveDraft,
    clearDraft
  } = useMatchDataFetcher(matchData, statType, showToast);

  // Form Management Hook
  const {
    form,
    cdnList,
    isMultiCdnMode,
    setForm,
    initializeForm,
    toggleCdnMode,
    handleAddCdn,
    handleRemoveCdn,
    handleUpdateCdnRow,
    handleAutofillSystemHealth,
    handleClearCdnRow,
    handleApplyImport: applyImport,
    handleAutoFixTime,
    validateForm
  } = useMatchForm(matchData, statType, showToast, currentLoadedId);

  // ========================
  // Data Fetching Effect
  // ========================
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchMatchData();
      initializeForm(data);
    };
    loadData();
  }, [fetchMatchData, initializeForm]);

  // ========================
  // Auto-Save Draft Effect
  // ========================
  useEffect(() => {
    if (!loading && !fetching && DRAFT_KEY && currentLoadedId.current === matchData?.id) {
      saveDraft(form, cdnList, isMultiCdnMode);
    }
  }, [form, cdnList, isMultiCdnMode, DRAFT_KEY, loading, fetching, matchData?.id, saveDraft]);

  // ========================
  // Auto-Fix Time on Load
  // ========================
  useEffect(() => {
    if (!fetching && !loading && matchData) {
      handleAutoFixTime();
    }
  }, [fetching, loading, matchData, statType, handleAutoFixTime]);

  // ========================
  // Import Handler Wrapper
  // ========================
  const handleApplyImport = useCallback((importedData) => {
    const success = applyImport(importedData);
    if (success) {
      setImportModal({ isOpen: false, data: [] });
    }
  }, [applyImport]);

  // ========================
  // Save Handler
  // ========================
  const handleSmartSave = useCallback(async (onSuccess) => {
    if (!matchData?.id) return;
    if (!validateForm()) return;

    setSaving(true);
    try {
      const statDocId = statType === 'START' ? 'start_stat' : 'end_stat';
      const payload = {
        ...form,
        cdn: isMultiCdnMode ? 'Multi CDN' : form.cdn,
        cdnDetails: isMultiCdnMode ? cdnList : null,
        updatedAt: serverTimestamp(),
        statType,
        reporter: typeof currentUser === 'object' ? currentUser?.name : currentUser || 'Unknown'
      };

      await setDoc(doc(db, COLLECTION_NAME, matchData.id, 'statistics', statDocId), payload);
      await updateDoc(doc(db, COLLECTION_NAME, matchData.id), {
        [statType === 'START' ? 'hasStartStat' : 'hasEndStat']: true,
        [statType === 'START' ? 'startStats' : 'endStats']: payload,
        liveChannel: form.liveChannel,
        channel: form.liveChannel,
        updatedAt: serverTimestamp()
      });

      clearDraft();

      queryClient.invalidateQueries({ queryKey: ['matches'] });
      showToast("บันทึกข้อมูลเรียบร้อยแล้ว", "success");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
      if (onSuccess) onSuccess();
    } catch (error) {
      showToast(getFirebaseErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }, [matchData?.id, validateForm, statType, form, isMultiCdnMode, cdnList, currentUser, clearDraft, queryClient, showToast]);

  // ========================
  // Preview Handler
  // ========================
  const handlePreview = useCallback(() => {
    const parseReq = (req) => {
      if (!req) return 0;
      if (typeof req === 'object' && req.val !== undefined) {
        const v = parseFloat(req.val || 0);
        const u = (req.unit || '').toLowerCase();
        if (u === 'm') return v * 1000000;
        if (u === 'b') return v * 1000000000;
        if (u === 'k') return v * 1000;
        return v;
      }
      return parseAbbrev(req);
    };

    const formatBytes = (obj) => {
      const v = obj?.val || 0;
      const u = obj?.unit || '';
      return convertToGB(v, u === '' ? 'GB' : u)?.toLocaleString('en-US', { maximumFractionDigits: 4 });
    };

    try {
      const common = {
        no: "1",
        league: matchData?.league || "-",
        title: matchData?.title || matchData?.match || "-",
        time: matchData?.startTime || "-",
        ecsSport: formatPercent(form.ecsSport, 2),
        ecsEnt: formatPercent(form.ecsEntitlement, 2),
        api: formatPercent(form.apiHuawei, 2),
        reqPeak: formatNumber(parseReq(form.requestPeak)),
        viewers: formatNumber(parseReq(form.muxViewerUniq)),
        score: form.muxScore,
        start: form.rangeStart || "-",
        end: form.rangeEnd || "-"
      };

      const data = isMultiCdnMode && cdnList.length > 0
        ? cdnList.map(cdn => [
          common.no, common.league, common.title, common.time, common.ecsSport, common.ecsEnt, common.api,
          formatNumber(parseReq(cdn.requestPeak)),
          cdn.provider || "-", cdn.key || "-",
          formatNumber(parseReq(cdn.reqPeakMin)),
          formatNumber(parseReq(cdn.reqTotal)),
          formatBytes(cdn.bwPeakGbps),
          formatBytes(cdn.bandwidth),
          formatNumber(parseReq(cdn.muxViewerUniq)),
          common.score, common.start, common.end
        ])
        : [[
          common.no, common.league, common.title, common.time, common.ecsSport, common.ecsEnt, common.api,
          formatNumber(parseReq(form.requestPeak)),
          form.cdn || "-", form.liveChannel || "-",
          formatNumber(parseReq(form.reqPeakMin)),
          formatNumber(parseReq(form.reqTotal)),
          formatBytes(form.bwPeakGbps),
          formatBytes(form.bandwidth),
          common.viewers, common.score, common.start, common.end
        ]];

      setPreview({ show: true, data });
    } catch {
      showToast("Preview Error", "error");
    }
  }, [matchData, form, isMultiCdnMode, cdnList, showToast]);

  // ========================
  // Delete Handler
  // ========================
  const requestDelete = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      title: `Reset ${statType}?`,
      message: `Sure to delete?`,
      isDanger: true,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setSaving(true);
        try {
          const statDocId = statType === 'START' ? 'start_stat' : 'end_stat';
          await deleteDoc(doc(db, COLLECTION_NAME, matchData.id, 'statistics', statDocId));
          await updateDoc(doc(db, COLLECTION_NAME, matchData.id), {
            [statType === 'START' ? 'hasStartStat' : 'hasEndStat']: false,
            [statType === 'START' ? 'startStats' : 'endStats']: null,
            updatedAt: serverTimestamp()
          });
          clearDraft();
          queryClient.invalidateQueries({ queryKey: ['matches'] });
          showToast("Reset Success", "success");
          setTimeout(onClose, 1000);
        } catch (error) {
          showToast(getFirebaseErrorMessage(error), "error");
        } finally {
          setSaving(false);
        }
      }
    });
  }, [statType, matchData?.id, clearDraft, queryClient, showToast, onClose]);

  // ========================
  // Return API
  // ========================
  return {
    state: {
      statType,
      loading,
      fetching,
      saving,
      isSuccess,
      form,
      cdnList,
      isMultiCdnMode,
      reporterName,
      confirmModal,
      preview,
      importModal
    },
    actions: {
      setStatType,
      setForm,
      toggleCdnMode,
      handleAddCdn,
      handleRemoveCdn,
      handleUpdateCdnRow,
      handleAutoFixTime: () => handleAutoFixTime(true),
      handleSmartSave,
      requestDelete,
      handlePreview,
      closeConfirm: () => setConfirmModal(p => ({ ...p, isOpen: false })),
      closePreview: () => setPreview(p => ({ ...p, show: false })),
      handleAutofillSystemHealth,
      handleClearCdnRow,
      openImportModal: (data) => setImportModal({ isOpen: true, data }),
      closeImportModal: () => setImportModal({ isOpen: false, data: [] }),
      handleApplyImport
    }
  };
}

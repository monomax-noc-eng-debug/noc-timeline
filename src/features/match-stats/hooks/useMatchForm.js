/**
 * useMatchForm - Hook for managing form state, CDN list, and validation
 * Handles all form-related operations for match statistics
 */
import { useState, useCallback, useEffect } from 'react';
import { INITIAL_FORM_STATE, createEmptyCdnRow, normalizeStat } from './useMatchDataFetcher';

/**
 * Hook for managing match statistics form state
 * @param {Object} matchData - Match metadata
 * @param {string} statType - 'START' or 'END'
 * @param {(msg: string, type: string) => void} showToast - Toast notification function
 * @param {React.MutableRefObject} currentLoadedId - Ref tracking loaded match ID
 * @returns {Object} Form state and actions
 */
export function useMatchForm(matchData, statType, showToast, currentLoadedId) {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [cdnList, setCdnList] = useState([]);
  const [isMultiCdnMode, setIsMultiCdnMode] = useState(false);

  /**
   * Initialize form with fetched data
   */
  const initializeForm = useCallback((data) => {
    setForm(data.form);
    setCdnList(data.cdnList);
    setIsMultiCdnMode(data.isMultiCdnMode);
  }, []);

  // Auto-Sync Channel Source -> Config Key for first CDN row
  useEffect(() => {
    if (isMultiCdnMode && form.liveChannel && cdnList.length > 0) {
      if (!cdnList[0].key || cdnList[0].key.trim() === '') {
        setCdnList(prev => prev.map((item, index) =>
          index === 0 ? { ...item, key: form.liveChannel } : item
        ));
      }
    }
  }, [form.liveChannel, isMultiCdnMode, cdnList]);

  // ========================
  // CDN Mode & List Actions
  // ========================

  const toggleCdnMode = useCallback(() => {
    setIsMultiCdnMode(prev => {
      const newMode = !prev;
      if (newMode && cdnList.length === 0) {
        setCdnList([createEmptyCdnRow(form.liveChannel)]);
      }
      setForm(p => ({ ...p, cdn: newMode ? 'Multi CDN' : 'AWS' }));
      return newMode;
    });
  }, [cdnList.length, form.liveChannel]);

  const handleAddCdn = useCallback(() => {
    setCdnList(prev => [...prev, {
      id: Date.now(),
      provider: 'Select Provider',
      key: '',
      reqPeakMin: { val: '', unit: '' },
      reqTotal: { val: '', unit: '' },
      bwPeakGbps: { val: '', unit: '' },
      bandwidth: { val: '', unit: '' },
      ecsSport: '', ecsEntitlement: '', apiHuawei: '',
      requestPeak: { val: '', unit: '' },
      muxViewerUniq: { val: '', unit: '' },
      muxScore: ''
    }]);
  }, []);

  const handleRemoveCdn = useCallback((id) => {
    if (cdnList.length > 1) {
      setCdnList(prev => prev.filter(item => item.id !== id));
    }
  }, [cdnList.length]);

  const handleUpdateCdnRow = useCallback((id, field, value) => {
    setCdnList(prev => prev.map(item => {
      if (item.id !== id) return item;

      // Handle nested object fields (like requestPeak, bandwidth, etc.)
      if (typeof item[field] === 'object' && item[field] !== null) {
        return { ...item, [field]: { ...item[field], ...value } };
      }
      return { ...item, [field]: value };
    }));
  }, []);

  // ========================
  // Autofill & Clear Actions
  // ========================

  const handleAutofillSystemHealth = useCallback(() => {
    if (cdnList.length < 2) return;

    const master = cdnList[0];
    setCdnList(prev => prev.map((item, idx) => {
      if (idx === 0) return item;
      return {
        ...item,
        ecsSport: master.ecsSport,
        ecsEntitlement: master.ecsEntitlement,
        apiHuawei: master.apiHuawei,
      };
    }));
    showToast("Autofilled System Health values", "success");
  }, [cdnList, showToast]);

  const handleClearCdnRow = useCallback((id) => {
    setCdnList(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        ecsSport: '', ecsEntitlement: '', apiHuawei: '',
        requestPeak: { val: '', unit: '' },
        reqPeakMin: { val: '', unit: '' },
        reqTotal: { val: '', unit: '' },
        bwPeakGbps: { val: '', unit: '' },
        bandwidth: { val: '', unit: '' },
        muxViewerUniq: { val: '', unit: '' },
        muxScore: ''
      };
    }));
    showToast("Cleared row data", "default");
  }, [showToast]);

  // ========================
  // Import Data Handler
  // ========================

  const handleApplyImport = useCallback((importedData) => {
    if (!importedData || !Array.isArray(importedData) || importedData.length === 0) return;

    const newCdnList = importedData.map(d => ({
      id: Date.now() + Math.random(),
      provider: d.provider || 'Select Provider',
      key: d.key || '',
      ecsSport: d.ecsSport || '',
      ecsEntitlement: d.ecsEntitlement || '',
      apiHuawei: d.apiHuawei || '',
      requestPeak: normalizeStat(d.requestPeak),
      reqPeakMin: normalizeStat(d.reqPeakMin),
      reqTotal: normalizeStat(d.reqTotal),
      bwPeakGbps: normalizeStat(d.bwPeakGbps),
      bandwidth: normalizeStat(d.bandwidth),
      muxViewerUniq: normalizeStat(d.muxViewerUniq),
      muxScore: d.muxScore || ''
    }));

    if (newCdnList.length > 0) {
      setCdnList(newCdnList);
      setIsMultiCdnMode(true);
      showToast(`Imported ${newCdnList.length} rows successfully`, "success");
      return true;
    }
    return false;
  }, [showToast]);

  // ========================
  // Time Range Auto-Fix
  // ========================

  const handleAutoFixTime = useCallback((isManual = false) => {
    let rawTime = matchData?.startTime || matchData?.start_time || matchData?.time;
    if (!rawTime) {
      if (isManual) showToast("Time not found", "error");
      return;
    }

    try {
      const parseTime = (str) => {
        let lowerStr = String(str).toLowerCase().trim().replace('.', ':');
        let cleanStr = lowerStr.replace(/[a-z]/g, '').trim();
        let [hStr, mStr] = cleanStr.split(':');
        let h = parseInt(hStr, 10);
        let m = parseInt(mStr || '0', 10);
        if (isNaN(h)) return null;
        if (lowerStr.includes('pm') && h < 12) h += 12;
        return { h, m };
      };

      const timeObj = parseTime(rawTime);
      if (!timeObj) return;

      const addTime = (h, m, add) => {
        let total = h * 60 + m + add;
        total = ((total % 1440) + 1440) % 1440;
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      };

      const start = addTime(timeObj.h, timeObj.m, 0);
      const end = addTime(timeObj.h, timeObj.m, statType === 'START' ? 15 : 120);

      if (currentLoadedId?.current === matchData?.id) {
        setForm(prev => {
          // If auto-run (not manual) and values exist, do not overwrite
          if (!isManual && prev.rangeStart && prev.rangeEnd) return prev;

          return { ...prev, rangeStart: start, rangeEnd: end };
        });
      }
    } catch { /* ignore */ }
  }, [matchData, statType, showToast, currentLoadedId]);

  // ========================
  // Form Validation
  // ========================

  const validateForm = useCallback(() => {
    const errors = [];

    if (!form.rangeStart || !form.rangeEnd) {
      errors.push("กรุณาระบุเวลา Start/End");
    }
    if (!form.liveChannel) {
      errors.push("กรุณาระบุ Channel");
    }

    const isStatEmpty = (stat) => {
      const val = typeof stat === 'object' ? stat?.val : stat;
      return val === '' || val === null || val === undefined;
    };

    if (isMultiCdnMode) {
      if (cdnList.length === 0) {
        errors.push("At least one CDN provider is required");
      }
      cdnList.forEach((cdn, idx) => {
        const p = `CDN #${idx + 1}`;
        if (!cdn.provider || cdn.provider === 'Select Provider') {
          errors.push(`${p}: Provider required`);
        }
        if (isStatEmpty(cdn.ecsSport)) {
          errors.push(`${p}: ECS Sport required`);
        }
        if (isStatEmpty(cdn.muxScore)) {
          errors.push(`${p}: Score required`);
        }
      });
    } else {
      if (isStatEmpty(form.ecsSport)) {
        errors.push("ECS Sport required");
      }
      if (isStatEmpty(form.muxScore)) {
        errors.push("Smoothness Score required");
      }
    }

    if (errors.length > 0) {
      showToast(errors[0], "error");
      return false;
    }
    return true;
  }, [form, cdnList, isMultiCdnMode, showToast]);

  return {
    // State
    form,
    cdnList,
    isMultiCdnMode,

    // Setters
    setForm,
    setCdnList,
    setIsMultiCdnMode,

    // Actions
    initializeForm,
    toggleCdnMode,
    handleAddCdn,
    handleRemoveCdn,
    handleUpdateCdnRow,
    handleAutofillSystemHealth,
    handleClearCdnRow,
    handleApplyImport,
    handleAutoFixTime,
    validateForm
  };
}

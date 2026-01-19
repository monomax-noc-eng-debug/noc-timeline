/**
 * useMatchDataFetcher - Hook for fetching match statistics from Firestore
 * Handles loading states, draft recovery, and data normalization
 */
import { useState, useCallback, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { getFirebaseErrorMessage } from '../../../utils/firebaseErrorHandler';

const COLLECTION_NAME = 'schedules';

/**
 * Normalize stat value to { val, unit } format
 */
export const normalizeStat = (value, defaultUnit = '') => {
  if (!value && value !== 0) return { val: '', unit: defaultUnit };
  if (typeof value === 'object' && value.val !== undefined) return value;

  const str = String(value).toLowerCase();
  let val = parseFloat(str);
  let unit = defaultUnit;

  if (str.endsWith('m')) { unit = 'm'; }
  else if (str.endsWith('k')) { unit = 'k'; }
  else if (str.endsWith('gb')) { unit = 'GB'; }
  else if (str.endsWith('tb')) { unit = 'TB'; }
  else if (str.endsWith('mb')) { unit = 'MB'; }

  return { val: isNaN(val) ? '' : val, unit };
};

export const INITIAL_FORM_STATE = {
  ecsSport: '', ecsEntitlement: '', apiHuawei: '',
  requestPeak: { val: '', unit: '' },
  muxViewerUniq: { val: '', unit: '' },
  muxScore: '',
  rangeStart: '', rangeEnd: '',
  reqPeakMin: { val: '', unit: '' },
  reqTotal: { val: '', unit: '' },
  bwPeakGbps: { val: '', unit: '' },
  bandwidth: { val: '', unit: '' },
  cdn: 'AWS', liveChannel: '',
};

/**
 * Create empty CDN row template
 */
export const createEmptyCdnRow = (liveChannel = '') => ({
  id: Date.now(),
  provider: 'Select Provider',
  key: liveChannel,
  reqPeakMin: { val: '', unit: '' },
  reqTotal: { val: '', unit: '' },
  bwPeakGbps: { val: '', unit: '' },
  bandwidth: { val: '', unit: '' },
  ecsSport: '', ecsEntitlement: '', apiHuawei: '',
  requestPeak: { val: '', unit: '' },
  muxViewerUniq: { val: '', unit: '' },
  muxScore: ''
});

/**
 * Hook for fetching match data and statistics from Firestore
 * @param {Object} matchData - Match metadata
 * @param {string} statType - 'START' or 'END'
 * @param {(msg: string, type: string) => void} showToast - Toast notification function
 * @returns {Object} Fetcher state and actions
 */
export function useMatchDataFetcher(matchData, statType, showToast) {
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [reporterName, setReporterName] = useState('Unknown');

  // Track loaded ID to prevent saving wrong data
  const currentLoadedId = useRef(null);

  const DRAFT_KEY = matchData?.id ? `draft_stats_${matchData.id}_${statType}` : null;

  /**
   * Fetch match data and statistics from Firestore
   * @returns {Promise<{form, cdnList, isMultiCdnMode}>} Loaded data
   */
  const fetchMatchData = useCallback(async () => {
    if (!matchData?.id) {
      return { form: INITIAL_FORM_STATE, cdnList: [], isMultiCdnMode: false };
    }

    setFetching(true);
    currentLoadedId.current = null;

    try {
      const matchRef = doc(db, COLLECTION_NAME, matchData.id);
      const statDocId = statType === 'START' ? 'start_stat' : 'end_stat';
      const statRef = doc(db, COLLECTION_NAME, matchData.id, 'statistics', statDocId);

      const [matchSnap, statSnap] = await Promise.all([getDoc(matchRef), getDoc(statRef)]);
      const baseInfo = matchSnap.exists() ? matchSnap.data() : {};

      let loadedForm = { ...INITIAL_FORM_STATE };
      let loadedCdnList = [];
      let loadedIsMulti = false;

      if (statSnap.exists()) {
        const data = statSnap.data();
        loadedForm = {
          ...loadedForm,
          ...data,
          liveChannel: data.liveChannel || baseInfo.liveChannel || baseInfo.channel || matchData.channel || '',
          requestPeak: normalizeStat(data.requestPeak, ''),
          muxViewerUniq: normalizeStat(data.muxViewerUniq, ''),
          reqPeakMin: normalizeStat(data.reqPeakMin, ''),
          reqTotal: normalizeStat(data.reqTotal, ''),
          bwPeakGbps: normalizeStat(data.bwPeakGbps, ''),
          bandwidth: normalizeStat(data.bandwidth, '')
        };

        if (data.cdnDetails?.length > 0) {
          loadedCdnList = data.cdnDetails.map(cdn => ({
            ...cdn,
            requestPeak: normalizeStat(cdn.requestPeak, ''),
            reqPeakMin: normalizeStat(cdn.reqPeakMin, ''),
            reqTotal: normalizeStat(cdn.reqTotal, ''),
            bwPeakGbps: normalizeStat(cdn.bwPeakGbps, ''),
            bandwidth: normalizeStat(cdn.bandwidth, ''),
            muxViewerUniq: normalizeStat(cdn.muxViewerUniq, '')
          }));
          loadedIsMulti = true;
        } else {
          loadedIsMulti = Boolean(data.cdn === 'Multi CDN');
        }
        setReporterName(data.reporter || 'Unknown');
      } else {
        const defaultCdn = baseInfo.cdn || 'AWS';
        loadedIsMulti = defaultCdn === 'Multi CDN';
        loadedForm.cdn = defaultCdn;
        loadedForm.liveChannel = baseInfo.liveChannel || baseInfo.channel || matchData.channel || '';

        if (loadedIsMulti) {
          loadedCdnList = [createEmptyCdnRow(loadedForm.liveChannel)];
        } else {
          loadedCdnList = [];
        }
        setReporterName('Unknown');
      }

      // Check for saved draft in localStorage
      if (DRAFT_KEY) {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          try {
            const draft = JSON.parse(savedDraft);
            if (draft.matchId === matchData.id) {
              if (draft.form) loadedForm = { ...loadedForm, ...draft.form };
              if (draft.cdnList) loadedCdnList = draft.cdnList;
              if (draft.isMultiCdnMode !== undefined) loadedIsMulti = draft.isMultiCdnMode;
            }
          } catch (e) {
            console.error("Draft load error", e);
          }
        }
      }

      currentLoadedId.current = matchData.id;

      return { form: loadedForm, cdnList: loadedCdnList, isMultiCdnMode: loadedIsMulti };

    } catch (error) {
      console.error("Fetch Error:", error);
      showToast(getFirebaseErrorMessage(error), "error");
      return { form: INITIAL_FORM_STATE, cdnList: [], isMultiCdnMode: false };
    } finally {
      setFetching(false);
      setLoading(false);
    }
  }, [matchData, statType, showToast, DRAFT_KEY]);

  /**
   * Save draft to localStorage
   */
  const saveDraft = useCallback((form, cdnList, isMultiCdnMode) => {
    if (!DRAFT_KEY || currentLoadedId.current !== matchData?.id) return;

    const draftData = {
      matchId: matchData.id,
      form,
      cdnList,
      isMultiCdnMode,
      timestamp: Date.now()
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
  }, [DRAFT_KEY, matchData?.id]);

  /**
   * Clear draft from localStorage
   */
  const clearDraft = useCallback(() => {
    if (DRAFT_KEY) {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [DRAFT_KEY]);

  return {
    // State
    loading,
    fetching,
    reporterName,
    currentLoadedId,
    DRAFT_KEY,

    // Actions
    fetchMatchData,
    saveDraft,
    clearDraft,
    setLoading,
    setFetching,
    setReporterName
  };
}

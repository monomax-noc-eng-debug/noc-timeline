// src/features/match-stats/hooks/useMatchStats.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { convertToGB, parseAbbrev, formatNumber, formatPercent } from '../../../utils/formatters';

const COLLECTION_NAME = 'schedules';

const INITIAL_FORM_STATE = {
  ecsSport: '', ecsEntitlement: '', apiHuawei: '', requestPeak: '',
  muxViewerUniq: '', muxScore: '', rangeStart: '', rangeEnd: '',
  reqPeakMin: '', reqTotal: { val: '', unit: 'k' },
  bwPeakGbps: { val: '', unit: 'GB' }, bandwidth: { val: '', unit: 'GB' },
  cdn: 'AWS', liveChannel: '',
};

export function useMatchStats(matchData, onClose) {
  // --- State ---
  const [statType, setStatType] = useState('START'); // ใช้ตัวนี้เช็ค Phase
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [cdnList, setCdnList] = useState([]);
  const [isMultiCdnMode, setIsMultiCdnMode] = useState(false);
  const [reporterName, setReporterName] = useState('Unknown');

  // UI State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [preview, setPreview] = useState({ show: false, data: [] });

  const { toast } = useToast();
  const showToast = useCallback((message, type = 'success') => {
    if (!message) return;
    toast({ description: message, variant: type });
  }, [toast]);

  // --- 1. Fetch Data ---
  const fetchMatchData = useCallback(async () => {
    if (!matchData?.id) return;
    setFetching(true);
    try {
      const matchRef = doc(db, COLLECTION_NAME, matchData.id);
      const statDocId = statType === 'START' ? 'start_stat' : 'end_stat';
      const statRef = doc(db, COLLECTION_NAME, matchData.id, 'statistics', statDocId);

      const [matchSnap, statSnap] = await Promise.all([getDoc(matchRef), getDoc(statRef)]);
      const baseInfo = matchSnap.exists() ? matchSnap.data() : {};

      if (statSnap.exists()) {
        const data = statSnap.data();
        setForm(prev => ({
          ...prev, ...data,
          liveChannel: data.liveChannel || baseInfo.liveChannel || baseInfo.channel || matchData.channel || '',
          reqTotal: data.reqTotal || { val: '', unit: 'k' },
          bwPeakGbps: data.bwPeakGbps || { val: '', unit: 'GB' },
          bandwidth: data.bandwidth || { val: '', unit: 'GB' }
        }));

        if (data.cdnDetails?.length > 0) {
          setCdnList(data.cdnDetails);
          setIsMultiCdnMode(true);
        } else {
          setIsMultiCdnMode(Boolean(data.cdn === 'Multi CDN'));
          setCdnList([]);
        }
        setReporterName(data.reporter || 'Unknown');
      } else {
        const defaultCdn = baseInfo.cdn || 'AWS';
        const isMulti = defaultCdn === 'Multi CDN';
        setForm({
          ...INITIAL_FORM_STATE,
          liveChannel: baseInfo.liveChannel || baseInfo.channel || matchData.channel || '',
          cdn: defaultCdn
        });
        setIsMultiCdnMode(isMulti);
        if (isMulti) {
          setCdnList([{
            id: Date.now(), provider: 'Select Provider', key: '',
            reqPeakMin: '', reqTotal: { val: '', unit: 'k' },
            bwPeakGbps: { val: '', unit: 'GB' }, bandwidth: { val: '', unit: 'GB' },
            ecsSport: '', ecsEntitlement: '', apiHuawei: '', requestPeak: '', muxViewerUniq: '', muxScore: ''
          }]);
        } else {
          setCdnList([]);
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      showToast("โหลดข้อมูลไม่สำเร็จ", "error");
    } finally {
      setFetching(false);
      setLoading(false);
    }
  }, [matchData, statType, showToast]);

  useEffect(() => { fetchMatchData(); }, [fetchMatchData]);

  // --- Logic Handlers ---
  const toggleCdnMode = () => {
    setIsMultiCdnMode(prev => !prev);
    if (!isMultiCdnMode && cdnList.length === 0) {
      setCdnList([{
        id: Date.now(), provider: 'AWS', key: '', reqPeakMin: '',
        reqTotal: { val: '', unit: 'k' }, bwPeakGbps: { val: '', unit: 'GB' }, bandwidth: { val: '', unit: 'GB' },
        ecsSport: '', ecsEntitlement: '', apiHuawei: '', requestPeak: '', muxViewerUniq: '', muxScore: ''
      }]);
    }
    setForm(prev => ({ ...prev, cdn: !isMultiCdnMode ? 'Multi CDN' : 'AWS' }));
  };

  const handleAddCdn = () => setCdnList(prev => [...prev, {
    id: Date.now(), provider: 'Select Provider', key: '', reqPeakMin: '', reqTotal: { val: '', unit: 'k' },
    bwPeakGbps: { val: '', unit: 'GB' }, bandwidth: { val: '', unit: 'GB' },
    ecsSport: '', ecsEntitlement: '', apiHuawei: '', requestPeak: '', muxViewerUniq: '', muxScore: ''
  }]);

  const handleRemoveCdn = (id) => cdnList.length > 1 && setCdnList(prev => prev.filter(item => item.id !== id));
  const handleUpdateCdnRow = (id, field, value) => setCdnList(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));

  // --- ✅ 3. Auto Fix Time (Corrected Logic) ---
  const handleAutoFixTime = () => {
    let rawTime = matchData?.startTime || matchData?.start_time || matchData?.time;
    if (!rawTime) { showToast("ไม่พบข้อมูลเวลาแข่ง", "error"); return; }

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
      if (!timeObj) { showToast("รูปแบบเวลาไม่ถูกต้อง", "error"); return; }

      const addTime = (baseH, baseM, minsToAdd) => {
        let totalMinutes = baseH * 60 + baseM + minsToAdd;
        totalMinutes = ((totalMinutes % 1440) + 1440) % 1440; // รองรับข้ามวัน
        let newH = Math.floor(totalMinutes / 60);
        let newM = totalMinutes % 60;
        return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
      };

      let newStart, newEnd;

      if (statType === 'START') {
        // ✅ Phase 1: Start = เวลาเตะ, End = เวลาเตะ + 15 นาที
        newStart = addTime(timeObj.h, timeObj.m, 0);
        newEnd = addTime(timeObj.h, timeObj.m, 15);
      } else {
        // ✅ Phase 2: Start = เวลาเตะ, End = เวลาเตะ + 2 ชั่วโมง
        newStart = addTime(timeObj.h, timeObj.m, 0);
        newEnd = addTime(timeObj.h, timeObj.m, 120);
      }

      setForm(prev => ({ ...prev, rangeStart: newStart, rangeEnd: newEnd }));
      showToast(`คำนวณเวลา (${statType}): ${newStart} - ${newEnd}`, "success");

    } catch (err) {
      showToast("เกิดข้อผิดพลาดในการคำนวณ", "error");
    }
  };

  // --- Smart Save ---
  const handleSmartSave = async (onSuccess) => {
    if (!matchData?.id) return;
    setSaving(true);
    try {
      const statDocId = statType === 'START' ? 'start_stat' : 'end_stat';
      const matchRef = doc(db, COLLECTION_NAME, matchData.id);
      const statRef = doc(db, COLLECTION_NAME, matchData.id, 'statistics', statDocId);

      const payload = {
        ...form,
        cdn: isMultiCdnMode ? 'Multi CDN' : form.cdn,
        cdnDetails: isMultiCdnMode ? cdnList : null,
        updatedAt: serverTimestamp(),
        statType,
        bwPeakGbps: form.bwPeakGbps || { val: '', unit: 'GB' },
        bandwidth: form.bandwidth || { val: '', unit: 'GB' },
        reqTotal: form.reqTotal || { val: '', unit: 'k' }
      };

      await setDoc(statRef, payload);
      await updateDoc(matchRef, {
        [statType === 'START' ? 'hasStartStat' : 'hasEndStat']: true,
        [statType === 'START' ? 'startStats' : 'endStats']: payload,
        updatedAt: serverTimestamp()
      });

      showToast("บันทึกข้อมูลเรียบร้อยแล้ว", "success");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
      if (onSuccess) onSuccess();
    } catch (error) {
      showToast("บันทึกข้อมูลล้มเหลว", "error");
    } finally {
      setSaving(false);
    }
  };

  // --- Delete Logic ---
  const requestDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: `Reset ${statType} Stats?`,
      message: `Are you sure you want to delete ${statType} data?`,
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
          showToast("รีเซ็ตเรียบร้อย", "success");
          setTimeout(onClose, 1000);
        } catch (e) {
          showToast("ลบข้อมูลไม่สำเร็จ", "error");
        } finally {
          setSaving(false);
        }
      }
    });
  };

  // --- Preview Logic ---
  const handlePreview = () => {
    const parseReq = (req) => {
      if (!req) return 0;
      if (typeof req === 'object' && req.val !== undefined) {
        const v = parseFloat(req.val || 0);
        const u = (req.unit || 'k').toLowerCase();
        if (u === 'm') return v * 1000000;
        if (u === 'b') return v * 1000000000;
        return v * 1000;
      }
      return parseAbbrev(req);
    };

    try {
      const common = {
        no: "1", league: matchData?.league || "-", title: matchData?.title || matchData?.match || "-",
        time: matchData?.startTime || "-", ecsSport: formatPercent(form.ecsSport, 2), ecsEnt: formatPercent(form.ecsEntitlement, 2),
        api: formatPercent(form.apiHuawei, 2), reqPeak: formatNumber(parseAbbrev(form.requestPeak)),
        viewers: formatNumber(parseAbbrev(form.muxViewerUniq)), score: form.muxScore,
        start: form.rangeStart || "-", end: form.rangeEnd || "-"
      };
      const data = isMultiCdnMode && cdnList.length > 0
        ? cdnList.map(cdn => [
          common.no, common.league, common.title, common.time, common.ecsSport, common.ecsEnt, common.api, common.reqPeak,
          cdn.provider || "-", cdn.key || "-", formatNumber(parseAbbrev(cdn.reqPeakMin)), formatNumber(parseReq(cdn.reqTotal)),
          convertToGB(cdn.bwPeakGbps?.val || cdn.bwPeakGbps, cdn.bwPeakGbps?.unit || 'GB')?.toLocaleString('en-US', { maximumFractionDigits: 4 }),
          convertToGB(cdn.bandwidth?.val || cdn.bandwidth, cdn.bandwidth?.unit || 'GB')?.toLocaleString('en-US', { maximumFractionDigits: 4 }),
          common.viewers, common.score, common.start, common.end
        ])
        : [[
          common.no, common.league, common.title, common.time, common.ecsSport, common.ecsEnt, common.api, common.reqPeak,
          form.cdn || "-", form.liveChannel || "-", formatNumber(parseAbbrev(form.reqPeakMin)), formatNumber(parseReq(form.reqTotal)),
          convertToGB(form.bwPeakGbps?.val || form.bwPeakGbps, form.bwPeakGbps?.unit || 'GB')?.toLocaleString('en-US', { maximumFractionDigits: 4 }),
          convertToGB(form.bandwidth?.val || form.bandwidth, form.bandwidth?.unit || 'GB')?.toLocaleString('en-US', { maximumFractionDigits: 4 }),
          common.viewers, common.score, common.start, common.end
        ]];
      setPreview({ show: true, data });
    } catch (e) { showToast("Preview Error", "error"); }
  };

  return {
    state: { statType, loading, fetching, saving, isSuccess, form, cdnList, isMultiCdnMode, reporterName, confirmModal, preview },
    actions: { setStatType, setForm, toggleCdnMode, handleAddCdn, handleRemoveCdn, handleUpdateCdnRow, handleAutoFixTime, handleSmartSave, requestDelete, handlePreview, closeConfirm: () => setConfirmModal(p => ({ ...p, isOpen: false })), closePreview: () => setPreview(p => ({ ...p, show: false })) }
  };
}
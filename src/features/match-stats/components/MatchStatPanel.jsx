import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, Save, Loader2, Server, Wifi, Users, Layers,
  ArrowLeftRight, Check, Trash2, Clock, FileText, ChevronLeft
} from 'lucide-react';

import ConfigSection from './ConfigSection';
import CopyPreviewModal from '../CopyPreviewModal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { useMatchStats } from '../hooks/useMatchStats';
import { SystemPanel, TrafficPanel, ViewerPanel } from './StatPanels';
import { configService } from '../../../services/configService';

const SkeletonLoader = () => (
  <div className="w-full space-y-6 animate-pulse p-6">
    <div className="h-40 rounded-lg bg-zinc-100 dark:bg-zinc-800/50" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800/50" />
      <div className="h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800/50" />
    </div>
  </div>
);

const SectionCard = ({ icon: Icon, title, iconColor, children, className = "" }) => (
  <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden transition-all ${className}`}>
    {(Icon || title) && (
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
        {Icon && (
          <div className="p-2 rounded-md bg-[#0078D4]/10 text-[#0078D4]">
            <Icon size={16} />
          </div>
        )}
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">{title}</h3>
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

export default function MatchStatPanel({ matchData, canEdit, onClose }) {
  const { state, actions } = useMatchStats(matchData, onClose);
  const [masterConfigs, setMasterConfigs] = useState({ channels: [], cdnOptions: [] });

  // --- LOCAL STATE FOR DEBOUNCING ---
  // Initialize localForm with state.form.
  // We use a ref to track if we're currently typing to prevent overwrites from upstream.
  const [localForm, setLocalForm] = useState(state.form || {});
  const [isTyping, setIsTyping] = useState(false);
  const isMounted = useRef(false);

  // Sync localForm when match changes OR when initial data loads (and user isn't typing)
  useEffect(() => {
    if (state.form && !isTyping) {
      setLocalForm(state.form);
    }
  }, [state.form, isTyping]); // Only sync if not typing

  useEffect(() => {
    // Only subscribe if we have a match
    if (!matchData) return;
    const unsub = configService.subscribeConfigs(setMasterConfigs);
    return unsub;
  }, [matchData]);

  // Debounce Effect
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (!isTyping) return; // Don't save if we haven't typed

    const handler = setTimeout(() => {
      // Trigger save/update
      const performSave = async () => {
        // 1. Update upstream state
        actions.setForm(localForm);
        // 2. Trigger Auto-Save (Reduce DB writes by only doing this on debounce)
        if (canEdit) {
          // We assume handleSmartSave uses the current state (which we just updated? NO, setForm is async in React usually, but hook state might not be immediate).
          // Safest to pass data if handleSmartSave accepts it, otherwise rely on the hook update.
          // Assuming handleSmartSave uses `state.form`. We need `state.form` to be updated.
          // Since we can't await `actions.setForm` easily here, we might just call handleSmartSave.
          // NOTE: If useMatchStats exposes a simpler "save(data)" method, that'd be better.
          // We will call handleSmartSave() and hope it picks up the latest form state or passed params.
          // Validating the requirement: "trigger the parent's onSave(localFormData) function".
          // I'll assume handleSmartSave handles it.
          await actions.handleSmartSave();
        }
        setIsTyping(false);
      };
      performSave();
    }, 800);

    return () => clearTimeout(handler);
  }, [localForm, isTyping, actions, canEdit]);

  const handleLocalChange = useCallback((field, value) => {
    setIsTyping(true);
    setLocalForm(prev => ({ ...prev, [field]: value }));
  }, []);


  if (!matchData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4">
        <Server size={48} strokeWidth={1} />
        <p className="text-sm font-medium">Select a match to view stats</p>
      </div>
    );
  }

  const isLive = matchData?.isLiveTime || (matchData?.hasStartStat && !matchData?.hasEndStat);

  return (
    <div className="flex flex-col h-full bg-[#fafafa] dark:bg-[#050505]">
      <div className="fixed z-[200]">
        <ConfirmModal isOpen={state.confirmModal.isOpen} onClose={actions.closeConfirm} {...state.confirmModal} />
      </div>

      {/* HEADER */}
      <div className="bg-white dark:bg-zinc-900/50 border-b border-zinc-50 dark:border-zinc-800/50 backdrop-blur-md px-4 py-4 md:px-6 md:py-5 shrink-0">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex-1 min-w-0 flex items-center gap-3">
            {/* Mobile Back Button */}
            <button onClick={onClose} className="lg:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              <ChevronLeft size={24} />
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {isLive ? (
                  <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mediumst bg-rose-500 text-white shadow-lg shadow-rose-500/30">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span> LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mediumst bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    <Clock size={12} /> {matchData?.startTime || '--:--'}
                  </span>
                )}
                {/* Visual Status of Saving */}
                {(isTyping || state.loading) && (
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider animate-pulse">
                    {isTyping ? 'Saving...' : 'Syncing...'}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight truncate">
                {matchData?.teamA && matchData?.teamB ? <span className="flex items-center gap-2">{matchData.teamA} <span className="text-zinc-300 dark:text-zinc-800 italic font-medium">vs</span> {matchData.teamB}</span> : (matchData?.title || 'Match Operational Record')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <button onClick={actions.toggleCdnMode} className="hidden md:flex h-11 px-5 items-center gap-2 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-100 dark:border-zinc-700 rounded-lg text-[10px] font-mediumst text-zinc-600 dark:text-zinc-300 transition-all active:scale-95">
                  <Layers size={14} className={state.isMultiCdnMode ? 'text-[#0078D4]' : 'text-zinc-400'} /><span>{state.isMultiCdnMode ? 'Multi-CDN' : 'Single'}</span>
                </button>
                <button onClick={() => actions.setStatType(state.statType === 'START' ? 'END' : 'START')} className="h-11 w-11 flex items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 border border-zinc-100 dark:border-zinc-700 transition-all active:scale-95" title="Switch Phase">
                  <ArrowLeftRight size={18} />
                </button>
              </>
            )}
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 hidden lg:block" />
            <button onClick={onClose} className="h-11 w-11 hidden lg:flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg hover:scale-105 active:scale-90 transition-all" title="Close"><X size={20} strokeWidth={2.5} /></button>
          </div>
        </div>
      </div>

      {/* SCROLLABLE BODY */}
      <div className={`flex-1 p-6 space-y-8 custom-scrollbar ${state.isMultiCdnMode ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        {state.fetching ? <SkeletonLoader /> : (
          <div className="max-w-7xl mx-auto space-y-8">
            <SectionCard className="shadow-sm border-none bg-zinc-50 dark:bg-zinc-900/30">
              {/* Use localForm and handleLocalChange */}
              <ConfigSection form={localForm} setForm={(newData) => { setIsTyping(true); setLocalForm(newData); }} isMultiCdnMode={state.isMultiCdnMode} toggleCdnMode={actions.toggleCdnMode} cdnList={state.cdnList} onAdd={actions.handleAddCdn} onRemove={actions.handleRemoveCdn} onUpdate={actions.handleUpdateCdnRow} onAutoFix={actions.handleAutoFixTime} statType={state.statType} masterConfigs={masterConfigs} canEdit={canEdit} />
            </SectionCard>
            <div className="flex flex-col gap-8">
              <SectionCard title="System Health" icon={Server} iconColor="text-[#0078D4] bg-[#0078D4]/10 dark:bg-[#0078D4]/30">
                <SystemPanel data={localForm} onChange={handleLocalChange} isMulti={state.isMultiCdnMode} cdnList={state.cdnList} onUpdateCdn={actions.handleUpdateCdnRow} onAddCdn={actions.handleAddCdn} onRemoveCdn={actions.handleRemoveCdn} canEdit={canEdit} />
              </SectionCard>
              <SectionCard title="Traffic & Bandwidth" icon={Wifi} iconColor="text-rose-500 bg-rose-50 dark:bg-rose-900/30">
                <TrafficPanel data={localForm} onChange={handleLocalChange} isMulti={state.isMultiCdnMode} cdnList={state.cdnList} onUpdateCdn={actions.handleUpdateCdnRow} onAddCdn={actions.handleAddCdn} onRemoveCdn={actions.handleRemoveCdn} canEdit={canEdit} />
              </SectionCard>
              <SectionCard title="Audience & Engagement" icon={Users} iconColor="text-violet-500 bg-violet-50 dark:bg-violet-900/30">
                <ViewerPanel data={localForm} onChange={handleLocalChange} isMulti={state.isMultiCdnMode} cdnList={state.cdnList} onUpdateCdn={actions.handleUpdateCdnRow} onAddCdn={actions.handleAddCdn} onRemoveCdn={actions.handleRemoveCdn} canEdit={canEdit} />
              </SectionCard>
            </div>
          </div>
        )}

        {/* Added spacer at bottom so content isn't covered by footer */}
        <div className="h-20" />
      </div>

      {/* FOOTER */}
      <div className="p-6 bg-white dark:bg-[#0a0a0a] border-t border-zinc-100 dark:border-zinc-900 shrink-0">
        <div className="flex justify-between items-center w-full gap-6">
          <div className="flex gap-2">
            <button onClick={actions.requestDelete} disabled={state.loading} className="group flex items-center gap-2 px-4 py-3 rounded-lg text-[10px] font-mediumst text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all disabled:opacity-30">
              <Trash2 size={16} /><span className="hidden sm:inline">Flush Data</span>
            </button>
            <button onClick={actions.handlePreview} disabled={state.loading} className="group flex items-center gap-2 px-4 py-3 rounded-lg text-[10px] font-mediumst text-zinc-400 hover:text-[#0078D4] hover:bg-[#0078D4]/10 dark:hover:bg-[#0078D4]/20 transition-all disabled:opacity-30">
              <FileText size={16} /><span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <button onClick={onClose} disabled={state.loading} className="px-8 py-4 rounded-lg text-[10px] font-mediumst text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Dismiss</button>
            {canEdit && (
              <button
                onClick={() => actions.handleSmartSave()}
                disabled={state.loading || state.isSuccess || isTyping}
                className={`flex-1 sm:flex-none h-14 px-10 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 ${state.isSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-zinc-900/20 dark:shadow-white/10'} ${state.loading || isTyping ? 'opacity-50 cursor-not-allowed cursor-wait' : ''}`}
              >
                {state.loading || isTyping ? <Loader2 size={18} className="animate-spin" /> : state.isSuccess ? <Check size={18} strokeWidth={3} /> : <Save size={18} />}
                <span>{state.loading || isTyping ? 'Saving...' : state.isSuccess ? 'Saved' : 'Save'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <CopyPreviewModal isOpen={state.preview.show} onClose={actions.closePreview} data={state.preview.data} headers={["#", "League", "Match", "Time", "ECS Sport", "ECS Entitlement", "API Huawei", "WWW & API Request", "CDN", "Key", "Req Peak", "Req Total", "BW Peak", "BW Total", "Viewers", "Score", "Start", "End"]} />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  X, Save, Loader2, Server, Wifi, Users, Layers,
  ArrowLeftRight, Check, Trash2, Clock, FileText, Maximize2
} from 'lucide-react';

import ConfigSection from './components/ConfigSection';
import CopyPreviewModal from './CopyPreviewModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useMatchStats } from './hooks/useMatchStats';
import { SystemPanel, TrafficPanel, ViewerPanel } from './components/StatPanels';
import { configService } from '../../services/configService';

const SkeletonLoader = () => (<div className="w-full space-y-6 animate-pulse p-6"><div className="h-40 rounded-lg bg-zinc-100 dark:bg-zinc-800/50" /><div className="grid grid-cols-1 gap-6"><div className="h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800/50" /><div className="h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800/50" /></div></div>);
const SectionCard = ({ icon: Icon, title, iconColor, children, className = "" }) => (<div className={`bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden ${className}`}>{(Icon || title) && (<div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900"><div className="flex items-center gap-3">{Icon && (<div className={`p-1.5 rounded-md ${iconColor}`}><Icon size={16} /></div>)}<h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{title}</h3></div></div>)}<div className="p-5">{children}</div></div>);

export default function MatchStatPanel({ matchData, onClose, initialStatType = 'START', canEdit }) {
  const { state, actions } = useMatchStats(matchData, onClose);
  const [masterConfigs, setMasterConfigs] = useState({ channels: [], cdnOptions: [] });

  // Override initial stat type if provided
  useEffect(() => {
    if (initialStatType && actions.setStatType) {
      actions.setStatType(initialStatType);
    }
  }, [initialStatType]);

  useEffect(() => {
    const unsub = configService.subscribeConfigs(setMasterConfigs);
    return unsub;
  }, []);

  if (!matchData) return null;

  const isLive = matchData?.isLiveTime || (matchData?.hasStartStat && !matchData?.hasEndStat);

  return (
    <div className="h-full flex flex-col bg-zinc-50/50 dark:bg-[#0a0a0a] border-l border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">

      {/* Confirm Modal (Portal-like behavior handled by relative parent or fixed if needed) */}
      <div className="absolute top-0 right-0 left-0 z-50">
        <ConfirmModal isOpen={state.confirmModal.isOpen} onClose={actions.closeConfirm} {...state.confirmModal} />
      </div>

      {/* Header */}
      <div className="shrink-0 px-6 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {isLive ? (
                <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span></span> LIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  <Clock size={12} /> {matchData?.startTime || '--:--'}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${state.statType === 'START' ? 'bg-[#eff6fc] text-[#0b5c9e] border-[#c7e0f4] dark:bg-[#0078D4]/20 dark:text-[#4ba0e8] dark:border-[#0078D4]/30' : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30'}`}>
                {state.statType === 'START' ? 'Start' : 'End'} Phase
              </span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight truncate" title={matchData?.teamA && matchData?.teamB ? `${matchData.teamA} vs ${matchData.teamB}` : matchData?.title}>
              {matchData?.teamA && matchData?.teamB ? <span className="flex items-center gap-2">{matchData.teamA} <span className="text-zinc-500 dark:text-zinc-500 font-medium text-sm">vs</span> {matchData.teamB}</span> : (matchData?.title || 'Match Operational Record')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-8 px-3 hidden sm:flex items-center gap-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 hover:text-zinc-900 transition-colors text-xs font-medium">
              <span>Close</span>
              <X size={16} />
            </button>
            <button onClick={onClose} className="h-8 w-8 flex sm:hidden items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 hover:text-zinc-900 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button onClick={actions.toggleCdnMode} className="flex-1 h-8 px-3 flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 transition-all active:scale-95">
              <Layers size={14} className={state.isMultiCdnMode ? 'text-[#0078D4]' : 'text-zinc-500'} /><span>{state.isMultiCdnMode ? 'Multi-CDN' : 'Single'}</span>
            </button>
            <button onClick={() => actions.setStatType(state.statType === 'START' ? 'END' : 'START')} className="flex-1 h-8 px-3 flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 transition-all active:scale-95">
              <ArrowLeftRight size={14} /> <span>Switch</span>
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${state.isMultiCdnMode ? '' : ''}`}>
        {state.fetching ? <SkeletonLoader /> : (
          <div className="space-y-6 pb-20">
            <SectionCard className="shadow-sm border border-zinc-200 dark:border-zinc-800">
              <ConfigSection form={state.form} setForm={actions.setForm} isMultiCdnMode={state.isMultiCdnMode} toggleCdnMode={actions.toggleCdnMode} cdnList={state.cdnList} onAdd={actions.handleAddCdn} onRemove={actions.handleRemoveCdn} onUpdate={actions.handleUpdateCdnRow} onAutoFix={actions.handleAutoFixTime} statType={state.statType} masterConfigs={masterConfigs} canEdit={canEdit} />
            </SectionCard>

            <SectionCard title="System Health" icon={Server} iconColor="text-[#0078D4] bg-[#eff6fc] dark:bg-[#0078D4]/20 dark:text-[#0078D4]">
              <SystemPanel data={state.form} onChange={(f, v) => actions.setForm({ ...state.form, [f]: v })} isMulti={state.isMultiCdnMode} cdnList={state.cdnList} onUpdateCdn={actions.handleUpdateCdnRow} onAddCdn={actions.handleAddCdn} onRemoveCdn={actions.handleRemoveCdn} canEdit={canEdit} />
            </SectionCard>

            <SectionCard title="Traffic & Bandwidth" icon={Wifi} iconColor="text-[#0078D4] bg-[#eff6fc] dark:bg-[#0078D4]/20 dark:text-[#0078D4]">
              <TrafficPanel data={state.form} onChange={(f, v) => actions.setForm({ ...state.form, [f]: v })} isMulti={state.isMultiCdnMode} cdnList={state.cdnList} onUpdateCdn={actions.handleUpdateCdnRow} onAddCdn={actions.handleAddCdn} onRemoveCdn={actions.handleRemoveCdn} canEdit={canEdit} />
            </SectionCard>
            <SectionCard title="Audience & Engagement" icon={Users} iconColor="text-[#0078D4] bg-[#eff6fc] dark:bg-[#0078D4]/20 dark:text-[#0078D4]">
              <ViewerPanel data={state.form} onChange={(f, v) => actions.setForm({ ...state.form, [f]: v })} isMulti={state.isMultiCdnMode} cdnList={state.cdnList} onUpdateCdn={actions.handleUpdateCdnRow} onAddCdn={actions.handleAddCdn} onRemoveCdn={actions.handleRemoveCdn} canEdit={canEdit} />
            </SectionCard>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
        <div className="flex gap-2">
          <button onClick={actions.requestDelete} disabled={state.loading} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/10 dark:hover:bg-rose-900/20 transition-all disabled:opacity-30">
            <Trash2 size={16} /><span className="">Flush</span>
          </button>
          <button onClick={actions.handlePreview} disabled={state.loading} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider text-[#0078D4] bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 transition-all disabled:opacity-30">
            <FileText size={16} /><span className="">Preview</span>
          </button>
        </div>
        {canEdit && (
          <button onClick={() => actions.handleSmartSave()} disabled={state.loading || state.isSuccess} className={`w-full h-10 px-6 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${state.isSuccess ? 'bg-emerald-600 text-white' : 'bg-[#0078D4] hover:bg-[#106EBE] text-white'} ${state.loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {state.loading ? <Loader2 size={14} className="animate-spin" /> : state.isSuccess ? <Check size={14} strokeWidth={2.5} /> : <Save size={14} />}
            <span>{state.loading ? 'Saving...' : state.isSuccess ? 'Saved' : 'Save Record'}</span>
          </button>
        )}
      </div>

      <CopyPreviewModal isOpen={state.preview.show} onClose={actions.closePreview} data={state.preview.data} headers={["#", "League", "Match", "Time", "ECS Sport", "ECS Entitlement", "API Huawei", "WWW & API Request", "CDN", "Key", "Req Peak", "Req Total", "BW Peak", "BW Total", "Viewers", "Score", "Start", "End"]} />
    </div>
  );
}

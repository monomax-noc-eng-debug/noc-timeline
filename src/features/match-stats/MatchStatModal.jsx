import React, { useState } from 'react';
import {
  X, Save, Loader2, Server, Wifi, Users, Gauge, Clock, Layers,
  ArrowLeftRight, Check, FileText, Trash2, Radio, Timer // ✅ เปลี่ยน ArrowRight -> ArrowLeftRight, Eye -> FileText
} from 'lucide-react';
import ConfigSection from './components/ConfigSection';
import CopyPreviewModal from './CopyPreviewModal';

import ConfirmModal from '../../components/ui/ConfirmModal';
import { useMatchStats } from './hooks/useMatchStats';
import { SystemPanel, TrafficPanel, ViewerPanel } from './components/StatPanels';

// Tab Button
const TabButton = ({ label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all
      ${active
        ? 'text-black dark:text-white'
        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
      }
    `}
  >
    <Icon size={16} strokeWidth={active ? 2.5 : 2} />
    <span>{label}</span>
    {active && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-t-full" />
    )}
  </button>
);

const SkeletonLoader = () => (
  <div className="max-w-4xl mx-auto space-y-6 animate-pulse pt-4">
    <div className="h-32 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
    <div className="grid grid-cols-2 gap-4">
      <div className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      <div className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
    </div>
  </div>
);

export default function MatchStatModal({ isOpen, onClose, matchData }) {
  const [activeSection, setActiveSection] = useState('system');
  const { state, actions } = useMatchStats(matchData, onClose);

  if (!isOpen) return null;

  const sections = [
    { id: 'system', label: 'System Health', icon: Server },
    { id: 'traffic', label: 'Traffic & BW', icon: Wifi },
    { id: 'viewer', label: 'Viewers', icon: Users },
    { id: 'config', label: 'Configuration', icon: Gauge },
  ];

  const isLive = matchData?.isLiveTime || (matchData?.hasStartStat && !matchData?.hasEndStat);
  const isSoon = matchData?.countdown && matchData?.countdown.toString().includes('m');

  return (
    <>
      <div className="fixed z-[200]">
        <ConfirmModal
          isOpen={state.confirmModal.isOpen}
          onClose={actions.closeConfirm}
          {...state.confirmModal}
        />
      </div>

      <CopyPreviewModal
        isOpen={state.preview.show}
        onClose={actions.closePreview}
        data={state.preview.data}
        headers={["#", "League", "Match", "Time", "ECS Sport", "ECS Ent", "API Huawei", "WWW & API Peak/Min", "CDN", "Key", "Req Peak", "Req Total", "BW Peak", "BW Total", "Viewers", "Score", "Start", "End"]}
      />

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={state.loading ? undefined : onClose}>
        <div className="bg-white dark:bg-[#09090b] w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

          {/* HEADER */}
          <div className="shrink-0 bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800">
            <div className="px-6 pt-5 pb-1 flex items-start justify-between gap-4">

              {/* Info */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  {isLive ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      LIVE NOW
                    </span>
                  ) : isSoon ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30">
                      <Timer size={12} /> Starts in {matchData?.countdown}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                      <Clock size={12} /> {matchData?.startTime || '--:--'}
                    </span>
                  )}

                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${state.statType === 'START'
                      ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30'
                      : 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30'
                    }`}>
                    {state.statType} Phase
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white tracking-tight truncate max-w-2xl">
                  {matchData?.teamA && matchData?.teamB ? `${matchData.teamA} vs ${matchData.teamB}` : (matchData?.title || matchData?.match || 'Match Stats')}
                </h2>
              </div>

              {/* Actions with New Icons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={actions.toggleCdnMode}
                  className="hidden md:flex h-9 px-3 items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Layers size={14} className={state.isMultiCdnMode ? 'text-blue-500' : 'text-zinc-400'} />
                  {state.isMultiCdnMode ? 'Multi-CDN' : 'Single CDN'}
                </button>

                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                {/* ✅ Switch Phase Icon */}
                <button onClick={() => actions.setStatType(state.statType === 'START' ? 'END' : 'START')} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors" title="Switch Phase">
                  <ArrowLeftRight size={18} />
                </button>

                {/* ✅ Preview Icon */}
                <button onClick={actions.handlePreview} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors" title="Preview Data">
                  <FileText size={18} />
                </button>

                <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors" title="Close">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="px-6 flex gap-2 overflow-x-auto no-scrollbar">
              {sections.map((section) => (
                <TabButton
                  key={section.id}
                  label={section.label}
                  icon={section.icon}
                  active={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                />
              ))}
            </div>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-[#0c0c0e] p-6 md:p-8 custom-scrollbar">
            {state.fetching ? <SkeletonLoader /> : (
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6 shadow-sm">
                  {activeSection === 'system' && <SystemPanel data={state.form} onChange={(f, v) => actions.setForm({ ...state.form, [f]: v })} isMulti={state.isMultiCdnMode} cdnList={state.cdnList} onUpdateCdn={actions.handleUpdateCdnRow} onRemoveCdn={actions.handleRemoveCdn} onAddCdn={actions.handleAddCdn} />}
                  {activeSection === 'traffic' && <TrafficPanel data={state.form} onChange={(f, v) => actions.setForm({ ...state.form, [f]: v })} isMulti={state.isMultiCdnMode} cdnList={state.cdnList} onUpdateCdn={actions.handleUpdateCdnRow} onRemoveCdn={actions.handleRemoveCdn} onAddCdn={actions.handleAddCdn} />}
                  {activeSection === 'viewer' && <ViewerPanel data={state.form} onChange={(f, v) => actions.setForm({ ...state.form, [f]: v })} isMulti={state.isMultiCdnMode} cdnList={state.cdnList} onUpdateCdn={actions.handleUpdateCdnRow} onRemoveCdn={actions.handleRemoveCdn} onAddCdn={actions.handleAddCdn} />}
                  {/* ✅ ส่ง prop onAutoFix ไปให้ ConfigSection */}
                  {activeSection === 'config' && <ConfigSection form={state.form} setForm={actions.setForm} isMultiCdnMode={state.isMultiCdnMode} toggleCdnMode={actions.toggleCdnMode} cdnList={state.cdnList} onAdd={actions.handleAddCdn} onRemove={actions.handleRemoveCdn} onUpdate={actions.handleUpdateCdnRow} onAutoFix={actions.handleAutoFixTime} statType={state.statType} />}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="shrink-0 p-4 bg-white dark:bg-[#09090b] border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center gap-4 z-10">
            <button
              onClick={actions.requestDelete}
              disabled={state.loading}
              className="px-4 py-2.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} /> <span className="hidden sm:inline">Reset Data</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={state.loading}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => actions.handleSmartSave()}
                disabled={state.loading || state.isSuccess}
                className={`
                   px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide flex items-center gap-2 shadow-lg transition-all transform active:scale-95
                   ${state.isSuccess
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
                  }
                 `}
              >
                {state.loading ? <Loader2 size={16} className="animate-spin" /> : state.isSuccess ? <Check size={16} /> : <Save size={16} />}
                {state.loading ? 'Saving...' : state.isSuccess ? 'Saved' : 'Save Changes'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
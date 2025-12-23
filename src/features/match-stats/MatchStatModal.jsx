import React, { useState } from 'react';
import { X, Save, Loader2, Server, Wifi, Users, Gauge, Clock, Layers, ArrowRight, Check, Eye, Trash2 } from 'lucide-react';
import ConfigSection from './components/ConfigSection';
import CopyPreviewModal from './CopyPreviewModal';
import Toast from '../../components/ui/Toast';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useMatchStats } from './hooks/useMatchStats';
import { SystemPanel, TrafficPanel, ViewerPanel } from './components/StatPanels';

const TabButton = ({ label, icon: Icon, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${active ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105' : 'bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'}`}>
    <Icon size={14} className={active ? 'animate-pulse' : ''} /><span>{label}</span>
  </button>
);

const SkeletonLoader = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-pulse p-2">
    <div className="flex items-center gap-6 mb-8"><div className="w-16 h-16 rounded-2xl bg-zinc-200 dark:bg-zinc-800/50" /><div className="flex-1 space-y-3"><div className="h-8 w-2/3 bg-zinc-200 dark:bg-zinc-800/50 rounded-xl" /><div className="flex gap-2"><div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg" /><div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg" /></div></div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-3xl bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" /></div>)}</div>
  </div>
);

export default function MatchStatModal({ isOpen, onClose, matchData }) {
  const [activeSection, setActiveSection] = useState('system');

  const { state, actions } = useMatchStats(matchData, onClose);

  if (!isOpen) return null;

  const sections = [
    { id: 'system', label: 'System', icon: Server },
    { id: 'traffic', label: 'Traffic', icon: Wifi },
    { id: 'viewer', label: 'Viewer', icon: Users },
    { id: 'config', label: 'Config', icon: Gauge },
  ];

  return (
    <>
      {/* ⚠️ Layer 1: Overlays (วางไว้นอกสุด เพื่อให้อยู่บนสุด) */}

      {/* 1. Confirm Modal (Z-Index สูงกว่า Main Modal) */}
      <div className="fixed z-[200]">
        <ConfirmModal
          isOpen={state.confirmModal.isOpen}
          onClose={actions.closeConfirm}
          {...state.confirmModal}
        />
      </div>

      {/* 2. Toast (Z-Index สูงสุด) */}
      {state.toast.show && (
        <div className="fixed bottom-4 right-4 z-[300]">
          <Toast
            message={state.toast.message}
            type={state.toast.type}
            onClose={actions.closeToast}
          />
        </div>
      )}

      {/* 3. Preview Modal */}
      <CopyPreviewModal
        isOpen={state.preview.show}
        onClose={actions.closePreview}
        data={state.preview.data}
        headers={["#", "League", "Match", "Time", "ECS Sport", "ECS Ent", "API Huawei", "WWW & API Peak/Min", "CDN", "Key", "Req Peak", "Req Total", "BW Peak", "BW Total", "Viewers", "Score", "Start", "End"]}
      />

      {/* ⚠️ Layer 2: Main Modal (Z-Index 100) */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={state.loading ? undefined : onClose}>
        <div className="bg-zinc-50 dark:bg-[#0a0a0a] w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="relative shrink-0 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${state.statType === 'START' ? 'from-orange-500 via-orange-600 to-red-600' : 'from-emerald-500 via-emerald-600 to-teal-600'}`} />
            <div className="relative p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 border-white/20 bg-white/10 backdrop-blur-md shadow-lg"><span className="text-2xl font-black leading-none">{state.reporterName.charAt(0).toUpperCase()}</span></div>
                    <div className="absolute -bottom-2 -right-2 bg-white text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-md">{state.statType}</div>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none drop-shadow-sm mb-2 max-w-md truncate">{matchData?.teamA && matchData?.teamB ? `${matchData.teamA} vs ${matchData.teamB}` : (matchData?.title || matchData?.match || 'Match Stats')}</h2>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/20 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider"><Clock size={10} /> {matchData?.startTime || matchData?.start_time || matchData?.time || '--:--'}</span>
                      <button onClick={actions.toggleCdnMode} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-wider ${state.isMultiCdnMode ? 'bg-white text-black border-white shadow-lg' : 'bg-black/20 text-white/80 border-white/10 hover:bg-black/30'}`}><Layers size={10} /> {state.isMultiCdnMode ? 'Multi-CDN' : 'Single CDN'}</button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => actions.setStatType(state.statType === 'START' ? 'END' : 'START')} className="flex-1 md:flex-none h-10 px-4 flex items-center justify-center gap-2 bg-black/20 hover:bg-black/30 border border-white/10 rounded-xl text-[10px] font-black uppercase backdrop-blur-sm transition-all text-white"><ArrowRight size={14} /> Switch Phase</button>
                  <button onClick={actions.handlePreview} className="flex-1 md:flex-none h-10 px-4 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl text-[10px] font-black uppercase backdrop-blur-sm transition-all text-white"><Eye size={14} /> Preview</button>
                  <button onClick={onClose} className="h-10 w-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"><X size={18} /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="shrink-0 p-2 bg-white dark:bg-[#0a0a0a] border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-[1.25rem] overflow-x-auto custom-scrollbar gap-1">
              {sections.map((section) => <TabButton key={section.id} id={section.id} label={section.label} icon={section.icon} active={activeSection === section.id} onClick={() => setActiveSection(section.id)} />)}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white dark:bg-[#0a0a0a]">
            {state.fetching ? <SkeletonLoader /> : (
              <div className="max-w-4xl mx-auto pb-10">
                {activeSection === 'system' && <SystemPanel data={state.form} onChange={(f, v) => actions.setForm({ ...state.form, [f]: v })} isMulti={state.isMultiCdnMode} cdnList={state.cdnList} onUpdateCdn={actions.handleUpdateCdnRow} onRemoveCdn={actions.handleRemoveCdn} onAddCdn={actions.handleAddCdn} />}
                {activeSection === 'traffic' && <TrafficPanel data={state.form} onChange={(f, v) => actions.setForm({ ...state.form, [f]: v })} isMulti={state.isMultiCdnMode} cdnList={state.cdnList} onUpdateCdn={actions.handleUpdateCdnRow} onRemoveCdn={actions.handleRemoveCdn} onAddCdn={actions.handleAddCdn} />}
                {activeSection === 'viewer' && <ViewerPanel data={state.form} onChange={(f, v) => actions.setForm({ ...state.form, [f]: v })} isMulti={state.isMultiCdnMode} cdnList={state.cdnList} onUpdateCdn={actions.handleUpdateCdnRow} onRemoveCdn={actions.handleRemoveCdn} onAddCdn={actions.handleAddCdn} />}
                {activeSection === 'config' && <ConfigSection form={state.form} setForm={actions.setForm} isMultiCdnMode={state.isMultiCdnMode} toggleCdnMode={actions.toggleCdnMode} cdnList={state.cdnList} onAdd={actions.handleAddCdn} onRemove={actions.handleRemoveCdn} onUpdate={actions.handleUpdateCdnRow} onAutoFix={actions.handleAutoFixTime} />}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border-t border-zinc-200 dark:border-zinc-800 flex flex-col-reverse md:flex-row gap-4 shrink-0 z-10 relative">
            <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-[#0a0a0a] to-transparent pointer-events-none" />
            <button onClick={actions.requestDelete} disabled={state.loading} className="px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"><Trash2 size={18} /> <span className="hidden md:inline">Reset Phase</span></button>
            <button onClick={onClose} disabled={state.loading} className="px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Discard</button>
            <button onClick={() => actions.handleSmartSave()} disabled={state.loading || state.isSuccess} className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all ${state.isSuccess ? 'bg-green-500 text-white' : state.statType === 'START' ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white' : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'}`}>
              {state.loading ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : state.isSuccess ? <><Check size={20} /> Success!</> : <><Save size={20} /> Save Statistics</>}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
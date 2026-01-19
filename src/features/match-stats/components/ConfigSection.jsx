import React, { useState } from 'react';
import {
  Gauge, Globe, Layers, Plus, Trash2, Settings,
  MonitorPlay, ArrowRight, Wand2, Clock, Check
} from 'lucide-react';
import { TimeInput } from '../../../components/forms/TimeInput';

export default function ConfigSection({
  form, setForm,
  isMultiCdnMode, toggleCdnMode,
  cdnList, onAdd, onRemove, onUpdate,
  onAutoFix,
  statType,
  masterConfigs = { channels: [], cdnOptions: [] },
  canEdit = true
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isActiveCdn = (id) => form.cdn === id;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <Gauge size={14} className="text-orange-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Configuration</span>
        </div>
      </div>

      <div className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800">
        <div className="flex-1 p-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full">
            <Clock size={14} className="text-zinc-400 shrink-0" />
            <div className="flex items-center gap-2 w-full">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-zinc-400 uppercase leading-none mb-0.5">Start</span>
                <TimeInput
                  value={form.rangeStart}
                  onChange={e => setForm({ ...form, rangeStart: e.target.value })}
                  disabled={!canEdit}
                  showIcon={false}
                  className="bg-transparent text-xs font-bold text-zinc-900 dark:text-zinc-100 p-0 border-none w-[70px] h-6 disabled:opacity-50"
                  placeholder="00:00"
                />
              </div>
              <ArrowRight size={12} className="text-zinc-300 dark:text-zinc-700" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-zinc-400 uppercase leading-none mb-0.5">
                  End {statType === 'START' ? '(+15m)' : '(+2h)'}
                </span>
                <TimeInput
                  value={form.rangeEnd}
                  onChange={e => setForm({ ...form, rangeEnd: e.target.value })}
                  disabled={!canEdit}
                  showIcon={false}
                  className="bg-transparent text-xs font-bold text-zinc-900 dark:text-zinc-100 p-0 border-none w-[70px] h-6 disabled:opacity-50"
                  placeholder="00:00"
                />
              </div>
            </div>
          </div>
          {onAutoFix && canEdit && (
            <button onClick={onAutoFix} title="Auto Calculate Time" className="shrink-0 p-1.5 rounded-md text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
              <Wand2 size={12} />
            </button>
          )}
        </div>

        <div className="flex-[1.5] p-2 flex items-center gap-3 relative">
          <MonitorPlay size={14} className="text-zinc-400 shrink-0" />
          <div className="w-full relative">
            <span className="text-[9px] font-bold text-zinc-400 uppercase leading-none block mb-0.5">Channel Source</span>
            <input
              type="text"
              value={form.liveChannel}
              onChange={e => setForm({ ...form, liveChannel: e.target.value })}
              onFocus={() => canEdit && setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              disabled={!canEdit}
              placeholder="Select Channel..."
              className="w-full bg-transparent text-xs font-bold text-zinc-900 dark:text-zinc-100 p-0 border-none focus:ring-0 h-4 leading-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 disabled:opacity-50"
            />
            {isFocused && (
              <div className="absolute top-full left-0 right-0 mt-3 max-h-40 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 py-1">
                {masterConfigs.channels.length > 0 ? (
                  masterConfigs.channels
                    .filter(opt => opt.toLowerCase().includes((form.liveChannel || '').toLowerCase()))
                    .map(opt => (
                      <div
                        key={opt}
                        onMouseDown={() => setForm({ ...form, liveChannel: opt })}
                        className="px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-between group/item"
                      >
                        {opt}
                        {form.liveChannel === opt && <Check size={12} className="text-orange-500" />}
                      </div>
                    ))
                ) : (
                  <div className="px-3 py-2 text-xs text-zinc-400 italic">No channels found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-2 border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide pl-1">
            CDN Distribution
          </label>
          <div className="flex bg-zinc-200 dark:bg-zinc-800 rounded-lg p-0.5">
            <button onClick={() => canEdit && isMultiCdnMode && toggleCdnMode()} disabled={!canEdit} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 ${!isMultiCdnMode ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'} ${!canEdit && 'cursor-not-allowed opacity-50'}`}>Single</button>
            <button onClick={() => canEdit && !isMultiCdnMode && toggleCdnMode()} disabled={!canEdit} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 ${isMultiCdnMode ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'} ${!canEdit && 'cursor-not-allowed opacity-50'}`}>Multi-CDN</button>
          </div>
        </div>

        {!isMultiCdnMode ? (
          <div className="flex flex-wrap gap-2">
            {masterConfigs.cdnOptions.filter(cdn => cdn.id !== 'Multi CDN').map(cdn => (
              <button
                key={cdn.id}
                onClick={() => setForm({ ...form, cdn: cdn.id })}
                className={`group relative px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-2 ${isActiveCdn(cdn.id) ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-md transform scale-[1.02]' : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-white'}`}
              >
                <Globe size={12} className={isActiveCdn(cdn.id) ? "opacity-100" : "opacity-50 group-hover:opacity-100"} />
                {cdn.label}
                {isActiveCdn(cdn.id) && <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-white dark:border-zinc-900" />}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {cdnList.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-1.5 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm group">
                <div className="w-[120px] shrink-0 border-r border-zinc-100 dark:border-zinc-700 pr-2">
                  <select
                    value={item.provider}
                    onChange={(e) => onUpdate(item.id, 'provider', e.target.value)}
                    className="w-full bg-transparent text-[11px] font-bold text-zinc-700 dark:text-zinc-200 outline-none cursor-pointer py-1"
                  >
                    <option value="Select Provider">Select Provider</option>
                    {masterConfigs.cdnOptions.filter(cdn => cdn.id !== 'Multi CDN').map(cdn => <option key={cdn.id} value={cdn.id}>{cdn.label}</option>)}
                  </select>
                </div>
                <div className="flex-1 relative">
                  <Settings size={10} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" />
                  <input type="text" placeholder="Enter Config Key..." value={item.key || ''} onChange={(e) => onUpdate(item.id, 'key', e.target.value)} className="w-full pl-4 bg-transparent text-[11px] font-medium text-zinc-600 dark:text-zinc-300 placeholder:text-zinc-300 outline-none border-none p-0 focus:ring-0" />
                </div>
                {cdnList.length > 1 && (
                  <button onClick={() => onRemove(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-red-500 transition-all">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={onAdd} className="w-full py-1.5 mt-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-900/50 text-[10px] font-bold text-zinc-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all flex items-center justify-center gap-1">
              <Plus size={10} /> Add Provider Layer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
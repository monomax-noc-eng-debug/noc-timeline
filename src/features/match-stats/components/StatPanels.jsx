import React from 'react';
import { Plus, Trash2, Server, Wifi, Users, Wand2, Eraser } from 'lucide-react';
import StatCard from '../../../components/forms/StatCard';

/**
 * Outlook-style CDN Header - Clean, professional design
 */
const CdnHeader = ({ item, index, icon, onRemove, onClear, isRemovable }) => {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-[#0078D4] text-white flex items-center justify-center">
          <Icon size={14} />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{item.provider || `Provider ${index + 1}`}</h4>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500">{item.key || 'Universal Node'}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {onClear && (
          <button onClick={onClear} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-all" title="Clear Data">
            <Eraser size={14} />
          </button>
        )}
        {isRemovable && (
          <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Outlook-style Add Button
 */
const AddBtn = ({ onClick }) => (
  <button onClick={onClick} className="w-full py-2.5 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md flex justify-center items-center gap-2 text-zinc-500 font-medium text-xs hover:text-[#0078D4] hover:border-[#0078D4] hover:bg-[#0078D4]/5 dark:hover:bg-[#0078D4]/10 transition-all active:scale-[0.99]">
    <Plus size={14} /> Add Provider Layer
  </button>
);

const updateObj = (currentVal, newVal) => ({ ...currentVal, val: newVal });
const updateUnit = (currentVal, newUnit) => ({ ...currentVal, unit: newUnit });
const GRID_CLASS = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3";

/**
 * System Health Panel - Outlook Style
 */
export const SystemPanel = ({ data, onChange, isMulti, cdnList, onUpdateCdn, onRemoveCdn, onAddCdn, onAutofill, onClearRow, canEdit = true }) => {
  const fields = (item, handleUpdate) => (
    <div className={GRID_CLASS}>
      <StatCard label="ECS Sport" value={item.ecsSport} onChange={v => handleUpdate('ecsSport', v)} type="percentage" max={100} thresholdType="higher-is-bad" thresholds={{ warning: 80, critical: 95 }} readOnly={!canEdit} />
      <StatCard label="ECS Entitlement" value={item.ecsEntitlement} onChange={v => handleUpdate('ecsEntitlement', v)} type="percentage" max={100} thresholdType="higher-is-bad" thresholds={{ warning: 80, critical: 95 }} readOnly={!canEdit} />
      <StatCard label="API Huawei" value={item.apiHuawei} onChange={v => handleUpdate('apiHuawei', v)} type="percentage" max={100} thresholdType="higher-is-bad" thresholds={{ warning: 80, critical: 95 }} readOnly={!canEdit} />
      <StatCard label="WWW & API REQ" value={item.requestPeak?.val} unit={item.requestPeak?.unit} onChange={v => handleUpdate('requestPeak', updateObj(item.requestPeak, v))} onUnitChange={u => handleUpdate('requestPeak', updateUnit(item.requestPeak, u))} type="number" compact readOnly={!canEdit} />
    </div>
  );

  if (isMulti) {
    return (
      <div className="space-y-4">
        {/* Autofill Button */}
        {cdnList.length > 1 && canEdit && (
          <div className="flex justify-end">
            <button onClick={onAutofill} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0078D4]/10 text-[#0078D4] rounded-md text-xs font-medium hover:bg-[#0078D4]/20 transition-colors">
              <Wand2 size={12} /> Autofill System Health
            </button>
          </div>
        )}

        {cdnList.map((item, index) => (
          <div key={item.id} className="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-lg p-4 border border-zinc-100 dark:border-zinc-800">
            <CdnHeader item={item} index={index} icon={Server} onRemove={canEdit ? () => onRemoveCdn(item.id) : null} onClear={canEdit ? () => onClearRow(item.id) : null} isRemovable={canEdit && cdnList.length > 1} />
            {fields(item, (f, v) => onUpdateCdn(item.id, f, v))}
          </div>
        ))}
        {canEdit && <AddBtn onClick={onAddCdn} />}
      </div>
    );
  }
  return <div>{fields(data, onChange)}</div>;
};

/**
 * Traffic & Bandwidth Panel - Outlook Style
 */
export const TrafficPanel = ({ data, onChange, isMulti, cdnList, onUpdateCdn, onRemoveCdn, onAddCdn, onClearRow, canEdit = true }) => {
  const fields = (item, handleUpdate) => (
    <div className={GRID_CLASS}>
      <StatCard label="Req Peak" value={item.reqPeakMin?.val} unit={item.reqPeakMin?.unit} onChange={v => handleUpdate('reqPeakMin', updateObj(item.reqPeakMin, v))} onUnitChange={u => handleUpdate('reqPeakMin', updateUnit(item.reqPeakMin, u))} type="number" compact readOnly={!canEdit} />
      <StatCard label="Req Total" value={item.reqTotal?.val} unit={item.reqTotal?.unit} onChange={v => handleUpdate('reqTotal', updateObj(item.reqTotal, v))} onUnitChange={u => handleUpdate('reqTotal', updateUnit(item.reqTotal, u))} type="number" compact readOnly={!canEdit} />
      <StatCard label="BW Peak" value={item.bwPeakGbps?.val} unit={item.bwPeakGbps?.unit} onChange={v => handleUpdate('bwPeakGbps', updateObj(item.bwPeakGbps, v))} onUnitChange={u => handleUpdate('bwPeakGbps', updateUnit(item.bwPeakGbps, u))} type="number" compact readOnly={!canEdit} />
      <StatCard label="BW Total" value={item.bandwidth?.val} unit={item.bandwidth?.unit} onChange={v => handleUpdate('bandwidth', updateObj(item.bandwidth, v))} onUnitChange={u => handleUpdate('bandwidth', updateUnit(item.bandwidth, u))} type="number" compact readOnly={!canEdit} />
    </div>
  );

  if (isMulti) {
    return (
      <div className="space-y-4">
        {cdnList.map((item, i) => (
          <div key={item.id} className="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-lg p-4 border border-zinc-100 dark:border-zinc-800">
            <CdnHeader item={item} index={i} icon={Wifi} onRemove={canEdit ? () => onRemoveCdn(item.id) : null} onClear={canEdit ? () => onClearRow(item.id) : null} isRemovable={canEdit && cdnList.length > 1} />
            {fields(item, (f, v) => onUpdateCdn(item.id, f, v))}
          </div>
        ))}
        {canEdit && <AddBtn onClick={onAddCdn} />}
      </div>
    );
  }
  return <div>{fields(data, onChange)}</div>;
};

/**
 * Audience & Engagement Panel - Outlook Style
 */
export const ViewerPanel = ({ data, onChange, isMulti, cdnList, onUpdateCdn, onRemoveCdn, onAddCdn, onClearRow, canEdit = true }) => {
  const fields = (item, handleUpdate) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <StatCard label="Live Viewers" value={item.muxViewerUniq?.val} unit={item.muxViewerUniq?.unit} onChange={v => handleUpdate('muxViewerUniq', updateObj(item.muxViewerUniq, v))} onUnitChange={u => handleUpdate('muxViewerUniq', updateUnit(item.muxViewerUniq, u))} type="number" compact readOnly={!canEdit} />
      <StatCard label="Smoothness Score" value={item.muxScore} onChange={v => handleUpdate('muxScore', v)} type="number" max={100} thresholdType="lower-is-bad" thresholds={{ warning: 80, critical: 60 }} readOnly={!canEdit} />
    </div>
  );

  if (isMulti) {
    return (
      <div className="space-y-4">
        {cdnList.map((item, i) => (
          <div key={item.id} className="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-lg p-4 border border-zinc-100 dark:border-zinc-800">
            <CdnHeader item={item} index={i} icon={Users} onRemove={canEdit ? () => onRemoveCdn(item.id) : null} onClear={canEdit ? () => onClearRow(item.id) : null} isRemovable={canEdit && cdnList.length > 1} />
            {fields(item, (f, v) => onUpdateCdn(item.id, f, v))}
          </div>
        ))}
        {canEdit && <AddBtn onClick={onAddCdn} />}
      </div>
    );
  }
  return <div>{fields(data, onChange)}</div>;
};
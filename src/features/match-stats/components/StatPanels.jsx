import React from 'react';
import { Activity, TrendingUp, Globe, BarChart3, Users, Gauge, Server, Wifi, Plus, Trash2 } from 'lucide-react';
import StatCard from '../../../components/forms/StatCard';

// Shared Helper
const CdnHeader = ({ item, index, icon: Icon, onRemove, isRemovable }) => (
  <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500"><Icon size={12} /></div>
      <div>
        <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">{item.provider || `Provider ${index + 1}`}</h4>
        <p className="text-[9px] text-zinc-400 font-bold uppercase">{item.key || 'No Key Configured'}</p>
      </div>
    </div>
    {isRemovable && <button onClick={onRemove} className="p-1 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>}
  </div>
);

const AddBtn = ({ onClick }) => (
  <button onClick={onClick} className="w-full py-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex justify-center items-center gap-2 text-zinc-400 font-black text-[10px] uppercase hover:text-orange-500 hover:border-orange-400 transition-all">
    <Plus size={14} /> Add CDN Provider
  </button>
);

// 1. System Panel
export const SystemPanel = ({ data, onChange, isMulti, cdnList, onUpdateCdn, onRemoveCdn, onAddCdn }) => {
  if (isMulti) {
    return (
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {cdnList.map((item, index) => (
          <div key={item.id} className="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
            <CdnHeader item={item} index={index} icon={Server} onRemove={() => onRemoveCdn(item.id)} isRemovable={cdnList.length > 1} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <StatCard label="ECS Sport" value={item.ecsSport} onChange={v => onUpdateCdn(item.id, 'ecsSport', v)} type="percentage" color="blue" max={100} compact />
              <StatCard label="ECS Entitlement" value={item.ecsEntitlement} onChange={v => onUpdateCdn(item.id, 'ecsEntitlement', v)} type="percentage" color="purple" max={100} compact />
              <StatCard label="API Huawei" value={item.apiHuawei} onChange={v => onUpdateCdn(item.id, 'apiHuawei', v)} type="percentage" color="orange" max={100} compact />
              <StatCard label="WWW & API Request" value={item.requestPeak} onChange={v => onUpdateCdn(item.id, 'requestPeak', v)} type="number" color="emerald" compact />
            </div>
          </div>
        ))}
        <AddBtn onClick={onAddCdn} />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <StatCard label="ECS Sport" value={data.ecsSport} onChange={v => onChange('ecsSport', v)} type="percentage" color="blue" max={100} compact />
      <StatCard label="ECS Entitlement" value={data.ecsEntitlement} onChange={v => onChange('ecsEntitlement', v)} type="percentage" color="purple" max={100} compact />
      <StatCard label="API Huawei" value={data.apiHuawei} onChange={v => onChange('apiHuawei', v)} type="percentage" color="orange" max={100} compact />
      <StatCard label="WWW & API Request" value={data.requestPeak} onChange={v => onChange('requestPeak', v)} type="number" color="emerald" compact />
    </div>
  );
};

// 2. Traffic Panel
export const TrafficPanel = ({ data, onChange, isMulti, cdnList, onUpdateCdn, onRemoveCdn, onAddCdn }) => {
  const renderFields = (item, handleChange) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <StatCard label="Req Peak" value={item.reqPeakMin} onChange={v => handleChange('reqPeakMin', v)} type="number" color="blue" compact />
      <StatCard label="Req Total" value={item.reqTotal?.val} unit={item.reqTotal?.unit || 'k'} onChange={v => handleChange('reqTotal', { ...item.reqTotal, val: v })} onUnitChange={u => handleChange('reqTotal', { ...item.reqTotal, unit: u })} type="number" color="cyan" compact />
      <StatCard label="BW Peak" value={item.bwPeakGbps?.val} unit={item.bwPeakGbps?.unit || 'GB'} onChange={v => handleChange('bwPeakGbps', { ...item.bwPeakGbps, val: v })} onUnitChange={u => handleChange('bwPeakGbps', { ...item.bwPeakGbps, unit: u })} type="number" color="red" compact />
      <StatCard label="BW Total" value={item.bandwidth?.val} unit={item.bandwidth?.unit || 'GB'} onChange={v => handleChange('bandwidth', { ...item.bandwidth, val: v })} onUnitChange={u => handleChange('bandwidth', { ...item.bandwidth, unit: u })} type="number" color="orange" compact />
    </div>
  );

  if (isMulti) {
    return (
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {cdnList.map((item, index) => (
          <div key={item.id} className="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
            <CdnHeader item={item} index={index} icon={Wifi} onRemove={() => onRemoveCdn(item.id)} isRemovable={cdnList.length > 1} />
            {renderFields(item, (f, v) => onUpdateCdn(item.id, f, v))}
          </div>
        ))}
        <AddBtn onClick={onAddCdn} />
      </div>
    );
  }
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard label="Req Peak" value={data.reqPeakMin} onChange={v => onChange('reqPeakMin', v)} type="number" color="blue" compact />
        <StatCard label="Req Total" value={data.reqTotal?.val} unit={data.reqTotal?.unit || 'k'} onChange={v => onChange('reqTotal', { ...data.reqTotal, val: v })} onUnitChange={u => onChange('reqTotal', { ...data.reqTotal, unit: u })} type="number" color="cyan" compact />
        <StatCard label="BW Peak" value={data.bwPeakGbps?.val} unit={data.bwPeakGbps?.unit || 'GB'} onChange={v => onChange('bwPeakGbps', { ...data.bwPeakGbps, val: v })} onUnitChange={u => onChange('bwPeakGbps', { ...data.bwPeakGbps, unit: u })} type="number" color="red" compact />
        <StatCard label="BW Total" value={data.bandwidth?.val} unit={data.bandwidth?.unit || 'GB'} onChange={v => onChange('bandwidth', { ...data.bandwidth, val: v })} onUnitChange={u => onChange('bandwidth', { ...data.bandwidth, unit: u })} type="number" color="orange" compact />
      </div>
    </div>
  );
};

// 3. Viewer Panel
export const ViewerPanel = ({ data, onChange, isMulti, cdnList, onUpdateCdn, onRemoveCdn, onAddCdn }) => {
  if (isMulti) {
    return (
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {cdnList.map((item, index) => (
          <div key={item.id} className="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
            <CdnHeader item={item} index={index} icon={Users} onRemove={() => onRemoveCdn(item.id)} isRemovable={cdnList.length > 1} />
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Live Viewers" value={item.muxViewerUniq} onChange={v => onUpdateCdn(item.id, 'muxViewerUniq', v)} type="number" color="purple" compact />
              <StatCard label="Engage Score" value={item.muxScore} onChange={v => onUpdateCdn(item.id, 'muxScore', v)} type="number" color="pink" max={100} compact />
            </div>
          </div>
        ))}
        <AddBtn onClick={onAddCdn} />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <StatCard label="Live Viewers" value={data.muxViewerUniq} onChange={v => onChange('muxViewerUniq', v)} type="number" color="purple" compact />
      <StatCard label="Engage Score" value={data.muxScore} onChange={v => onChange('muxScore', v)} type="number" color="pink" max={100} compact />
    </div>
  );
};

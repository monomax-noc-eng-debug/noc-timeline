import React from 'react';
import { Activity, TrendingUp, Globe, BarChart3, Users, Gauge, Server, Wifi, Plus, Trash2 } from 'lucide-react';
import StatCard from '../../../components/forms/StatCard';

// Shared Helper
const CdnHeader = ({ item, index, icon: Icon, onRemove, isRemovable }) => (
  <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-700/50">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500"><Icon size={16} /></div>
      <div>
        <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase">{item.provider || `Provider ${index + 1}`}</h4>
        <p className="text-[10px] text-zinc-400 font-bold uppercase">{item.key || 'No Key Configured'}</p>
      </div>
    </div>
    {isRemovable && <button onClick={onRemove} className="text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>}
  </div>
);

const AddBtn = ({ onClick }) => (
  <button onClick={onClick} className="w-full py-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex justify-center gap-2 text-zinc-400 font-bold text-xs uppercase hover:text-orange-500 hover:border-orange-400 transition-all">
    <Plus size={16} /> Add Provider
  </button>
);

// 1. System Panel
export const SystemPanel = ({ data, onChange, isMulti, cdnList, onUpdateCdn, onRemoveCdn, onAddCdn }) => {
  if (isMulti) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {cdnList.map((item, index) => (
          <div key={item.id} className="bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <CdnHeader item={item} index={index} icon={Server} onRemove={() => onRemoveCdn(item.id)} isRemovable={cdnList.length > 1} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard label="ECS Sport" value={item.ecsSport} onChange={v => onUpdateCdn(item.id, 'ecsSport', v)} type="percentage" icon={Activity} color="blue" placeholder="0" />
              <StatCard label="ECS Entitlement" value={item.ecsEntitlement} onChange={v => onUpdateCdn(item.id, 'ecsEntitlement', v)} type="percentage" icon={Activity} color="purple" placeholder="0" />
              <StatCard label="API Huawei" value={item.apiHuawei} onChange={v => onUpdateCdn(item.id, 'apiHuawei', v)} type="percentage" icon={TrendingUp} color="orange" placeholder="0" />
              <StatCard label="WWW & API Peak" value={item.requestPeak} onChange={v => onUpdateCdn(item.id, 'requestPeak', v)} type="number" icon={Globe} color="emerald" placeholder="0" />
            </div>
          </div>
        ))}
        <AddBtn onClick={onAddCdn} />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StatCard label="ECS Sport" value={data.ecsSport} onChange={v => onChange('ecsSport', v)} type="percentage" icon={Activity} color="blue" placeholder="0" />
      <StatCard label="ECS Entitlement" value={data.ecsEntitlement} onChange={v => onChange('ecsEntitlement', v)} type="percentage" icon={Activity} color="purple" placeholder="0" />
      <StatCard label="API Huawei" value={data.apiHuawei} onChange={v => onChange('apiHuawei', v)} type="percentage" icon={TrendingUp} color="orange" placeholder="0" />
      <StatCard label="WWW & API Peak" value={data.requestPeak} onChange={v => onChange('requestPeak', v)} type="number" icon={Globe} color="emerald" placeholder="0" />
    </div>
  );
};

// 2. Traffic Panel
export const TrafficPanel = ({ data, onChange, isMulti, cdnList, onUpdateCdn, onRemoveCdn, onAddCdn }) => {
  const renderFields = (item, handleChange) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard label="Req Peak (Min)" value={item.reqPeakMin} onChange={v => handleChange('reqPeakMin', v)} type="number" icon={TrendingUp} color="blue" placeholder="0" />
        <StatCard label="Req Total" value={item.reqTotal?.val} unit={item.reqTotal?.unit || 'k'} onChange={v => handleChange('reqTotal', { ...item.reqTotal, val: v })} onUnitChange={u => handleChange('reqTotal', { ...item.reqTotal, unit: u })} type="number" icon={BarChart3} color="cyan" placeholder="0" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard label="BW Peak (Gb/s)" value={item.bwPeakGbps?.val} unit={item.bwPeakGbps?.unit || 'GB'} onChange={v => handleChange('bwPeakGbps', { ...item.bwPeakGbps, val: v })} onUnitChange={u => handleChange('bwPeakGbps', { ...item.bwPeakGbps, unit: u })} type="number" icon={Activity} color="red" placeholder="0" />
        <StatCard label="BW Total (GB)" value={item.bandwidth?.val} unit={item.bandwidth?.unit || 'GB'} onChange={v => handleChange('bandwidth', { ...item.bandwidth, val: v })} onUnitChange={u => handleChange('bandwidth', { ...item.bandwidth, unit: u })} type="number" icon={Activity} color="orange" placeholder="0" />
      </div>
    </>
  );

  if (isMulti) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {cdnList.map((item, index) => (
          <div key={item.id} className="bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <CdnHeader item={item} index={index} icon={Wifi} onRemove={() => onRemoveCdn(item.id)} isRemovable={cdnList.length > 1} />
            <div className="space-y-4">{renderFields(item, (f, v) => onUpdateCdn(item.id, f, v))}</div>
          </div>
        ))}
        <AddBtn onClick={onAddCdn} />
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {renderFields(data, (f, v) => onChange(f, v))}
    </div>
  );
};

// 3. Viewer Panel
export const ViewerPanel = ({ data, onChange, isMulti, cdnList, onUpdateCdn, onRemoveCdn, onAddCdn }) => {
  if (isMulti) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {cdnList.map((item, index) => (
          <div key={item.id} className="bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <CdnHeader item={item} index={index} icon={Users} onRemove={() => onRemoveCdn(item.id)} isRemovable={cdnList.length > 1} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard label="Live Viewers" value={item.muxViewerUniq} onChange={v => onUpdateCdn(item.id, 'muxViewerUniq', v)} type="number" icon={Users} color="purple" placeholder="0" />
              <StatCard label="Engagement Score" value={item.muxScore} onChange={v => onUpdateCdn(item.id, 'muxScore', v)} type="number" icon={Gauge} color="pink" placeholder="0" />
            </div>
          </div>
        ))}
        <AddBtn onClick={onAddCdn} />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <StatCard label="Live Viewers" value={data.muxViewerUniq} onChange={v => onChange('muxViewerUniq', v)} type="number" icon={Users} color="purple" placeholder="0" />
      <StatCard label="Engagement Score" value={data.muxScore} onChange={v => onChange('muxScore', v)} type="number" icon={Gauge} color="pink" placeholder="0" />
    </div>
  );
};
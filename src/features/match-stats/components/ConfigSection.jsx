import React from 'react';
import { Gauge, Globe, Layers, Plus, Trash2, Settings } from 'lucide-react';

export default function ConfigSection({
  form, setForm,
  isMultiCdnMode, toggleCdnMode,
  cdnList, onAdd, onRemove, onUpdate,
  onAutoFix // ✅ Add prop
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Gauge size={20} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white">Configuration</h3>
            <p className="text-xs text-zinc-500">Manage Time Range & CDN Strategy</p>
          </div>
        </div>
        {/* Auto Fix Button */}
        {onAutoFix && (
          <button
            onClick={onAutoFix}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
          >
            {/* ✅ ลบ animate-spin-slow ออกแล้ว */}
            <Settings size={14} /> Auto Calc Time
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6 shadow-sm">

        {/* ✅ Time Range: แสดงตลอด (ไม่ซ่อนแล้ว) */}
        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Range Start</label>
            <input
              type="time"
              value={form.rangeStart}
              onChange={e => setForm({ ...form, rangeStart: e.target.value })}
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold dark:text-white focus:ring-2 ring-orange-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Range End</label>
            <input
              type="time"
              value={form.rangeEnd}
              onChange={e => setForm({ ...form, rangeEnd: e.target.value })}
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold dark:text-white focus:ring-2 ring-orange-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* CDN Strategy */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">CDN Strategy</label>
            <button
              onClick={toggleCdnMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isMultiCdnMode ? 'bg-black text-white border-black dark:bg-white dark:text-black' : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'}`}
            >
              <Layers size={14} /> {isMultiCdnMode ? 'Multi-CDN Mode: ON' : 'Single Provider'}
            </button>
          </div>

          {!isMultiCdnMode ? (
            /* Single Mode Buttons */
            <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-300">
              {['AWS', 'Tencent', 'Huawei', 'BytePlus', 'Wangsu', 'Akamai'].map(cdn => (
                <button
                  key={cdn}
                  onClick={() => setForm({ ...form, cdn })}
                  className={`p-4 rounded-xl border-2 font-black uppercase text-sm transition-all flex flex-col items-center justify-center gap-2 ${form.cdn === cdn ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black border-zinc-900 dark:border-zinc-100 shadow-lg scale-[1.02]' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
                >
                  <Globe size={24} className={form.cdn === cdn ? "opacity-100" : "opacity-50"} /> {cdn}
                </button>
              ))}
            </div>
          ) : (
            /* ✅ Multi Mode List (Redesigned: Clean Row Layout) */
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
              {cdnList.map((item, index) => (
                <div key={item.id} className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all hover:border-orange-300 dark:hover:border-orange-700/50">

                  {/* Provider Select */}
                  <div className="w-1/3">
                    <label className="text-[9px] font-bold text-zinc-400 mb-1.5 block uppercase tracking-wide">
                      {index === 0 ? 'Primary Provider' : `Provider #${index + 1}`}
                    </label>
                    <div className="relative">
                      <select
                        value={item.provider}
                        onChange={(e) => onUpdate(item.id, 'provider', e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 text-xs font-bold outline-none focus:ring-1 ring-orange-500 appearance-none cursor-pointer"
                      >
                        <option value="Select Provider">Select Provider</option>
                        <option value="AWS">AWS</option>
                        <option value="Tencent">Tencent</option>
                        <option value="Huawei">Huawei</option>
                        <option value="BytePlus">BytePlus</option>
                        <option value="Wangsu">Wangsu</option>
                        <option value="Akamai">Akamai</option>
                      </select>
                      <Globe size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Config Key (เอา Request/BW ออก เหลือแค่นี้) */}
                  <div className="flex-1">
                    <label className="text-[9px] font-bold text-zinc-400 mb-1.5 block uppercase tracking-wide">Channel / Config Key</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. sport-1-hd"
                        value={item.key || ''}
                        onChange={(e) => onUpdate(item.id, 'key', e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 text-xs font-bold outline-none focus:ring-1 ring-orange-500"
                      />
                      <Settings size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    </div>
                  </div>

                  {/* Remove Button */}
                  {cdnList.length > 1 && (
                    <div className="pt-6">
                      <button
                        onClick={() => onRemove(item.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove CDN"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                </div>
              ))}
              <button onClick={onAdd} className="w-full py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-400 font-bold text-xs uppercase flex items-center justify-center gap-2 hover:border-orange-400 hover:text-orange-500 transition-all"><Plus size={16} /> Add CDN Provider</button>
            </div>
          )}
        </div>

        {/* Live Channel */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Live Channel ID</label>
          <div className="relative">
            <input
              type="text"
              value={form.liveChannel}
              onChange={e => setForm({ ...form, liveChannel: e.target.value })}
              onFocus={() => document.getElementById('custom-dropdown').classList.remove('hidden')}
              onBlur={() => setTimeout(() => document.getElementById('custom-dropdown')?.classList.add('hidden'), 200)}
              placeholder="Select or Type Channel ID"
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold focus:ring-2 ring-orange-500 outline-none"
            />
            {/* Custom Dropdown List */}
            <div id="custom-dropdown" className="hidden absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50">
              {[
                ...Array.from({ length: 24 }, (_, i) => `Sport ${i + 1}`),
                'Thaileague', 'Sport-T 101', 'Sport-T 102',
                ...Array.from({ length: 21 }, (_, i) => `TL${i + 1}`)
              ].filter(opt => opt.toLowerCase().includes((form.liveChannel || '').toLowerCase())).map(opt => (
                <div
                  key={opt}
                  onMouseDown={() => setForm({ ...form, liveChannel: opt })}
                  className="px-4 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
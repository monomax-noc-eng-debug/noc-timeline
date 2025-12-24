// src/features/match-stats/components/ConfigSection.jsx
import React from 'react';
import { Gauge, Globe, Layers, Plus, Trash2, Settings, MonitorPlay } from 'lucide-react';

export default function ConfigSection({
  form, setForm,
  isMultiCdnMode, toggleCdnMode,
  cdnList, onAdd, onRemove, onUpdate,
  onAutoFix,
  statType // ✅ รับ statType เข้ามา
}) {
  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Gauge size={16} className="text-orange-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Configuration</h3>
        </div>

        {/* Auto Calc Button */}
        {onAutoFix && (
          <button
            onClick={onAutoFix}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-orange-100 transition-colors"
          >
            <Settings size={12} /> Auto Calc Time
          </button>
        )}
      </div>

      {/* ✅ Compact Row: Time Range + Live Channel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Start Time */}
        <div className="md:col-span-3">
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-1 block">
            Range Start (Kick-off)
          </label>
          <input
            type="time"
            value={form.rangeStart}
            onChange={e => setForm({ ...form, rangeStart: e.target.value })}
            className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold focus:ring-1 ring-orange-500 outline-none"
          />
        </div>

        {/* End Time (Dynamic Label) */}
        <div className="md:col-span-3">
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-1 block">
            Range End {statType === 'START' ? '(+15m)' : '(+2h)'} {/* ✅ เปลี่ยน Label ตาม Phase */}
          </label>
          <input
            type="time"
            value={form.rangeEnd}
            onChange={e => setForm({ ...form, rangeEnd: e.target.value })}
            className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold focus:ring-1 ring-orange-500 outline-none"
          />
        </div>

        {/* Live Channel */}
        <div className="md:col-span-6">
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-1 block">Live Channel ID</label>
          <div className="relative">
            <input
              type="text"
              value={form.liveChannel}
              onChange={e => setForm({ ...form, liveChannel: e.target.value })}
              onFocus={() => document.getElementById('custom-dropdown')?.classList.remove('hidden')}
              onBlur={() => setTimeout(() => document.getElementById('custom-dropdown')?.classList.add('hidden'), 200)}
              placeholder="Select Channel..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold focus:ring-1 ring-orange-500 outline-none"
            />
            <MonitorPlay size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />

            {/* Dropdown */}
            <div id="custom-dropdown" className="hidden absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl z-50">
              {[
                ...Array.from({ length: 24 }, (_, i) => `Sport ${i + 1}`),
                'Thaileague', 'Sport-T 101', 'Sport-T 102',
                ...Array.from({ length: 21 }, (_, i) => `TL${i + 1}`)
              ].filter(opt => opt.toLowerCase().includes((form.liveChannel || '').toLowerCase())).map(opt => (
                <div
                  key={opt}
                  onMouseDown={() => setForm({ ...form, liveChannel: opt })}
                  className="px-3 py-1.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CDN Strategy (ส่วนที่เหลือเหมือนเดิม) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-2">CDN Strategy</label>
          <button
            onClick={toggleCdnMode}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${isMultiCdnMode ? 'bg-black text-white border-black dark:bg-white dark:text-black' : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'}`}
          >
            <Layers size={10} /> {isMultiCdnMode ? 'Multi-CDN' : 'Single'}
          </button>
        </div>

        {!isMultiCdnMode ? (
          /* Single Mode */
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {['AWS', 'Tencent', 'Huawei', 'BytePlus', 'Wangsu', 'Akamai'].map(cdn => (
              <button
                key={cdn}
                onClick={() => setForm({ ...form, cdn })}
                className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${form.cdn === cdn ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black border-zinc-900 dark:border-zinc-100 shadow-sm' : 'bg-white dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
              >
                <Globe size={14} className={form.cdn === cdn ? "opacity-100" : "opacity-50"} /> {cdn}
              </button>
            ))}
          </div>
        ) : (
          /* Multi Mode (Compact List) */
          <div className="space-y-2">
            {cdnList.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">

                {/* Provider */}
                <div className="w-1/3 min-w-[120px]">
                  <div className="relative">
                    <select
                      value={item.provider}
                      onChange={(e) => onUpdate(item.id, 'provider', e.target.value)}
                      className="w-full py-1.5 pl-2 pr-6 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 text-[10px] font-bold outline-none focus:ring-1 ring-orange-500 appearance-none cursor-pointer"
                    >
                      <option value="Select Provider">Select...</option>
                      <option value="AWS">AWS</option>
                      <option value="Tencent">Tencent</option>
                      <option value="Huawei">Huawei</option>
                      <option value="BytePlus">BytePlus</option>
                      <option value="Wangsu">Wangsu</option>
                      <option value="Akamai">Akamai</option>
                    </select>
                    <Globe size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* Config Key */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Config Key..."
                      value={item.key || ''}
                      onChange={(e) => onUpdate(item.id, 'key', e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 text-[10px] font-bold outline-none focus:ring-1 ring-orange-500"
                    />
                    <Settings size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
                  </div>
                </div>

                {/* Remove */}
                {cdnList.length > 1 && (
                  <button onClick={() => onRemove(item.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={onAdd} className="w-full py-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-400 font-bold text-[10px] uppercase flex items-center justify-center gap-2 hover:border-orange-400 hover:text-orange-500 transition-all">
              <Plus size={12} /> Add Provider
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import {
  X, Save, Loader2, Calendar, Clock, Trophy, Tv,
  LayoutList, Server, Wand2, Swords, Sparkles, CheckCircle2
} from 'lucide-react';

export default function ManualMatchModal({ isOpen, onClose, onSubmit, initialData, selectedDate, saving }) {
  const [form, setForm] = useState({
    league: '',
    match: '',
    teamA: '',
    teamB: '',
    startTime: '',
    startDate: '',
    channel: '',
    cdn: 'AWS',
  });

  // Load Data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          league: initialData.league || '',
          match: initialData.match || initialData.title || '',
          teamA: initialData.teamA || '',
          teamB: initialData.teamB || '',
          startTime: initialData.startTime || '',
          startDate: initialData.startDate || '',
          channel: initialData.channel || initialData.liveChannel || '',
          cdn: initialData.cdn || 'AWS',
        });
      } else {
        setForm({
          league: '',
          match: '',
          teamA: '',
          teamB: '',
          startTime: '',
          startDate: selectedDate || new Date().toISOString().split('T')[0],
          channel: '',
          cdn: 'AWS',
        });
      }
    }
  }, [isOpen, initialData, selectedDate]);

  // Smart Match Input
  const handleMatchNameChange = (val) => {
    let newForm = { ...form, match: val };
    const separators = [' vs ', ' VS ', ' Vs ', ' - ', ' v '];
    const foundSeparator = separators.find(sep => val.includes(sep));

    if (foundSeparator) {
      const parts = val.split(foundSeparator);
      if (parts.length >= 2) {
        newForm.teamA = parts[0].trim();
        newForm.teamB = parts.slice(1).join(foundSeparator).trim();
      }
    }
    setForm(newForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!isOpen) return null;

  const isFormValid = form.teamA && form.teamB && form.league && form.startDate && form.startTime;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-2 border-zinc-100 dark:border-zinc-800">

        {/* Header */}
        <div className="px-8 py-6 border-b-2 border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                  {initialData ? 'Edit Match' : 'New Match'}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                  {initialData ? 'Update match details' : 'Add a new match to the schedule'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-6">

            {/* Smart Input Section */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg shadow-md">
                    <Sparkles size={14} />
                    <span className="text-xs font-black uppercase tracking-wider">Smart Input</span>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Auto-fill teams instantly</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder='Type "Arsenal vs Chelsea" to auto-fill both teams'
                    className="w-full h-14 bg-white dark:bg-zinc-900 border-2 border-blue-300 dark:border-blue-700 rounded-xl px-5 pr-12 text-base font-semibold text-zinc-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-zinc-400 placeholder:font-normal"
                    value={form.match}
                    onChange={e => handleMatchNameChange(e.target.value)}
                    autoFocus={!initialData}
                  />
                  <Wand2 size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Teams Section */}
            <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-6 border-2 border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-center mb-5">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-zinc-800 rounded-lg border-2 border-zinc-200 dark:border-zinc-700">
                  <Swords size={16} className="text-zinc-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Matchup</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-6 items-end">
                {/* Team A */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-3">
                    <LayoutList size={14} />
                    Home Team
                  </label>
                  <input
                    type="text"
                    placeholder="Home Team"
                    className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl px-4 text-base font-bold text-zinc-900 dark:text-white text-center md:text-left outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-zinc-400 placeholder:font-normal"
                    value={form.teamA}
                    onChange={e => setForm({ ...form, teamA: e.target.value })}
                    required
                  />
                </div>

                {/* VS */}
                <div className="hidden md:flex items-center justify-center pb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-200 flex items-center justify-center shadow-lg">
                    <span className="text-white dark:text-black font-black text-sm">VS</span>
                  </div>
                </div>

                {/* Team B */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-3 md:justify-end">
                    <LayoutList size={14} />
                    Away Team
                  </label>
                  <input
                    type="text"
                    placeholder="Away Team"
                    className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl px-4 text-base font-bold text-zinc-900 dark:text-white text-center md:text-right outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-zinc-400 placeholder:font-normal"
                    value={form.teamB}
                    onChange={e => setForm({ ...form, teamB: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* League & Channel */}
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-3">
                    <Trophy size={14} />
                    League / Competition
                  </label>
                  <select
                    className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl px-4 text-sm font-semibold text-zinc-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none"
                    value={form.league}
                    onChange={e => setForm({ ...form, league: e.target.value })}
                    required
                  >
                    <option value="">Select League</option>
                    <option value="Premier League">Premier League</option>
                    <option value="EFL">EFL</option>
                    <option value="Thai League 1">Thai League 1</option>
                    <option value="Thai League 2">Thai League 2</option>
                    <option value="Thai League 3">Thai League 3</option>
                    <option value="French League">French League</option>
                    <option value="Carabao Cup">Carabao Cup</option>
                    <option value="UEFA European">UEFA European</option>
                    <option value="Thai Women League 2">Thai Women League 2</option>
                    <option value="U21">U21</option>
                    <option value="Chang FA Cup">Chang FA Cup</option>
                    <option value="SV League WM_Volleyball">SV League WM_Volleyball</option>
                    <option value="SV League M_Volleyball">SV League M_Volleyball</option>
                    <option value="The Emirates FA Cup">The Emirates FA Cup</option>
                    <option value="MUANGTHAI CUP">MUANGTHAI CUP</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-3">
                    <Tv size={14} />
                    Broadcast Channel
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select or Type Channel"
                      className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl px-4 text-sm font-semibold text-zinc-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-zinc-400"
                      value={form.channel}
                      onChange={e => setForm({ ...form, channel: e.target.value })}
                      onFocus={() => document.getElementById('new-match-channel-dropdown').classList.remove('hidden')}
                      onBlur={() => setTimeout(() => document.getElementById('new-match-channel-dropdown')?.classList.add('hidden'), 200)}
                    />
                    {/* Custom Dropdown List (Dropup) */}
                    <div id="new-match-channel-dropdown" className="hidden absolute bottom-full left-0 right-0 mb-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50">
                      {[
                        ...Array.from({ length: 24 }, (_, i) => `Sport ${i + 1}`),
                        'Thaileague', 'Sport-T 101', 'Sport-T 102',
                        ...Array.from({ length: 21 }, (_, i) => `TL${i + 1}`)
                      ].filter(opt => opt.toLowerCase().includes((form.channel || '').toLowerCase())).map(opt => (
                        <div
                          key={opt}
                          onMouseDown={() => setForm({ ...form, channel: opt })}
                          className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date, Time & CDN */}
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-3">
                      <Calendar size={14} />
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl px-3 text-sm font-semibold text-zinc-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-3">
                      <Clock size={14} />
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl px-3 text-sm font-semibold text-zinc-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                      value={form.startTime}
                      onChange={e => setForm({ ...form, startTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-3">
                    <Server size={14} />
                    CDN Provider
                  </label>
                  <select
                    className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl px-4 text-sm font-semibold text-zinc-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer"
                    value={form.cdn}
                    onChange={e => setForm({ ...form, cdn: e.target.value })}
                  >
                    <option value="">Select Provider</option>
                    <option value="AWS">AWS</option>
                    <option value="Tencent">Tencent</option>
                    <option value="Huawei">Huawei</option>
                    <option value="BytePlus">BytePlus</option>
                    <option value="Wangsu">Wangsu</option>
                    <option value="Akamai">Akamai</option>
                    <option value="Multi CDN">Multi CDN</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 h-12 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !isFormValid}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Save Match</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
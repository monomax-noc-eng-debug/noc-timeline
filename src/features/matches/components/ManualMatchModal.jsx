// src/features/matches/components/ManualMatchModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Loader2, Clock, Trophy, Tv, Shield,
  Server, Wand2, Sparkles, Calendar as CalendarIcon,
  CheckCircle2, Swords, X, Hash, Globe, Activity,
  LayoutGrid, Info, Settings2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

// ✅ Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

  const cdnOptions = [
    { id: 'AWS', label: 'AWS', color: 'bg-orange-500' },
    { id: 'Tencent', label: 'Tencent', color: 'bg-blue-500' },
    { id: 'Huawei', label: 'Huawei', color: 'bg-red-500' },
    { id: 'BytePlus', label: 'BytePlus', color: 'bg-cyan-500' },
    { id: 'Wangsu', label: 'Wangsu', color: 'bg-indigo-500' },
    { id: 'Akamai', label: 'Akamai', color: 'bg-blue-600' },
    { id: 'Multi CDN', label: 'Multi CDN', color: 'bg-purple-600' }
  ];

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

  // Logic: Smart Input Parser
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

  const isFormValid = form.teamA && form.teamB && form.startDate && form.startTime;

  // Sub-component for Section Label
  const SectionLabel = ({ icon: Icon, title, desc }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
        <Icon size={16} />
      </div>
      <div>
        <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">{title}</h4>
        {desc && <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{desc}</p>}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[760px] p-0 gap-0 overflow-hidden bg-white dark:bg-[#09090b] border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all duration-300">

        {/* PROGRESSIVE HEADER */}
        <DialogHeader className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-gradient-to-r from-white via-white to-zinc-50/50 dark:from-[#09090b] dark:via-[#09090b] dark:to-zinc-900/10 relative">
          <div className="flex items-center justify-between relative z-10 w-full">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-2xl shadow-sm transition-all duration-500",
                initialData
                  ? "bg-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-black text-white dark:bg-white dark:text-black shadow-zinc-500/20"
              )}>
                {initialData ? <CheckCircle2 size={24} /> : <Activity size={24} />}
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                  {initialData ? 'Update Match Event' : 'Schedule New Event'}
                  {!initialData && <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black tracking-widest uppercase">Manual</span>}
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Configure real-time monitoring and broadcast distribution.
                </DialogDescription>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">NOC DASHBOARD</span>
              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter flex items-center gap-1.5 mt-1">
                <LayoutGrid size={12} /> CONFIG V2.4
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* RESTRUCTURED SCROLLABLE BODY */}
        <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar bg-white dark:bg-[#09090b]">
          <form id="match-form" onSubmit={handleSubmit} className="space-y-10">

            {/* SECTION 1: IDENTITY & LEAGUE */}
            <section>
              <SectionLabel icon={Info} title="Event Identity" desc="League and Teams Information" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* League Selection (Left) */}
                <div className="md:col-span-4 space-y-2">
                  <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">League</Label>
                  <Select value={form.league} onValueChange={(val) => setForm({ ...form, league: val })}>
                    <SelectTrigger className="h-12 text-sm font-bold bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-sm transition-all focus:ring-2 ring-zinc-500/10">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-amber-500" />
                        <SelectValue placeholder="Select" />
                      </div>
                    </SelectTrigger>
                    <SelectContent side="bottom" className="max-h-[250px] border-zinc-200 dark:border-zinc-800">
                      <SelectItem value="Premier League" className="font-bold">Premier League</SelectItem>
                      <SelectItem value="EFL" className="font-bold">EFL</SelectItem>
                      <SelectItem value="Thai League 1" className="font-bold">Thai League 1</SelectItem>
                      <SelectItem value="Thai League 2" className="font-bold">Thai League 2</SelectItem>
                      <SelectItem value="Thai League 3" className="font-bold">Thai League 3</SelectItem>
                      <SelectItem value="French League" className="font-bold">French League</SelectItem>
                      <SelectItem value="Carabao Cup" className="font-bold">Carabao Cup</SelectItem>
                      <SelectItem value="UEFA European" className="font-bold">UEFA European</SelectItem>
                      <SelectItem value="Chang FA Cup" className="font-bold">Chang FA Cup</SelectItem>
                      <SelectItem value="SV League WM_Volleyball" className="font-bold">SV League WM_Volleyball</SelectItem>
                      <SelectItem value="SV League M_Volleyball" className="font-bold">SV League M_Volleyball</SelectItem>
                      <SelectItem value="The Emirates FA Cup" className="font-bold">The Emirates FA Cup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Smart Fill Input (Right) */}
                <div className="md:col-span-8 space-y-2">
                  <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                    Smart Fill Parser
                    <span className="text-amber-500 flex items-center gap-1 normal-case tracking-normal font-bold">
                      <Sparkles size={10} /> Auto-suggest
                    </span>
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Wand2 size={18} className="text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      placeholder='Search or type "Man City vs Arsenal"...'
                      className="pl-12 h-12 text-sm font-bold bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-sm transition-all focus:ring-2 ring-blue-500/10 placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
                      value={form.match}
                      onChange={e => handleMatchNameChange(e.target.value)}
                      autoFocus={!initialData}
                    />
                  </div>
                </div>

                {/* Matchup Hero Row */}
                <div className="md:col-span-12 mt-2">
                  <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-inner relative overflow-hidden group/arena">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-focus-within/arena:opacity-[0.08] transition-opacity">
                      <Swords size={120} />
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                      {/* Team A */}
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield size={14} className="text-red-500 opacity-50" />
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Home</span>
                        </div>
                        <Input
                          placeholder="Search team A..."
                          className="h-12 text-lg font-black bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-zinc-900 dark:text-white placeholder:opacity-30"
                          value={form.teamA}
                          onChange={e => setForm({ ...form, teamA: e.target.value })}
                          required
                        />
                      </div>

                      {/* VS Icon */}
                      <div className="shrink-0 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-sm z-20">
                          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 italic">VS</span>
                        </div>
                        <div className="h-px w-20 bg-zinc-200 dark:bg-zinc-800 absolute top-1/2 -translate-y-1/2 md:hidden" />
                      </div>

                      {/* Team B */}
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex items-center gap-2 mb-1 justify-end">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Away</span>
                          <Shield size={14} className="text-blue-500 opacity-50" />
                        </div>
                        <Input
                          placeholder="Search team B..."
                          className="h-12 text-lg font-black text-right bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-zinc-900 dark:text-white placeholder:opacity-30"
                          value={form.teamB}
                          onChange={e => setForm({ ...form, teamB: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: BROADCAST & DISTRIBUTION */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Broadcast Settings */}
              <div className="space-y-6">
                <SectionLabel icon={Settings2} title="Broadcast" desc="Schedule & Channel Settings" />

                <div className="space-y-4">
                  {/* Date & Time Picker */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Kick-off Schedule</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 justify-between px-4 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-bold shadow-sm group"
                        >
                          <div className="flex items-center gap-3">
                            <CalendarIcon size={16} className="text-blue-500 transition-transform group-hover:scale-110" />
                            <span className="text-zinc-900 dark:text-zinc-200">
                              {form.startDate ? format(parseISO(form.startDate), "EEE, d MMMM yyyy") : "Select Date"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 py-0.5 px-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-[11px]">
                            <Clock size={12} className="text-zinc-400" />
                            {form.startTime || "--:--"}
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-zinc-200 dark:border-zinc-800 shadow-2xl" align="start">
                        <Calendar
                          mode="single"
                          selected={form.startDate ? parseISO(form.startDate) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const yyyy = date.getFullYear();
                              const mm = String(date.getMonth() + 1).padStart(2, '0');
                              const dd = String(date.getDate()).padStart(2, '0');
                              setForm({ ...form, startDate: `${yyyy}-${mm}-${dd}` });
                            }
                          }}
                        />
                        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-blue-500" />
                            <span className="text-xs font-black uppercase text-zinc-400">Set Time</span>
                          </div>
                          <Input
                            type="time"
                            className="w-28 h-9 text-sm font-bold bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                            value={form.startTime}
                            onChange={e => setForm({ ...form, startTime: e.target.value })}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Channel Search */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Master Channel</Label>
                    <div className="relative group/input">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-purple-500 transition-colors pointer-events-none">
                        <Tv size={18} />
                      </div>
                      <Input
                        placeholder="e.g. Sport-T 101"
                        className="pl-12 h-12 text-sm font-bold bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-sm transition-all focus:ring-2 ring-purple-500/10"
                        value={form.channel}
                        onChange={e => setForm({ ...form, channel: e.target.value })}
                      />

                      <div className="hidden group-focus-within/input:block absolute bottom-full left-0 right-0 mb-2 max-h-40 overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 p-1">
                        {[...Array.from({ length: 24 }, (_, i) => `Sport ${i + 1}`), 'Thaileague', 'Sport-T 101', 'Sport-T 102']
                          .filter(opt => opt.toLowerCase().includes((form.channel || '').toLowerCase()))
                          .map(opt => (
                            <div key={opt} onMouseDown={() => setForm({ ...form, channel: opt })} className="px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg cursor-pointer text-xs font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center gap-2">
                              <Hash size={12} className="opacity-30" />
                              {opt}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CDN Distribution Settings */}
              <div className="space-y-6">
                <SectionLabel icon={Globe} title="Distribution" desc="Global CDN Selection" />

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {cdnOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setForm({ ...form, cdn: opt.id })}
                        className={cn(
                          "flex items-center gap-3 px-4 h-12 rounded-xl border text-xs font-black transition-all group/cdn relative overflow-hidden",
                          form.cdn === opt.id
                            ? "bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white text-white dark:text-black shadow-lg"
                            : "bg-white dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600"
                        )}
                      >
                        {/* Selected Indicator Dot */}
                        <div className={cn(
                          "shrink-0 w-2 h-2 rounded-full transition-all",
                          form.cdn === opt.id ? opt.color : "bg-zinc-200 dark:bg-zinc-800 group-hover/cdn:scale-150"
                        )} />
                        <span className="truncate">{opt.label}</span>

                        {/* Subtle background color on selection */}
                        {form.cdn === opt.id && (
                          <div className={cn("absolute inset-0 opacity-[0.05] pointer-events-none", opt.color)} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

          </form>
        </div>

        {/* REFINED FOOTER */}
        <DialogFooter className="px-8 py-6 border-t border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-[#09090b] flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-12 px-6 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-95"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              form="match-form"
              disabled={saving || !isFormValid}
              className={cn(
                "h-12 px-10 font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-[0.97] relative group overflow-hidden",
                initialData
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                  : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 shadow-zinc-500/20"
              )}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : initialData ? (
                <CheckCircle2 size={16} className="mr-2" />
              ) : (
                <Sparkles size={16} className="mr-2" />
              )}
              {saving ? 'Processing...' : initialData ? 'Update & Sync Match' : 'Deploy Match Event'}

              {/* Shine effect on hover */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-[30deg] -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

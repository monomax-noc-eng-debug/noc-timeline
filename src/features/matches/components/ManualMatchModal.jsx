// src/features/matches/components/ManualMatchModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Loader2, Tv, Wand2, Zap, Clock, Save,
  Calendar as CalendarIcon, Check, ChevronsUpDown,
  Globe, Settings2, X
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { configService } from '../../../services/configService';
import { useStore } from '../../../store/useStore'; // ✅ 1. Import Store
import { Link } from 'react-router-dom';

// ✅ Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function ManualMatchModal({ isOpen, onClose, onSubmit, initialData, selectedDate, saving }) {
  const { currentUser } = useStore(); // ✅ 2. ดึง currentUser

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

  const [configs, setConfigs] = useState({ leagues: [], channels: [], cdnOptions: [] });
  const [openChannelBox, setOpenChannelBox] = useState(false);

  useEffect(() => {
    const unsub = configService.subscribeConfigs((data) => setConfigs(data));
    return () => unsub();
  }, []);

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

    // ✅ 3. เตรียมข้อมูล User (รองรับทั้ง Object และ String)
    const userName = typeof currentUser === 'object' ? currentUser?.name : currentUser;
    const userToRecord = userName || 'System';

    // เพิ่ม createdBy หรือ updatedBy ตามกรณี
    const payload = {
      ...form,
      ...(initialData
        ? { updatedBy: userToRecord }
        : { createdBy: userToRecord }
      )
    };

    onSubmit(payload);
  };

  const isFormValid = form.teamA && form.teamB && form.startDate && form.startTime;

  // --- Components ---

  const FieldLabel = ({ children, icon: Icon }) => (
    <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1.5">
      {Icon && <Icon size={12} />}
      {children}
    </Label>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[700px] p-0 gap-0 overflow-hidden bg-white dark:bg-[#09090b] border-zinc-200 dark:border-zinc-800 shadow-2xl block">

        <form id="match-form" onSubmit={handleSubmit}>
          {/* HEADER SECTION */}
          <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 p-6 pb-10 relative overflow-hidden">
            {/* Background Decoration */}

            <DialogHeader className="mb-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                    {initialData ? 'Edit Match Details' : 'Create New Match'}
                    {initialData && <Badge variant="secondary" className="px-2 py-0 h-4 text-[9px] uppercase font-black">Updating</Badge>}
                  </DialogTitle>

                </div>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                    <X size={16} />
                  </Button>
                </DialogClose>
              </div>
            </DialogHeader>

            {/* TOP CONTROLS: Magic Parser & League */}
            <div className="flex flex-col md:flex-row items-center gap-2 relative z-10">
              {/* League Select */}
              <div className="w-full md:w-[140px] shrink-0">
                <Select value={form.league} onValueChange={(val) => setForm({ ...form, league: val })}>
                  <SelectTrigger className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 h-10 shadow-sm text-[11px] font-bold">
                    <SelectValue placeholder="League" />
                  </SelectTrigger>
                  <SelectContent>
                    {configs.leagues.map(league => (
                      <SelectItem key={league} value={league} className="text-xs">{league}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Smart Parser Input */}
              <div className="flex-1 w-full relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Zap size={14} className="text-indigo-500 fill-indigo-500/20" />
                </div>
                <Input
                  placeholder="Paste details to auto-fill..."
                  value={form.match}
                  onChange={(e) => handleMatchNameChange(e.target.value)}
                  className="pl-9 h-10 bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 shadow-sm focus-visible:ring-indigo-500 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* MAIN BODY */}
          <div className="p-6 space-y-8">

            {/* VERSUS SECTION (Hero) */}
            <div className="relative -mt-14 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-5 md:p-6 mx-2">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full space-y-2">
                  <Label className="text-[10px] font-black text-zinc-400 text-center block uppercase tracking-widest">Home Team</Label>
                  <Input
                    value={form.teamA}
                    onChange={e => setForm({ ...form, teamA: e.target.value })}
                    placeholder="Team A"
                    className="h-10 text-center text-base font-bold bg-zinc-50 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-black focus:border-indigo-500 transition-all rounded-xl"
                  />
                </div>

                <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-black text-[10px] border border-zinc-200 dark:border-zinc-700 shadow-sm z-10">
                  VS
                </div>

                <div className="flex-1 w-full space-y-2">
                  <Label className="text-[10px] font-black text-zinc-400 text-center block uppercase tracking-widest">Away Team</Label>
                  <Input
                    value={form.teamB}
                    onChange={e => setForm({ ...form, teamB: e.target.value })}
                    placeholder="Team B"
                    className="h-10 text-center text-base font-bold bg-zinc-50 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-black focus:border-red-500 transition-all rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* METADATA GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

              {/* Left Column: Schedule */}
              <div className="space-y-4 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100/50 dark:border-zinc-800/50">
                  <Settings2 size={16} className="text-zinc-500" />
                  <span className="text-sm font-semibold tracking-tight">Schedule & Source</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <FieldLabel icon={CalendarIcon}>Kick-off Date</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-10 justify-start text-[11px] font-bold bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 shadow-sm",
                            !form.startDate && "text-muted-foreground"
                          )}
                        >
                          <span className="truncate">
                            {form.startDate ? format(parseISO(form.startDate), "dd MMM yyyy") : "Pick date"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.startDate ? parseISO(form.startDate) : undefined}
                          onSelect={(date) => date && setForm({ ...form, startDate: format(date, 'yyyy-MM-dd') })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel icon={Clock}>Kick-off Time</FieldLabel>
                    <div className="flex items-center gap-1">
                      <Select
                        value={form.startTime?.split(':')[0] || "00"}
                        onValueChange={(h) => setForm({ ...form, startTime: `${h}:${form.startTime?.split(':')[1] || '00'}` })}
                      >
                        <SelectTrigger className="h-10 text-[11px] font-bold bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 shadow-sm"><SelectValue placeholder="HH" /></SelectTrigger>
                        <SelectContent position="popper" className="h-48">
                          {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-zinc-400 font-bold">:</span>
                      <Select
                        value={form.startTime?.split(':')[1] || "00"}
                        onValueChange={(m) => setForm({ ...form, startTime: `${form.startTime?.split(':')[0] || '00'}:${m}` })}
                      >
                        <SelectTrigger className="h-10 text-[11px] font-bold bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 shadow-sm"><SelectValue placeholder="MM" /></SelectTrigger>
                        <SelectContent position="popper" className="h-48">
                          {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <FieldLabel icon={Tv}>Channel Source</FieldLabel>
                  <Popover open={openChannelBox} onOpenChange={setOpenChannelBox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openChannelBox}
                        className="w-full justify-between h-10 text-xs"
                      >
                        {form.channel ? form.channel : "Select channel source..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search channel..." />
                        <CommandList>
                          <CommandEmpty>No channel found.</CommandEmpty>
                          <CommandGroup>
                            {configs.channels.map((channel) => (
                              <CommandItem
                                key={channel}
                                value={channel}
                                onSelect={(currentValue) => {
                                  setForm({ ...form, channel: currentValue === form.channel ? "" : currentValue });
                                  setOpenChannelBox(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", form.channel === channel ? "opacity-100" : "opacity-0")} />
                                {channel}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Right Column: Distribution */}
              <div className="space-y-4 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100/50 dark:border-zinc-800/50">
                  <Globe size={16} className="text-zinc-500" />
                  <span className="text-sm font-semibold tracking-tight">Distribution (CDN)</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {configs.cdnOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setForm({ ...form, cdn: opt.id })}
                      className={cn(
                        "cursor-pointer rounded-lg border p-3 flex flex-col gap-2 transition-all hover:border-zinc-400",
                        form.cdn === opt.id
                          ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm"
                          : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className={cn("w-2 h-2 rounded-full", opt.color || "bg-zinc-400")} />
                        {form.cdn === opt.id && <Check size={12} className="text-zinc-900 dark:text-zinc-100" />}
                      </div>
                      <span className="text-xs font-bold truncate">{opt.label}</span>
                    </div>
                  ))}

                  <Link
                    to="/settings/config"
                    className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-2 text-zinc-400 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors"
                  >
                    <Settings2 size={14} />
                    <span className="text-[10px] font-bold uppercase">Manage</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !isFormValid}
              className={cn(
                "h-10 min-w-[140px] font-bold transition-all",
                initialData ? "bg-emerald-600 hover:bg-emerald-700" : ""
              )}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : initialData ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {saving ? 'Processing...' : initialData ? 'Update Match' : 'Create Match'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
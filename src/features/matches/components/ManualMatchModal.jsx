// src/features/matches/components/ManualMatchModal.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { matchSchema } from '../schemas/matchSchema';
import {
  Loader2, Tv, Zap, Clock, Save,
  Calendar as CalendarIcon, Check, ChevronsUpDown,
  Settings2, X, Trophy, Swords, Sparkles, MonitorSmartphone
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { configService } from '../../../services/configService';
import { useStore } from '../../../store/useStore';

// UI Components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormModal } from '../../../components/FormModal';
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

// Standard Date/Time Components
import { DatePicker } from '../../../components/forms/DatePicker';
import { TimeInput } from '../../../components/forms/TimeInput';
import { formatDateAPI } from '../../../utils/formatters';

// Helper components
const SectionLabel = ({ icon: Icon, children }) => (
  <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-1.5 ml-1">
    {Icon && <Icon size={12} className="text-zinc-400" />}
    {children}
  </Label>
);

export default function ManualMatchModal({ isOpen, onClose, onSubmit, initialData, selectedDate, saving }) {
  const { currentUser } = useStore();
  const [configs, setConfigs] = useState({ leagues: [], channels: [], cdnOptions: [] });
  const [openChannelBox, setOpenChannelBox] = useState(false);
  const [openLeagueBox, setOpenLeagueBox] = useState(false);

  // Form Setup
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      league: '',
      match: '',
      teamA: '',
      teamB: '',
      startTime: '',
      startDate: '',
      channel: '',
      cdn: 'AWS'
    }
  });

  // Watchers
  const teamA = watch('teamA');
  const teamB = watch('teamB');

  // Load configs
  useEffect(() => {
    const unsub = configService.subscribeConfigs((data) => setConfigs(data));
    return () => unsub();
  }, []);

  // Reset/Init
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
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
        reset({
          league: '',
          match: '',
          teamA: '',
          teamB: '',
          startTime: format(new Date(), 'HH:mm'),
          startDate: selectedDate || new Date().toISOString().split('T')[0],
          channel: '',
          cdn: 'AWS',
        });
      }
    }
  }, [isOpen, initialData, selectedDate, reset]);

  // Smart Paste
  const handleSmartPaste = (val) => {
    setValue('match', val);
    const separators = [' vs ', ' VS ', ' Vs ', ' - ', ' v '];
    const foundSeparator = separators.find(sep => val.includes(sep));
    if (foundSeparator) {
      const parts = val.split(foundSeparator);
      if (parts.length >= 2) {
        setValue('teamA', parts[0].trim());
        setValue('teamB', parts.slice(1).join(foundSeparator).trim());
      }
    }
  };

  const onFormSubmit = (data) => {
    const userName = typeof currentUser === 'object' ? currentUser?.name : currentUser;
    const userToRecord = userName || 'System';
    const payload = {
      ...data,
      ...(initialData ? { updatedBy: userToRecord } : { createdBy: userToRecord })
    };
    onSubmit(payload);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
      headerClassName="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10"
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shadow-sm">
              {initialData ? <Settings2 size={18} /> : <Sparkles size={18} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {initialData ? 'Match Settings' : 'New Match'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {initialData ? 'Update match details' : 'Add match to schedule'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <X size={16} />
          </Button>
        </div>
      }
      footerClassName="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-end gap-3 rounded-b-lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-lg px-5 text-xs font-bold border-zinc-200 dark:border-zinc-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="match-form"
            disabled={saving}
            className={cn(
              "h-10 rounded-lg px-6 text-xs font-bold shadow-sm transition-all active:scale-95",
              initialData
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-[#0078D4] hover:bg-[#106EBE] text-white"
            )}
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-2" />
                {initialData ? 'Update Match' : 'Save Match'}
              </>
            )}
          </Button>
        </>
      }
      bodyClassName="p-6 space-y-6 bg-zinc-50/50 dark:bg-black/50"
    >
      <form id="match-form" onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col">



        {/* 1. TEAMS SECTION (Card Style) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <SectionLabel icon={Swords}>Matchup</SectionLabel>

            {/* Quick Import (Integrated into header line) */}
            <div className="relative group w-[240px]">
              <Zap size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0078D4] z-10" />
              <input
                {...register('match')}
                placeholder="Auto-fill: 'Team A vs Team B'"
                onChange={(e) => {
                  register('match').onChange(e); // Keep react-hook-form sync
                  handleSmartPaste(e.target.value);
                }}
                className="w-full h-7 pl-8 pr-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0078D4]/20 focus:border-[#0078D4] transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="relative bg-white dark:bg-zinc-900 rounded-lg p-2 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-1">
              {/* Team A */}
              <div className="flex-1">
                <input
                  {...register('teamA')}
                  placeholder="Home Team"
                  className="w-full h-12 text-center text-sm font-bold bg-transparent border-none rounded-lg focus:ring-0 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
                {/* Visual Focus Indicator */}
                <div className={cn("h-0.5 w-12 mx-auto rounded-full bg-zinc-200 dark:bg-zinc-800 transition-all", teamA && "bg-[#0078D4] w-full")} />
                {errors.teamA && <span className="text-[10px] text-red-500 text-center block mt-1">{errors.teamA.message}</span>}
              </div>

              {/* VS Badge */}
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                VS
              </div>

              {/* Team B */}
              <div className="flex-1">
                <input
                  {...register('teamB')}
                  placeholder="Away Team"
                  className="w-full h-12 text-center text-sm font-bold bg-transparent border-none rounded-lg focus:ring-0 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
                <div className={cn("h-0.5 w-12 mx-auto rounded-full bg-zinc-200 dark:bg-zinc-800 transition-all", teamB && "bg-rose-500 w-full")} />
                {errors.teamB && <span className="text-[10px] text-red-500 text-center block mt-1">{errors.teamB.message}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 2. DETAILS GRID */}
        <div className="grid grid-cols-2 gap-4">
          {/* League */}
          <div>
            <SectionLabel icon={Trophy}>League</SectionLabel>
            <Controller
              name="league"
              control={control}
              render={({ field }) => (
                <Popover open={openLeagueBox} onOpenChange={setOpenLeagueBox}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full h-10 justify-between bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-lg">
                      <span className="truncate">{field.value || "Select League"}</span>
                      <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0 rounded-lg z-[200]" align="start">
                    <Command>
                      <CommandInput placeholder="Search..." className="h-9 text-xs" />
                      <CommandList className="max-h-[200px]">
                        <CommandEmpty className="py-3 text-xs text-center text-zinc-500">No results</CommandEmpty>
                        <CommandGroup>
                          {(configs.leagues || []).map((l) => (
                            <CommandItem key={l} value={l} className="text-xs" onSelect={(curr) => {
                              field.onChange(curr === field.value ? "" : curr);
                              setOpenLeagueBox(false);
                            }}>
                              <Check className={cn("mr-2 h-3.5 w-3.5", field.value === l ? "opacity-100" : "opacity-0")} />
                              {l}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.league && <span className="text-[10px] text-red-500 block mt-1">{errors.league.message}</span>}
          </div>

          {/* Channel */}
          <div>
            <SectionLabel icon={Tv}>Channel</SectionLabel>
            <Controller
              name="channel"
              control={control}
              render={({ field }) => (
                <Popover open={openChannelBox} onOpenChange={setOpenChannelBox}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full h-10 justify-between bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-lg">
                      <span className="truncate">{field.value || "Select Channel"}</span>
                      <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0 rounded-lg z-[200]" align="end">
                    <Command>
                      <CommandInput placeholder="Search..." className="h-9 text-xs" />
                      <CommandList className="max-h-[200px]">
                        <CommandEmpty className="py-3 text-xs text-center text-zinc-500">No results</CommandEmpty>
                        <CommandGroup>
                          {(configs.channels || []).map((c) => (
                            <CommandItem key={c} value={c} className="text-xs" onSelect={(curr) => {
                              field.onChange(curr === field.value ? "" : curr);
                              setOpenChannelBox(false);
                            }}>
                              <Check className={cn("mr-2 h-3.5 w-3.5", field.value === c ? "opacity-100" : "opacity-0")} />
                              {c}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          {/* Date */}
          <div>
            <SectionLabel icon={CalendarIcon}>Date</SectionLabel>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  date={field.value ? parseISO(field.value) : undefined}
                  setDate={(d) => d && field.onChange(formatDateAPI(d))}
                  placeholder="Pick date"
                  className="h-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold"
                />
              )}
            />
          </div>

          {/* Time */}
          <div>
            <SectionLabel icon={Clock}>Time</SectionLabel>
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => (
                <TimeInput
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="h-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold"
                />
              )}
            />
            {errors.startTime && <span className="text-[10px] text-red-500 block mt-1">{errors.startTime.message}</span>}
          </div>
        </div>

        {/* 3. CDN SELECTOR */}
        <div>
          <SectionLabel icon={MonitorSmartphone}>CDN Provider</SectionLabel>
          <Controller
            name="cdn"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-4 gap-2">
                {configs.cdnOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => field.onChange(opt.id)}
                    className={cn(
                      "flex flex-col items-center justify-center py-2.5 rounded-lg border transition-all duration-200",
                      field.value === opt.id
                        ? "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 shadow-sm"
                        : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800/50 opacity-60 hover:opacity-100"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full mb-1.5 transition-all", opt.color || "bg-zinc-400", field.value === opt.id && "scale-125")} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          />
        </div>



      </form>
    </FormModal >
  );
}

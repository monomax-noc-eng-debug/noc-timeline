import React, { useState, memo, useCallback, useMemo } from 'react';
import {
  Plus,
  Trophy, Tv, Globe, Tag, AlertTriangle, Layers,
  Settings, Users, LayoutPanelTop, CheckCircle, Clock, Loader2, Save, ArrowLeft,
  X, Trash2, Search, Zap,
  ChevronRight, Hash, BarChart3, LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { configService } from '../services/configService';
import { useConfigs } from '../hooks/useConfigs';
import { useStore } from '../store/useStore';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { hasRole, ROLES } from '../utils/permissions';
import { TimeInput } from '../components/forms/TimeInput';

// --- Improved Editor Component for Large Datasets ---

const SearchableListEditor = memo(({ items = [], onAdd, onRemove, onUpdate, canEdit, title, icon: Icon, placeholder = "Search or Add..." }) => {
  const [query, setQuery] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState('');
  const { toast } = useToast();

  const filteredItems = useMemo(() => {
    if (!query) return items.map((item, idx) => ({ item, idx }));
    const lower = query.toLowerCase();
    return items
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => (typeof item === 'string' ? item : item.label).toLowerCase().includes(lower));
  }, [items, query]);

  const handleAdd = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (items.some(item => (typeof item === 'string' ? item : item.label).toLowerCase() === trimmed.toLowerCase())) {
      toast({ variant: "destructive", title: "Duplicate", description: `"${trimmed}" already exists.` });
      return;
    }
    onAdd(trimmed);
    setQuery('');
  };

  const handleUpdate = (realIdx) => {
    const trimmed = editVal.trim();
    if (trimmed && trimmed !== items[realIdx]) {
      if (items.some((item, i) => i !== realIdx && (typeof item === 'string' ? item : item.label).toLowerCase() === trimmed.toLowerCase())) {
        toast({ variant: "destructive", title: "Duplicate", description: `"${trimmed}" already exists.` });
        return;
      }
      onUpdate(realIdx, trimmed);
    }
    setEditIdx(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
      {/* Header & Search */}
      <div className="shrink-0 p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg shadow-sm">
            <Icon size={16} className="text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">{title}</h3>
            <p className="text-[10px] font-medium text-zinc-400">{items.length} Records</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#0078D4] transition-colors" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canEdit && handleAdd()}
              placeholder={placeholder}
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all placeholder:font-medium"
            />
          </div>
          {canEdit && (
            <button
              onClick={handleAdd}
              disabled={!query.trim()}
              className="px-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {filteredItems.length > 0 ? (
          filteredItems.map(({ item, idx }) => {
            const isEditing = editIdx === idx;
            const display = typeof item === 'string' ? item : item.label;

            return (
              <div key={idx} className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 transition-all">
                {isEditing ? (
                  <input
                    autoFocus
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    onBlur={() => handleUpdate(idx)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleUpdate(idx);
                      if (e.key === 'Escape') setEditIdx(null);
                    }}
                    className="flex-1 bg-transparent text-xs font-semibold text-[#0078D4] dark:text-[#0078D4] outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-600 w-6 shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                    <span
                      onClick={() => { if (canEdit) { setEditIdx(idx); setEditVal(display); } }}
                      className={cn("text-xs font-medium truncate cursor-pointer select-none text-zinc-600 dark:text-zinc-300", canEdit && "hover:text-[#0078D4] dark:hover:text-[#0078D4]")}
                    >
                      {display}
                    </span>
                  </div>
                )}
                {canEdit && !isEditing && (
                  <button
                    onClick={() => onRemove(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 opacity-60">
            <LayoutGrid size={32} strokeWidth={1} className="mb-2" />
            <span className="text-xs font-medium">No items found</span>
          </div>
        )}
      </div>
    </div>
  );
});

// --- Main Page ---

export default function ConfigPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useStore();
  const { configs, setConfigs, ticketOptions, setTicketOptions, projects, setProjects, loading } = useConfigs();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Navigation State
  const [activeCategory, setActiveCategory] = useState('broadcast');

  const canEdit = hasRole(currentUser, [ROLES.LEAD]);
  const markChanged = useCallback(() => setHasChanges(true), []);

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      await Promise.all([
        configService.updateConfigs(configs),
        configService.updateTicketOptions(ticketOptions),
        configService.updateProjects(projects)
      ]);
      toast({ title: "Deployed", description: "Changes synced successfully.", className: "bg-emerald-500 text-white border-none font-bold" });
      setHasChanges(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  // Helper Factories
  const createListActions = (state, setState, key) => ({
    onAdd: (val) => { markChanged(); setState(prev => key ? { ...prev, [key]: [...prev[key], val] } : [...prev, val]); },
    onRemove: (idx) => { markChanged(); setState(prev => key ? { ...prev, [key]: prev[key].filter((_, i) => i !== idx) } : prev.filter((_, i) => i !== idx)); },
    onUpdate: (idx, val) => { markChanged(); setState(prev => key ? { ...prev, [key]: prev[key].map((item, i) => i === idx ? val : item) } : prev.map((item, i) => i === idx ? val : item)); }
  });

  const CDNActions = {
    onAdd: (val) => { markChanged(); setConfigs(p => ({ ...p, cdnOptions: [...p.cdnOptions, { id: val, label: val, color: 'bg-zinc-500' }] })); },
    onRemove: createListActions(configs, setConfigs, 'cdnOptions').onRemove,
    onUpdate: (idx, val) => { /* Complex update for CDN objects if needed, but simplified for list editor */ }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>;

  const MENUS = [
    { id: 'broadcast', label: 'Broadcast', icon: Tv, desc: 'Channels, Leagues, CDN' },
    { id: 'tickets', label: 'Ticketing', icon: Tag, desc: 'Types, Severity, Status' },
    { id: 'org', label: 'Organization', icon: Users, desc: 'Projects, Teams' },
    { id: 'system', label: 'System', icon: Settings, desc: 'Sync, Preferences' },
  ];

  return (
    <div className="h-screen bg-zinc-50 dark:bg-black flex flex-col overflow-hidden">

      {/* Top Bar */}
      <header className="shrink-0 h-14 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ArrowLeft size={18} className="text-zinc-500" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
              <Settings size={16} />
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white leading-none">Registry Hub</h1>
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">{configs.leagues?.length + configs.channels?.length || 0} Records</span>
            </div>
          </div>
        </div>
        {canEdit && (
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={cn("h-9 rounded-md px-6 font-semibold uppercase text-[10px] tracking-widest transition-all", hasChanges ? "bg-[#0078D4] hover:bg-[#106EBE] text-white shadow-sm" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400")}
          >
            {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
            {saving ? 'Saving...' : 'Commit Changes'}
          </Button>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 shrink-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col py-4 overflow-y-auto hidden md:flex">
          <div className="px-4 mb-2 text-[10px] font-semibold text-zinc-400 tracking-widest">Domains</div>
          <div className="space-y-1 px-2">
            {MENUS.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveCategory(m.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                  activeCategory === m.id
                    ? "bg-[#eff6fc] dark:bg-[#0078D4]/20 text-[#0078D4] dark:text-[#0078D4] shadow-sm font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <div className={cn("p-1.5 rounded-md", activeCategory === m.id ? "bg-white dark:bg-zinc-900 shadow-sm text-[#0078D4]" : "text-zinc-400 dark:text-zinc-500")}>
                  <m.icon size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide leading-none mb-0.5">{m.label}</div>
                  <div className="text-[9px] font-medium opacity-70">{m.desc}</div>
                </div>
                {activeCategory === m.id && <ChevronRight size={14} className="ml-auto text-[#0078D4]" />}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden bg-zinc-50/50 dark:bg-black/50 p-4 md:p-6">
          <div className="h-full w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* === BROADCAST PANEL === */}
            {activeCategory === 'broadcast' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                <SearchableListEditor
                  title="Leagues" icon={Trophy}
                  items={configs.leagues} {...createListActions(configs, setConfigs, 'leagues')} canEdit={canEdit}
                />
                <SearchableListEditor
                  title="Channels" icon={Tv}
                  items={configs.channels} {...createListActions(configs, setConfigs, 'channels')} canEdit={canEdit}
                  placeholder="Add Channel..."
                />
                <SearchableListEditor
                  title="CDN Providers" icon={Globe}
                  items={configs.cdnOptions} {...CDNActions} canEdit={canEdit}
                  placeholder="Add Provider..."
                />
              </div>
            )}

            {/* === TICKETS PANEL === */}
            {activeCategory === 'tickets' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
                <SearchableListEditor title="Types" icon={Tag} items={ticketOptions.types} {...createListActions(ticketOptions, setTicketOptions, 'types')} canEdit={canEdit} />
                <SearchableListEditor title="Status" icon={CheckCircle} items={ticketOptions.statuses} {...createListActions(ticketOptions, setTicketOptions, 'statuses')} canEdit={canEdit} />
                <SearchableListEditor title="Severity" icon={AlertTriangle} items={ticketOptions.severities} {...createListActions(ticketOptions, setTicketOptions, 'severities')} canEdit={canEdit} />
                <SearchableListEditor title="Category" icon={Layers} items={ticketOptions.categories} {...createListActions(ticketOptions, setTicketOptions, 'categories')} canEdit={canEdit} />
              </div>
            )}

            {/* === ORG PANEL === */}
            {activeCategory === 'org' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start">
                <div className="lg:col-span-1 h-full flex flex-col gap-4">
                  <SearchableListEditor
                    title="Projects / Tenants"
                    icon={LayoutPanelTop}
                    items={projects}
                    {...createListActions(projects, setProjects)}
                    canEdit={canEdit}
                  />
                </div>

                <div className="lg:col-span-2 h-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SearchableListEditor
                    title="Responsibility Options"
                    icon={Users}
                    items={ticketOptions.responsibilities || []}
                    {...createListActions(ticketOptions, setTicketOptions, 'responsibilities')}
                    canEdit={canEdit}
                    placeholder="Add Name..."
                  />
                  <SearchableListEditor
                    title="Assignee Options"
                    icon={Users}
                    items={ticketOptions.assignees || []}
                    {...createListActions(ticketOptions, setTicketOptions, 'assignees')}
                    canEdit={canEdit}
                    placeholder="Add Assignee..."
                  />
                </div>
              </div>
            )}

            {/* === SYSTEM PANEL === */}
            {activeCategory === 'system' && (
              <div className="max-w-2xl mx-auto h-full overflow-y-auto">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 flex items-center gap-3">
                    <Zap size={18} className="text-[#0078D4]" />
                    <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">Automated Sync</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white">Google Sheet Sync</div>
                        <div className="text-xs text-zinc-500 mt-1">Automatically fetch ticket data daily.</div>
                      </div>
                      <Switch
                        checked={configs.ticketSync?.autoSync}
                        onCheckedChange={(c) => { markChanged(); setConfigs(p => ({ ...p, ticketSync: { ...p.ticketSync, autoSync: c } })); }}
                        disabled={!canEdit}
                        className="data-[state=checked]:bg-[#0078D4]"
                      />
                    </div>
                    {configs.ticketSync?.autoSync && (
                      <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-zinc-400" />
                          <span className="text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">Schedule Time</span>
                        </div>
                        <TimeInput
                          value={configs.ticketSync?.syncTime || '08:00'}
                          onChange={(e) => { markChanged(); setConfigs(p => ({ ...p, ticketSync: { ...p.ticketSync, syncTime: e.target.value } })); }}
                          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 text-xs font-bold outline-none w-[100px] focus:border-[#0078D4]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Mobile Tab Bar (Bottom) - Only show if Sidebar is hidden (md:hidden) */}
      <div className="md:hidden shrink-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 p-2 flex justify-between">
        {MENUS.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveCategory(m.id)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-md transition-all flex-1",
              activeCategory === m.id ? "text-[#0078D4] dark:text-white bg-zinc-50 dark:bg-zinc-900" : "text-zinc-400"
            )}
          >
            <m.icon size={20} className={cn("mb-1", activeCategory === m.id && "fill-current opacity-20")} />
            <span className="text-[9px] font-medium">{m.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
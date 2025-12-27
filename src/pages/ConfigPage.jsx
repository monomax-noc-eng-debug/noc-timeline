// file: src/pages/ConfigPage.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Plus, Trash2, Save, Loader2,
  Trophy, Tv, Globe, LayoutGrid, ArrowLeft, Lock, Tag, AlertTriangle, Layers, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { configService } from '../services/configService';
import { useStore } from '../store/useStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ConfirmModal from '@/components/ui/ConfirmModal';

// Memoized Simple List Editor for Ticket Options
const SimpleListEditor = memo(({ items, onAdd, onRemove, onUpdate, title, icon: Icon, color, canEdit }) => {
  const [newValue, setNewValue] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = useCallback(() => {
    if (newValue.trim()) {
      onAdd(newValue.trim());
      setNewValue('');
    }
  }, [newValue, onAdd]);

  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${color}`}>
            <Icon size={14} className="text-white" />
          </div>
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{title}</span>
          <span className="text-[9px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{items.length}</span>
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="group flex items-center gap-1 px-2 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700">
            {canEdit && editingIndex === idx ? (
              <input
                autoFocus
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { onUpdate(idx, editValue); setEditingIndex(null); }
                  if (e.key === 'Escape') setEditingIndex(null);
                }}
                onBlur={() => { if (editValue.trim()) onUpdate(idx, editValue); setEditingIndex(null); }}
                className="w-20 h-5 px-1 text-[10px] font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 rounded outline-none"
              />
            ) : (
              <span
                onClick={() => { if (canEdit) { setEditingIndex(idx); setEditValue(item); } }}
                className={`text-[10px] font-bold text-zinc-600 dark:text-zinc-300 ${canEdit ? 'cursor-pointer hover:text-blue-500' : ''}`}
              >
                {item}
              </span>
            )}
            {canEdit && (
              <button
                onClick={() => onRemove(idx)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-300 hover:text-red-500 transition-all"
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Input */}
      {canEdit && (
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <input
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            placeholder={`Add ${title.toLowerCase()}...`}
            className="flex-1 h-7 px-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            className="h-7 px-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-[10px] font-bold hover:opacity-90 transition-all"
          >
            <Plus size={12} />
          </button>
        </div>
      )}
    </div>
  );
});
SimpleListEditor.displayName = 'SimpleListEditor';

export default function ConfigPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState({
    leagues: [],
    channels: [],
    cdnOptions: []
  });

  // Ticket Options State (from Firestore)
  const [ticketOptions, setTicketOptions] = useState({
    types: [],
    statuses: [],
    severities: [],
    categories: [],
    subCategories: []
  });

  const [activeTab, setActiveTab] = useState('leagues');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { }, isDanger: false });

  const userRole = typeof currentUser === 'object' ? currentUser?.role : null;
  const canEdit = userRole === 'NOC Lead';

  // Subscribe to configs from Firestore
  useEffect(() => {
    const unsubConfigs = configService.subscribeConfigs((data) => {
      setConfigs(data);
      setLoading(false);
    });

    const unsubTicketOptions = configService.subscribeTicketOptions((data) => {
      setTicketOptions(data);
    });

    return () => {
      unsubConfigs();
      unsubTicketOptions();
    };
  }, []);

  // Save all configs (including ticket options)
  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      // Save main configs
      await configService.updateConfigs(configs);
      // Save ticket options
      await configService.updateTicketOptions(ticketOptions);
      toast({ title: "Saved", description: "All settings saved to database" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const addItem = (key, value) => {
    if (!canEdit || !value.trim()) return;
    if (key === 'cdnOptions') {
      setConfigs({
        ...configs,
        cdnOptions: [...configs.cdnOptions, { id: value, label: value, color: 'bg-zinc-500' }]
      });
    } else {
      setConfigs({
        ...configs,
        [key]: [...configs[key], value]
      });
    }
  };

  const removeItem = (key, index) => {
    if (!canEdit) return;
    const itemToRemove = configs[key][index];
    const label = typeof itemToRemove === 'string' ? itemToRemove : itemToRemove.label;

    setConfirmModal({
      isOpen: true,
      title: 'Remove Item',
      message: `Are you sure you want to remove "${label}"?`,
      isDanger: true,
      onConfirm: () => {
        setConfigs({
          ...configs,
          [key]: configs[key].filter((_, i) => i !== index)
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const updateItem = (key, index, newData) => {
    if (!canEdit) return;
    const newConfigs = { ...configs };
    if (key === 'cdnOptions') {
      newConfigs.cdnOptions = configs.cdnOptions.map((item, i) =>
        i === index ? { ...item, ...newData } : item
      );
    } else {
      newConfigs[key] = configs[key].map((item, i) => i === index ? newData : item);
    }
    setConfigs(newConfigs);
  };

  // Ticket Option Handlers
  const addTicketOption = useCallback((key, value) => {
    if (!canEdit || !value.trim()) return;
    setTicketOptions(prev => ({
      ...prev,
      [key]: [...prev[key], value]
    }));
  }, [canEdit]);

  const removeTicketOption = useCallback((key, index) => {
    if (!canEdit) return;
    const item = ticketOptions[key][index];
    setConfirmModal({
      isOpen: true,
      title: 'Remove Option',
      message: `Remove "${item}" from ${key}?`,
      isDanger: true,
      onConfirm: () => {
        setTicketOptions(prev => ({
          ...prev,
          [key]: prev[key].filter((_, i) => i !== index)
        }));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, [canEdit, ticketOptions]);

  const updateTicketOption = useCallback((key, index, value) => {
    if (!canEdit || !value.trim()) return;
    setTicketOptions(prev => ({
      ...prev,
      [key]: prev[key].map((item, i) => i === index ? value : item)
    }));
  }, [canEdit]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        <p className="mt-4 text-xs font-bold text-zinc-400">Loading...</p>
      </div>
    );
  }

  // --- Sub Component: List Editor ---
  const ListEditor = ({ items, onAdd, onRemove, onUpdate, icon: Icon, title, placeholder, isCdn = false }) => {
    const [newValue, setNewValue] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState('');

    const colors = [
      'bg-zinc-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500',
      'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'
    ];

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
              <Icon size={16} className="text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{title}</h3>
              <p className="text-[10px] text-zinc-400">{items.length} records</p>
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-2">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { onAdd(newValue); setNewValue(''); } }}
                placeholder={placeholder}
                className="h-8 w-48 text-xs"
              />
              <Button
                onClick={() => { onAdd(newValue); setNewValue(''); }}
                className="h-8 px-3 text-[10px] font-bold"
              >
                <Plus size={14} className="mr-1" /> Add
              </Button>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {items.map((item, idx) => (
            <div key={idx} className="group flex items-center justify-between p-3 bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all relative overflow-hidden">
              {isCdn && <div className={`absolute top-0 left-0 w-1 h-full ${item.color || 'bg-zinc-500'}`} />}

              {canEdit && editingIndex === idx ? (
                <Input
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { onUpdate(idx, isCdn ? { ...item, label: editValue, id: editValue } : editValue); setEditingIndex(null); }
                    if (e.key === 'Escape') setEditingIndex(null);
                  }}
                  onBlur={() => { onUpdate(idx, isCdn ? { ...item, label: editValue, id: editValue } : editValue); setEditingIndex(null); }}
                  className="h-6 text-xs"
                />
              ) : (
                <span
                  className={`text-xs font-bold text-zinc-700 dark:text-zinc-200 truncate ${canEdit ? 'cursor-pointer hover:text-blue-500' : ''}`}
                  onClick={() => { if (canEdit) { setEditingIndex(idx); setEditValue(typeof item === 'string' ? item : item.label); } }}
                >
                  {typeof item === 'string' ? item : item.label}
                </span>
              )}

              {canEdit && (
                <button
                  onClick={() => onRemove(idx)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-red-500 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              )}

              {isCdn && canEdit && (
                <div className="absolute bottom-1 left-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => onUpdate(idx, { ...item, color: c })}
                      className={`w-2 h-2 rounded-full ${c} ${item.color === c ? 'ring-1 ring-offset-1 ring-zinc-400' : 'opacity-40 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="py-12 bg-zinc-50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-300">
            <LayoutGrid size={32} className="mb-2 opacity-20" />
            <p className="text-[10px] font-bold">No entries</p>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'leagues', label: 'Leagues', icon: Trophy },
    { id: 'channels', label: 'Channels', icon: Tv },
    { id: 'cdn', label: 'CDNs', icon: Globe },
    { id: 'ticket', label: 'Options', icon: Tag }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-sm font-bold">Master Registry</h1>
          </div>

          <div className="flex items-center gap-2">
            {!canEdit && (
              <div className="flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <Lock size={10} className="text-zinc-400" />
                <span className="text-[9px] font-bold text-zinc-400">READ ONLY</span>
              </div>
            )}

            {canEdit && (
              <Button onClick={handleSave} disabled={saving} size="sm" className="h-8 text-xs font-bold gap-1.5">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save All
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-fit mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === tab.id
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-in fade-in duration-200">
          {activeTab === 'leagues' && (
            <ListEditor
              items={configs.leagues}
              onAdd={(v) => addItem('leagues', v)}
              onRemove={(i) => removeItem('leagues', i)}
              onUpdate={(i, v) => updateItem('leagues', i, v)}
              icon={Trophy}
              title="League Registry"
              placeholder="Add league..."
            />
          )}
          {activeTab === 'channels' && (
            <ListEditor
              items={configs.channels}
              onAdd={(v) => addItem('channels', v)}
              onRemove={(i) => removeItem('channels', i)}
              onUpdate={(i, v) => updateItem('channels', i, v)}
              icon={Tv}
              title="Channel Map"
              placeholder="Add channel..."
            />
          )}
          {activeTab === 'cdn' && (
            <ListEditor
              items={configs.cdnOptions}
              onAdd={(v) => addItem('cdnOptions', v)}
              onRemove={(i) => removeItem('cdnOptions', i)}
              onUpdate={(i, v) => updateItem('cdnOptions', i, v)}
              icon={Globe}
              title="CDN Providers"
              placeholder="Add provider..."
              isCdn={true}
            />
          )}
          {activeTab === 'ticket' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={16} className="text-blue-500" />
                  <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300">Options</h3>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">Configure dropdown options for ticket management. Changes will sync to all users after saving.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SimpleListEditor
                  items={ticketOptions.types || []}
                  onAdd={(v) => addTicketOption('types', v)}
                  onRemove={(i) => removeTicketOption('types', i)}
                  onUpdate={(i, v) => updateTicketOption('types', i, v)}
                  title="Types"
                  icon={Tag}
                  color="bg-blue-500"
                  canEdit={canEdit}
                />
                <SimpleListEditor
                  items={ticketOptions.statuses || []}
                  onAdd={(v) => addTicketOption('statuses', v)}
                  onRemove={(i) => removeTicketOption('statuses', i)}
                  onUpdate={(i, v) => updateTicketOption('statuses', i, v)}
                  title="Statuses"
                  icon={CheckCircle}
                  color="bg-emerald-500"
                  canEdit={canEdit}
                />
                <SimpleListEditor
                  items={ticketOptions.severities || []}
                  onAdd={(v) => addTicketOption('severities', v)}
                  onRemove={(i) => removeTicketOption('severities', i)}
                  onUpdate={(i, v) => updateTicketOption('severities', i, v)}
                  title="Severities"
                  icon={AlertTriangle}
                  color="bg-amber-500"
                  canEdit={canEdit}
                />
                <SimpleListEditor
                  items={ticketOptions.categories || []}
                  onAdd={(v) => addTicketOption('categories', v)}
                  onRemove={(i) => removeTicketOption('categories', i)}
                  onUpdate={(i, v) => updateTicketOption('categories', i, v)}
                  title="Categories"
                  icon={Layers}
                  color="bg-purple-500"
                  canEdit={canEdit}
                />
                <SimpleListEditor
                  items={ticketOptions.subCategories || []}
                  onAdd={(v) => addTicketOption('subCategories', v)}
                  onRemove={(i) => removeTicketOption('subCategories', i)}
                  onUpdate={(i, v) => updateTicketOption('subCategories', i, v)}
                  title="Sub Categories"
                  icon={Layers}
                  color="bg-pink-500"
                  canEdit={canEdit}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        isDanger={confirmModal.isDanger}
      />
    </div>
  );
}
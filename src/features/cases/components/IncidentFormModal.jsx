// file: e:\Project-NOCNTT\noc-timeline\src\features\cases\components\IncidentFormModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X, Save, FolderKanban, Tag, Hash, User, AlertCircle,
  FileText, Activity, Trash2, Download, ShieldCheck,
  AlertTriangle, Clock, CheckCircle2, PlayCircle, XCircle,
  Settings2, Flag, Zap, Layout
} from 'lucide-react';
import { useTicketOptions } from '../../../hooks/useTicketOptions';
import { useProjects } from '../../../hooks/useProjects';
import { cn } from "@/lib/utils";
import { FormModal } from '../../../components/FormModal';

export default function IncidentFormModal({
  isOpen, onClose, incident, onUpdate, onDelete
}) {
  const { ticketOptions } = useTicketOptions();
  const { projects } = useProjects();

  const [formData, setFormData] = useState({
    subject: '',
    project: '',
    type: 'Incident',
    ticket: '',
    status: 'Open',
    priority: 'Medium',
    impact: '',
    root_cause: '',
    action: ''
  });

  useEffect(() => {
    if (incident) {
      setTimeout(() => {
        setFormData({
          subject: incident.subject || '',
          project: incident.project || '',
          type: incident.type || 'Incident',
          ticket: incident.ticket || '',
          status: incident.status || 'Open',
          priority: incident.priority || 'Medium',
          impact: incident.impact || '',
          root_cause: incident.root_cause || '',
          action: incident.action || ''
        });
      }, 0);
    }
  }, [incident, isOpen]);

  const isAutoFormat = formData.subject?.includes('|') && formData.subject?.includes('-');

  const handleSubjectChange = (val) => {
    let updates = { subject: val };
    if (val.includes('|') && val.includes('-')) {
      const parts = val.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        const idProjectPart = parts[0].split('-').map(p => p.trim());
        if (idProjectPart.length >= 2) {
          updates.ticket = idProjectPart[0];
          updates.project = idProjectPart[1];
          const validTypes = ticketOptions?.types || ['Incident', 'Request', 'Maintenance'];
          updates.type = validTypes.find(t => t.toLowerCase() === parts[1].toLowerCase()) || parts[1];
          if (parts.length >= 3) {
            updates.subject = parts.slice(2).join(' | ');
          }
        }
      }
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Error state
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.ticket?.trim()) {
      newErrors.ticket = 'Ticket Identity is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate(formData);
    onClose();
  };

  const getStatusConfig = (s) => {
    const configs = {
      'Open': { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: AlertCircle },
      'Pending': { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: Clock },
      'Succeed': { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
      'Closed': { color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800/50', icon: XCircle }
    };
    return configs[s] || configs['Open'];
  };

  const getPriorityConfig = (p) => {
    const configs = {
      'Critical': { color: 'text-red-500', bg: 'bg-red-500/10' },
      'High': { color: 'text-orange-500', bg: 'bg-orange-500/10' },
      'Medium': { color: 'text-amber-500', bg: 'bg-amber-500/10' },
      'Low': { color: 'text-[#0078D4]', bg: 'bg-[#0078D4]/10' }
    };
    return configs[p] || configs['Medium'];
  };

  const labelClasses = "block text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2 ml-1";
  const inputClasses = "w-full h-11 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:ring-4 focus:ring-[#0078D4]/5 focus:border-[#0078D4] outline-none transition-all";
  const selectClasses = "w-full h-11 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 text-xs font-medium focus:ring-4 focus:ring-[#0078D4]/5 outline-none transition-all cursor-pointer appearance-none";

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
      headerClassName="px-6 py-5 bg-zinc-50/50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5"
      header={
        <>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center shadow-lg">
              <ShieldCheck size={20} className="text-white dark:text-black" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-none">Intelligence Hub</h3>
              <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest mt-1.5 opacity-60">System Configuration Unit</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-rose-500 transition-all active:scale-95">
            <X size={18} />
          </button>
        </>
      }
      footerClassName="p-6 pt-2 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between"
      footer={
        <>
          <button type="button" onClick={onDelete} className="h-11 px-5 rounded-lg bg-rose-500/10 text-rose-500 font-semibold text-[9px] tracking-widest hover:bg-rose-500/20 transition-all flex items-center gap-2">
            <Trash2 size={14} /> Purge Hub
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="h-11 px-6 rounded-lg text-[9px] font-medium text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">Abort</button>
            <button
              type="submit"
              form="incident-form"
              className="h-11 px-8 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-[9px] font-medium shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <Save size={14} /> Commit Changes
            </button>
          </div>
        </>
      }
      bodyClassName="p-6"
    >
      <form id="incident-form" onSubmit={handleSubmit} className="space-y-8">

        {/* Group 1: Protocol Signature (Subject) */}
        <div className="p-5 rounded-lg bg-[#0078D4]/5 border border-[#0078D4]/10 space-y-4">
          <div className="flex items-center justify-between">
            <label className={cn(labelClasses, "text-[#0078D4]")}><Layout size={10} /> Protocol Signature (Subject)</label>
            {isAutoFormat && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Zap size={8} className="text-emerald-500 fill-emerald-500" />
                <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Auto-Parse Active</span>
              </div>
            )}
          </div>
          <textarea
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 rounded-lg p-4 text-sm font-black text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-[#0078D4]/5 focus:border-[#0078D4]/50 min-h-[60px] resize-none transition-all uppercase leading-snug"
            value={formData.subject}
            onChange={e => handleSubjectChange(e.target.value)}
            placeholder=""
          />
        </div>

        {/* Group 2: Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4 p-5 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
            <div>
              <label className={labelClasses}><Activity size={10} className="text-rose-500" /> Operational Status</label>
              <div className="relative">
                <select className={cn(selectClasses, getStatusConfig(formData.status).color)} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  {(ticketOptions.statuses || ['Open', 'Pending', 'Succeed', 'Closed']).map(s => <option key={s} value={s} className="bg-white dark:bg-zinc-950">{s}</option>)}
                </select>
                <Clock size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelClasses}><Flag size={10} className="text-amber-500" /> Criticality Level</label>
              <div className="relative">
                <select className={cn(selectClasses, getPriorityConfig(formData.priority).color)} value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                  {(ticketOptions.severities || ['Critical', 'High', 'Medium', 'Low']).map(p => <option key={p} value={p} className="bg-white dark:bg-zinc-950">{p}</option>)}
                </select>
                <AlertTriangle size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="space-y-4 p-5 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
            <div>
              <label className={labelClasses}>
                <Hash size={10} className="text-[#0078D4]" /> Ticket Identity
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                className={cn(inputClasses, errors.ticket && "border-red-400 focus:border-red-500 focus:ring-red-500/10")}
                value={formData.ticket}
                onChange={e => {
                  setFormData({ ...formData, ticket: e.target.value });
                  if (errors.ticket) setErrors({ ...errors, ticket: null });
                }}
                placeholder="e.g. SVR123456"
              />
              {errors.ticket && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.ticket}</p>}
            </div>
            <div>
              <label className={labelClasses}><FolderKanban size={10} className="text-[#0078D4]" /> Project Reference</label>
              <div className="relative">
                <select
                  className={selectClasses}
                  value={formData.project}
                  onChange={e => setFormData({ ...formData, project: e.target.value })}
                >
                  <option value="" disabled className="bg-white dark:bg-zinc-950">Select Project</option>
                  {(projects && projects.length > 0 ? projects : ['MONOMAX', 'MONO29', '3BB GIGATV']).map(p => (
                    <option key={p} value={p} className="bg-white dark:bg-zinc-950">{p}</option>
                  ))}
                </select>
                <FolderKanban size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Group 3: Technical Archive */}
        <div className="space-y-4">
          <div>
            <label className={labelClasses}><AlertCircle size={10} className="text-rose-500" /> Impact Assessment</label>
            <textarea className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-lg p-4 text-xs font-bold text-zinc-800 dark:text-zinc-200 outline-none focus:ring-4 focus:ring-[#0078D4]/5 focus:border-[#0078D4] min-h-[80px] resize-none transition-all" value={formData.impact} onChange={e => setFormData({ ...formData, impact: e.target.value })} placeholder="" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}><Settings2 size={10} /> Root Cause</label>
              <textarea className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-lg p-4 text-xs font-bold text-zinc-800 dark:text-zinc-200 outline-none focus:ring-4 focus:ring-[#0078D4]/5 focus:border-[#0078D4] min-h-[100px] resize-none transition-all" value={formData.root_cause} onChange={e => setFormData({ ...formData, root_cause: e.target.value })} placeholder="" />
            </div>
            <div>
              <label className={labelClasses}><ShieldCheck size={10} /> Remediation</label>
              <textarea className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-lg p-4 text-xs font-bold text-zinc-800 dark:text-zinc-200 outline-none focus:ring-4 focus:ring-[#0078D4]/5 focus:border-[#0078D4] min-h-[100px] resize-none transition-all" value={formData.action} onChange={e => setFormData({ ...formData, action: e.target.value })} placeholder="" />
            </div>
          </div>
        </div>

      </form>
    </FormModal>
  );
}


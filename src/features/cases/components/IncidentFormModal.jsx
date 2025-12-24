import React, { useState, useEffect } from 'react';
import { X, Save, FolderKanban, Tag, Hash, User, AlertCircle, FileText, Activity } from 'lucide-react';

export default function IncidentFormModal({ isOpen, onClose, incident, onUpdate }) {
  const [formData, setFormData] = useState({
    project: '',
    type: 'Incident',
    ticket: '',
    impact: '',
    root_cause: '',
    action: ''
  });

  useEffect(() => {
    if (incident) {
      setFormData({
        project: incident.project || '',
        type: incident.type || 'Incident',
        ticket: incident.ticket || '',
        impact: incident.impact || '',
        root_cause: incident.root_cause || '',
        action: incident.action || ''
      });
    }
  }, [incident, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  const labelClasses = "block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-2";
  const inputClasses = "w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all";
  const textareaClasses = "w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all resize-none min-h-[80px]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden scale-in-center animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
              <Activity size={18} className="text-white dark:text-black" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Incident Information</h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Modify incident metadata and details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Project */}
            <div>
              <label className={labelClasses}><FolderKanban size={12} /> Project</label>
              <input
                type="text"
                className={inputClasses}
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                placeholder="Project Name"
              />
            </div>

            {/* Type */}
            <div>
              <label className={labelClasses}><Tag size={12} /> Type</label>
              <select
                className={inputClasses}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Incident">Incident</option>
                <option value="Request">Request</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Ticket */}
            <div>
              <label className={labelClasses}><Hash size={12} /> Ticket ID</label>
              <input
                type="text"
                className={inputClasses}
                value={formData.ticket}
                onChange={(e) => setFormData({ ...formData, ticket: e.target.value })}
                placeholder="NO-TICKET"
              />
            </div>

            {/* Reporter (Read Only for now) */}
            <div>
              <label className={labelClasses}><User size={12} /> Reporter</label>
              <input
                type="text"
                className={`${inputClasses} opacity-50 cursor-not-allowed`}
                value={incident.createdBy || 'Unknown'}
                readOnly
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Impact */}
            <div>
              <label className={labelClasses}><AlertCircle size={12} /> Impact</label>
              <textarea
                className={textareaClasses}
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                placeholder="Describe the impact of this incident..."
              />
            </div>

            {/* Root Cause */}
            <div>
              <label className={labelClasses}><FileText size={12} /> Root Cause</label>
              <textarea
                className={textareaClasses}
                value={formData.root_cause}
                onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                placeholder="What was the root cause?"
              />
            </div>

            {/* Action */}
            <div>
              <label className={labelClasses}><Activity size={12} /> Action Taken</label>
              <textarea
                className={textareaClasses}
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                placeholder="What actions were taken to resolve this?"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:opacity-90 active:scale-95 transition-all"
            >
              <Save size={14} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

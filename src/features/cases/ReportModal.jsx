
import React, { useMemo } from 'react';
import { X, Copy, Download, Check, FileText, Activity, AlertTriangle, Workflow, Wrench, Clock, Calendar } from 'lucide-react';

/**
 * ReportModal - Display and copy incident report
 * Shows a beautiful visual preview but copies raw formatted text
 */
export default function ReportModal({ isOpen, onClose, text, incident }) {
  const [copied, setCopied] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('preview'); // 'preview' | 'raw'

  // --- Parsing Logic for Visual Preview ---
  const parsedData = useMemo(() => {
    // MODE 1: Direct Data (High Precision)
    if (incident) {
      // Timeline mapping
      const timeline = (incident.events || []).map(ev => ({
        date: ev.date ? new Date(ev.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
        time: ev.time,
        desc: ev.desc || ev.title,
        originalDate: ev.date // Keep for grouping check
      }));

      return {
        meta: {
          Project: incident.project || '-',
          Subject: incident.subject || '-',
          Status: incident.status || '-',
          Ticket: incident.ticket || '-'
        },
        details: {
          Impact: incident.impact || '-',
          'Root Cause': incident.root_cause || '-',
          'Action Taken': incident.action || '-'
        },
        timeline
      };
    }

    // MODE 2: Text Parsing (Fallback)
    if (!text) return null;

    const result = {
      meta: {},
      details: {},
      timeline: []
    };

    const lines = text.split('\n');
    let isTimeline = false;
    let currentTimelineDate = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Check key-value pairs (Project: Value)
      const colonIndex = line.indexOf(':');
      if (!isTimeline && colonIndex !== -1 && colonIndex < 20) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();

        // Categorize known fields
        if (['Project', 'Subject', 'Status', 'Ticket'].includes(key)) {
          result.meta[key] = value;
        } else if (['Impact', 'Root Cause', 'Action Taken'].includes(key)) {
          result.details[key] = value;
        } else {
          // Fallback context
          result.details[key] = value;
        }
      } else {
        // Timeline Section detection (naive)
        isTimeline = true;

        // Detection of Date Header (e.g. "20 Dec 2025") - usually short and contains year/month
        const isDateHeader = trimmed.length < 20 && /\d/.test(trimmed) && !trimmed.includes('-');

        if (isDateHeader) {
          currentTimelineDate = trimmed;
        } else {
          // Event line logic: "10:00 - Event desc" or "10:43 NOC..."
          // Regex to capture "HH:MM" at start, optional separator (- or :), and the rest
          // Support "03:43 น." as well
          const timeMatch = trimmed.match(/^(\d{1,2}:\d{2})(?:\s*:|\s*-|\s*น\.)?\s*(.*)/);

          if (timeMatch) {
            result.timeline.push({
              date: currentTimelineDate,
              time: timeMatch[1],
              desc: timeMatch[2] || ''
            });
          } else {
            // Fallback: No clear time found at start
            result.timeline.push({
              date: currentTimelineDate,
              time: null,
              desc: trimmed
            });
          }
        }
      }
    });

    return result;
  }, [text, incident]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Incident_Report_${parsedData?.meta['Ticket'] || 'Draft'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#09090b] w-full max-w-3xl h-[85vh] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm">
              <FileText size={24} className="text-zinc-900 dark:text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg text-zinc-900 dark:text-white uppercase tracking-tight">
                Report Preview
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md transition-all ${viewMode === 'preview' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Visual
                </button>
                <div className="w-[1px] h-3 bg-zinc-300 dark:bg-zinc-700" />
                <button
                  onClick={() => setViewMode('raw')}
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md transition-all ${viewMode === 'raw' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Raw Text
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#09090b]">
          {viewMode === 'raw' ? (
            <textarea
              readOnly
              value={text}
              className="w-full h-full p-6 font-mono text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-transparent resize-none border-none outline-none leading-relaxed"
            />
          ) : (
            <div className="p-6 space-y-8">
              {/* 1. Meta Header Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parsedData?.meta && Object.entries(parsedData.meta).map(([key, val]) => (
                  <div key={key} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">{key}</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white block truncate">{val}</span>
                  </div>
                ))}
              </div>

              {/* 2. Details Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Activity size={14} /> Incident Details
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {parsedData?.details && Object.entries(parsedData.details).map(([key, val]) => {
                    let Icon = Activity;
                    if (key.includes('Impact')) Icon = AlertTriangle;
                    if (key.includes('Root')) Icon = Workflow;
                    if (key.includes('Action')) Icon = Wrench;

                    return (
                      <div key={key} className="relative pl-4 border-l-2 border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={12} className="text-zinc-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{key}</span>
                        </div>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium whitespace-pre-wrap leading-relaxed">
                          {val === '-' ? <span className="text-zinc-300 italic">No description provided</span> : val}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Timeline Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Clock size={14} /> Timeline
                </h4>
                <div className="relative space-y-6">
                  {/* Vertical Line */}
                  <div className="absolute top-2 bottom-2 left-[7px] w-[2px] bg-zinc-100 dark:bg-zinc-800" />

                  {parsedData?.timeline.map((event, idx) => (
                    <div key={idx} className="relative pl-8">
                      <div className="absolute left-[2px] top-[6px] w-3 h-3 rounded-full border-2 border-white dark:border-black bg-zinc-300 dark:bg-zinc-700 z-10" />

                      {/* Date Header if changed */}
                      {(idx === 0 || event.date !== parsedData.timeline[idx - 1].date) && (
                        <div className="mb-2 flex items-center gap-2">
                          <Calendar size={12} className="text-zinc-400" />
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{event.date}</span>
                        </div>
                      )}

                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                        {event.time && (
                          <span className="block text-xs font-black text-zinc-900 dark:text-white mb-0.5">{event.time}</span>
                        )}
                        <span className="block text-xs text-zinc-600 dark:text-zinc-400">{event.desc}</span>
                      </div>
                    </div>
                  ))}

                  {parsedData?.timeline.length === 0 && (
                    <div className="text-center py-8 text-zinc-400 text-xs italic">
                      No timeline events recorded.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] flex justify-end gap-3 z-10">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download size={16} /> Download
          </button>
          <button
            onClick={handleCopy}
            disabled={copied}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${copied
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:shadow-xl'
              }`}
          >
            {copied ? (
              <>
                <Check size={16} /> Copied!
              </>
            ) : (
              <>
                <Copy size={16} /> Copy to Clipboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
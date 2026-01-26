import React, { useMemo, useState } from 'react';
import { X, Copy, Check, FileText, Activity, AlertTriangle, Workflow, Wrench, Calendar, ChevronLeft } from 'lucide-react';
import { FormModal } from '../../components/FormModal';
import { getDirectImageUrl } from '../../utils/helpers';
import { useToast } from "@/hooks/use-toast";

/**
 * ReportModal - Responsive Incident Report Preview
 * Native UI design (Zinc theme) with Dark Mode support.
 */
export default function ReportModal({ isOpen, onClose, text, incident }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'raw'
  const { toast } = useToast();

  // --- Parsing Logic ---
  const parsedData = useMemo(() => {
    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      try {
        return new Date(dateStr).toLocaleDateString('th-TH', {
          day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      } catch { return dateStr; }
    };

    if (incident) {
      return {
        header: {
          id: incident.ticket || 'INC-PENDING',
          date: formatDate(incident.createdAt || new Date()),
          status: incident.status || 'Open',
          severity: incident.sev || 'Normal'
        },
        meta: {
          'Subject': incident.subject || '-',
          'Project': incident.project || '-',
          'Reported By': incident.createdBy?.name || '-',
          'Assigned To': incident.assign || '-'
        },
        content: {
          'Incident Description': incident.impact || '-',
          'Root Cause': incident.root_cause || '-',
          'Action Taken': incident.action || '-'
        },
        timeline: (incident.events || []).map(ev => ({
          date: ev.date ? new Date(ev.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
          time: ev.time,
          desc: ev.desc || ev.title,
          images: ev.imageUrls || (ev.image ? [ev.image] : [])
        }))
      };
    }

    // Fallback Text Parsing
    if (!text) return null;

    const result = {
      header: { id: 'LOG-ENTRY', date: new Date().toLocaleDateString('th-TH'), status: '-', severity: '-' },
      meta: {},
      content: {},
      timeline: []
    };

    const lines = text.split('\n');
    let isTimeline = false;
    let currentTimelineDate = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const colonIndex = line.indexOf(':');
      if (!isTimeline && colonIndex !== -1 && colonIndex < 25) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();

        if (['Ticket', 'ID'].includes(key)) result.header.id = value;
        else if (['Status'].includes(key)) result.header.status = value;
        else if (['Subject', 'Project', 'Reported By'].includes(key)) result.meta[key] = value;
        else if (['Impact', 'Description'].includes(key)) result.content['Incident Description'] = value;
        else if (['Root Cause'].includes(key)) result.content['Root Cause'] = value;
        else if (['Action', 'Action Taken'].includes(key)) result.content['Action Taken'] = value;
        else result.meta[key] = value;
      } else {
        isTimeline = true;
        const isDateHeader = trimmed.length < 20 && /\d/.test(trimmed) && !trimmed.includes('-');
        if (isDateHeader) {
          currentTimelineDate = trimmed;
        } else {
          const timeMatch = trimmed.match(/^(\d{1,2}:\d{2})(?:\s*:|\s*-|\s*น\.)?\s*(.*)/);
          if (timeMatch) {
            result.timeline.push({ date: currentTimelineDate, time: timeMatch[1], desc: timeMatch[2] || '' });
          } else {
            result.timeline.push({ date: currentTimelineDate, time: null, desc: trimmed });
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
      toast({ title: "Copied", description: "Ready to paste." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Copy failed." });
    }
  };

  if (!isOpen) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showCloseButton={false}
      headerClassName="flex justify-between items-center px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50"
      header={
        <>
          <div className="flex items-center gap-3">
            {/* Back Button (Always visible) */}
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white mr-2"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hidden sm:block">
              <FileText size={20} className="text-zinc-900 dark:text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-white tracking-tight">
                Incident Report
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-zinc-500 font-mono">#{parsedData?.header.id}</span>
                <div className="w-[1px] h-3 bg-zinc-300 dark:bg-zinc-700" />
                <div className="flex bg-zinc-200 dark:bg-zinc-800 rounded p-[2px]">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                  >
                    Visual
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm transition-all ${viewMode === 'raw' ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                  >
                    Raw
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hidden sm:block p-2 text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </>
      }
      bodyClassName="p-0 overflow-y-auto custom-scrollbar bg-zinc-50 dark:bg-[#09090b]"
      footerClassName="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] flex justify-end gap-3 z-50 sticky bottom-0"
      footer={
        <button
          onClick={handleCopy}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${copied ? 'bg-emerald-500 text-white' : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90'}`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy Text'}
        </button>
      }
    >
      {viewMode === 'raw' ? (
        <div className="p-4 sm:p-6 min-h-[50vh]">
          <textarea
            readOnly
            value={text}
            className="w-full h-full min-h-[60vh] font-mono text-xs sm:text-sm leading-relaxed outline-none resize-none text-zinc-600 dark:text-zinc-300 bg-transparent"
          />
        </div>
      ) : (
        <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto">
          {/* 1. Header Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">{parsedData?.meta['Subject'] || parsedData?.header?.id}</h2>
                <div className="flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {parsedData?.header.date}</span>
                  <span>•</span>
                  <span>{parsedData?.meta['Project'] || 'Monomax'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${parsedData?.header.status === 'Resolved' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-800'}`}>
                  {parsedData?.header.status}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  {parsedData?.header.severity}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Content */}
          <div className="space-y-4">
            {parsedData?.content && Object.entries(parsedData.content).map(([title, content]) => {
              let Icon = Activity;
              if (title.includes('Incident')) Icon = AlertTriangle;
              if (title.includes('Root')) Icon = Workflow;
              if (title.includes('Action')) Icon = Wrench;

              return (
                <div key={title} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                    <Icon size={14} /> {title}
                  </h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {content === '-' ? <span className="text-zinc-400 italic">No details provided.</span> : content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* 3. Timeline */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Activity size={14} /> Sequence of Events
            </h4>

            <div className="relative space-y-8 pl-2">
              {/* Vertical Line */}
              <div className="absolute top-2 bottom-2 left-[7px] w-[2px] bg-zinc-100 dark:bg-zinc-800" />

              {parsedData?.timeline.map((event, idx) => (
                <div key={idx} className="relative pl-8">
                  {/* Dot */}
                  <div className="absolute left-[2px] top-[2px] w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-300 dark:bg-zinc-600 z-10" />

                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 sm:items-baseline mb-1">
                    <span className="text-xs font-black text-zinc-900 dark:text-white shrink-0 w-16">
                      {event.time || '--:--'}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider sm:hidden">
                      {event.date}
                    </span>
                  </div>

                  <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {event.desc}
                  </div>

                  {event.images && event.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                      {event.images.map((img, i) => (
                        <div key={i} className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                          <img
                            src={getDirectImageUrl(img)}
                            className="w-full h-full object-cover"
                            alt="evidence"
                            loading="lazy"
                            onClick={() => window.open(getDirectImageUrl(img), '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {parsedData?.timeline.length === 0 && (
                <div className="text-center py-4 text-zinc-400 text-xs italic">No timeline data available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </FormModal>
  );
}

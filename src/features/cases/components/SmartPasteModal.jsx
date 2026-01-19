import React, { useState, useEffect } from 'react';
import { UploadCloud, ArrowRight, X, Calendar, Clock, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { incidentService } from '../../../services/incidentService';
import { FormModal } from '../../../components/FormModal';

export default function SmartPasteModal({ isOpen, onClose, incidentId, onImportComplete }) {
  const [text, setText] = useState('');
  const [previewEvents, setPreviewEvents] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setText('');
      setPreviewEvents([]);
    }
  }, [isOpen]);

  const parseText = (inputText) => {
    const lines = inputText.split('\n').map(l => l.trim()).filter(l => l);
    const events = [];
    let currentDate = null;
    let currentEvent = null;

    const dateRegex = /^(\d{1,2})\s+(ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)\s+(\d{4})$/;
    const timeRegex = /^(\d{1,2}:\d{2})\s*[-:]\s*(.*)$/;

    const monthMap = {
      'ม.ค.': 0, 'ก.พ.': 1, 'มี.ค.': 2, 'เม.ย.': 3, 'พ.ค.': 4, 'มิ.ย.': 5,
      'ก.ค.': 6, 'ส.ค.': 7, 'ก.ย.': 8, 'ต.ค.': 9, 'พ.ย.': 10, 'ธ.ค.': 11
    };

    lines.forEach(line => {
      // 1. Check Date
      const dateMatch = line.match(dateRegex);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = monthMap[dateMatch[2]];
        const year = parseInt(dateMatch[3]) - 543; // Convert Buddhist Year to AD
        currentDate = new Date(year, month, day);
        // Reset current event on new date? No, new date means future events get this date.
        return;
      }

      // 2. Check Time - Start new event
      const timeMatch = line.match(timeRegex);
      if (timeMatch && currentDate) {
        // Push previous event if exists
        if (currentEvent) events.push(currentEvent);

        const time = timeMatch[1];
        const desc = timeMatch[2];
        const dateStr = currentDate.toISOString().split('T')[0];

        currentEvent = {
          date: dateStr,
          time: time,
          title: desc, // Using title/desc logic
          desc: desc,  // Store in desc
          imageUrls: []
        };
        return;
      }

      // 3. Check Attachments (📎 or https)
      if (currentEvent && (line.includes('📎') || line.startsWith('http'))) {
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          currentEvent.imageUrls.push(urlMatch[0]);
        }
        return;
      }

      // 4. Append Text to current event (Multi-line)
      if (currentEvent) {
        // If it's not a url line we just processed
        if (!line.includes('📎') && !line.startsWith('http')) {
          currentEvent.desc += '\n' + line;
        }
      }
    });

    // Push last event
    if (currentEvent) events.push(currentEvent);

    return events;
  };

  useEffect(() => {
    const events = parseText(text);
    setPreviewEvents(events);
  }, [text]);

  const handleImport = async () => {
    if (previewEvents.length === 0) return;
    setIsProcessing(true);
    try {
      // Add all events
      const promises = previewEvents.map((ev) => {
        return incidentService.createEvent(incidentId, {
          ...ev,
          order: -(new Date(`${ev.date}T${ev.time}`).getTime()) // Sort order fallback
        });
      });
      await Promise.all(promises);

      onImportComplete();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      showCloseButton={false}
      headerClassName="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center shrink-0"
      header={
        <>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0078D4]/10 text-[#0078D4] dark:text-[#4ba0e8] flex items-center justify-center">
              <UploadCloud size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white leading-none">Smart Import</h2>
              <p className="text-[10px] font-medium text-zinc-400 mt-1">Paste timeline text to auto-parse events</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} className="text-zinc-400" />
          </button>
        </>
      }
      bodyClassName="flex flex-1 min-h-0 divide-x divide-zinc-200 dark:divide-zinc-800 p-0 overflow-hidden"
      footerClassName="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-end gap-3 shrink-0"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={previewEvents.length === 0 || isProcessing}
            className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? 'Importing...' : `Import ${previewEvents.length} Events`}
          </button>
        </>
      }
    >
      <div className="flex w-full h-full">
        {/* Left: Input */}
        <div className="flex-1 flex flex-col p-4 bg-white dark:bg-black">
          <textarea
            className="flex-1 w-full h-full resize-none bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 text-xs font-mono border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#0078D4]/30 transition-all custom-scrollbar"
            placeholder={`Paste text here, e.g.:\n13 ธ.ค. 2568\n21:56 - High Usage Alert`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* Right: Preview */}
        <div className="flex-1 flex flex-col min-w-[300px] bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="px-4 py-3 border-b border-zinc-200/50 dark:border-zinc-800 flex justify-between items-center">
            <span className="text-[10px] font-medium text-zinc-400">Preview ({previewEvents.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {previewEvents.map((ev, i) => (
              <div key={i} className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded text-[9px] font-bold text-zinc-500">
                    <Calendar size={10} /> {ev.date}
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0078D4]/10 dark:bg-[#0078D4]/20 rounded text-[9px] font-bold text-[#0078D4] dark:text-[#4ba0e8]">
                    <Clock size={10} /> {ev.time}
                  </div>
                </div>
                <p className="text-xs text-zinc-800 dark:text-zinc-300 font-medium whitespace-pre-wrap leading-snug">{ev.desc}</p>
                {ev.imageUrls.length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {ev.imageUrls.map((url, k) => (
                      <div key={k} className="flex items-center gap-1 px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded max-w-full">
                        <LinkIcon size={10} className="text-zinc-400 shrink-0" />
                        <span className="text-[9px] text-[#0078D4] truncate max-w-[150px]">{url}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {previewEvents.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 gap-2">
                <ArrowRight size={24} />
                <span className="text-[10px] font-semibold">Start typing to see preview</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormModal>
  );
}


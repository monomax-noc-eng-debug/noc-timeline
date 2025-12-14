import React, { useState } from 'react';
import { Plus, Pencil, X, FileText, Trash2, ArrowRight, Copy, Link as LinkIcon, ExternalLink, ChevronUp, ChevronDown, ImagePlus, AlertCircle, CheckCircle2, Clock, PlayCircle, XCircle } from 'lucide-react';

export default function CaseDetail({ incident, onUpdateIncident, onAddEvent, onDeleteEvent, onUpdateEvent, onReorderEvent }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventForm, setEventForm] = useState({ date: '', time: '', desc: '', imageUrls: [] });
  const [currentInputUrl, setCurrentInputUrl] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState('');

  if (!incident) return (
    <div className="lg:col-span-9 flex flex-col items-center justify-center h-full bg-white dark:bg-zinc-900 transition-colors">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-700 flex items-center justify-center mb-4">
        <ArrowRight size={24} className="text-gray-400 dark:text-gray-500" />
      </div>
      <p className="font-bold text-gray-500 dark:text-gray-400">Select an incident</p>
    </div>
  );

  const sortedEvents = [...(incident.events || [])].sort((a, b) => {
    if (typeof a.order === 'number' && typeof b.order === 'number') return a.order - b.order;
    const dateA = a.date || incident.createdAt;
    const dateB = b.date || incident.createdAt;
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return a.time.localeCompare(b.time);
  });

  const moveEvent = (index, direction) => {
    const tempEvents = [...sortedEvents];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tempEvents.length) return;
    [tempEvents[index], tempEvents[targetIndex]] = [tempEvents[targetIndex], tempEvents[index]];
    const reorderedEvents = tempEvents.map((ev, i) => ({ ...ev, order: i }));
    if (onReorderEvent) onReorderEvent(incident.id, reorderedEvents);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30';
      case 'Monitoring': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30';
      case 'Completed':
      case 'Closed': return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <AlertCircle size={14} />;
      case 'In Progress': return <PlayCircle size={14} />;
      case 'Monitoring': return <Clock size={14} />;
      case 'Resolved': return <CheckCircle2 size={14} />;
      case 'Closed': return <XCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  }

  const openAddModal = () => {
    setEditingEventId(null);
    const now = new Date();
    setEventForm({ date: now.toISOString().split('T')[0], time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, desc: '', imageUrls: [] });
    setCurrentInputUrl('');
    setIsModalOpen(true);
  };
  const openEditModal = (ev) => {
    setEditingEventId(ev.id);
    let urls = ev.imageUrls || [];
    if (!urls.length && ev.imageUrl) urls = [ev.imageUrl];
    setEventForm({ ...ev, imageUrls: urls });
    setCurrentInputUrl('');
    setIsModalOpen(true);
  };
  const handleAddImageUrl = () => { if (currentInputUrl.trim()) { setEventForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, currentInputUrl.trim()] })); setCurrentInputUrl(''); } };
  const handleRemoveImageUrl = (indexToRemove) => { setEventForm(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove) })); };
  const handleSubmit = (e) => {
    e.preventDefault();
    const autoTitle = eventForm.desc.trim().split('\n')[0].substring(0, 50) + (eventForm.desc.length > 50 ? '...' : '') || 'Log Update';
    const finalFormPayload = { ...eventForm, title: autoTitle };
    editingEventId ? onUpdateEvent(incident.id, editingEventId, finalFormPayload) : onAddEvent(incident.id, finalFormPayload);
    setIsModalOpen(false);
  };

  const generateReportText = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, '-').toLowerCase();

    const groupedEvents = {};
    sortedEvents.forEach(ev => {
      const d = ev.date ? new Date(ev.date) : new Date();
      const dateKey = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
      if (!groupedEvents[dateKey]) groupedEvents[dateKey] = [];
      groupedEvents[dateKey].push(ev);
    });

    let report = `Project: ${incident.project || '-'}\n`;
    report += `Subject: ${incident.type || 'Incident'} | ${incident.subject || '-'} | ${dateStr}\n`;
    report += `Status: ${incident.status || '-'}\n`;
    report += `Ticket: ${incident.ticket || '-'}\n`;
    report += `Impact: ${incident.impact || '-'}\n`;
    report += `Root Cause: ${incident.root_cause || '-'}\n`;
    report += `Action Taken: ${incident.action || '-'}\n\n`;

    Object.keys(groupedEvents).forEach(dateLabel => {
      report += `${dateLabel}\n`;
      groupedEvents[dateLabel].forEach(ev => { report += `${ev.time} - ${ev.desc || ev.title}\n`; });
      report += `\n`;
    });
    return report;
  };
  const handlePreview = () => { setPreviewText(generateReportText()); setIsPreviewOpen(true); };

  const inputClasses = "w-full bg-transparent border-b-2 border-gray-200 dark:border-zinc-700 hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white font-bold text-xs text-gray-900 dark:text-white transition-all pb-0.5 placeholder-gray-400 dark:placeholder-zinc-600 outline-none";
  const labelClasses = "block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5";
  const textareaClasses = "w-full text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 rounded-lg p-2 border-2 border-gray-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-black dark:focus:border-white transition-all resize-none placeholder-gray-400 dark:placeholder-zinc-600 outline-none";

  return (
    <div className="lg:col-span-9 flex flex-col h-full bg-white dark:bg-zinc-900 relative transition-colors duration-300 overflow-hidden">

      {/* HEADER */}
      <div className="px-5 py-4 border-b-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 z-10 shadow-sm shrink-0">
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-12 gap-x-4 gap-y-3 mb-3 items-end">
          <div className="group col-span-2 lg:col-span-2"><label className={labelClasses}>Project</label><input type="text" className={inputClasses} value={incident.project} onChange={(e) => onUpdateIncident(incident.id, { project: e.target.value })} /></div>
          <div className="group col-span-2 lg:col-span-1"><label className={labelClasses}>Type</label><select value={incident.type || 'Incident'} onChange={(e) => onUpdateIncident(incident.id, { type: e.target.value })} className={`${inputClasses} cursor-pointer appearance-none`}><option className="dark:bg-zinc-800" value="Incident">Incident</option><option className="dark:bg-zinc-800" value="Request">Request</option><option className="dark:bg-zinc-800" value="Maintenance">Maintenance</option></select></div>
          <div className="group col-span-2 lg:col-span-2"><label className={labelClasses}>Ticket ID</label><input type="text" className={`${inputClasses} font-mono`} value={incident.ticket} onChange={(e) => onUpdateIncident(incident.id, { ticket: e.target.value })} /></div>

          <div className="group col-span-2 lg:col-span-2">
            <label className={labelClasses}>Status</label>
            <div className={`relative flex items-center h-7.5 w-full rounded-lg border-2 transition-all px-2 ${getStatusStyle(incident.status)}`}>
              <div className="mr-2 flex-none">{getStatusIcon(incident.status)}</div>
              <select value={incident.status || 'Open'} onChange={(e) => onUpdateIncident(incident.id, { status: e.target.value })} className="w-full bg-transparent font-black uppercase text-[10px] tracking-widest cursor-pointer appearance-none outline-none z-10"><option className="bg-white dark:bg-zinc-900 text-black dark:text-white" value="Open">Open</option><option className="bg-white dark:bg-zinc-900 text-black dark:text-white" value="In Progress">In Progress</option><option className="bg-white dark:bg-zinc-900 text-black dark:text-white" value="Monitoring">Monitoring</option><option className="bg-white dark:bg-zinc-900 text-black dark:text-white" value="Resolved">Resolved</option><option className="bg-white dark:bg-zinc-900 text-black dark:text-white" value="Completed">Completed</option><option className="bg-white dark:bg-zinc-900 text-black dark:text-white" value="Closed">Closed</option></select>
              <ChevronDown size={14} className="absolute right-2 opacity-50 pointer-events-none" />
            </div>
          </div>

          <div className="col-span-4 lg:col-span-3"><label className={labelClasses}>Subject / Alert</label><input type="text" className="w-full text-lg font-black text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-zinc-700 border-none bg-transparent p-0 focus:ring-0 leading-tight" value={incident.subject} onChange={(e) => onUpdateIncident(incident.id, { subject: e.target.value })} placeholder="Subject..." /></div>
          <div className="col-span-4 flex justify-end lg:col-span-1 lg:justify-start">
            <button onClick={handlePreview} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1.5 border-2 border-transparent hover:border-gray-200 dark:hover:border-zinc-700 rounded-lg lg:mb-1 mt-1 lg:mt-0" title="View Report">
              <FileText size={18} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['impact', 'root_cause', 'action'].map((field) => (<div key={field}><label className={labelClasses}>{field.replace('_', ' ')}</label><textarea className={`${textareaClasses} h-15`} value={incident[field] || ''} onChange={(e) => onUpdateIncident(incident.id, { [field]: e.target.value })} placeholder="..." /></div>))}
        </div>
      </div>

      {/* TIMELINE LIST (IMPROVED RESPONSIVE) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 custom-scrollbar bg-gray-50 dark:bg-zinc-950 relative transition-colors min-h-0">
        <div className="flex flex-col pb-20 relative">

          {/* ✅ เส้น Timeline หลัก (วาดเส้นยาวตลอดแนว) */}
          <div className="absolute top-0 bottom-0 left-6.5 sm:left-10.75 w-0.75 bg-gray-200 dark:bg-zinc-800 z-0"></div>

          {sortedEvents.map((ev, index) => {
            const showDateHeader = index === 0 || ev.date !== sortedEvents[index - 1].date;
            const dateLabel = ev.date ? new Date(ev.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
            const isLastItem = index === sortedEvents.length - 1;
            let displayImages = ev.imageUrls || [];
            if (!displayImages.length && ev.imageUrl) displayImages = [ev.imageUrl];

            return (
              <div key={ev.id} className="relative flex items-start gap-4 sm:gap-6 mb-8 z-10">

                {/* 1. Timeline Column (Left) */}
                <div className="flex-none w-14 sm:w-22.5 flex flex-col items-center pt-1 z-10">
                  {/* จุด (Dot) - เด่นชัดขึ้น */}
                  <div className="w-4 h-4 rounded-full bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-md ring-4 ring-gray-50 dark:ring-zinc-950 z-20"></div>

                  {/* เวลา - อยู่ใต้จุด */}
                  <div className="mt-2 flex flex-col items-center">
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-center">
                      {ev.time}
                    </span>
                  </div>
                </div>

                {/* 2. Content Card (Right) */}
                <div className="flex-1 min-w-0">

                  {/* Date Header (แทรกเข้ามาระหว่าง Timeline กับ Card เมื่อเปลี่ยนวัน) */}
                  {showDateHeader && (
                    <div className="mb-4 -mt-2">
                      <span className="inline-block text-[10px] font-black text-white dark:text-black uppercase tracking-widest bg-black dark:bg-white px-3 py-1 rounded-full shadow-md opacity-90">
                        {dateLabel}
                      </span>
                    </div>
                  )}

                  <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border-2 border-gray-200 dark:border-zinc-800 shadow-sm flex gap-4 relative group/card hover:border-black dark:hover:border-white transition-all duration-200 hover:shadow-md">

                    {/* ลูกศรชี้ไปที่ Timeline (Triangle) */}
                    <div className="absolute top-5 -left-2.25 w-4 h-4 bg-white dark:bg-zinc-900 border-l-2 border-b-2 border-gray-200 dark:border-zinc-800 transform rotate-45 group-hover/card:border-black dark:group-hover/card:border-white transition-colors duration-200"></div>

                    {/* ปุ่ม Up/Down */}
                    <div className="flex flex-col gap-1 justify-center border-r pr-3 border-gray-100 dark:border-zinc-800 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <button onClick={() => moveEvent(index, 'up')} disabled={index === 0} className="p-1 text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-0 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-all"><ChevronUp size={16} /></button>
                      <button onClick={() => moveEvent(index, 'down')} disabled={isLastItem} className="p-1 text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-0 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-all"><ChevronDown size={16} /></button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mr-4">{ev.title || ev.time}</h3>
                        <div className="flex gap-2 flex-none opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(ev)} className="text-gray-400 hover:text-black dark:hover:text-white" title="Edit Event"><Pencil size={12} /></button>
                          <button onClick={() => onDeleteEvent(incident.id, ev.id)} className="text-gray-400 hover:text-red-500" title="Delete Event"><Trash2 size={12} /></button>
                        </div>
                      </div>
                      {ev.desc && <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-3">{ev.desc}</p>}
                      {displayImages.length > 0 && (
                        <div className={`grid gap-3 mt-3 ${displayImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1 max-w-md'}`}>
                          {displayImages.map((url, imgIndex) => (
                            <div key={imgIndex} className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 relative group/image h-auto shadow-sm">
                              <img src={url} className="w-full h-auto block" alt={`Evidence ${imgIndex + 1}`} onError={(e) => e.target.style.display = 'none'} />
                              <a href={url} target="_blank" rel="noreferrer" className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1.5 rounded-lg opacity-0 group-hover/image:opacity-100 transition backdrop-blur-sm"><ExternalLink size={14} /></a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={openAddModal} className="absolute bottom-6 right-6 bg-black dark:bg-white text-white dark:text-black w-14 h-14 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 border-4 border-white dark:border-zinc-800 transition-all z-20 flex items-center justify-center active:scale-95"><Plus size={24} strokeWidth={3} /></button>

      {/* MODALS */}
      {(isModalOpen || isPreviewOpen) && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          {isModalOpen && (
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl border-2 border-gray-300 dark:border-zinc-700 shadow-2xl p-6 animate-in zoom-in-95 relative">
              <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">{editingEventId ? 'Edit Event' : 'New Event'}</h3><button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-black dark:hover:text-white"><X size={20} /></button></div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/2 space-y-1"><label className={labelClasses}>Date</label><input required type="date" className={`${inputClasses} bg-gray-50 dark:bg-zinc-800 rounded-lg p-2.5 border-2 border-gray-300 dark:border-zinc-700 focus:border-black dark:focus:border-white`} value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} /></div>
                  <div className="w-1/2 space-y-1"><label className={labelClasses}>Time</label><input required type="time" className={`${inputClasses} bg-gray-50 dark:bg-zinc-800 rounded-lg p-2.5 border-2 border-gray-300 dark:border-zinc-700 focus:border-black dark:focus:border-white`} value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} /></div>
                </div>
                <div className="space-y-1"><label className={labelClasses}>Description (Details)</label><textarea required rows={5} placeholder="What happened?..." className={`${textareaClasses} h-auto`} value={eventForm.desc} onChange={e => setEventForm({ ...eventForm, desc: e.target.value })} /></div>
                <div className="space-y-2">
                  <label className={labelClasses}>Image Links (Optional)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1"><LinkIcon size={14} className="absolute left-3 top-3 text-gray-400" /><input type="text" placeholder="Paste image URL here..." className={`${inputClasses} bg-gray-50 dark:bg-zinc-800 rounded-lg p-2.5 pl-9 border-2 border-gray-300 dark:border-zinc-700 focus:border-black dark:focus:border-white`} value={currentInputUrl} onChange={e => setCurrentInputUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())} /></div>
                    <button type="button" onClick={handleAddImageUrl} disabled={!currentInputUrl.trim()} className="px-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-lg border-2 border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"><ImagePlus size={18} /></button>
                  </div>
                  {eventForm.imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2 max-h-37.5 overflow-y-auto custom-scrollbar p-1">
                      {eventForm.imageUrls.map((url, index) => (
                        <div key={index} className="relative group/preview rounded-lg overflow-hidden border-2 border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 h-20 flex items-center justify-center">
                          <img src={url} alt="Preview" className="h-full w-full object-cover" onError={(e) => e.target.style.opacity = '0.3'} />
                          <button type="button" onClick={() => handleRemoveImageUrl(index)} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover/preview:opacity-100 transition-opacity shadow-sm hover:bg-red-600"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md border-2 border-transparent hover:border-black dark:hover:border-white">SAVE EVENT</button>
              </form>
            </div>
          )}
          {isPreviewOpen && (
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl h-[70vh] rounded-2xl border-2 border-gray-300 dark:border-zinc-700 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 relative">
              <div className="flex justify-between items-center p-5 border-b-2 border-gray-300 dark:border-zinc-700"><h3 className="font-black text-lg text-gray-900 dark:text-white uppercase">Preview</h3><button onClick={() => setIsPreviewOpen(false)} className="text-gray-400 hover:text-black dark:hover:text-white"><X size={20} /></button></div>
              <textarea readOnly value={previewText} className="flex-1 p-6 font-mono text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-950 resize-none border-none outline-none custom-scrollbar" />
              <div className="p-5 border-t-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex justify-end"><button onClick={() => { navigator.clipboard.writeText(previewText); alert('Copied!'); setIsPreviewOpen(false); }} className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-md flex items-center gap-2 border-2 border-transparent hover:border-black dark:hover:border-white"><Copy size={16} /> Copy to Clipboard</button></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
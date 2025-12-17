import React, { useState } from 'react';
import {
  FileText, Plus, Search, Download, XCircle, Sun, Moon, Filter, X, Check, Copy, Pencil, Trash2, CheckCircle2, AlertTriangle, Eye, Clock, Users, Calendar
} from 'lucide-react';
import { useShiftLogic } from '../hooks/useShiftLogic';
import ShiftHandoverForm from '../features/handover/ShiftHandoverForm';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

// --- DATA MOCK ---
const NOC_MEMBERS_DEFAULT = [
  { id: 'NOC-1', name: 'Mekin S.', role: 'NOC' },
  { id: 'NOC-2', name: 'Akkapol P.', role: 'NOC' },
  { id: 'NOC-3', name: 'Nawapat R.', role: 'NOC' },
  { id: 'NOC-4', name: 'Watcharapol P.', role: 'NOC' },
  { id: 'NOC-5', name: 'Supporter', role: 'NOC' }
];

// --- COMPONENT: SHIFT DETAIL MODAL ---
const ShiftDetailModal = ({ log, isOpen, onClose, nocMembers }) => {
  if (!isOpen || !log) return null;
  const isAllAck = nocMembers.every(m => (log.acknowledgedBy || []).includes(m.name));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-[#F3F4F6] dark:bg-[#111]">
        <div className="px-6 py-4 flex justify-between items-start border-b border-gray-200 bg-white dark:bg-[#000] dark:border-[#333]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${log.status === 'Normal' ? 'bg-[#1F2937] text-white border-transparent' : 'bg-red-500 text-white border-transparent'}`}>
                {log.status}
              </span>
              <span className="text-xs text-gray-400 font-mono">ID: {log.id.slice(0, 8)}...</span>
            </div>
            <h2 className="text-xl font-bold text-[#1F2937] dark:text-[#F2F2F2] flex items-center gap-2">
              {log.shift === 'Morning' ? <Sun className="text-[#1F2937] dark:text-[#F2F2F2]" size={20} /> : <Moon className="text-gray-500" size={20} />}
              {log.shift} Shift
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 dark:text-[#F2F2F2] dark:hover:bg-[#222] transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6 bg-[#F3F4F6] dark:bg-[#111]">
          <div className="flex gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-[#333] rounded-lg text-[#1F2937] dark:text-[#F2F2F2] shadow-sm"><Calendar size={18} /></div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Date</p>
                <p className="text-sm font-bold text-[#1F2937] dark:text-[#F2F2F2]">{new Date(log.date).toLocaleDateString('en-GB', { dateStyle: 'long' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-[#333] rounded-lg text-[#1F2937] dark:text-[#F2F2F2] shadow-sm"><Clock size={18} /></div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Time</p>
                <p className="text-sm font-bold text-[#1F2937] dark:text-[#F2F2F2]">{log.time}</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border shadow-sm bg-white dark:bg-[#222] border-gray-200 dark:border-[#333]">
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Log Note</p>
            <p className="text-sm whitespace-pre-line leading-relaxed text-[#1F2937] dark:text-[#F2F2F2]">
              {log.note || "No details provided."}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase mb-2 flex items-center gap-2 text-gray-500"><Users size={12} /> On Duty</p>
              <div className="flex flex-wrap gap-2">
                {log.onDuty.map((name, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-medium shadow-sm bg-[#1F2937] text-white dark:bg-[#F2F2F2] dark:text-[#000000]">{name}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <p className="text-[10px] font-bold uppercase text-gray-500">Acknowledgments</p>
                {isAllAck && <span className="text-[10px] font-bold text-white bg-[#1F2937] px-2 py-0.5 rounded-full">All Ack</span>}
              </div>
              <div className="space-y-1">
                {nocMembers.map((member, i) => {
                  const isAck = (log.acknowledgedBy || []).includes(member.name);
                  return (
                    <div key={i} className={`flex items-center gap-2 p-1.5 rounded-lg text-xs transition-all ${isAck ? 'bg-gray-200 text-[#1F2937] font-bold dark:bg-[#333] dark:text-[#F2F2F2]' : 'text-gray-400 grayscale opacity-70'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${isAck ? 'bg-[#1F2937] text-white dark:bg-[#F2F2F2] dark:text-[#000000]' : 'bg-gray-300 text-gray-600 dark:bg-[#333] dark:text-[#666]'}`}>
                        {isAck ? <Check size={10} strokeWidth={4} /> : null}
                      </div>
                      {member.name}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 flex justify-end bg-gray-50 border-t border-gray-200 dark:bg-[#000] dark:border-[#333]">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-[#1F2937] hover:bg-gray-50 transition-colors shadow-sm dark:bg-[#222] dark:border-[#444] dark:text-[#F2F2F2] dark:hover:bg-[#333]">Close</button>
        </div>
      </div>
    </div>
  );
};

export default function ShiftHandoverPage({ currentUser, nocMembers = NOC_MEMBERS_DEFAULT }) {
  const {
    history, loading,
    filterDate, setFilterDate,
    searchText, setSearchText,
    toast, setToast,
    handleDelete, handleSave, handleAcknowledge, handleExportCSV
  } = useShiftLogic(currentUser);

  const [filterShift, setFilterShift] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const filteredHistory = history.filter(log => {
    const term = searchText.toLowerCase();
    const matchSearch = (
      (log.note && log.note.toLowerCase().includes(term)) ||
      log.onDuty.some(m => m.toLowerCase().includes(term)) ||
      log.status.toLowerCase().includes(term)
    );
    const matchDate = !filterDate || log.date === filterDate;
    const matchShift = filterShift === 'All' || log.shift === filterShift;
    const matchStatus = filterStatus === 'All' || log.status === filterStatus;
    return matchSearch && matchDate && matchShift && matchStatus;
  });

  const openCreateModal = () => { if (!currentUser) return setToast({ show: true, message: "Please select 'I am' first!", type: 'error' }); setIsEditing(false); setEditingData(null); setIsModalOpen(true); };
  const openEditModal = (e, log) => { e.stopPropagation(); setIsEditing(true); setEditingData(log); setIsModalOpen(true); };
  const openDetailModal = (log) => { setEditingData(log); setIsDetailOpen(true); };
  const requestDelete = (e, id) => { e.stopPropagation(); setConfirmModal({ isOpen: true, title: 'Delete Log?', message: 'This action cannot be undone.', isDanger: true, onConfirm: async () => { await handleDelete(id); setConfirmModal({ isOpen: false }); } }); };
  const submitForm = async (formData) => { const success = await handleSave(formData, isEditing, editingData?.id); if (success) setIsModalOpen(false); };
  const requestAck = (e, log, memberName) => { e.stopPropagation(); const isAlreadyAck = (log.acknowledgedBy || []).includes(memberName); if (!isAlreadyAck) { handleAcknowledge(log, memberName); } else { setConfirmModal({ isOpen: true, title: 'Revoke Ack?', message: `Remove acknowledgment for ${memberName}?`, isDanger: true, onConfirm: async () => { await handleAcknowledge(log, memberName); setConfirmModal({ isOpen: false }); } }); } };
  const formatDateDisplay = (date) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });

  return (
    <div className="h-full bg-[#F3F4F6] dark:bg-[#000000] p-3 sm:p-6 font-sans flex flex-col transition-colors duration-300">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />}
      <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false })} {...confirmModal} />
      <ShiftHandoverForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={submitForm} initialData={editingData} isEditing={isEditing} currentUser={currentUser} isLoading={loading} />
      <ShiftDetailModal log={editingData} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} nocMembers={nocMembers} />

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight text-[#1F2937] dark:text-[#F2F2F2]">
              <span className="bg-white text-[#1F2937] p-1.5 rounded-lg shadow-sm border border-gray-200 dark:bg-[#333] dark:text-[#F2F2F2] dark:border-[#444]"><FileText size={20} /></span> Shift Handover
            </h1>
            <p className="text-xs mt-1 ml-1 font-mono text-gray-500">{filteredHistory.length} LOGS RECORDED</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative grow md:grow-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full md:w-48 h-10 pl-9 pr-3 border-none rounded-xl text-sm font-medium outline-none bg-white text-[#1F2937] focus:ring-2 focus:ring-gray-300 shadow-sm dark:bg-[#111] dark:text-[#F2F2F2] dark:focus:ring-[#F2F2F2]" />
              {searchText && <button onClick={() => setSearchText('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"><XCircle size={12} /></button>}
            </div>
            <button onClick={() => handleExportCSV(filteredHistory)} className="h-10 w-10 flex items-center justify-center rounded-xl transition-colors shadow-sm bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-black dark:bg-[#111] dark:text-[#F2F2F2] dark:border-[#333]">
              <Download size={18} />
            </button>
            <button onClick={openCreateModal} className="h-10 px-4 bg-[#1F2937] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-all flex items-center gap-2 dark:bg-[#F2F2F2] dark:text-[#000000]">
              <Plus size={18} /> <span className="hidden sm:inline">NEW LOG</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="h-9 w-full bg-white dark:bg-[#111] border-none rounded-lg px-3 text-xs font-bold text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-gray-300 shadow-sm" />
          <div className="relative">
            <select value={filterShift} onChange={(e) => setFilterShift(e.target.value)} className="w-full h-9 pl-3 pr-8 bg-white dark:bg-[#111] border-none rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 appearance-none outline-none focus:ring-2 focus:ring-gray-300 shadow-sm cursor-pointer">
              <option value="All">All Shifts</option><option value="Morning">Morning</option><option value="Night">Night</option>
            </select>
            <Sun size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full h-9 pl-3 pr-8 bg-white dark:bg-[#111] border-none rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 appearance-none outline-none focus:ring-2 focus:ring-gray-300 shadow-sm cursor-pointer">
              <option value="All">All Status</option><option value="Normal">Normal</option><option value="Issue Found">Issues</option>
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {(filterDate || filterShift !== 'All' || filterStatus !== 'All' || searchText) && (
            <button onClick={() => { setFilterDate(''); setFilterShift('All'); setFilterStatus('All'); setSearchText(''); }} className="h-9 w-full border border-dashed border-gray-300 text-gray-400 rounded-lg text-xs font-bold hover:text-black hover:border-gray-400 dark:hover:text-white transition-colors">RESET FILTERS</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
        {filteredHistory.length === 0 && !loading ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 dark:bg-[#111] dark:border-[#333]">
            <div className="inline-flex p-4 rounded-full mb-3 bg-white dark:bg-[#333]"><FileText size={32} className="text-gray-300 dark:text-gray-600" /></div>
            <p className="text-gray-400 font-medium">No logs found.</p>
          </div>
        ) : (
          filteredHistory.map((log) => {
            const isIssue = log.status !== 'Normal';
            const ackList = log.acknowledgedBy || [];
            return (
              <div key={log.id} onClick={() => openDetailModal(log)} className="group relative rounded-xl p-4 shadow-sm hover:shadow-lg border cursor-pointer flex flex-col sm:flex-row gap-4 transition-all bg-white border-gray-100 hover:border-gray-300 dark:bg-[#111] dark:border-[#333] dark:hover:border-[#F2F2F2]">
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:w-32 shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-[#333] pb-3 sm:pb-0 sm:pr-4">
                  <div className={`p-2.5 rounded-xl ${log.shift === 'Morning' ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-indigo-500 dark:bg-[#333] dark:text-indigo-300'}`}>
                    {log.shift === 'Morning' ? <Sun size={24} /> : <Moon size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1F2937] dark:text-[#F2F2F2]">{formatDateDisplay(log.date)}</h3>
                    <p className="text-xs font-mono text-gray-400">{log.time}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${isIssue ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-[#333] dark:text-emerald-400 dark:border-[#444]'}`}>
                      {isIssue ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />} {log.status}
                    </span>
                    <div className="flex -space-x-1">
                      {log.onDuty.map((name, i) => (
                        <div key={i} title={name} className="w-5 h-5 rounded-full border border-white bg-[#1F2937] flex items-center justify-center text-[8px] font-bold text-white shadow-sm">{name[0]}</div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2 leading-relaxed text-[#1F2937]/80 dark:text-[#F2F2F2]/80">
                    {log.note || <span className="italic opacity-50">No note recorded...</span>}
                  </p>
                </div>
                <div className="flex sm:flex-col justify-between items-end gap-3 sm:w-40 shrink-0 sm:pl-4 sm:border-l border-gray-100 dark:border-[#333]">
                  <div className="flex -space-x-1.5 py-1">
                    {nocMembers.map((member, i) => {
                      const isAck = ackList.includes(member.name);
                      return (
                        <button key={i} onClick={(e) => requestAck(e, log, member.name)} title={member.name} className={`w-7 h-7 rounded-full border-2 border-white dark:border-[#111] flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 z-0 hover:z-10 ${isAck ? 'bg-[#1F2937] text-white shadow-sm dark:bg-[#F2F2F2] dark:text-[#000000]' : 'bg-gray-200 text-gray-400 grayscale dark:bg-[#333] dark:text-[#666]'} ${(member.name === currentUser && !isAck) ? 'ring-2 ring-blue-200 ring-offset-1 animate-pulse' : ''}`}>
                          {isAck ? <Check size={12} strokeWidth={4} /> : member.name[0]}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); openDetailModal(log); }} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg dark:hover:bg-[#333] dark:hover:text-[#F2F2F2]"><Eye size={16} /></button>
                    <button onClick={(e) => openEditModal(e, log)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg dark:hover:bg-[#333] dark:hover:text-[#F2F2F2]"><Pencil size={16} /></button>
                    <button onClick={(e) => requestDelete(e, log.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
// file: src/features/ticket/components/TicketDetailPanel.jsx
// View-only "Reading Pane" style component for ticket details
import React, { memo } from 'react';
import { format } from 'date-fns';
import {
  X, Edit, Trash2, ArrowRightCircle, User,
  Calendar, AlertTriangle, Activity, Tag, CheckCircle2, Layout,
  Info, ChevronLeft, Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- Detail Item Helper ---
const DetailItem = ({ label, value, icon: Icon, className }) => (
  <div className={cn("space-y-1", className)}>
    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">
      {Icon && <Icon size={12} className="text-[#0078D4]" />}
      {label}
    </div>
    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words">
      {value || '-'}
    </div>
  </div>
);

const TicketDetailPanel = memo(({
  ticket,
  onClose,
  onEdit,
  onDelete,
  onSendToIncident,
  canEdit
}) => {
  if (!ticket) return null;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">

      {/* 1. Toolbar / Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all lg:hidden"
          >
            <X size={20} />
          </button>
          {/* Breadcrumb / ID */}
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs">#{ticket.ticketNumber}</span>
            <span>/</span>
            <span>{ticket.type}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {canEdit && (
            <>
              <button
                onClick={() => onEdit(ticket)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
              >
                <Edit size={16} />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => onDelete(ticket.ticketNumber)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                title="Delete Ticket"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-2" />

          <button
            onClick={() => onSendToIncident(ticket)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#0078D4] hover:bg-[#0078D4]/10 rounded-md transition-colors"
            title="Convert to Incident"
          >
            <ArrowRightCircle size={16} />
            <span className="hidden sm:inline">To Incident</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 ml-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all hidden lg:block"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2. Reading Pane Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-900">
        <div className="p-6 max-w-5xl mx-auto space-y-8">

          {/* Header Section */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white leading-tight">
              {ticket.shortDesc}
            </h1>

            <div className="flex items-center gap-3 pb-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-full bg-[#0078D4]/10 text-[#0078D4] flex items-center justify-center font-bold text-lg">
                {ticket.assign ? ticket.assign.charAt(0).toUpperCase() : <User size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-900 dark:text-white text-sm">
                    {ticket.assign || 'Unassigned'}
                  </span>
                  <span className="text-zinc-400 text-xs">•</span>
                  <span className="text-zinc-500 text-xs">
                    {ticket.createdAt ? format(new Date(ticket.createdAt), 'EEE, MMM d, yyyy h:mm a') : '-'}
                  </span>
                </div>
                <div className="text-xs text-zinc-500">
                  Responsibility: {ticket.responsibility || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Properties Grid (Outlook Style Info Bar) */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            <DetailItem
              label="Status"
              value={ticket.status}
              icon={Activity}
            />
            <DetailItem
              label="Severity"
              value={ticket.severity}
              icon={AlertTriangle}
              className={ticket.severity === 'Critical' ? 'text-red-600' : ''}
            />
            <DetailItem
              label="Category"
              value={ticket.category}
              icon={Layout}
            />
            <DetailItem
              label="Sub-Category"
              value={ticket.subCategory}
              icon={Tag}
            />
          </div>

          {/* Main Content / Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-[#0078D4] rounded-full" />
              Description
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {ticket.details || 'No description provided.'}
            </div>
          </div>

          {/* Additional Info (Action, Remarks) */}
          {(ticket.action || ticket.resolvedDetail || ticket.remark) && (
            <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              {ticket.action && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Action Taken</h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-md border border-amber-100 dark:border-amber-900/20">
                    {ticket.action}
                  </p>
                </div>
              )}

              {ticket.resolvedDetail && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={12} /> Resolution
                  </h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {ticket.resolvedDetail}
                  </p>
                </div>
              )}

              {ticket.remark && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Remarks</h3>
                  <p className="text-sm text-zinc-500 italic">
                    "{ticket.remark}"
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
});

TicketDetailPanel.displayName = 'TicketDetailPanel';

export default TicketDetailPanel;

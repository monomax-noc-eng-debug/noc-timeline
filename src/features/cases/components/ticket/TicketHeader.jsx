import React from 'react';
import {
  ArrowLeft, Calendar, Hash, Download, FileText,
  Edit3, Trash2, MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function TicketHeader({
  incident,
  onBack,
  onExport,
  onGenerateReport,
  onEdit,
  onDelete,
  canEdit
}) {
  if (!incident) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'succeed': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'closed': return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
      case 'open': return 'bg-[#0078D4]/15 text-[#0078D4] dark:text-[#4ba0e8] border-[#0078D4]/30 dark:border-[#0078D4]/50';
      case 'pending': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="px-3 md:px-5 py-3">
      {/* Single Row Layout */}
      <div className="flex items-start gap-3">
        {/* Back Button (Mobile Only) */}
        <button
          onClick={onBack}
          className="mt-0.5 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all active:scale-95 lg:hidden shrink-0"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          {/* Meta Row */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
            <span className="flex items-center gap-0.5">
              <Hash size={10} />
              {incident.ticket || 'NO-TICKET'}
            </span>
            <span className="text-zinc-300 dark:text-zinc-600">•</span>
            <span className="flex items-center gap-0.5">
              <Calendar size={10} />
              {incident.createdAt ? format(new Date(incident.createdAt), 'dd MMM yy') : '-'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-base md:text-lg font-black text-zinc-900 dark:text-zinc-100 leading-tight truncate">
            {incident.subject}
          </h1>

          {/* Badges */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                "rounded-md border text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5",
                getStatusColor(incident.status)
              )}
            >
              {incident.status}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-md border-zinc-200 dark:border-zinc-700 text-[9px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5"
            >
              {incident.type}
            </Badge>
            {incident.project && (
              <Badge
                variant="secondary"
                className="rounded-md text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5"
              >
                {incident.project}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions - Collapsible into dropdown on mobile */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onExport}
              className="h-8 w-8 text-zinc-400 hover:text-[#0078D4]"
              title="Export CSV"
            >
              <Download size={14} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onGenerateReport}
              className="h-8 w-8 text-zinc-400 hover:text-[#0078D4]"
              title="Generate Report"
            >
              <FileText size={14} />
            </Button>

            {canEdit && (
              <>
                <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  title="Edit Details"
                >
                  <Edit3 size={14} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="h-8 w-8 text-zinc-400 hover:text-red-600"
                  title="Delete Case"
                >
                  <Trash2 size={14} />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400"
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onExport} className="gap-2">
                <Download size={14} />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onGenerateReport} className="gap-2">
                <FileText size={14} />
                Generate Report
              </DropdownMenuItem>
              {canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onEdit} className="gap-2">
                    <Edit3 size={14} />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="gap-2 text-red-600 focus:text-red-600">
                    <Trash2 size={14} />
                    Delete Case
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
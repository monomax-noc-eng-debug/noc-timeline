import React, { memo } from 'react';
import { Search, X, SlidersHorizontal, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * FilterBar Component (Common Header System)
 * Designed to match the Timeline/CaseList aesthetic.
 * 
 * Structure:
 * - Row 1: Title/Icon | View Toggles | Actions
 * - Row 2: Search Bar | Filter Toggle (Mobile/Desktop)
 * - Row 3: Quick Filter Pills (Optional)
 */
const FilterBar = memo(({
  icon: Icon,
  title,
  viewToggle, // React Node for View Switcher (Tabs/Pills)
  actions = [], // [{ label, icon, onClick, variant, disabled, hideTextOnMobile }]

  // Search Props
  searchTerm,
  onSearch,
  searchPlaceholder = "Search...",

  // Filter Props
  isFilterActive,
  onFilterClick, // Toggle specific filter modal/panel

  // Quick Filters (Pills)
  quickFilters = [], // [{ label, count, color, isActive, onClick }]

  className
}) => {
  return (
    <div className={cn("flex flex-col bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-20 sticky top-0", className)}>

      {/* --- Row 1: Top Bar --- */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        {/* Icon & Title */}
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-8 h-8 rounded-md bg-[#0078D4] text-white flex items-center justify-center shrink-0">
              <Icon size={16} />
            </div>
          )}
          {title && (
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white hidden sm:block">{title}</h1>
          )}
        </div>

        {/* View Toggle Slot */}
        {viewToggle && (
          <div className="ml-2">
            {viewToggle}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1.5 opacity-100 transition-opacity whitespace-nowrap">
          {actions.map((action, idx) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={idx}
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  "flex items-center gap-1.5 h-8 px-3 rounded-md text-[10px] sm:text-xs font-semibold uppercase tracking-wide transition-all",
                  action.variant === 'primary'
                    ? "bg-[#0078D4] hover:bg-[#106EBE] text-white shadow-sm"
                    : action.variant === 'ghost'
                      ? "bg-transparent text-zinc-500 hover:text-[#0078D4] hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-none px-2"
                      : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm",
                  action.disabled && "opacity-50 cursor-not-allowed"
                )}
                title={action.label}
              >
                {ActionIcon && <ActionIcon size={14} />}
                {action.label && <span className={action.hideTextOnMobile ? "hidden sm:inline" : ""}>{action.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Row 2: Search + Filter Toggle --- */}
      <div className="flex gap-2 px-3 pb-2">
        <div className="relative flex-1 group">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#0078D4] transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-8 pl-8 pr-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-transparent text-xs font-normal focus:bg-white dark:focus:bg-zinc-900 focus:ring-1 focus:ring-[#0078D4] text-zinc-900 dark:text-white placeholder:text-zinc-500 transition-all outline-none"
          />
          {searchTerm && (
            <button onClick={() => onSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-600 transition-colors">
              <X size={12} />
            </button>
          )}
        </div>

        {onFilterClick && (
          <button
            onClick={onFilterClick}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-lg transition-all border",
              isFilterActive
                ? "bg-[#deecf9] text-[#0078D4] border-[#0078D4]/20"
                : "bg-white dark:bg-zinc-900 text-zinc-600 border-zinc-200 dark:border-zinc-800"
            )}
            title="Filters"
          >
            <SlidersHorizontal size={14} />
          </button>
        )}
      </div>

      {/* --- Row 3: Quick Filter Pills (Optional) --- */}
      {quickFilters.length > 0 && (
        <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto no-scrollbar">
          {quickFilters.map((filter) => (
            <button
              key={filter.label}
              onClick={filter.onClick}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all whitespace-nowrap shrink-0 border",
                filter.isActive
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600 shadow-sm"
                  : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              {filter.color && (
                <span className={cn("w-1.5 h-1.5 rounded-full", filter.color)} />
              )}
              {filter.label}
              {filter.count !== undefined && (
                <span className="opacity-50 ml-0.5">({filter.count})</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

export default FilterBar;

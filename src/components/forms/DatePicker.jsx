import React from 'react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

/**
 * Reusable DatePicker Component
 * 
 * @param {Date} date - Current date (Date Object or undefined)
 * @param {Function} setDate - Function to update the date
 * @param {String} placeholder - Placeholder text when no date is selected
 * @param {String} className - Additional CSS classes
 * @param {Boolean} showNavigation - Show prev/next day buttons (default: false)
 * @param {Boolean} showTodayButton - Show "Today" reset button only when NOT today (default: true when showNavigation is true)
 * @param {String} dateFormat - Display format (default: "dd/MM/yyyy")
 * @param {String} displayFormat - Alternative display format for compact mode (e.g., "d MMM")
 * @param {Boolean} disabled - Disable the picker
 */
export function DatePicker({
  date,
  setDate,
  placeholder = "Pick a date",
  className,
  showNavigation = false,
  showTodayButton,
  dateFormat = "dd/MM/yyyy",
  displayFormat,
  disabled = false
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Check if current date is today
  const isCurrentDateToday = date ? isToday(date) : false;

  // Default showTodayButton to true when showNavigation is enabled
  // Only show Today button when the selected date is NOT today
  const shouldShowToday = (showTodayButton ?? showNavigation) && !isCurrentDateToday;

  const handlePrevDay = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (date) {
      setDate(subDays(date, 1));
    } else {
      setDate(subDays(new Date(), 1));
    }
  };

  const handleNextDay = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (date) {
      setDate(addDays(date, 1));
    } else {
      setDate(addDays(new Date(), 1));
    }
  };

  const handleToday = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setDate(new Date());
  };

  // Simple mode (no navigation)
  if (!showNavigation) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, dateFormat) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[100]" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setIsOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Navigation mode (with prev/next buttons)
  return (
    <div className={cn(
      "flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden",
      disabled && "opacity-50 pointer-events-none",
      className
    )}>
      {/* Prev Day */}
      <button
        type="button"
        onClick={handlePrevDay}
        disabled={disabled}
        className="w-9 h-11 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Date Display - Opens Calendar Picker */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="flex flex-col items-center justify-center px-3 h-11 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors min-w-[80px] disabled:opacity-50"
          >
            {date ? (
              <>
                <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wide">
                  {format(date, displayFormat || 'd MMM')}
                </span>
                <span className="text-[10px] font-bold text-zinc-400">
                  {format(date, 'yyyy')}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-zinc-400 uppercase">
                {placeholder}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[100]" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setIsOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Next Day */}
      <button
        type="button"
        onClick={handleNextDay}
        disabled={disabled}
        className={cn(
          "w-9 h-11 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border-l border-zinc-200 dark:border-zinc-800 disabled:opacity-50",
          shouldShowToday && "border-r"
        )}
      >
        <ChevronRight size={16} />
      </button>

      {/* Today Button - Only shows when NOT today */}
      {shouldShowToday && (
        <button
          type="button"
          onClick={handleToday}
          disabled={disabled}
          className="w-10 h-11 flex items-center justify-center text-[#0078D4] hover:text-[#106EBE] hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          title="Go to Today"
        >
          <RotateCcw size={14} />
        </button>
      )}
    </div>
  );
}
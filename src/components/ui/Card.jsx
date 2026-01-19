import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

/**
 * Universal Card Component
 * Supports multiple variants, status colors, selection states, and accent bars
 */

// Card container variants using CVA (Outlook-style: flatter corners)
const cardVariants = cva(
  // Base styles - Outlook uses less rounded corners
  "relative rounded-lg transition-all duration-150 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
        interactive: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-[0.99] cursor-pointer",
        flat: "bg-white dark:bg-zinc-900",
        ghost: "bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900",
      },
      status: {
        none: "",
        live: "border-red-500 shadow-lg shadow-red-500/20",
        soon: "border-orange-400 shadow-lg shadow-orange-500/10",
        finished: "border-emerald-500/30 dark:border-emerald-500/20",
        upcoming: "border-zinc-200 dark:border-zinc-800",
        normal: "border-emerald-500/30 dark:border-emerald-500/20",
        issues: "border-red-500/30 dark:border-red-500/20",
        open: "border-rose-500/30 dark:border-rose-500/20",
        pending: "border-amber-500/30 dark:border-amber-500/20",
        resolved: "border-emerald-500/30 dark:border-emerald-500/20",
      },
      selected: {
        true: "bg-white dark:bg-zinc-800/80 border-[#0078D4]/50 shadow-md scale-[1.01] z-10",
        false: "",
      },
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-5 sm:p-6",
      }
    },
    defaultVariants: {
      variant: "default",
      status: "none",
      selected: false,
      size: "md"
    }
  }
);

// Accent bar variants
const accentVariants = cva(
  "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
  {
    variants: {
      accent: {
        none: "bg-transparent",
        live: "bg-red-500 animate-pulse",
        soon: "bg-orange-500",
        finished: "bg-emerald-500",
        upcoming: "bg-zinc-300 dark:bg-zinc-700",
        normal: "bg-emerald-500",
        issues: "bg-red-500",
        blue: "bg-[#0078D4]",
        indigo: "bg-[#0078D4]",
        open: "bg-rose-500",
        pending: "bg-amber-500",
        resolved: "bg-emerald-500",
        closed: "bg-zinc-400",
      }
    },
    defaultVariants: {
      accent: "none"
    }
  }
);

const Card = memo(({
  children,
  className,
  onClick,
  variant = 'default',
  status = 'none',
  accent = 'none',
  selected = false,
  size = 'md',
  showAccent = false,
  ...props
}) => {
  // Determine accent color - use status if showAccent is true and no explicit accent
  const effectiveAccent = showAccent && accent === 'none' ? status : accent;

  return (
    <div
      className={cn(
        cardVariants({ variant, status, selected, size }),
        // Add padding-left offset when accent bar is shown
        effectiveAccent !== 'none' && 'pl-4',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
      {...props}
    >
      {/* Accent Bar */}
      {effectiveAccent !== 'none' && (
        <div className={cn(accentVariants({ accent: effectiveAccent }))} />
      )}

      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;

// Export variants for external use
export { cardVariants, accentVariants };

import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * FormModal - Modal มาตรฐานที่ยืดหยุ่นสำหรับทั้งโปรเจค
 * 
 * รองรับทั้ง Simple Forms และ Complex Modals
 * 
 * @param {boolean} isOpen - สถานะเปิด/ปิด Modal
 * @param {function} onClose - ฟังก์ชันเมื่อกดปิด
 * @param {string} title - หัวข้อของ Modal (ถ้าไม่ใช้ header prop)
 * @param {string} description - คำอธิบายเพิ่มเติม (ถ้ามี)
 * @param {ReactNode} header - Custom header component (แทนที่ default header)
 * @param {ReactNode} children - เนื้อหาฟอร์ม
 * @param {ReactNode} footer - ปุ่ม Action / Custom footer
 * @param {boolean} isLoading - สถานะกำลังโหลด
 * @param {string} size - ขนาด: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
 * @param {string} variant - สไตล์: 'default' | 'minimal' | 'glass'
 * @param {boolean} showCloseButton - แสดงปุ่มปิดมุมขวาบน
 * @param {boolean} closeOnBackdrop - ปิดเมื่อกดพื้นหลัง
 * @param {string} className - Custom class สำหรับ content container
 * @param {string} bodyClassName - Custom class สำหรับ body/children area
 * @param {string} headerClassName - Custom class สำหรับ header
 * @param {string} footerClassName - Custom class สำหรับ footer
 */

// ========== SIZE PRESETS ==========
const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  '3xl': 'max-w-7xl',
  full: 'max-w-none w-full h-full sm:max-w-[95vw] sm:h-[95vh]'
};

// ========== VARIANT STYLES ==========
const VARIANTS = {
  default: {
    backdrop: 'bg-black/50 backdrop-blur-sm',
    container: 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl',
    header: 'border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950',
    footer: 'border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50'
  },
  minimal: {
    backdrop: 'bg-black/40 backdrop-blur-sm',
    container: 'bg-white dark:bg-zinc-900 shadow-xl',
    header: 'border-b border-zinc-100 dark:border-zinc-800',
    footer: 'border-t border-zinc-100 dark:border-zinc-800'
  },
  glass: {
    backdrop: 'bg-zinc-950/60 backdrop-blur-md',
    container: 'bg-white/95 dark:bg-[#0a0a0a]/95 border border-zinc-200/50 dark:border-white/5 shadow-2xl backdrop-blur-xl',
    header: 'border-b border-zinc-100/50 dark:border-white/5 bg-zinc-50/50 dark:bg-white/5',
    footer: 'border-t border-zinc-100/50 dark:border-white/5 bg-zinc-50/30 dark:bg-white/5'
  },
  premium: {
    backdrop: 'bg-zinc-950/70 backdrop-blur-md',
    container: 'bg-white dark:bg-[#050505] border border-zinc-100 dark:border-zinc-800/50 shadow-2xl',
    header: 'border-b border-zinc-50 dark:border-zinc-800/50 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900/50 dark:to-transparent',
    footer: 'border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-[#0a0a0a]'
  }
};

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  header,
  children,
  footer,
  isLoading = false,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnBackdrop = true,
  className,
  bodyClassName,
  headerClassName,
  footerClassName,
  icon: HeaderIcon,
  iconClassName
}) {
  // ไม่แสดงถ้า isOpen = false
  if (!isOpen) return null;

  const styles = VARIANTS[variant] || VARIANTS.default;
  const sizeClass = SIZES[size] || SIZES.md;

  const handleBackdropClick = () => {
    if (closeOnBackdrop && !isLoading) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose();
    }
  };

  // Effect for keyboard listener
  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isLoading]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6",
        styles.backdrop,
        "animate-in fade-in duration-200"
      )}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "w-full flex flex-col overflow-hidden",
          "max-h-full sm:max-h-[95vh]",
          "sm:rounded-lg md:rounded-lg",
          sizeClass,
          styles.container,
          "animate-in zoom-in-95 duration-200",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========== HEADER ========== */}
        {(header || title) && (
          <div className={cn(
            "shrink-0 px-5 py-4 flex items-center justify-between",
            styles.header,
            headerClassName
          )}>
            {header ? (
              header
            ) : (
              <div className="flex items-center gap-2.5">
                {HeaderIcon && (
                  <div className={cn(
                    "w-8 h-8 rounded flex items-center justify-center",
                    iconClassName || "bg-[#deecf9] text-[#0078D4]"
                  )}>
                    <HeaderIcon size={18} />
                  </div>
                )}
                <div>
                  <h2 className="text-base font-semibold text-zinc-800 dark:text-white">
                    {title}
                  </h2>
                  {description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Close Button */}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded transition-all",
                  "text-zinc-400 hover:text-zinc-600 dark:hover:text-white",
                  "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  "disabled:opacity-50"
                )}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* ========== BODY ========== */}
        <div className={cn(
          "flex-1 overflow-y-auto custom-scrollbar",
          bodyClassName || "p-5"
        )}>
          {children}
        </div>

        {/* ========== FOOTER ========== */}
        {footer && (
          <div className={cn(
            "shrink-0 px-5 py-3",
            styles.footer,
            footerClassName
          )}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ========== HELPER COMPONENTS ==========

/**
 * FormModalFooter - Footer มาตรฐาน (Cancel + Submit)
 */
export function FormModalFooter({
  onCancel,
  onSubmit,
  submitLabel = "บันทึก",
  cancelLabel = "ยกเลิก",
  isSubmitting = false,
  submitVariant = "default",
  submitClassName,
  showCancel = true,
  leftContent,
  formId
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Left side - optional content */}
      <div className="hidden sm:block">
        {leftContent}
      </div>

      {/* Right side - buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
        {showCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-9 px-4 rounded-md text-sm font-medium"
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type={formId ? "submit" : "button"}
          form={formId}
          variant={submitVariant}
          onClick={onSubmit}
          disabled={isSubmitting}
          className={cn(
            "h-9 px-5 rounded-md text-sm font-medium",
            "flex items-center justify-center gap-2",
            submitClassName
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              กำลังบันทึก...
            </>
          ) : submitLabel}
        </Button>
      </div>
    </div>
  );
}

/**
 * FormModalSection - Section wrapper สำหรับจัดกลุ่ม form fields
 */
export function FormModalSection({ title, icon: Icon, children, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {Icon && <Icon size={14} className="text-[#0078D4]" />}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * FormModalDivider - เส้นคั่นระหว่าง sections
 */
export function FormModalDivider({ className }) {
  return (
    <hr className={cn(
      "border-dashed border-zinc-200 dark:border-zinc-800 my-6",
      className
    )} />
  );
}

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';

// 1. สร้าง Context
const ToastContext = createContext();

// 2. Hook สำหรับเรียกใช้
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// --- Component แสดงผล Toast ---
function Toast({ message, type = 'info', onClose, className = '' }) {

  // ✅ 1. ป้องกันการแสดงผลถ้าไม่มีข้อความ
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  };

  const styles = {
    success: 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/25',
    error: 'bg-red-500 text-white border-red-600 shadow-red-500/25',
    warning: 'bg-orange-500 text-white border-orange-600 shadow-orange-500/25',
    info: 'bg-blue-500 text-white border-blue-600 shadow-blue-500/25'
  };

  return (
    <div className={`
      flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border-2
      ${styles[type] || styles.info}
      ${className}
    `}>
      <div className="shrink-0">{icons[type]}</div>
      <p className="text-sm font-bold pr-2">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/20 transition-colors rounded-lg ml-2">
        <X size={16} />
      </button>
    </div>
  );
}

// 3. Provider (สำหรับ Global Usage)
export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* เงื่อนไข toast && ... สำคัญมาก เพื่อไม่ให้แสดงกล่องเปล่า */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export default Toast;
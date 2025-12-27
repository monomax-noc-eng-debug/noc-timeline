import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import MainLayout from './components/MainLayout';
import { Loader2 } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";

// Pages - Lazy Loaded
const LoginPage = lazy(() => import('./pages/LoginPage'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const ShiftHandoverPage = lazy(() => import('./pages/ShiftHandoverPage'));
const TicketLogPage = lazy(() => import('./pages/TicketLogPage'));
const TodayPage = lazy(() => import('./pages/schedule/TodayPage'));
const HistoryPage = lazy(() => import('./pages/schedule/HistoryPage'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
const ConfigPage = lazy(() => import('./pages/ConfigPage'));

// Loading Fallback
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4">
    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
    <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Loading Protocol...</p>
  </div>
);

/**
 * ProtectedRoute: ส่วนตรวจสอบสิทธิ์การเข้าถึง
 * หากไม่มีผู้ล็อกอิน (currentUser) จะดีดกลับไปหน้า /login ทันที
 */
const ProtectedRoute = ({ children }) => {
  const currentUser = useStore((state) => state.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  const darkMode = useStore((state) => state.darkMode);

  // ✅ Dark Mode Effect: Sync state with HTML class
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 1. Route สำหรับหน้า Login (ไม่มีแถบ Sidebar) */}
          <Route path="/login" element={<LoginPage />} />

          {/* 2. Route หลักที่ต้องผ่านการ Login (มี Sidebar ผ่าน MainLayout) */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    {/* หน้า Dashboard หลัก */}
                    <Route path="/" element={<WelcomePage />} />

                    {/* ระบบ Schedule */}
                    <Route path="/schedule/today" element={<TodayPage />} />
                    <Route path="/schedule/history" element={<HistoryPage />} />

                    {/* ระบบจัดการ Ticket */}
                    <Route path="/tickets" element={<TicketLogPage />} />

                    {/* ระบบ Timeline และ Incident */}
                    <Route path="/incidents" element={<TimelinePage />} />

                    {/* ระบบส่งเวร (Handover) */}
                    <Route path="/handover" element={<ShiftHandoverPage />} />

                    {/* คู่มือการใช้งาน (Documentation) */}
                    <Route path="/docs" element={<DocsPage />} />

                    {/* ระบบตั้งค่า Master Data */}
                    <Route path="/settings/config" element={<ConfigPage />} />

                    {/* กรณีพิมพ์ URL มั่ว ให้ดีดกลับหน้าหลัก */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}
// file: src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import MainLayout from './components/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import TimelinePage from './pages/TimelinePage';
import ShiftHandoverPage from './pages/ShiftHandoverPage';
import TicketLogPage from './pages/TicketLogPage';
import TodayPage from './pages/schedule/TodayPage';
import HistoryPage from './pages/schedule/HistoryPage';

/**
 * ProtectedRoute: ส่วนตรวจสอบสิทธิ์การเข้าถึง
 * หากไม่มีผู้ล็อกอิน (currentUser) จะดีดกลับไปหน้า /login ทันที
 */
const ProtectedRoute = ({ children }) => {
  const currentUser = useStore((state) => state.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

import { Toaster } from "@/components/ui/toaster";

export default function App() {
  const darkMode = useStore((state) => state.darkMode);

  // จัดการ Class 'dark' ที่ html tag เพื่อรองรับ Tailwind Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <>
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

                  {/* ระบบจัดการ Ticket (หน้าใหม่ที่เพิ่มเข้ามา) */}
                  <Route path="/tickets" element={<TicketLogPage />} />

                  {/* ระบบ Timeline และ Incident */}
                  <Route path="/incidents" element={<TimelinePage />} />

                  {/* ระบบส่งเวร (Handover) */}
                  <Route path="/handover" element={<ShiftHandoverPage />} />

                  {/* กรณีพิมพ์ URL มั่ว ให้ดีดกลับหน้าหลัก */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}
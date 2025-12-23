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

// ตัวกั้นประตู: ถ้าไม่มี User ให้เด้งไป Login
const ProtectedRoute = ({ children }) => {
  const currentUser = useStore((state) => state.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  const darkMode = useStore((state) => state.darkMode);

  // Sync Class 'dark' กับ html tag
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  return (
    <Routes>
      {/* 1. หน้า Login (ไม่มี Sidebar) */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. หน้าใช้งานจริง (มี Sidebar) - ต้อง Login ก่อน */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<WelcomePage />} />
                {/* ❌ ลบ Route /dashboard ออก */}
                <Route path="/schedule/today" element={<TodayPage />} />
                <Route path="/schedule/history" element={<HistoryPage />} />
                <Route path="/tickets" element={<TicketLogPage />} />
                <Route path="/incidents" element={<TimelinePage />} />
                <Route path="/handover" element={<ShiftHandoverPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
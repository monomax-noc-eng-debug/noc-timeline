import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import MainLayout from './components/MainLayout';
import { Toaster } from "@/components/ui/toaster";

// components
import PageLoader from './components/ui/PageLoader';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './components/auth/AuthProvider';

import { ROLES } from './utils/permissions';

// Pages - Lazy Loaded
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const ShiftHandoverPage = lazy(() => import('./pages/ShiftHandoverPage'));
const TicketLogPage = lazy(() => import('./pages/TicketLogPage'));
const HistoryPage = lazy(() => import('./pages/schedule/HistoryPage'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
const ConfigPage = lazy(() => import('./pages/ConfigPage'));
const TeamManagementPage = lazy(() => import('./pages/TeamManagementPage'));

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
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 1. Public Routes (No Authentication Required) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 2. Protected Routes (Require Authentication) */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    {/* หน้า Dashboard หลัก */}
                    <Route path="/" element={<WelcomePage />} />

                    {/* ระบบ Schedule */}
                    <Route path="/schedule/history" element={<HistoryPage />} />

                    {/* ระบบจัดการ Ticket */}
                    <Route path="/tickets" element={<TicketLogPage />} />

                    {/* ระบบ Timeline และ Incident */}
                    <Route path="/incidents" element={<TimelinePage />} />

                    {/* ระบบส่งเวร (Handover) */}
                    <Route path="/handover" element={<ShiftHandoverPage />} />

                    {/* Profile Pages */}
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/change-password" element={<ChangePasswordPage />} />

                    {/* คู่มือการใช้งาน (Documentation) */}
                    <Route path="/docs" element={<DocsPage />} />

                    {/* ระบบตั้งค่า Master Data - เฉพาะ NOC Lead เท่านั้น */}
                    <Route
                      path="/settings/config"
                      element={
                        <ProtectedRoute allowedRoles={[ROLES.LEAD]}>
                          <ConfigPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Team Management - เฉพาะ NOC Lead เท่านั้น */}
                    <Route
                      path="/settings/team"
                      element={
                        <ProtectedRoute allowedRoles={[ROLES.LEAD]}>
                          <TeamManagementPage />
                        </ProtectedRoute>
                      }
                    />

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
    </AuthProvider>
  );
}

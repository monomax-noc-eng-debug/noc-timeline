import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ✅ เพิ่ม useNavigate
import { useStore } from '../store/useStore';   // ✅ เพิ่ม useStore
import Sidebar from './layouts/Sidebar';
import ConfirmModal from './ui/ConfirmModal';   // ✅ Import ConfirmModal มาที่นี่

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const { logout } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

  // ✅ State สำหรับ Modal Logout (ย้ายมาจาก Sidebar)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // ✅ ฟังก์ชัน Logout
  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white overflow-hidden relative">

      {/* ✅ วาง ConfirmModal ไว้ที่นี่ (ระดับสูงสุดของ Layout) */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sign Out?"
        message="Are you sure you want to log out?"
        onConfirm={handleLogoutConfirm}
        isDanger={true}
      />

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-900 
        transition-all duration-300 ease-in-out shadow-2xl md:shadow-none overflow-hidden
        w-64 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative 
        ${isDesktopSidebarCollapsed ? 'md:w-[70px]' : 'md:w-64'}
      `}>
        <Sidebar
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          isCollapsed={isDesktopSidebarCollapsed}
          toggleCollapse={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
          // ✅ ส่งฟังก์ชันเปิด Modal ลงไปให้ Sidebar
          onLogoutClick={() => setIsLogoutModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#050505] border-b border-zinc-200 dark:border-zinc-800 shrink-0 z-30">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black italic tracking-tighter uppercase dark:text-white">
              NOC<span className="text-zinc-400">TT</span>
            </h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -mr-2 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden relative w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
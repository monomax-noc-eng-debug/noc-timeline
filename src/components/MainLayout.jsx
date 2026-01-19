import React, { useState, useCallback, memo } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { authService } from '../services/authService';
import Sidebar from './layouts/Sidebar';
import ConfirmModal from './ui/ConfirmModal';
import ErrorBoundary from './ui/ErrorBoundary';

// Outlook-style color
const OUTLOOK_BLUE = '#0078D4';

// Memoized Header - Outlook-style flat design
const MobileHeader = memo(({ onMenuClick }) => (
  <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0 sticky top-0 z-30">
    <div className="flex items-center gap-2.5">
      <div
        className="w-7 h-7 rounded flex items-center justify-center font-bold text-white text-sm"
        style={{ backgroundColor: OUTLOOK_BLUE }}
      >
        N
      </div>
      <span className="font-semibold text-sm text-zinc-800 dark:text-white">NOC Operations</span>
    </div>
    <button
      onClick={onMenuClick}
      className="p-2 -mr-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors"
      aria-label="Open menu"
    >
      <Menu size={22} />
    </button>
  </header>
));
MobileHeader.displayName = 'MobileHeader';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const logout = useStore((state) => state.logout);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutConfirm = useCallback(async () => {
    try {
      await authService.logout();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigate('/login');
    } finally {
      setIsLogoutModalOpen(false);
    }
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => {
    setIsDesktopSidebarCollapsed((prev) => !prev);
  }, []);

  const openMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const openLogoutModal = useCallback(() => {
    setIsLogoutModalOpen(true);
  }, []);

  const closeLogoutModal = useCallback(() => {
    setIsLogoutModalOpen(false);
  }, []);

  return (
    // Outlook-style: clean white/gray background
    <div className="flex h-screen w-full bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden relative">

      {/* --- Global Modal --- */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={closeLogoutModal}
        title="Sign Out"
        message="Are you sure you want to end your session?"
        onConfirm={handleLogoutConfirm}
        isDanger={true}
      />

      {/* --- Mobile Backdrop --- */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* --- Sidebar Container (Outlook-style) --- */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-45 h-full flex flex-col
          bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800
          transition-all duration-200 ease-out shadow-lg md:shadow-none
          /* Mobile Logic */
          w-64 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          /* Desktop Logic */
          md:translate-x-0 md:relative 
          ${isDesktopSidebarCollapsed ? 'md:w-16' : 'md:w-64'}
        `}
      >
        <Sidebar
          onCloseMobile={closeMobileMenu}
          isCollapsed={isDesktopSidebarCollapsed}
          toggleCollapse={toggleSidebar}
          onLogoutClick={openLogoutModal}
        />
      </aside>

      {/* --- Main Content Area (Outlook-style: light gray) --- */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-200 bg-zinc-50 dark:bg-zinc-950">

        {/* Mobile Header (Memoized) */}
        <MobileHeader onMenuClick={openMobileMenu} />

        {/* Content Wrapper */}
        <div className="flex-1 w-full h-full overflow-hidden relative">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>

      </main>
    </div>
  );
}
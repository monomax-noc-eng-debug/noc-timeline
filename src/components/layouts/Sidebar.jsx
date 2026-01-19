import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Activity, Zap, AlertTriangle, FileText, LogOut, Sun, Moon, X,
  PanelLeftClose, PanelLeftOpen, Archive, Book, Settings2, Users, User, Lock,
  RefreshCw, Check, CloudOff, Loader2
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useSyncStatus } from '../../store/useSyncStatus';

// Outlook-style color scheme
const OUTLOOK_BLUE = '#0078D4';
const OUTLOOK_BLUE_HOVER = '#106EBE';
const OUTLOOK_BLUE_LIGHT = '#deecf9';

// กำหนดเมนูที่นี่เพื่อให้แก้ไขง่าย
const menuGroups = [
  {
    title: "Schedule",
    items: [
      { to: "/schedule/history", icon: Zap, label: "Match" }
    ]
  },
  {
    title: "Controls",
    items: [
      { to: "/tickets", icon: Archive, label: "Ticket Log" },
      { to: "/incidents", icon: AlertTriangle, label: "Timeline" },
      { to: "/handover", icon: FileText, label: "Shift Log" }
    ]
  },
  {
    title: "System",
    items: [
      { to: "/settings/team", icon: Users, label: "Team", requiresLead: true },
      { to: "/settings/config", icon: Settings2, label: "Settings", requiresLead: true },
      { to: "/docs", icon: Book, label: "User Manual" }
    ]
  }
];

import { hasRole, ROLES } from '../../utils/permissions';

// --- Sync Status Indicator Component ---
const SyncStatusIndicator = ({ isCollapsed, showLabel }) => {
  const { status, syncCount, lastSyncDate, errorMessage, lastSyncType } = useSyncStatus();

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: Loader2,
          color: 'text-amber-500',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          label: 'Checking...',
          animate: true
        };
      case 'syncing':
        return {
          icon: RefreshCw,
          color: 'text-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          label: 'Syncing...',
          animate: true
        };
      case 'done':
        const isManual = useSyncStatus.getState().lastSyncType === 'manual';
        // Note: We use getState() or need it passed in props/hook. 
        // Better to get it from the hook at the top level of component
        return {
          icon: Check,
          color: 'text-emerald-500',
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          label: lastSyncType === 'manual' ? 'Synced Manual' : 'Synced Auto',
          animate: false
        };
      case 'error':
        return {
          icon: CloudOff,
          color: 'text-red-500',
          bg: 'bg-red-50 dark:bg-red-900/20',
          label: 'Sync Error',
          animate: false
        };
      default:
        return {
          icon: RefreshCw,
          color: 'text-zinc-400',
          bg: 'bg-zinc-50 dark:bg-zinc-800',
          label: 'Auto Sync',
          animate: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      title={isCollapsed ? `${config.label}${errorMessage ? `: ${errorMessage}` : ''}` : ''}
      className={`
        flex items-center transition-all
        ${isCollapsed ? 'justify-center w-9 h-9 mx-auto rounded' : 'gap-2.5 px-3 py-2 rounded'}
        ${config.bg}
      `}
    >
      <Icon
        size={16}
        className={`shrink-0 ${config.color} ${config.animate ? 'animate-spin' : ''}`}
      />
      {showLabel && (
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
          {lastSyncDate && status === 'done' && (
            <span className="text-[10px] text-zinc-400 ml-1">
              ({lastSyncDate})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default function Sidebar({ onCloseMobile, isCollapsed = false, toggleCollapse, onLogoutClick }) {
  const { currentUser, darkMode, toggleDarkMode } = useStore();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const showLabel = !isCollapsed;

  // กรองเมนูตามสิทธิ์
  const filteredGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (item.requiresLead) return hasRole(currentUser, [ROLES.LEAD]);
      return true;
    })
  })).filter(group => group.items.length > 0);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-900 relative">

      {/* --- 1. Header Logo (Outlook-style) --- */}
      <div className={`flex items-center h-12 shrink-0 border-b border-zinc-200 dark:border-zinc-800 transition-all duration-200 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>

        <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2.5 group overflow-hidden">
          <div
            className="w-7 h-7 rounded flex items-center justify-center font-bold text-white text-sm shrink-0"
            style={{ backgroundColor: OUTLOOK_BLUE }}
          >
            N
          </div>
          <div className={`transition-all duration-200 origin-left ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <h1 className="text-sm font-semibold tracking-tight text-zinc-800 dark:text-white leading-none whitespace-nowrap">
              NOC <span className="text-zinc-500 dark:text-zinc-400">Operations</span>
            </h1>
          </div>
        </Link>

        {/* Desktop Collapse Button */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex p-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1 text-zinc-500 hover:text-red-500 rounded"
        >
          <X size={18} />
        </button>
      </div>

      {/* --- 2. Menu List (Outlook-style: flat, clean) --- */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {filteredGroups.map((group, i) => (
          <div key={i} className="mb-4">
            {/* Group Title - Outlook uses subtle labels */}
            <div className={`px-4 mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500 transition-all duration-200 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
              {group.title}
            </div>

            {/* Menu Items - Outlook-style flat design */}
            <div className="space-y-0.5 px-2">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  title={isCollapsed ? item.label : ''}
                  className={({ isActive }) => `
                    relative flex items-center rounded transition-all duration-150 group
                    ${isCollapsed ? 'justify-center w-9 h-9 mx-auto' : 'gap-3 px-3 py-2'}
                    ${isActive
                      ? 'bg-[#deecf9] dark:bg-[#0078D4]/20 text-[#0078D4] dark:text-[#4ba0e8] font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-normal'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Indicator Bar - Outlook uses left border */}
                      {isActive && !isCollapsed && (
                        <div
                          className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r"
                          style={{ backgroundColor: OUTLOOK_BLUE }}
                        />
                      )}

                      <item.icon
                        size={18}
                        strokeWidth={isActive ? 2 : 1.5}
                        className="shrink-0"
                      />

                      <span className={`text-sm whitespace-nowrap transition-all duration-200 origin-left ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* --- 3. Footer Area (Outlook-style: compact) --- */}
      <div className="mt-auto px-2 pb-3 pt-2 space-y-1 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">

        {/* Sync Status Indicator */}
        <SyncStatusIndicator isCollapsed={isCollapsed} showLabel={showLabel} />

        {/* Theme Toggle - Outlook-style compact */}
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center transition-colors ${isCollapsed
            ? 'justify-center w-9 h-9 mx-auto rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            : 'justify-between px-3 py-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
        >
          <div className="flex items-center gap-2.5">
            {darkMode ? <Moon size={16} /> : <Sun size={16} />}
            {showLabel && <span className="text-sm">Dark Mode</span>}
          </div>
          {showLabel && (
            <div
              className={`w-8 h-4 rounded-full relative transition-colors ${darkMode ? '' : 'bg-zinc-300 dark:bg-zinc-600'}`}
              style={{ backgroundColor: darkMode ? OUTLOOK_BLUE : undefined }}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm ${darkMode ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
          )}
        </button>

        {/* User Profile - Outlook-style compact */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            title={isCollapsed ? `${currentUser?.name || 'Guest'} - View Profile` : ''}
            className={`flex items-center transition-all cursor-pointer w-full ${isCollapsed ? 'justify-center w-9 h-9 mx-auto rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600' : 'gap-2.5 p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
          >
            <div
              className="w-8 h-8 shrink-0 rounded-full text-white flex items-center justify-center font-semibold text-sm"
              style={{ backgroundColor: OUTLOOK_BLUE }}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>

            {showLabel && (
              <div className="flex-1 min-w-0 overflow-hidden text-left">
                <p className="text-sm font-medium truncate text-zinc-800 dark:text-white">
                  {currentUser?.name || 'Guest'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {currentUser?.role || 'Viewer'}
                </p>
              </div>
            )}
          </button>

          {/* Dropdown Menu - Outlook-style */}
          {showProfileDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileDropdown(false)}
              />

              {/* Menu - Outlook-style flat */}
              <div className="absolute left-full ml-2 bottom-0 z-50 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded shadow-lg overflow-hidden">
                {/* User Info Header */}
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold text-sm"
                      style={{ backgroundColor: OUTLOOK_BLUE }}
                    >
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-white truncate">
                        {currentUser?.name || 'Guest'}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {currentUser?.email || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLinkClick();
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <User size={15} className="text-zinc-500" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-200">Account</span>
                  </Link>

                  <Link
                    to="/profile/change-password"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLinkClick();
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <Lock size={15} className="text-zinc-500" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-200">Change Password</span>
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onLogoutClick();
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                  >
                    <LogOut size={15} className="text-red-600" />
                    <span className="text-sm text-red-600">Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
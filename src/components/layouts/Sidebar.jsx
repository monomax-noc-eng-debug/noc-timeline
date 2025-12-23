// file: src/components/layouts/Sidebar.jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Activity, Calendar, AlertTriangle, FileText, LogOut, Sun, Moon, X,
  PanelLeftClose, PanelLeftOpen, Archive
} from 'lucide-react';
import { useStore } from '../../store/useStore';

// eslint-disable-next-line no-unused-vars
const NavItem = ({ to, icon: Icon, label, isCollapsed, handleLinkClick }) => (
  <NavLink
    to={to}
    onClick={handleLinkClick}
    title={isCollapsed ? label : ''}
    className={({ isActive }) => `
      flex items-center rounded-xl transition-all duration-200 group relative
      ${isCollapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'gap-3 px-3 py-2.5'}
      ${isActive
        ? 'bg-zinc-900 text-white shadow-md dark:bg-white dark:text-black'
        : 'text-zinc-500 hover:text-black hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900'}
    `}
  >
    <Icon size={20} strokeWidth={2.5} className={`${isCollapsed ? '' : 'group-hover:scale-105'} transition-transform shrink-0`} />
    <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
      {label}
    </span>
  </NavLink>
);

export default function Sidebar({ onCloseMobile, isCollapsed = false, toggleCollapse, onLogoutClick }) {
  const { currentUser, darkMode, toggleDarkMode } = useStore();

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const showLabel = !isCollapsed;

  return (
    <aside className="w-full h-full flex flex-col py-4 overflow-hidden relative">

      {/* Header Area */}
      <div className={`flex items-center mb-6 px-4 transition-all ${isCollapsed ? 'justify-center flex-col gap-4 px-0' : 'justify-between'}`}>
        <Link to="/" onClick={handleLinkClick} className="group block text-center">
          {isCollapsed ? (
            <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-black italic text-sm shadow-md mx-auto">N</div>
          ) : (
            <div className="text-left">
              {/* ✅ แก้ไขชื่อเว็บ */}
              <h1 className="text-xl font-black italic tracking-tighter uppercase dark:text-white transition-opacity group-hover:opacity-80 whitespace-nowrap leading-none">
                NOC <span className="text-zinc-300 dark:text-zinc-600">NTT</span>
              </h1>
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1 whitespace-nowrap">System Management</p>
            </div>
          )}
        </Link>
        <div className="flex flex-col gap-2">
          <button onClick={toggleCollapse} className="hidden md:flex p-1.5 text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors justify-center mx-auto">
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <button onClick={onCloseMobile} className="md:hidden p-2 text-zinc-400 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Menu Area */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar px-3">

        <div className={`mt-2 mb-2 px-3 text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden mt-0 mb-0' : 'opacity-100 h-auto'}`}>Schedule</div>
        <NavItem to="/schedule/today" icon={Activity} label="Live Desk" isCollapsed={isCollapsed} handleLinkClick={handleLinkClick} />
        <NavItem to="/schedule/history" icon={Calendar} label="Archive" isCollapsed={isCollapsed} handleLinkClick={handleLinkClick} />

        <div className={`mt-6 mb-2 px-3 text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden mt-0 mb-0' : 'opacity-100 h-auto'}`}>Controls</div>
        <NavItem to="/tickets" icon={Archive} label="Tickets" isCollapsed={isCollapsed} handleLinkClick={handleLinkClick} />
        <NavItem to="/incidents" icon={AlertTriangle} label="Incidents" isCollapsed={isCollapsed} handleLinkClick={handleLinkClick} />
        <NavItem to="/handover" icon={FileText} label="Handover" isCollapsed={isCollapsed} handleLinkClick={handleLinkClick} />

      </nav>

      {/* Footer Controls */}
      <div className="mt-auto pt-4 px-3 border-t border-zinc-100 dark:border-zinc-900 space-y-3">
        {/* Theme Toggle */}
        <button onClick={toggleDarkMode} className={`w-full flex items-center rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors ${isCollapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'justify-between px-3 py-2.5'}`} title="Toggle Theme">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
            {showLabel && <span className="text-[10px] font-bold uppercase tracking-widest">Appearance</span>}
          </div>
          {showLabel && <span className="text-[9px] font-black bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded uppercase text-zinc-600 dark:text-zinc-300">{darkMode ? 'Dark' : 'Light'}</span>}
        </button>

        {/* User Profile & Logout */}
        <div className={`flex items-center rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black transition-all ${isCollapsed ? 'justify-center border-none bg-transparent p-0 w-10 h-10 mx-auto' : 'gap-3 p-2'} `}>
          <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-xs shadow-sm">
            {currentUser ? currentUser.charAt(0).toUpperCase() : 'U'}
          </div>

          {showLabel && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-xs font-bold truncate dark:text-white">{currentUser || 'Guest'}</p>
              <p className="text-[9px] text-zinc-400 font-medium truncate uppercase tracking-wider">Operator</p>
            </div>
          )}

          {showLabel && (
            <button
              onClick={onLogoutClick}
              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
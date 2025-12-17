import React, { useState } from 'react';
import { LayoutDashboard, ClipboardList, Sun, Moon, Check } from 'lucide-react'; // ลบ Activity ออกเพราะไม่ใช้แล้ว

export default function MainLayout({
  children, activeTab, setActiveTab,
  currentUser, setCurrentUser, nocMembers,
  darkMode, setDarkMode
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden transition-colors duration-300 bg-[#F3F4F6] dark:bg-[#000000]">

      {/* --- NAVBAR --- */}
      <nav className="h-16 shrink-0 z-50 flex justify-between items-center px-4 lg:px-6 
        bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#333] shadow-sm">

        {/* Left: Logo & Tabs */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {/* ✅ LOGO: เปลี่ยนเป็นตัว N */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md 
              bg-[#1F2937] text-white dark:bg-[#F2F2F2] dark:text-[#000000]">
              <span className="text-xl font-black leading-none">N</span>
            </div>

            <div className="hidden sm:block">
              {/* ✅ TITLE: เปลี่ยนเป็น NOCNTT */}
              <h1 className="text-lg font-black tracking-tighter uppercase leading-none text-[#1F2937] dark:text-[#F2F2F2]">NOCNTT</h1>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Managament System</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-[#000000] border border-gray-200 dark:border-[#333]">
            {['incidents', 'handover'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all 
                  ${activeTab === tab
                    ? 'bg-white dark:bg-[#333] shadow-sm text-[#1F2937] dark:text-[#F2F2F2]'
                    : 'text-gray-500 hover:text-[#1F2937] dark:text-[#666] dark:hover:text-[#F2F2F2]'}`}
              >
                {tab === 'incidents' ? <LayoutDashboard size={16} /> : <ClipboardList size={16} />}
                <span className="hidden sm:inline">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: User & Theme */}
        <div className="flex items-center">
          <div className="relative">
            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-3 focus:outline-none group pl-2">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase leading-none mb-0.5 text-gray-400">Signed in as</span>
                <span className="text-sm font-bold leading-none group-hover:text-black dark:group-hover:text-white transition-colors text-[#1F2937] dark:text-[#F2F2F2]">{currentUser}</span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md ring-2 transition-transform group-hover:scale-105
                bg-[#1F2937] text-white ring-gray-200 dark:ring-[#333]">
                <span className="font-bold text-lg leading-none">{currentUser.charAt(0)}</span>
              </div>
            </button>

            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200
                  bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333]">

                  <div className="px-4 py-3 border-b bg-gray-50 dark:bg-[#000000] border-gray-200 dark:border-[#333]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Switch Account</p>
                  </div>

                  <div className="p-1 max-h-48 overflow-y-auto custom-scrollbar">
                    {nocMembers.map(member => (
                      <button key={member.id} onClick={() => { setCurrentUser(member.name); setIsUserMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-colors 
                        ${currentUser === member.name
                            ? 'bg-gray-100 text-[#1F2937] dark:bg-[#333] dark:text-[#F2F2F2]'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-[#1F2937] dark:text-[#888] dark:hover:bg-[#222]'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] 
                            ${currentUser === member.name ? 'bg-[#1F2937] text-white dark:bg-[#F2F2F2] dark:text-[#000000]' : 'bg-gray-200 text-gray-600 dark:bg-[#333] dark:text-[#ccc]'}`}>
                            {member.name.charAt(0)}
                          </div>
                          {member.name}
                        </div>
                        {currentUser === member.name && <Check size={14} />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t p-2 border-gray-200 dark:border-[#333]">
                    <button onClick={() => setDarkMode(!darkMode)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-colors 
                      text-[#1F2937] hover:bg-gray-100 dark:text-[#F2F2F2] dark:hover:bg-[#222]">
                      <div className="flex items-center gap-3">{darkMode ? <Moon size={16} /> : <Sun size={16} />} <span>Appearance</span></div>
                      <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold bg-gray-200 text-gray-600 dark:bg-[#333] dark:text-[#F2F2F2]">
                        {darkMode ? 'Dark' : 'Light'}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 overflow-hidden relative p-0 lg:p-6">
        <div className="w-full h-full shadow-xl overflow-hidden border relative lg:rounded-2xl 
          bg-[#F3F4F6] dark:bg-[#000000] border-gray-200 dark:border-[#333]">
          {children}
        </div>
      </main>
    </div>
  );
}
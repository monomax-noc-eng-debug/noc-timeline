import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Calendar, ArrowRight, Activity, Clock, Shield } from 'lucide-react';

export default function WelcomePage({ currentUser }) {
  const navigate = useNavigate();

  // ข้อมูลเมนูต่างๆ
  const MENU_ITEMS = [
    {
      title: 'Incidents Timeline',
      description: 'Monitor and track real-time system incidents.',
      icon: <LayoutDashboard size={32} />,
      path: '/incidents',
      color: 'bg-blue-600',
      stat: 'Live Monitoring'
    },
    {
      title: 'Shift Handover',
      description: 'Create and view shift summary reports.',
      icon: <ClipboardList size={32} />,
      path: '/handover',
      color: 'bg-emerald-600',
      stat: 'Shift Reports'
    },
    {
      title: 'Schedule',
      description: 'Check team shifts and sport match schedules.',
      icon: <Calendar size={32} />,
      path: '/schedule',
      color: 'bg-purple-600',
      stat: 'Upcoming Matches'
    }
  ];

  return (
    <div className="h-full w-full p-6 lg:p-10 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center">

      {/* Header Section */}
      <div className="text-center max-w-2xl mb-12 animate-in slide-in-from-bottom-4 fade-in duration-500">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-[#222] border border-gray-200 dark:border-[#333] mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">System Operational</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#1F2937] dark:text-[#F2F2F2] mb-4">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{currentUser}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          NOCNTT Command Center. Select a module to start working.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {MENU_ITEMS.map((item, index) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            className="group relative bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-2xl p-6 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-8 fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-xl text-white shadow-lg ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              <div className="bg-gray-50 dark:bg-[#222] px-2 py-1 rounded text-[10px] font-bold uppercase text-gray-400 group-hover:text-blue-500 transition-colors">
                {item.stat}
              </div>
            </div>

            <h3 className="text-xl font-bold text-[#1F2937] dark:text-[#F2F2F2] mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 line-clamp-2">
              {item.description}
            </p>

            <div className="flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 opacity-0 transform translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              OPEN MODULE <ArrowRight size={16} className="ml-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-16 grid grid-cols-3 gap-8 text-center border-t border-gray-200 dark:border-[#333] pt-8 w-full max-w-2xl">
        <div className="flex flex-col items-center gap-1">
          <Activity size={20} className="text-gray-400 mb-1" />
          <span className="text-xs font-bold text-gray-400 uppercase">Uptime 99.9%</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Shield size={20} className="text-gray-400 mb-1" />
          <span className="text-xs font-bold text-gray-400 uppercase">Secure Connection</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Clock size={20} className="text-gray-400 mb-1" />
          <span className="text-xs font-bold text-gray-400 uppercase">24/7 Monitoring</span>
        </div>
      </div>

    </div>
  );
}
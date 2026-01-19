import React, { useState } from 'react';
import {
  Book, Activity, Zap, FileText, Archive,
  RefreshCcw, Eye, Search, Menu, X,
  CheckCircle2, ChevronRight, LayoutGrid, Users,
  Settings, PenTool, Globe, Server, Shield
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- CONTENT DEFINITIONS ---

const SECTIONS = [
  {
    category: "Getting Started",
    items: [
      {
        id: 'overview',
        title: 'Platform Overview',
        icon: LayoutGrid,
        description: 'Introduction to the NOC Operations Center platform.',
        content: (
          <div className="space-y-6">
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
              This platform serves as the central command hub for NOC operations, providing real-time match monitoring, incident tracking, and performance analysis.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#0078D4]/10 dark:bg-[#0078D4]/20 border border-[#0078D4]/20 dark:border-[#0078D4]/30">
                <h4 className="font-semibold text-[#0078D4] dark:text-[#0078D4] mb-2 flex items-center gap-2"><Activity size={16} /> Real-time Monitoring</h4>
                <p className="text-xs text-[#0078D4]/80 dark:text-[#0078D4]/70">Track match status, viewer concurrency, and system health metrics live.</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                <h4 className="font-bold text-orange-900 dark:text-orange-300 mb-2 flex items-center gap-2"><Zap size={16} /> Incident Management</h4>
                <p className="text-xs text-orange-700 dark:text-orange-400">Automated ticket generation, smart parsing, and escalation workflows.</p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'team',
        title: 'Team & Access',
        icon: Users,
        description: 'Managing user roles, shifts, and permissions.',
        content: (
          <div className="space-y-6">
            <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900/50">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2"><Shield size={18} className="text-[#0078D4]" /> Role-Based Access Control (RBAC)</h3>
              <div className="space-y-4">
                {[
                  { role: 'NOC Lead', desc: 'Full access to all modules, configuration editing, and user management.' },
                  { role: 'NOC Engineer', desc: 'Can creating/edit tickets, manage matches, and view statistics.' },
                  { role: 'Viewer', desc: 'Read-only access to dashboards and reports.' }
                ].map(r => (
                  <div key={r.role} className="flex gap-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/30">
                    <span className="text-xs font-semibold w-24 shrink-0 pt-0.5 text-zinc-700 dark:text-zinc-300">{r.role}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }
    ]
  },
  {
    category: "Match Operations",
    items: [
      {
        id: 'monitoring',
        title: 'Live Monitoring',
        icon: Eye,
        description: 'Tracking live matches and verifying data integrity.',
        content: (
          <div className="space-y-8">
            <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-1">Data Preview & Editing</h3>
              <p className="text-sm text-zinc-500 mb-6">Verify and correct match data before export.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-black text-emerald-500 uppercase block mb-2">01. Inline Edit</span>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">Click directly on League, Title, or Time cells in the preview table to modify data instantly.</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-black text-emerald-500 uppercase block mb-2">02. Auto Sync</span>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">Changes made in the Match Stats modal (Channel, CDN) are automatically synced to the preview.</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-black text-emerald-500 uppercase block mb-2">03. Export</span>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">Use "Copy Table" to generate a formatted report for external communication.</p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'stats',
        title: 'Statistics Entry',
        icon: Activity,
        description: 'Inputting performance metrics for Start/End phases.',
        content: (
          <div className="space-y-6">
            <p className="text-zinc-600 dark:text-zinc-300">
              Statistics are divided into <strong>Start Phase</strong> (first 15 mins) and <strong>End Phase</strong> (match conclusion).
            </p>
            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <Globe className="text-[#0078D4] mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">CDN Configuration</h4>
                  <p className="text-sm text-zinc-500 mt-1">Supports both <strong>Single CDN</strong> (e.g., AWS) and <strong>Multi-CDN</strong> setups. For Multi-CDN, ensure the correct provider key is entered for each layer.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <Server className="text-purple-500 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">System Health</h4>
                  <p className="text-sm text-zinc-500 mt-1">Metrics for ECS Sport, Entitlement, and API Huawei success rates. Use the "Autofill" feature to replicate master values across CDN layers.</p>
                </div>
              </div>
            </div>
          </div>
        )
      }
    ]
  },
  {
    category: "Incident Response",
    items: [
      {
        id: 'tickets',
        title: 'Ticket Intelligence',
        icon: Archive,
        description: 'Smart parsing and ticket management.',
        content: (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 p-6 rounded-lg border border-amber-100 dark:border-amber-900/30">
              <h3 className="text-amber-900 dark:text-amber-100 font-bold mb-2 flex items-center gap-2"><Zap size={18} /> Smart Parsing Engine</h3>
              <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                Paste raw alert text directly into the description field. The system will automatically extract key details like <strong>Project, Severity, and Impact</strong> using regex patterns.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <h4 className="font-bold text-zinc-900 dark:text-white mb-2">Escalation Protocol</h4>
                <ul className="list-disc list-inside text-sm text-zinc-500 space-y-1">
                  <li>Identify severity (High/Critical)</li>
                  <li>Create Timeline Ticket</li>
                  <li>Notify Stakeholders via Line/Slack</li>
                </ul>
              </div>
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <h4 className="font-bold text-zinc-900 dark:text-white mb-2">Status Workflow</h4>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-bold">Open</span>
                  <span className="text-zinc-300">→</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded font-bold">Pending</span>
                  <span className="text-zinc-300">→</span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded font-bold">Resolved</span>
                  <span className="text-zinc-300">→</span>
                  <span className="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded font-bold">Closed</span>
                </div>
              </div>
            </div>
          </div>
        )
      }
    ]
  },
  {
    category: "Administration",
    items: [
      {
        id: 'config',
        title: 'Registry Hub',
        icon: Settings,
        description: 'Master configuration for Leagues, Channels, and options.',
        content: (
          <div className="space-y-6">
            <p className="text-zinc-600 dark:text-zinc-300">
              The <strong>Registry Hub</strong> is the central database for all dropdown options used in the app.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <span className="w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-800 rounded text-zinc-500 font-bold">1</span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300"><strong>Broadcast Domain:</strong> Manage League names, Channel mappings, and CDN providers.</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <span className="w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-800 rounded text-zinc-500 font-bold">2</span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300"><strong>Ticketing Domain:</strong> Define Issue Types, Severities, and Status options.</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <span className="w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-800 rounded text-zinc-500 font-bold">3</span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300"><strong>System Domain:</strong> Configure Google Sheet Sync schedules.</span>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'sync',
        title: 'Google Sheet Sync',
        icon: RefreshCcw,
        description: 'Integration with Google Workspace.',
        content: (
          <div className="space-y-6">
            <div className="p-4 border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Automated Data Fetching</h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                The system connects to the central Google Sheet to retrieve the latest ticket logs.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-[#0078D4] dark:text-[#0078D4]">
                <Clock size={14} /> Auto-Sync Schedule: <strong>Daily at 08:00 AM</strong> (Configurable)
              </div>
            </div>
          </div>
        )
      }
    ]
  }
];

export default function DocsPage() {
  const [activeId, setActiveId] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Flatten items for search
  const allItems = SECTIONS.flatMap(s => s.items);
  const activeItem = allItems.find(i => i.id === activeId) || allItems[0];

  const filteredSections = SECTIONS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="h-screen bg-white dark:bg-black flex flex-col overflow-hidden">

      {/* HEADER */}
      <header className="shrink-0 h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-zinc-950 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0078D4] dark:bg-white rounded-md flex items-center justify-center text-white dark:text-black shadow-sm">
            <Book size={18} strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">NOC <span className="text-zinc-500 font-normal">Docs</span></h1>
        </div>
        <button className="lg:hidden p-2 text-zinc-500" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden relative">

        {/* SIDEBAR NAVIGATION */}
        <aside className={cn(
          "absolute inset-y-0 left-0 z-10 w-72 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search docs..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm font-medium outline-none focus:ring-1 focus:ring-[#0078D4] dark:focus:ring-[#0078D4] transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
            {filteredSections.map((cat, idx) => (
              <div key={idx}>
                <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-2 px-2">{cat.category}</h3>
                <div className="space-y-1">
                  {cat.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveId(item.id); setIsMobileMenuOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all text-left",
                        activeId === item.id
                          ? "bg-white dark:bg-zinc-800 text-[#0078D4] shadow-sm border border-zinc-200 dark:border-zinc-700"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      )}
                    >
                      <item.icon size={16} className={cn("shrink-0", activeId === item.id ? "text-[#0078D4]" : "text-zinc-400")} />
                      <span className="truncate">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-black p-6 lg:p-12 scroll-smooth">
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center gap-3 text-sm font-medium text-zinc-400 mb-4">
                <span>Docs</span>
                <ChevronRight size={12} />
                <span className="text-zinc-900 dark:text-white">{SECTIONS.find(s => s.items.find(i => i.id === activeId))?.category}</span>
                <ChevronRight size={12} />
                <span className="text-[#0078D4] font-semibold">{activeItem.title}</span>
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <activeItem.icon size={32} className="text-zinc-900 dark:text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">{activeItem.title}</h1>
                  <p className="text-lg text-zinc-500 leading-relaxed">{activeItem.description}</p>
                </div>
              </div>
            </div>

            <div className="prose prose-zinc dark:prose-invert max-w-none">
              {activeItem.content}
            </div>

            <div className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex justify-between">
              <div className="text-xs text-zinc-400">Last updated: {new Date().toLocaleDateString()}</div>
              <div className="flex gap-4">
                <button className="text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Submit Feedback</button>
                <button className="text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Edit Page</button>
              </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
function Clock({ size, className }) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> }
import React, { useState } from 'react';
import {
  Book, Activity, Calendar, AlertTriangle, FileText,
  Archive, Zap, ChevronRight, Search, Layout,
  Layers, Database, Shield, Cpu, RefreshCcw, Eye,
  CheckCircle2, Info, Terminal, Target, Clock,
  Plus, ArrowRight, Download, Filter, Save, Share2,
  Lock, Settings, Users, Monitor, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

const sections = [
  {
    id: 'schedule',
    title: 'Monitoring & Statistics',
    icon: Activity,
    content: (
      <div className="space-y-12">
        <div className="relative">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 mb-2">
            <Activity className="text-emerald-500 w-10 h-10" />
            Match & Calendar
          </h2>
          <div className="h-1 w-20 bg-emerald-500 rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-10">
          <section className="bg-zinc-50 dark:bg-zinc-900/40 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white transition-transform group-hover:scale-110">
                <Eye size={24} />
              </div>
              <div>
                <h3 className="font-black uppercase text-lg tracking-widest leading-none">Data Preview</h3>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Verification Workflow</p>
              </div>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">ระบบรองรับการดูพรีวิวข้อมูลสรุป เพื่อตรวจสอบความถูกต้องก่อนส่งต่อหรือจัดเก็บ</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'Quick View', desc: 'คลิกปุ่ม Preview บนการ์ดคู่แข่งขัน' },
                { title: 'Stats Summary', desc: 'แสดงค่าสถิติ CDN และ Timeline' },
                { title: 'One-Click Copy', desc: 'คัดลอกข้อมูลไปรายงานผลต่อได้ทันที' }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[9px] font-black text-emerald-500 uppercase block mb-1">Feature {i + 1}</span>
                  <p className="text-[11px] font-bold dark:text-zinc-200 mb-1">{item.title}</p>
                  <p className="text-[10px] text-zinc-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-8 rounded-[2rem] border border-blue-500/10 bg-blue-500/[0.02] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-blue-500/5">
              <RefreshCcw size={120} />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white transition-transform group-hover:scale-110">
                <RefreshCcw size={24} />
              </div>
              <h3 className="font-black uppercase text-lg tracking-widest leading-none">Cloud Sync Protocol</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-6 relative">
              <div className="flex-1 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black shrink-0">1</div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider mb-1 dark:text-white">Initialize Sync</h4>
                    <p className="text-[11px] text-zinc-500">คลิกที่ปุ่ม Sync บริเวณแถบ Header ของหน้า Match</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black shrink-0">2</div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider mb-1 dark:text-white">Fetch Data</h4>
                    <p className="text-[11px] text-zinc-500">เลือกวันที่ แล้วกดปุ่ม Fetch เพื่อดึงข้อมูลจาก Cloud Sheets</p>
                  </div>
                </div>
              </div>
              <div className="md:w-px md:h-20 bg-blue-500/20 self-center hidden md:block" />
              <div className="flex-1 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Info size={12} /> Sync Tip
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-500/80 leading-relaxed italic">
                  หากข้อมูลในแผ่นงาน Google Sheet มีการเปลี่ยนแปลง สามารถกด Sync ซ้ำเพื่ออัปเดตสถานะล่าสุดได้ตลอดเวลา
                </p>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-colors" />

            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-xl tracking-tighter italic">Recording Protocol</h3>
                <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em]">Operational Guideline</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-colors">
                <div className="flex items-center justify-between font-black uppercase text-xs tracking-widest text-white italic">
                  <span>Pre-Match Phase</span>
                  <div className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[8px]">Start Stat</div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  บันทึกก่อนแข่งขัน <span className="text-white font-bold">30-60 นาที</span> เพื่อเก็บค่าโหลดย้อนหลัง (ECS, API) มาวิเคราะห์โหลดตั้งต้น
                </p>
              </div>
              <div className="space-y-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center justify-between font-black uppercase text-xs tracking-widest text-white italic">
                  <span>Live/Finish Phase</span>
                  <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[8px]">End Stat</div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  บันทึกหลังจบเกมเพื่อสรุป <span className="text-white font-bold">Peak Traffic</span> และคำนวณสัดส่วนผู้ใช้แยกตาม CDN (Akamai/Huawei)
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap gap-3">
              {['Live Viewers', 'Engage Score', 'CDN Bandwidth', 'API Request'].map(tag => (
                <span key={tag} className="text-[8px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl bg-white/5 text-zinc-500 border border-white/5">{tag}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  },
  {
    id: 'tickets',
    title: 'Ticket Intelligence',
    icon: Archive,
    content: (
      <div className="space-y-12">
        <div className="relative">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 mb-2">
            <Archive className="text-amber-500 w-10 h-10" />
            Ticket Intelligence
          </h2>
          <div className="h-1 w-20 bg-amber-500 rounded-full" />
        </div>

        <section className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl shadow-emerald-500/20">
          <div className="absolute top-0 right-0 p-8 text-white/10 group-hover:scale-110 transition-transform duration-700">
            <Zap size={180} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-white">
                <Zap size={24} className="fill-current" />
              </div>
              <h3 className="text-white font-black italic uppercase text-2xl tracking-tighter">Smart Parsing</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed max-w-lg mb-8">
              ระบบวิเคราะห์ข้อมูลอัตโนมัติ เพียงวางข้อความแจ้งเตือน (Alert) ลงในหัวข้อ แล้วคลิกปุ่มสายฟ้า ระบบจะกระจายข้อมูลลงในช่องต่างๆ ให้ทันที
            </p>
            <div className="flex gap-4">
              <div className="px-4 py-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase text-white tracking-widest">
                Save 80% Time
              </div>
              <div className="px-4 py-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase text-white tracking-widest">
                Zero Type Errors
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-black uppercase text-sm tracking-widest dark:text-white">Escalation Protocol</h3>
            </div>
            <div className="space-y-4">
              {[
                { step: '01', text: 'เลือก Ticket ที่มีความรุนแรงสูง' },
                { step: '02', text: 'กดปุ่ม Transfer to Ticket Timeline' },
                { step: '03', text: 'ระบบจะสรุปข้อมูลและเริ่มนับ Timeline ทันที' }
              ].map(item => (
                <div key={item.step} className="flex gap-4 items-center p-3 rounded-xl bg-white dark:bg-black/40 border border-zinc-100 dark:border-zinc-800 transition-transform hover:-translate-y-1">
                  <span className="text-xs font-black italic text-zinc-300 dark:text-zinc-700">{item.step}</span>
                  <p className="text-[11px] font-bold dark:text-zinc-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Target size={20} />
              </div>
              <h3 className="font-black uppercase text-sm tracking-widest dark:text-white">Status Definitions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Open', color: 'bg-zinc-400' },
                { label: 'Pending', color: 'bg-amber-500' },
                { label: 'Resolved', color: 'bg-emerald-500' },
                { label: 'Closed', color: 'bg-zinc-600' }
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl bg-white dark:bg-black/40 border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  },
  {
    id: 'incidents',
    title: 'Ticket Timeline',
    icon: AlertTriangle,
    content: (
      <div className="space-y-12">
        <div className="relative">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 mb-2">
            <AlertTriangle className="text-red-500 w-10 h-10" />
            Ticket Timeline Management
          </h2>
          <div className="h-1 w-20 bg-red-500 rounded-full" />
        </div>

        <div className="space-y-8 relative before:absolute before:left-6 before:top-10 before:bottom-10 before:w-px before:bg-zinc-100 dark:before:bg-zinc-800">
          {[
            {
              title: 'Creation Phase',
              icon: Plus,
              color: 'bg-red-500',
              desc: 'ระบุรายละเอียดผลกระทบ (Impact) และสรุปปัญหาให้ชัดเจนที่สุด เพื่อใช้เป็นหัวข้อรายงาน'
            },
            {
              title: 'Execution Phase',
              icon: Terminal,
              color: 'bg-blue-500',
              desc: 'อัปเดต Timeline รายนาที รองรับการวางรูปภาพ (Paste) และการลากวาง (Drag & Drop)'
            },
            {
              title: 'Reporting Phase',
              icon: FileText,
              color: 'bg-emerald-500',
              desc: 'เมื่อสถานการณ์คลี่คลาย กดปุ่ม Report เพื่อสร้างสรุปเหตุการณ์ (Generate PDF/Preview)'
            }
          ].map((phase, i) => (
            <div key={i} className="relative pl-14 group">
              <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl ${phase.color} shadow-lg flex items-center justify-center text-white transition-transform group-hover:scale-110 z-10`}>
                <phase.icon size={20} />
              </div>
              <div className="p-6 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 transition-all group-hover:bg-white dark:group-hover:bg-zinc-900">
                <h3 className="font-black uppercase text-sm tracking-widest mb-2 flex items-center gap-2">
                  <span className="text-zinc-300 dark:text-zinc-700 font-black italic">0{i + 1}</span>
                  {phase.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{phase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'handover',
    title: 'Shift Transfer',
    icon: FileText,
    content: (
      <div className="space-y-12">
        <div className="relative">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 mb-2">
            <RefreshCcw className="text-blue-500 w-10 h-10" />
            Shift Transfer Protocol
          </h2>
          <div className="h-1 w-20 bg-blue-500 rounded-full" />
        </div>

        <section className="p-10 rounded-[3rem] bg-zinc-900 border border-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/[0.03] animate-pulse" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-[2rem] bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Users size={32} />
              </div>
              <div>
                <h4 className="text-2xl text-white font-black italic tracking-widest uppercase mb-1">Shift Transition</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em]">Protocol • Verification</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'ตรวจสอบสถานะ Live Matches ทั้งหมด',
                'สรุป Ticket ที่ยังเป็นสถานะ Open/Pending',
                'ยืนยันว่าข้อมูล Incident ทั้งหมดมีการอัปเดต',
                'ระบุปัญหาที่ต้องติดตามต่อในเวรถัดไป'
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-400">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="p-8 rounded-[2rem] bg-blue-50 dark:bg-blue-500/[0.03] border border-blue-100 dark:border-blue-500/10 flex gap-6 items-center">
          <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-black border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
            <Lock size={28} />
          </div>
          <div>
            <h5 className="font-black text-xs uppercase tracking-widest dark:text-white mb-2 italic text-blue-600">Sync & Accountability</h5>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium italic">
              "การส่งต่อข้อมูลที่มีคุณภาพ คือรากฐานของความมั่นคงในระบบงาน NOC"
            </p>
          </div>
        </div>
      </div>
    )
  }
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = sections.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-full bg-white dark:bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-20 shrink-0 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between px-8 bg-white/50 dark:bg-black/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-black/10 dark:shadow-white/5 transition-transform hover:scale-105 active:scale-95">
            <Book className="text-white dark:text-black" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">USER MANUAL</h1>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] leading-none italic">NOC Protocol Guide v2.0</p>
          </div>
        </div>

        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search Protocols..."
            className="w-full pl-12 pr-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-blue-500/20 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest focus:ring-4 ring-blue-500/5 outline-none transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area - Single Page Scroll */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#050505] relative scroll-smooth">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-4xl mx-auto py-12 md:py-24 px-8 md:px-16 relative z-10 space-y-40 mb-32">
          {filteredSections.map((section, idx) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {section.content}
              {idx !== filteredSections.length - 1 && (
                <div className="mt-40 h-px w-full bg-gradient-to-r from-transparent via-zinc-100 dark:via-zinc-800 to-transparent" />
              )}
            </motion.div>
          ))}

          {/* Footer Section */}
          <div className="pt-12 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-300 dark:text-zinc-600 shadow-sm">
                <Cpu size={24} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  System documentation Live
                </p>
                <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest">Knowledge Base Secured</p>
              </div>
            </div>
            <div className="text-[9px] font-black text-zinc-300 dark:text-zinc-800 uppercase tracking-[0.3em]">End of Document</div>
          </div>
        </div>
      </div>
    </div>
  );
}

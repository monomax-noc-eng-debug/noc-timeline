import React, { useState } from 'react';
import {
  Book, Activity, Calendar, AlertTriangle, FileText,
  Archive, Zap, ChevronRight, Search, Layout,
  Layers, Database, Shield, Cpu, RefreshCcw, Eye,
  CheckCircle2, Info, Terminal, Target, Clock,
  Plus, ArrowRight, Download, Filter, Save, Share2,
  Lock, Settings, Users, Monitor, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
  {
    id: 'schedule',
    title: 'ตารางงานและสถิติ',
    icon: Activity,
    content: (
      <div className="space-y-8">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
          <Activity className="text-emerald-500" />
          Live Desk & Archive
        </h2>

        <div className="space-y-6">
          <section className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-zinc-100 dark:before:bg-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Eye size={16} />
              </div>
              <h3 className="font-black uppercase text-sm tracking-widest">การ Preview ข้อมูล</h3>
            </div>
            <p className="text-sm text-zinc-500 mb-4">ระบบรองรับการดูพรีวิวข้อมูลสรุป เพื่อตรวจสอบความถูกต้องก่อนส่งต่อหรือจัดเก็บ</p>
            <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 dark:text-zinc-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>คลิกปุ่ม <span className="font-bold">Preview</span> (ไอคอนรูปดวงตา) บนการ์ดคู่แข่งขัน</span>
              </div>
              <div className="flex items-center gap-2 dark:text-zinc-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>แสดงข้อมูลสรุป เช่น ผลการแข่งขัน, ค่าสถิติ CDN และ Timeline สำคัญ</span>
              </div>
              <div className="flex items-center gap-2 dark:text-zinc-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>รองรับการ <span className="font-bold">Copy to Google Sheet</span> เพื่อคัดลอกข้อมูลสรุปไปวางในไฟล์รายงานหลักได้ทันที</span>
              </div>
            </div>
          </section>

          <section className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-zinc-100 dark:before:bg-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Plus size={16} />
              </div>
              <h3 className="font-black uppercase text-sm tracking-widest">การเพิ่มคู่แข่งขัน (Add Match)</h3>
            </div>
            <p className="text-sm text-zinc-500 mb-4">หากไม่มีข้อมูลในระบบ Sync คุณสามารถเพิ่มคู่แข่งขันได้ด้วยตนเอง</p>
            <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 dark:text-zinc-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>กดปุ่ม <span className="font-bold">+ Add Match</span> บริเวณแถบ Header</span>
              </div>
              <div className="flex items-center gap-2 dark:text-zinc-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>กรอกข้อมูลพื้นฐาน: ทีมแข่งขัน, รายการ (League), และเวลาเริ่มการแข่งขัน</span>
              </div>
            </div>
          </section>

          <section className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-zinc-100 dark:before:bg-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-500/10 flex items-center justify-center text-zinc-500">
                <Filter size={16} />
              </div>
              <h3 className="font-black uppercase text-sm tracking-widest">การเรียงลำดับและตัวกรอง (Sorting & Filter)</h3>
            </div>
            <p className="text-sm text-zinc-500 mb-4">จัดการรายการคู่แข่งขันจำนวนมากด้วยระบบช่วยกรอง</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 dark:text-zinc-300 font-medium">
                <span className="font-black italic text-zinc-400">Time Order:</span>
                เรียงตามเวลาการแข่งขัน (Kick-off Time) เพื่อลำดับการทำงานที่ชัดเจน
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 dark:text-zinc-300 font-medium">
                <span className="font-black italic text-zinc-400">Status Filter:</span>
                เลือกดูเฉพาะคู่ที่กำลังแข่งขัน (Live), จบแล้ว (Succeed) หรือที่กำลังจะมาถึง
              </div>
            </div>
          </section>

          <section className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-zinc-100 dark:before:bg-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <RefreshCcw size={16} />
              </div>
              <h3 className="font-black uppercase text-sm tracking-widest">การเชื่อมต่อ Google Sync</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-[9px]">
                  <Download size={12} /> Step 01
                </div>
                <p className="dark:text-zinc-300">คลิกที่ปุ่ม <span className="text-amber-500 font-bold">Sync</span> บริเวณแถบ Header ของหน้า Live Desk</p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-[9px]">
                  <ArrowRight size={12} /> Step 02
                </div>
                <p className="dark:text-zinc-300">เลือกวันที่ แล้วกดปุ่ม Fetch เพื่อเริ่มการดึงข้อมูลจาก Cloud Sheets</p>
              </div>
            </div>
          </section>

          <section className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-zinc-100 dark:before:bg-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Layers size={16} />
              </div>
              <h3 className="font-black uppercase text-sm tracking-widest">การบันทึกสถิติ CDN โดยละเอียด</h3>
            </div>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
                <div className="flex items-center gap-3 mb-4 text-white font-bold border-b border-zinc-800 pb-2">
                  <BarChart3 size={18} className="text-blue-400" />
                  <span>ขั้นตอนการบันทึก (Recording Workflow)</span>
                </div>
                <div className="space-y-4 text-xs font-mono">
                  <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/20">
                    <p className="text-blue-400 font-bold mb-1">[Phase 1] START STATS</p>
                    <p className="text-[10px] leading-relaxed">
                      บันทึกก่อนการแข่งขันเริ่ม (Pre-match) ประมาณ 30-60 นาที เพื่อเก็บค่า Baseline
                      และตรวจสอบความพร้อมของปริมาณ Traffic ที่เริ่มเข้ามา
                    </p>
                  </div>
                  <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                    <p className="text-emerald-400 font-bold mb-1">[Phase 2] END STATS</p>
                    <p className="text-[10px] leading-relaxed">
                      บันทึกหลังจบการแข่งขัน (Post-match) เพื่อเก็บค่า Peak ที่เกิดขึ้นจริงตลอดช่วงเวลา
                      นำมาเปรียบเทียบและทำสรุป Report ประจำวัน
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                  <h4 className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Cpu size={14} className="text-blue-500" /> Metrics Definition
                  </h4>
                  <ul className="text-[11px] text-zinc-500 space-y-1">
                    <li className="flex justify-between"><span>Peak Bandwidth</span> <span className="text-zinc-900 dark:text-zinc-300 font-mono">Gbps / Mbps</span></li>
                    <li className="flex justify-between"><span>Total Requests</span> <span className="text-zinc-900 dark:text-zinc-300 font-mono">Units</span></li>
                    <li className="flex justify-between"><span>Peak Requests</span> <span className="text-zinc-900 dark:text-zinc-300 font-mono">RPS / TPS</span></li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                  <h4 className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Layers size={14} className="text-emerald-500" /> Multi-CDN Support
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    รองรับการกรอกข้อมูลแยกตามผู้ให้บริการ (CDN Providers) เช่น Akamai, Cloudflare ฯลฯ
                    โดยระบบจะคำนวณผลรวม (Aggregated Total) ให้โดยอัตโนมัติ
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 text-[11px]">
                <p className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-2 mb-1">
                  <Info size={14} /> หมายเหตุสำคัญ
                </p>
                <p className="text-amber-600 dark:text-amber-500/80 leading-relaxed">
                  การกรอกข้อมูลสถิติจะถูกจัดเก็บเข้าสู่ Firestore ใน Sub-collection แยกตาม Match ID
                  เพื่อให้ข้อมูลมีความเป็นระเบียบและเรียกดูย้อนหลังได้รวดเร็วในหน้า Archive
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  },
  {
    id: 'tickets',
    title: 'Ticket Log อัจฉริยะ',
    icon: Archive,
    content: (
      <div className="space-y-8">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
          <Archive className="text-amber-500" />
          Ticket Intelligence
        </h2>

        {/* Smart Parsing Section */}
        <div className="bg-emerald-950/20 border border-emerald-900/30 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-emerald-500/10">
            <Zap size={100} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-500 font-black italic uppercase text-lg mb-2">
              <Zap size={22} className="fill-emerald-500" />
              Smart Parsing Module
            </div>
            <p className="text-emerald-400/80 text-sm leading-relaxed max-w-xl mb-6">
              เพียงวางข้อความแจ้งเตือนลงในช่องหัวข้อ แล้วกดปุ่มสายฟ้าเพื่อกระจายข้อมูลลงในช่องต่างๆ โดยอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Escalation Section */}
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-amber-600 dark:text-amber-400 font-black uppercase text-sm tracking-widest">การยกระดับปัญหา (Ticket to Incident)</h3>
              <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-widest">Escalation Protocol</p>
            </div>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
            หากตรวจสอบแล้วพบว่า Ticket นั้นมีความรุนแรงสูงหรือมีผลกระทบเป็นวงกว้าง (Major Issue)
            คุณสามารถยกระดับ Ticket นั้นให้เป็น <span className="text-red-500 font-black italic">Incident</span> ได้ทันที
          </p>
          <div className="p-4 rounded-xl bg-white dark:bg-black/40 border dark:border-zinc-800 flex flex-col gap-3 font-medium">
            <div className="flex items-center gap-3 text-xs dark:text-zinc-300">
              <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold italic text-[10px]">01</div>
              <span>เลือก Ticket ที่ต้องการจากรายการ</span>
            </div>
            <div className="flex items-center gap-3 text-xs dark:text-zinc-300">
              <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold italic text-[10px]">02</div>
              <span>คลิกปุ่ม <span className="font-bold text-red-500">Create Incident</span> บนแถบเครื่องมือของ Ticket นั้น</span>
            </div>
            <div className="flex items-center gap-3 text-xs dark:text-zinc-300">
              <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold italic text-[10px]">03</div>
              <span>ระบบจะนำข้อมูลจาก Ticket ไปสร้างเคสในหน้า Incident และเริ่มนับ Timeline โดยอัตโนมัติ</span>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Filter size={18} className="text-zinc-400" />
              <h3 className="font-black uppercase text-sm tracking-widest">การบริหารจัดการ (Management)</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-black/40">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shrink-0"><Search size={16} /></div>
                <div>
                  <h4 className="text-xs font-bold uppercase dark:text-zinc-300">Advanced Search</h4>
                  <p className="text-[11px] text-zinc-500">ค้นหา Ticket จากชื่อเรื่อง หรือเนื้อหาได้แบบ Real-time</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-black/40">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shrink-0"><RefreshCcw size={16} /></div>
                <div>
                  <h4 className="text-xs font-bold uppercase dark:text-zinc-300">Live Updates</h4>
                  <p className="text-[11px] text-zinc-500">มีการเรียงลำดับตามความคืบหน้าล่าสุดเสมอ</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <Target size={18} className="text-zinc-400" />
              <h3 className="font-black uppercase text-sm tracking-widest">สถานะ (Status Protocol)</h3>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Open', desc: 'ได้รับแจ้ง/รอการตรวจสอบ', dot: 'bg-zinc-400' },
                { label: 'Pending', desc: 'กำลังประสานงาน/รอผลยืนยัน', dot: 'bg-amber-500' },
                { label: 'Succeed', desc: 'แก้ไขเรียบร้อยแล้ว', dot: 'bg-emerald-500' },
                { label: 'Closed', desc: 'ปิดเคสสมบูรณ์', dot: 'bg-zinc-600' },
              ].map((status, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <div className={`w-2 h-2 rounded-full ${status.dot} ${i === 2 ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest min-w-[60px]">{status.label}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">{status.desc}</span>
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
    title: 'การจัดการ Incident',
    icon: AlertTriangle,
    content: (
      <div className="space-y-8">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
          <AlertTriangle className="text-red-500" />
          Incident Protocol
        </h2>

        <div className="grid grid-cols-1 gap-6">
          <div className="flex gap-6 items-start">
            <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
                <Plus size={18} strokeWidth={3} />
              </div>
              <div className="w-0.5 h-16 bg-zinc-100 dark:bg-zinc-800" />
            </div>
            <div className="flex-1 p-6 rounded-2xl border border-red-500/20 bg-red-50 dark:bg-red-950/10">
              <h3 className="text-red-600 dark:text-red-400 font-black uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
                <Plus size={14} /> Creation phase
              </h3>
              <p className="text-sm dark:text-zinc-300 mb-4">ระบุรายละเอียดผลกระทบ (Impact) และสรุปปัญหาให้ชัดเจนที่สุด เพื่อใช้เป็นหัวข้อรายงาน</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded bg-white dark:bg-black/40 text-[9px] font-bold text-red-500 uppercase border border-red-500/20">Critical</span>
                <span className="px-2 py-1 rounded bg-white dark:bg-black/40 text-[9px] font-bold text-red-500 uppercase border border-red-500/20">Timeline start</span>
              </div>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Terminal size={18} />
              </div>
              <div className="w-0.5 h-32 bg-zinc-100 dark:bg-zinc-800" />
            </div>
            <div className="flex-1 p-6 rounded-2xl border border-blue-500/20 bg-blue-50 dark:bg-blue-950/10">
              <h3 className="text-blue-600 dark:text-blue-400 font-black uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
                <Terminal size={14} /> Execution phase
              </h3>
              <p className="text-sm dark:text-zinc-300 mb-4">
                เพิ่มลำดับเหตุการณ์ (Update Timeline) โดยการพิมพ์รายละเอียดแล้วกดที่ไอคอน <span className="text-blue-500 font-bold">ลูกศร (Arrow)</span> เพื่อบันทึกข้อมูลลงในระบบ และสื่อสารความคืบหน้าอย่างแม่นยำ
              </p>

              <div className="bg-white dark:bg-black/40 rounded-xl border border-blue-500/10 p-4 mb-4">
                <h4 className="text-[10px] font-black uppercase text-blue-500 mb-2 flex items-center gap-2">
                  <Share2 size={12} /> ระบบรองรับการเพิ่มรูปภาพ
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs dark:text-zinc-400">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold italic text-[9px]">A</div>
                    <span>คลิกไอคอนรูปภาพ เพื่อเลือกไฟล์จากเครื่อง</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs dark:text-zinc-400">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold italic text-[9px]">B</div>
                    <span>วางรูปภาพ (Paste) จาก Clipboard ได้ทันที</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs dark:text-zinc-400">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold italic text-[9px]">C</div>
                    <span>ลากและวางไฟล์ (Drag & Drop) ลงใน Timeline</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-mono text-blue-500 uppercase font-black">
                <span className="flex items-center gap-1"><Save size={12} /> Autosaved</span>
                <span className="flex items-center gap-1"><ArrowRight size={12} /> Real-time sync</span>
              </div>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <FileText size={18} />
              </div>
            </div>
            <div className="flex-1 p-6 rounded-2xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/10">
              <h3 className="text-emerald-600 dark:text-emerald-400 font-black uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
                <Download size={14} /> Reporting phase
              </h3>
              <p className="text-sm dark:text-zinc-300">เมื่อสถานการณ์คลี่คลาย กดปุ่ม Report เพื่อสร้างสรุปเหตุการณ์ (Generate PDF/Preview) เพื่อส่งสรุปให้ผู้บริหาร</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'handover',
    title: 'การส่งเวรปฏิบัติการ',
    icon: FileText,
    content: (
      <div className="space-y-8">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
          <Share2 className="text-blue-500" />
          Shift Transition
        </h2>

        <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/5 rotate-3 scale-110 -z-0" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Users size={24} />
              </div>
              <div>
                <h4 className="text-white font-black italic tracking-widest uppercase">Operator Sync Control</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Type: Protocol-Verification</p>
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center gap-3 text-zinc-400 border-b border-zinc-800 pb-3">
                <span className="text-emerald-500 italic">01.</span>
                <span className="flex-1">ตรวจสอบสถานะ Live Matches ทั้งหมด</span>
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
              <div className="flex items-center gap-3 text-zinc-400 border-b border-zinc-800 pb-3">
                <span className="text-emerald-500 italic">02.</span>
                <span className="flex-1">สรุป Ticket ที่ยังเป็นสถานะ Open/Pending</span>
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <span className="text-emerald-500 italic">03.</span>
                <span className="flex-1">ยืนยันว่าข้อมูล Incident ทั้งหมดปิดจบแล้ว</span>
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
            <Lock size={18} />
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase tracking-widest dark:text-white mb-1">Security & Accountability</h5>
            <p className="text-xs text-zinc-500 leading-relaxed">
              การกรอกข้อมูลที่ชัดเจนช่วยให้เพื่อนร่วมงานทำงานต่อได้อย่างปลอดภัย โปรดตรวจสอบข้อมูลอีกครั้งก่อนการบันทึกระบบ
            </p>
          </div>
        </div>
      </div>
    )
  }
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('schedule');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = sections.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div className="h-full w-full bg-white dark:bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-20 shrink-0 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg dark:shadow-white/5">
            <Book className="text-white dark:text-black" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none mb-1">USER MANUAL</h1>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] leading-none italic">NOC Protocol Guide</p>
          </div>
        </div>

        <div className="relative w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-emerald-500/20 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-4 ring-emerald-500/10 outline-none transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar - Horizontal on Mobile, Vertical on Desktop */}
        <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-900 overflow-x-auto md:overflow-y-auto p-4 flex md:flex-col gap-1.5 bg-zinc-50/20 dark:bg-zinc-950/20 custom-scrollbar-hide">
          <div className="hidden md:block px-4 py-2 mb-2">
            <p className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">Main Protocols</p>
          </div>
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden shrink-0 md:shrink ${isActive
                  ? 'bg-zinc-900 text-white shadow-xl dark:bg-white dark:text-black md:translate-x-1'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-y-0 left-0 w-1 bg-emerald-500 hidden md:block"
                  />
                )}
                <Icon size={18} strokeWidth={isActive ? 3 : 2} className={isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                <span className="text-[11px] font-black uppercase tracking-wider text-left whitespace-nowrap md:whitespace-normal">
                  {section.title}
                </span>
                <ChevronRight
                  size={14}
                  className={`hidden md:block transition-all duration-300 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`}
                />
              </button>
            );
          })}

        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#050505] relative">
          {/* Subtle Background Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 hidden md:block" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 hidden md:block" />

          <div className="max-w-3xl mx-auto py-8 md:py-16 px-6 md:px-12 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {activeContent?.content}

                {/* Footer Section in Content */}
                <div className="mt-16 md:mt-24 pt-10 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5 self-start sm:self-auto">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                      <Cpu size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-zinc-500/50 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        System documentation updated successfully
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

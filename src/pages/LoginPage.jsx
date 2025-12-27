// file: src/pages/LoginPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { nocMembers, setCurrentUser } = useStore();

  // ✅ แก้ไข: รับ parameter เป็น member object และไม่ต้องใช้ e.preventDefault()
  const handleLogin = (member) => {
    // ส่งทั้ง Object (id, name, role) ไปเก็บใน Store
    setCurrentUser({
      id: member.id,
      name: member.name,
      role: member.role || 'NOC Engineer'
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-black p-4 transition-colors duration-500">
      <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase dark:text-white mb-4">
            NOCNTT <span className="text-zinc-300 dark:text-zinc-700">Management</span>
          </h1>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-[0.3em] mb-6">System Access</p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <ShieldCheck size={14} className="text-zinc-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Who is operating?</span>
          </div>
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {nocMembers.map((member) => (
            <button
              key={member.id}
              // ✅ แก้ไข: ส่ง member object ทั้งก้อนเข้าไป
              onClick={() => handleLogin(member)}
              className="group flex flex-col items-center gap-4 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Avatar Circle */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-3xl md:text-4xl font-black text-zinc-500 dark:text-zinc-400 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:scale-105 border-4 border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
                  {member.name.charAt(0)}
                </div>
                {/* Role Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-[9px] font-black uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {member.role}
                </div>
              </div>

              {/* Name */}
              <div className="text-center">
                <div className="text-sm md:text-base font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                  {member.name}
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
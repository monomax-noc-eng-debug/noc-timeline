import React, { useState, useEffect } from 'react';
import MainLayout from './components/MainLayout';
import TimelinePage from './pages/TimelinePage';
import ShiftHandoverPage from './pages/ShiftHandoverPage'; // ใช้ไฟล์ใหม่ที่เราทำก่อนหน้านี้

// Config User List
const NOC_MEMBERS = [
  { id: 'NOC-1', name: 'Mekin S.', role: 'NOC' },
  { id: 'NOC-2', name: 'Akkapol P.', role: 'NOC' },
  { id: 'NOC-3', name: 'Nawapat R.', role: 'NOC' },
  { id: 'NOC-4', name: 'Watcharapol P.', role: 'NOC' },
  { id: 'NOC-5', name: 'Supporter', role: 'NOC' }
];

export default function App() {
  // Global State (Theme & User)
  const [activeTab, setActiveTab] = useState('incidents');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [currentUser, setCurrentUser] = useState(NOC_MEMBERS[0].name);

  // Theme Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <MainLayout
      activeTab={activeTab} setActiveTab={setActiveTab}
      currentUser={currentUser} setCurrentUser={setCurrentUser}
      nocMembers={NOC_MEMBERS}
      darkMode={darkMode} setDarkMode={setDarkMode}
    >
      {activeTab === 'incidents' && <TimelinePage currentUser={currentUser} />}
      {activeTab === 'handover' && <ShiftHandoverPage currentUser={currentUser} nocMembers={NOC_MEMBERS} />}
    </MainLayout>
  );
}
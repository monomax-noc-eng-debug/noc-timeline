import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';

export const useShiftForm = (isOpen, initialData, currentUser, team, onSubmit) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    shift: 'Morning',
    onDuty: [],
    status: 'Normal',
    note: ''
  });
  const [errors, setErrors] = useState({});

  // Reset or Initialize Form Data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // กรณี Edit: ใช้ข้อมูลเดิม
        setFormData({
          ...initialData,
          onDuty: initialData.onDuty || [],
        });
      } else {
        // กรณี New: Default Values
        const now = new Date();

        // ดึงชื่อ User ปัจจุบันอย่างปลอดภัย
        const currentUserName = typeof currentUser === 'object' ? currentUser?.name : currentUser;

        setFormData({
          date: format(now, 'yyyy-MM-dd'),
          time: format(now, 'HH:mm'),
          shift: now.getHours() >= 8 && now.getHours() < 20 ? 'Morning' : 'Night',

          // ✅ REQUIREMENT: เลือกชื่อคน Login เป็นค่าเริ่มต้นเสมอ
          onDuty: currentUserName ? [currentUserName] : [],

          status: 'Normal',
          note: '',

          // ✅ FIX: Set createdBy to current user's name
          createdBy: currentUserName || ''
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData, currentUser]);

  const setField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const toggleMember = (memberName) => {
    setFormData(prev => {
      const current = prev.onDuty || [];
      if (current.includes(memberName)) {
        return { ...prev, onDuty: current.filter(m => m !== memberName) };
      } else {
        return { ...prev, onDuty: [...current, memberName] };
      }
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Start time is required";
    if (!formData.onDuty || formData.onDuty.length === 0) newErrors.onDuty = "Select at least one member";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  // ✅ DISPLAY LOGIC: รวมรายชื่อในทีม + คนที่ Login (เผื่อไม่อยู่ในทีม) + คนในประวัติเก่า
  const displayMembers = useMemo(() => {
    const teamNames = new Set(team.map(t => t.name));
    const members = [...team];

    // 1. ถ้าคน Login ไม่มีชื่อในทีม ให้เพิ่มเข้าไปชั่วคราว (เฉพาะตอนสร้างใหม่)
    const currentUserName = typeof currentUser === 'object' ? currentUser?.name : currentUser;
    if (!initialData && currentUserName && !teamNames.has(currentUserName)) {
      members.push({ id: 'current-user', name: currentUserName, role: 'Current', isActive: true });
      teamNames.add(currentUserName);
    }

    // 2. เพิ่มคนที่มีชื่อใน Log เก่า (กรณี Edit แล้วคนนั้นออกจากทีมไปแล้ว)
    if (initialData?.onDuty) {
      initialData.onDuty.forEach(name => {
        if (!teamNames.has(name)) {
          members.push({ id: name, name, role: 'History', isActive: false });
          teamNames.add(name);
        }
      });
    }

    return members;
  }, [team, initialData, currentUser]);

  return {
    formData,
    errors,
    setField,
    toggleMember,
    handleSubmit,
    displayMembers
  };
};
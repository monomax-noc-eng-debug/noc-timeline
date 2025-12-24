// src/features/handover/hooks/useShiftForm.js
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

export const useShiftForm = (isOpen, initialData, currentUser, nocMembers, onSubmit) => {
  // 1. Logic สร้างค่าเริ่มต้น (ย้ายมาจากใน Component)
  const getDefaultState = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const isNight = currentHour >= 20 || currentHour < 8;
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    return {
      date: now.toISOString().split('T')[0],
      time: currentTime,
      shift: isNight ? 'Night' : 'Morning',
      onDuty: currentUser ? [currentUser] : [],
      status: 'Normal',
      note: '',
      acknowledgedBy: []
    };
  }, [currentUser]);

  const [formData, setFormData] = useState(getDefaultState());
  const [errors, setErrors] = useState({});

  // 2. Logic การ Reset Form เมื่อเปิด Modal หรือข้อมูลเปลี่ยน
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          onDuty: initialData.onDuty || [],
          acknowledgedBy: initialData.acknowledgedBy || []
        });
      } else {
        setFormData(getDefaultState());
      }
      setErrors({});
    }
  }, [isOpen, initialData, getDefaultState]);

  // 3. Helper Functions
  const toggleMember = (name) => {
    setFormData(prev => {
      const exists = prev.onDuty.includes(name);
      if (exists) {
        return { ...prev, onDuty: prev.onDuty.filter(m => m !== name) };
      } else {
        return { ...prev, onDuty: [...prev.onDuty, name] };
      }
    });
  };

  const setField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error เมื่อพิมพ์ใหม่
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.onDuty || formData.onDuty.length === 0) {
      newErrors.onDuty = 'At least one staff member required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  // 4. เตรียมข้อมูล List สมาชิกที่จะแสดง
  const displayMembers = initialData // isEditing ดูจาก initialData
    ? nocMembers
    : nocMembers.filter(m => m.name === currentUser);

  return {
    formData,
    errors,
    setField,
    toggleMember,
    handleSubmit,
    displayMembers
  };
};
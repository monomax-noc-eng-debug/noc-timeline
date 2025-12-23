AI_CONTEXT.md "ช่วยอ่านบริบทจากไฟล์ AI_CONTEXT นี้แล้วลุยงานต่อที [วางข้อความด้านบน]"
# NOCNTT Project Context
- **Project Name:** NOCNTT Command Center (ระบบจัดการงาน NOC)
- **Tech Stack:** React (Vite), Tailwind CSS, Firebase (Firestore/Hosting), Lucide React
- **Status:** Stable (Git Main Branch initialized)

## 📁 Project Structure & Files
- **`src/lib/firebase.js`**: ไฟล์คอนฟิกหลักเชื่อมต่อ Firebase (ใช้ Env Variables)
- **`src/lib/api.js`**: ไฟล์ที่ส่งออก (export) `db` สำหรับการใช้งานในหน้าระหว่างพัฒนา
- **`src/pages/SchedulePage.jsx`**: หน้าตารางงาน ดึงข้อมูลจาก Google Calendar มีปุ่ม "Fill Stats"
- **`src/pages/MatchStatPage.jsx`**: หน้าฟอร์มบันทึกสถิติ แบ่งเป็น 2 ช่วง:
  - **START Stat (สีส้ม)**: ช่วง 15 นาทีแรกของการแข่ง
  - **END Stat (สีเขียว)**: ช่วงหลังจบการแข่ง 2 ชั่วโมง
- **`src/components/UnitInput.jsx`**: Component พิเศษสำหรับกรอกตัวเลขที่รองรับการเลือกหน่วย GB/TB

## ⚙️ Logic & Workflows
- **Unit Conversion:** ระบบจะรับค่า Bandwidth เป็น TB หรือ GB แล้วทำการคูณ 1024 เพื่อแปลงเป็นหน่วย GB ก่อนบันทึกลง Firebase เสมอ เพื่อลดความผิดพลาดของคน
- **Data Deduplication:** ในระบบ Schedule มีการใช้ Unique ID (Base64 Encode จาก Date+Time+Title) เพื่อป้องกันข้อมูลซ้ำตอนดึงจากปฏิทินหลายอัน
- **Routing:** ใช้ `react-router-dom` โดยหน้า Stat เข้าถึงผ่าน `/match-stats/:id`

## 🚀 Future Roadmap
1. เชื่อมต่อระบบแจ้งเตือนผ่าน Line/Telegram เมื่อกรอกสถิติเสร็จ
2. สร้างหน้า Dashboard สรุปผลสถิติรายเดือน (Monthly Report)
3. พัฒนาระบบ Auto-fill สถิติผ่าน API (ถ้ามี)

# NOCNTT Project Context (Update: Phase 3 Cleanup)
- **Status:** Dashboard (GB Unit) & Schedule Status Dots Completed.
- **New Feature Added:** - Input Validation (ป้องกันการลืมกรอกชื่อผู้รายงาน)
  - Copy to Clipboard (ฟอร์แมตข้อความสรุปงานสำหรับส่งต่อในทีม)
- **Implemented Fixes:** Resolved duplicate 'updateDoc' import error.
- **Pending Tasks:**
  - เพิ่มหน้า "View History" เพื่อกดดูสถิติย้อนหลังของแต่ละ Match
  - ระบบแจ้งเตือน Threshold (เช่น ถ้า CPU > 90% ให้แสดงตัวหนังสือสีแดง)
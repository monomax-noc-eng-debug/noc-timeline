# 📘 NOC Incident Timeline - Developer Log

บันทึกสถานะโปรเจกต์ **NOC Incident Timeline**
**สถานะปัจจุบัน:** Development (แก้ไข UI/UX และ Performance เรียบร้อย)

---

## ✅ สิ่งที่ทำเสร็จแล้ว (Current Achievements)

### 1. 🎨 UI & Layout (Tailwind CSS v4)
* **Responsive Sidebar:**
    * ปุ่ม **New Incident** และ **Theme Toggle** ย้ายไปอยู่ Header ด้านบนขวา (ไม่กินพื้นที่)
    * **Sticky Header:** ส่วนหัวล็อกติดด้านบน รายการ Incident เลื่อนได้อิสระโดยไม่ดันปุ่มหาย
    * **Floating Add Button:** ปุ่มบวกในหน้า Detail ลอยอยู่มุมขวาล่างเสมอ ไม่เลื่อนตามเนื้อหา
* **Timeline Alignment:**
    * แก้ปัญหาเส้น Timeline ไม่ตรงกับจุด (ใช้ Relative Positioning)
    * เส้นเชื่อมต่อกันสวยงามแม้ Padding จะเปลี่ยนไป

### 2. ⚡ Performance & Logic
* **Lazy Loading Events:**
    * แก้ปัญหา `N+1 Query` โดยเปลี่ยนมาโหลด Events เฉพาะตอนที่กดคลิก Incident เท่านั้น
* **Pagination (Infinite Scroll):**
    * รองรับข้อมูลจำนวนมาก โหลดทีละ 20 รายการด้วยปุ่ม "Load More"
* **Latest Data First:**
    * เรียงข้อมูลจาก `createdAt` (ใหม่ -> เก่า) ทั้งตอนโหลดครั้งแรกและตอนสร้างใหม่

### 3. 🛠️ Code Structure
* **Separation of Concerns:**
    * `api.js`: เก็บ Logic การต่อ Firebase ทั้งหมด (Pure JS ไม่มี React ปน)
    * `App.jsx`: จัดการ State หลักและ Routing
    * `CaseList.jsx`: จัดการรายการด้านซ้าย
    * `CaseDetail.jsx`: จัดการรายละเอียดและ Timeline ด้านขวา

---

## 🚧 จุดที่ต้องระวัง (Important Notes)

1.  **ไฟล์ `src/lib/api.js`:**
    * ต้องเป็น **Pure JavaScript** เท่านั้น ห้ามมี `import React` หรือ JSX tags (`<div>`, `<button>`) เด็ดขาด ไม่งั้น Vite จะพัง

2.  **Firebase Indexes:**
    * ถ้า Console ขึ้น Error สีแดงเกี่ยวกับ `index` ให้กดลิงก์ใน Error นั้นเพื่อสร้าง Index ใน Firestore (จำเป็นสำหรับการ Query แบบ `orderBy` + `where`)

---

## 🔮 สิ่งที่ต้องทำต่อ (Next Steps)

### Phase 1: Features Enhancement (ทำต่อได้เลย)
- [ ] **Image Upload:** เปลี่ยนจากแปะ URL เป็นอัปโหลดไฟล์ลง Firebase Storage
- [ ] **Search/Filter:** เพิ่มช่องค้นหา Incident ตาม Project หรือ Ticket ID
- [ ] **Rich Text Editor:** เปลี่ยน Textarea ธรรมดาเป็น Editor ที่ใส่ตัวหนา/สีได้

### Phase 2: Production Ready (เมื่อพร้อมออนไลน์)
- [ ] **Authentication:** ทำระบบ Login (Google Auth)
- [ ] **Security Rules:** ล็อก Firestore ให้เขียนได้เฉพาะคนในทีม
- [ ] **Deployment:** ตัดสินใจว่าจะใช้ Firebase Hosting หรือ GitHub Pages
    * *ถ้าใช้ GitHub Pages:* ต้องเปลี่ยน Router เป็น `HashRouter` และตั้งค่า `base` ใน vite config

---
**Last Updated:** [Current Date]

1. 🔥 เตรียม Firebase Console

ไปที่ firebase.google.com แล้วกด Go to console
สร้าง Project ใหม่ (เช่น noc-timeline-dev สำหรับเครื่องคุณ)
ไปที่เมนู Build > Firestore Database > กด Create Database
เลือก Start in test mode (เพื่อให้เขียน/อ่านได้เลยโดยไม่ต้องแก้ Rules ในช่วงแรก)
เลือก Location (แนะนำ asia-southeast1 สิงคโปร์ เพื่อความเร็ว)
ไปที่ Project Settings (รูปฟันเฟือง) > เลื่อนลงมาล่างสุด > เลือกไอคอน Web (</>)
ตั้งชื่อ App แล้ว Copy ค่า firebaseConfig เก็บไว้
(ทำซ้ำอีกรอบสำหรับ Project ของบริษัท ถ้าต้องการแยก Environment)
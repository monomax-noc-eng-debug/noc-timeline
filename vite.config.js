import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 👈 ต้องมีบรรทัดนี้สำหรับ Tailwind v4
  ],
  base: '/noc-timeline/', // ✅ เปลี่ยนจาก './' เป็นชื่อ repo ของคุณ
})
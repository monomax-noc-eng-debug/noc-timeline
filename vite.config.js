import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 👈 ต้องมีบรรทัดนี้สำหรับ Tailwind v4
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/noc-timeline/', // ✅ เปลี่ยนจาก './' เป็นชื่อ repo ของคุณ
})
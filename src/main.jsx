import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HashRouter } from 'react-router-dom'
// ✅ 1. Import React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ✅ 2. สร้าง Client (Config ให้เร็วและ Cache นานหน่อย)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 นาทีข้อมูลถึงจะเก่า (ลดการ Fetch ถี่ๆ)
      cacheTime: 1000 * 60 * 30, // เก็บ Cache 30 นาที
      refetchOnWindowFocus: false, // สลับจอไม่ต้องโหลดใหม่
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    {/* ✅ 3. ห่อ App ด้วย Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </HashRouter>
)
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ✅ แก้ไขบรรทัดนี้: เพิ่ม HashRouter เข้าไป
import { HashRouter } from 'react-router-dom' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ เปลี่ยนจาก BrowserRouter เป็น HashRouter */}
    <HashRouter> 
      <App />
    </HashRouter>
  </React.StrictMode>
)
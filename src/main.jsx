import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// ✅ แก้ไข: ต้องมี HashRouter อยู่ในเครื่องหมาย { }
import { HashRouter } from 'react-router-dom' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter> 
    <App />
  </HashRouter>
)
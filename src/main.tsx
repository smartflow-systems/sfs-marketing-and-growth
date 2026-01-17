import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './sfs-premium-theme.css'
import './index.css'
import './styles/animations.css'
import { performanceMonitor } from './utils/performance-monitor'

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor; // Trigger initialization
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

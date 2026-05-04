import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Kill any service worker left over from earlier deploys — those workers
// can serve broken cached HTML/JS and cause a permanent white screen.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(rs => {
    for (const r of rs) r.unregister()
  }).catch(() => {})
  if ('caches' in window) {
    caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {})
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)

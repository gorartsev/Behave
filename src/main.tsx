import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// HashRouter avoids SPA-fallback issues on GitHub Pages (no server-side 404 routing).
// URLs look like /Behave/#/habits. PWA install + offline still work fine.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)



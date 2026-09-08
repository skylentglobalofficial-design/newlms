import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { bootstrapTheme } from './lib/theme-init'
import './index.css'
import './theme-overrides.css'
import './skylent-home.css'
import './skylent-public-overrides.css'
import './skylent-dark-visual.css'
import './skylent-layout-responsive.css'
import './skylent-light-aurora.css'
import './skylent-home-layout-fix.css'
import './skylent-final-visual.css'
import './skylent-public-compact.css'
import './skylent-launch-audit.css'

bootstrapTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

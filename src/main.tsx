import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { bootstrapTheme } from './lib/theme-init'
import './index.css'
import './theme-overrides.css'
import './skylent-home.css'
import './skylent-public-overrides.css'

bootstrapTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { installNativeAppBridge } from './lib/native-app-bridge'
import './index.css'
import './skylent-public.css'

installNativeAppBridge()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

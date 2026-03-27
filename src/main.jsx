import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Prevent browser from restoring previous scroll position on reload
window.history.scrollRestoration = 'manual'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

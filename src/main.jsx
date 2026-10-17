import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Restore path from GitHub Pages 404 redirect
const p = new URLSearchParams(window.location.search).get('p');
if (p) window.history.replaceState(null, '', '/' + decodeURIComponent(p));

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <App />
  // </StrictMode>,
)

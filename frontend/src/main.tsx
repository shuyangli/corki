import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import log from 'loglevel'

import './index.css'
import App from './App.tsx'

log.setLevel('debug')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
